import 'dart:convert';
import 'package:flutter/material.dart' hide Row;
import 'package:flutter/services.dart';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'training.dart';
import 'old_storage.dart' if (dart.library.js_interop) 'old_storage_web.dart';
import 'demo.dart';
import 'update_tile.dart';

class GymApp extends StatefulWidget {
  const GymApp({super.key});
  @override
  State<GymApp> createState() => _GymState();
}

class _GymState extends State<GymApp> {
  late SharedPreferences prefs;
  List<Row> logs = [];
  Row history = {}, baseline = {};
  double kg = 65;
  bool ready = false;
  int page = 0;
  DateTime week = monday(DateTime.now());
  @override
  void initState() {
    super.initState();
    load();
  }

  Future<void> load() async {
    prefs = await SharedPreferences.getInstance();
    final data = jsonDecode(prefs.getString('gym.v1') ?? '{}');
    logs = List<Row>.from(data['logs'] ?? []);
    history = data['history'] ?? {};
    baseline = data['baseline'] ?? {};
    kg = (data['kg'] ?? 65).toDouble();
    final legacy = readOldStorage();
    if (legacy != null && !prefs.containsKey('historyImported')) {
      try {
        history = {...migrate(jsonDecode(legacy)), ...history};
        await save();
        await prefs.setBool('historyImported', true);
      } on FormatException {
        /* Original backup remains accessible. */
      }
    }
    if (mounted) setState(() => ready = true);
  }

  Future<void> save() async {
    if (!await prefs.setString(
      'gym.v1',
      jsonEncode({
        'logs': logs,
        'history': history,
        'baseline': baseline,
        'kg': kg,
      }),
    ))
      throw StateError('Device save failed');
  }

  Future<String?> input(String title, String initial) async {
    String value = initial;
    return showDialog<String>(
      context: context,
      builder: (c) => AlertDialog(
        title: Text(title),
        content: TextFormField(
          initialValue: initial,
          maxLines: 4,
          onChanged: (v) => value = v,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(c),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(c, value),
            child: const Text('Save'),
          ),
        ],
      ),
    );
  }

  static const backupChannel = MethodChannel('move_strong/backup');
  Future<void> backup(bool restore) async {
    try {
      if (restore) {
        final picked = await backupChannel.invokeMethod('restore');
        if (picked is! String) return;
        final b = jsonDecode(picked);
        if (b is! Map || b['format'] != 'move-strong.full.v1')
          throw const FormatException('Expected a Move Strong full backup');
        final restored = List<Row>.from(b['logs']);
        final restoredHistory = Map<String, dynamic>.from(b['history']);
        final restoredBaseline = Map<String, dynamic>.from(b['baseline']);
        final weight = (b['kg'] as num).toDouble();
        final minutes = b['reminderMinutes'] as int?;
        if (!weight.isFinite ||
            weight < 25 ||
            weight > 300 ||
            (minutes != null && (minutes < 0 || minutes >= 1440)) ||
            restored.any(
              (r) => r['date'] is! String || r['exercises'] is! List,
            ))
          throw const FormatException('Invalid backup records');
        if (!mounted) return;
        final accept = await showDialog<bool>(
          context: context,
          builder: (c) => AlertDialog(
            title: const Text('Restore backup?'),
            content: Text(
              'Merge ${restored.length} sessions and ${restoredHistory.length} history entries. This device keeps matching sessions and history. Restore the saved weight and reminder settings.',
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(c, false),
                child: const Text('Cancel'),
              ),
              FilledButton(
                onPressed: () => Navigator.pop(c, true),
                child: const Text('Restore'),
              ),
            ],
          ),
        );
        if (accept != true) return;
        logs = {
          for (final r in [...restored, ...logs]) r['date']: r,
        }.values.toList();
        history = {...restoredHistory, ...history};
        baseline = {...restoredBaseline, ...baseline};
        kg = weight;
        await save();
        await const MethodChannel(
          'move_strong/reminder',
        ).invokeMethod('schedule', minutes ?? -1);
        if (minutes == null) {
          await prefs.remove('reminderMinutes');
          await prefs.remove('reminder');
        } else {
          await prefs.setInt('reminderMinutes', minutes);
          await prefs.setString(
            'reminder',
            b['reminder'] ??
                '${minutes ~/ 60}:${(minutes % 60).toString().padLeft(2, '0')}',
          );
        }
        if (b['historyImported'] == true)
          await prefs.setBool('historyImported', true);
        if (mounted) setState(() {});
      } else {
        final text = jsonEncode({
          'format': 'move-strong.full.v1',
          'exportedAt': DateTime.now().toUtc().toIso8601String(),
          'logs': logs,
          'history': history,
          'baseline': baseline,
          'kg': kg,
          'reminder': prefs.getString('reminder'),
          'reminderMinutes': prefs.getInt('reminderMinutes'),
          'historyImported': prefs.getBool('historyImported') ?? false,
        });
        if (await backupChannel.invokeMethod('export', text) != true) return;
      }
      if (mounted)
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(restore ? 'Backup restored' : 'Backup file saved'),
          ),
        );
    } catch (e) {
      if (mounted)
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Backup operation failed: $e')));
    }
  }

  @override
  Widget build(BuildContext context) {
    if (!ready)
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    final dates = logs.map((r) => r['date']).toSet();
    final evidence = [
      ...historyEvidence(history).where((r) => !dates.contains(r['date'])),
      ...logs,
    ];
    final plan = draft(week, evidence, baseline: baseline);
    return Scaffold(
      appBar: AppBar(
        title: Text(page == 0 ? 'Training week' : 'Progress & history'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: page == 0
            ? [
                Wrap(
                  alignment: WrapAlignment.spaceBetween,
                  children: [
                    IconButton(
                      icon: const Icon(Icons.chevron_left),
                      onPressed: () => setState(
                        () => week = week.subtract(const Duration(days: 7)),
                      ),
                    ),
                    Text(dayKey(week)),
                    IconButton(
                      icon: const Icon(Icons.chevron_right),
                      onPressed: () => setState(
                        () => week = week.add(const Duration(days: 7)),
                      ),
                    ),
                  ],
                ),
                for (final day in plan)
                  Card(
                    child: ListTile(
                      title: Text(day['title']),
                      subtitle: Text(
                        '${day['date']} · ${logs.any((l) => l['date'] == day['date'])
                            ? 'Logged'
                            : day['title'] == 'Rest'
                            ? 'Rest'
                            : day['date'] == dayKey(DateTime.now())
                            ? 'Today'
                            : 'Planned'}',
                      ),
                      onTap: day['title'] == 'Rest'
                          ? null
                          : () async {
                              final old = logs
                                  .where((l) => l['date'] == day['date'])
                                  .firstOrNull;
                              final result = await Navigator.push<Row>(
                                context,
                                MaterialPageRoute(
                                  builder: (_) => Session(
                                    day: old?['plan'] ?? day,
                                    old: old,
                                    options: plan,
                                  ),
                                ),
                              );
                              if (result != null) {
                                logs.removeWhere(
                                  (l) => l['date'] == result['date'],
                                );
                                logs.add(result);
                                await save();
                                setState(() {});
                              }
                            },
                    ),
                  ),
                FilledButton.icon(
                  icon: const Icon(Icons.copy),
                  label: const Text('Export week'),
                  onPressed: () async {
                    final days = plan.map((p) => p['date']).toSet();
                    await Clipboard.setData(
                      ClipboardData(
                        text: const JsonEncoder.withIndent('  ').convert({
                          'week': dayKey(week),
                          'targets': plan,
                          'logs': evidence
                              .where((l) => days.contains(l['date']))
                              .toList(),
                          'baseline': baseline,
                          'importedDays': {
                            for (final d in days)
                              if (history.containsKey('dated/$d'))
                                d: history['dated/$d'],
                          },
                          'profile': {
                            'age': 26,
                            'heightCm': 178,
                            'bodyweightKg': kg,
                            'gym': 'Nuffield Health Friern Barnet',
                            'asthma': true,
                            'eczemaHistory': true,
                            'gradualLoadingCleared': true,
                          },
                          'draft': draft(
                            week.add(const Duration(days: 7)),
                            evidence,
                            baseline: baseline,
                          ),
                        }),
                      ),
                    );
                    if (context.mounted)
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Weekly JSON copied')),
                      );
                  },
                ),
              ]
            : [
                if (!kIsWeb &&
                    defaultTargetPlatform == TargetPlatform.android) ...[
                  const UpdateTile(),
                  ListTile(
                    title: const Text('Export all data'),
                    onTap: () => backup(false),
                  ),
                  ListTile(
                    title: const Text('Restore full backup'),
                    onTap: () => backup(true),
                  ),
                ],
                if (!kIsWeb && defaultTargetPlatform == TargetPlatform.android)
                  ListTile(
                    title: const Text('Workout reminder'),
                    subtitle: Text(prefs.getString('reminder') ?? 'Off'),
                    trailing: IconButton(
                      icon: const Icon(Icons.notifications_off),
                      onPressed: () async {
                        await const MethodChannel(
                          'move_strong/reminder',
                        ).invokeMethod('schedule', -1);
                        await prefs.remove('reminder');
                        await prefs.remove('reminderMinutes');
                        setState(() {});
                      },
                    ),
                    onTap: () async {
                      final t = await showTimePicker(
                        context: context,
                        initialTime: const TimeOfDay(hour: 15, minute: 0),
                      );
                      if (t == null || !context.mounted) return;
                      final label = t.format(context);
                      await const MethodChannel(
                        'move_strong/reminder',
                      ).invokeMethod('schedule', t.hour * 60 + t.minute);
                      await prefs.setString('reminder', label);
                      await prefs.setInt(
                        'reminderMinutes',
                        t.hour * 60 + t.minute,
                      );
                      setState(() {});
                    },
                  ),
                ListTile(
                  title: Text('Bodyweight · $kg kg'),
                  onTap: () async {
                    final n = double.tryParse(
                      await input('Bodyweight (kg)', kg.toString()) ?? '',
                    );
                    if (n != null && n >= 25 && n <= 300) {
                      kg = n;
                      await save();
                      setState(() {});
                    }
                  },
                ),
                const Text(
                  '23 Nov baseline · 3–4 strict pull-ups, about 15 push-ups. Shoulder feels fine after two weeks off.',
                ),
                for (final name in [
                  'Assisted pull-up',
                  'Tuck L-sit',
                  'Push-up',
                  'Seated leg press',
                  'DB Romanian deadlift',
                  'DB bench press',
                ])
                  ExpansionTile(
                    title: Text('$name trend'),
                    children: [
                      for (final r
                          in (logs.toList()
                            ..sort((a, b) => a['date'].compareTo(b['date']))))
                        for (final e in r['exercises'])
                          if (e['name'] == name)
                            ListTile(
                              title: Text(
                                "${r['date']} · ${e['sets']} ${e['unit']}",
                              ),
                              subtitle: Text(
                                "${name.startsWith('Assisted') ? 'Assistance' : 'Load'} ${e['load'] ?? '—'} kg · shoulder during ${e['pain'] ?? '—'}, next morning ${e['next'] ?? '—'}",
                              ),
                            ),
                    ],
                  ),
                for (final name in [
                  'Max strict pull-ups',
                  'Dead hang (s)',
                  'Max push-ups',
                  'Max tuck L-sit (s)',
                  'Easy 5 km (min)',
                ])
                  ListTile(
                    title: Text(name),
                    trailing: Text('${baseline[name] ?? '—'}'),
                    onTap: () async {
                      final n = num.tryParse(
                        await input(name, '${baseline[name] ?? ''}') ?? '',
                      );
                      if (n != null && n >= 0) {
                        baseline[name] = n;
                        await save();
                        setState(() {});
                      }
                    },
                  ),
                OutlinedButton(
                  onPressed: () async {
                    final s = await input(
                      'Paste existing Move Strong JSON backup',
                      '',
                    );
                    if (s == null) return;
                    try {
                      final imported = migrate(jsonDecode(s));
                      history = {...imported, ...history};
                      await save();
                      setState(() {});
                    } catch (e) {
                      if (context.mounted)
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text('Import failed: $e')),
                        );
                    }
                  },
                  child: const Text('Import existing history'),
                ),
                for (final l in logs)
                  ExpansionTile(
                    title: Text('${l['date']} · ${l['actual']}'),
                    children: [
                      for (final e in l['exercises'])
                        ListTile(
                          title: Text(e['name']),
                          subtitle: Text(
                            "${e['sets']} · ${e['load'] ?? 'bodyweight'} · shoulder ${e['pain'] ?? '—'}/10",
                          ),
                        ),
                    ],
                  ),
                for (final e in history.entries)
                  ExpansionTile(
                    title: Text(e.key),
                    children: [SelectableText(jsonEncode(e.value))],
                  ),
              ],
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: page,
        onDestinationSelected: (p) => setState(() => page = p),
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.calendar_month),
            label: 'Week',
          ),
          NavigationDestination(
            icon: Icon(Icons.show_chart),
            label: 'Progress',
          ),
        ],
      ),
    );
  }
}

class Session extends StatefulWidget {
  final Row day;
  final Row? old;
  final List<Row> options;
  const Session({
    super.key,
    required this.day,
    this.old,
    this.options = const [],
  });
  @override
  State<Session> createState() => _SessionState();
}

class _SessionState extends State<Session> {
  final form = GlobalKey<FormState>();
  late Row log;
  @override
  void initState() {
    super.initState();
    log = jsonDecode(
      jsonEncode(
        widget.old ??
            {
              'date': widget.day['date'],
              'plan': widget.day,
              'actual': widget.day['title'],
              'exercises': [
                for (final e in widget.day['targets'])
                  {...e, 'sets': [], 'status': 'modified'},
              ],
              'heat': [],
            },
      ),
    );
  }

  Widget field(
    Row r,
    String key,
    String label, {
    bool numeric = false,
    num? max,
  }) {
    return TextFormField(
      key: ValueKey('${r['name'] ?? ''}/$key'),
      initialValue: r[key]?.toString() ?? '',
      decoration: InputDecoration(labelText: label),
      keyboardType: numeric
          ? const TextInputType.numberWithOptions(decimal: true)
          : TextInputType.text,
      validator: (s) {
        if (!numeric || s == null || s.isEmpty) return null;
        final n = num.tryParse(s);
        return n == null || !n.isFinite || n < 0 || (max != null && n > max)
            ? 'Enter a valid value'
            : null;
      },
      onSaved: (s) => r[key] = numeric ? num.tryParse(s ?? '') : s,
    );
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: Text(widget.day['title'])),
    body: Form(
      key: form,
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Text(
              '${log['date']} · ${DateTime.parse(log['date']).weekday < 6 ? '15:00–16:30' : 'Conversational pace'}',
            ),
            for (final e in log['exercises'])
              Card(
                key: ValueKey('${log['actual']}/${e['name']}'),
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        e['variation'] ?? e['name'],
                        style: Theme.of(context).textTheme.titleLarge,
                      ),
                      Text(
                        "${e['plannedSets']} × ${e['target']} ${e['unit']} · rest ${e['restSeconds']} s · RIR 3–4",
                      ),
                      Text(e['cue']),
                      if (e['load'] != null)
                        Text(
                          'Resistance or assistance target: ${e['load']} kg',
                        ),
                      const Text(
                        'Keep shoulder pain at or below 3/10 and record the next-morning response. Stop for focal plate pain.',
                      ),
                      Text(e['reason']),
                      ExpansionTile(
                        title: const Text('Base movement demo'),
                        children: [MotionDemo(e['name'])],
                      ),
                      if (pathways.containsKey(e['name']))
                        CheckboxListTile(
                          title: const Text(
                            'Ready for next skill: pain-free range, control and clinician-agreed loading',
                          ),
                          value: e['skillReady'] == true,
                          onChanged: (v) => setState(() => e['skillReady'] = v),
                        ),
                      TextFormField(
                        initialValue: (e['sets'] as List).join(', '),
                        decoration: const InputDecoration(
                          labelText: 'Actual reps, seconds or distance per set',
                        ),
                        validator: (s) =>
                            (s ?? '')
                                .split(',')
                                .where((v) => v.trim().isNotEmpty)
                                .any((v) => (num.tryParse(v.trim()) ?? -1) < 0)
                            ? 'Enter numbers separated by commas'
                            : null,
                        onSaved: (s) => e['sets'] = (s ?? '')
                            .split(',')
                            .map((v) => num.tryParse(v.trim()))
                            .whereType<num>()
                            .toList(),
                      ),
                      field(
                        e,
                        'load',
                        e['name'].startsWith('Assisted')
                            ? 'Assistance (kg)'
                            : 'Load (kg)',
                        numeric: true,
                      ),
                      field(e, 'rir', 'RIR', numeric: true, max: 10),
                      field(
                        e,
                        'pain',
                        'Shoulder during (0–10)',
                        numeric: true,
                        max: 10,
                      ),
                      field(
                        e,
                        'next',
                        'Shoulder next morning (0–10)',
                        numeric: true,
                        max: 10,
                      ),
                      DropdownButtonFormField<String>(
                        initialValue: e['status'],
                        items: [
                          for (final v in ['completed', 'modified', 'skipped'])
                            DropdownMenuItem(value: v, child: Text(v)),
                        ],
                        onChanged: (v) => e['status'] = v,
                      ),
                      CheckboxListTile(
                        title: const Text(
                          'Focal plate symptoms or new surgery',
                        ),
                        value: e['flag'] == true,
                        onChanged: (v) => setState(() => e['flag'] = v),
                      ),
                      if (e['plannedSets'] == 0)
                        CheckboxListTile(
                          title: const Text(
                            'Clinician reviewed and cleared gradual reloading',
                          ),
                          value: e['cleared'] == true,
                          onChanged: (v) => setState(() => e['cleared'] = v),
                        ),
                    ],
                  ),
                ),
              ),
            DropdownButtonFormField<String>(
              initialValue: log['actual'],
              decoration: const InputDecoration(
                labelText: 'Session actually performed',
              ),
              items: [
                for (final v in {
                  ...schedule,
                  'Missed',
                  widget.day['title'] as String,
                })
                  DropdownMenuItem(value: v, child: Text(v)),
              ],
              onChanged: (v) {
                form.currentState!.save();
                final saved = log['alternateRecords'] ??= <String, dynamic>{};
                saved[log['actual']] = log['exercises'];
                final choice = widget.options
                    .where((o) => o['title'] == v)
                    .firstOrNull;
                setState(() {
                  log['actual'] = v;
                  log['exercises'] =
                      saved[v] ??
                      [
                        for (final e in choice?['targets'] ?? [])
                          {...e, 'sets': [], 'status': 'modified'},
                      ];
                });
              },
            ),
            field(log, 'duration', 'Duration (min)', numeric: true),
            field(
              log,
              'difficulty',
              'Difficulty (0–10)',
              numeric: true,
              max: 10,
            ),
            field(log, 'fatigue', 'Fatigue (0–10)', numeric: true, max: 10),
            field(log, 'sleep', 'Sleep (hours)', numeric: true, max: 24),
            field(log, 'notes', 'Session notes'),
            if (DateTime.parse(log['date']).weekday <= 5) ...[
              const Text(
                'Optional heat after training · 10–15 minutes total, or two rounds with a cool shower between. Drink about 500 ml afterwards. Shower and moisturise promptly. Reduce heat if skin flares. Prefer dry sauna and use steam only if your chest tolerates it.',
              ),
              for (final h in log['heat'])
                Column(
                  children: [
                    Text(h['type']),
                    field(h, 'minutes', 'Minutes', numeric: true),
                    field(h, 'note', 'Skin or chest note'),
                  ],
                ),
              Wrap(
                children: [
                  for (final t in ['sauna', 'steam'])
                    TextButton(
                      onPressed: () => setState(
                        () => log['heat'].add(<String, dynamic>{'type': t}),
                      ),
                      child: Text('Add $t'),
                    ),
                ],
              ),
            ],
            FilledButton(
              onPressed: () {
                if (form.currentState!.validate()) {
                  form.currentState!.save();
                  Navigator.pop(context, log);
                }
              },
              child: const Text('Save workout'),
            ),
          ],
        ),
      ),
    ),
  );
}
