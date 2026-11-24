typedef Row = Map<String, dynamic>;
const equipment = {
  'rack',
  'barbell',
  'plates',
  'cable',
  'assisted pull-up',
  'assisted dip',
  'dumbbells',
  'bench',
  'machines',
  'cardio',
  'rower',
  'pool',
  'sauna',
  'steam',
};
const schedule = [
  'Pull + core',
  'Lower body',
  'Easy swim + shoulder prehab',
  'Push + skills',
  'Full body · light legs',
  'Long easy run',
  'Rest',
];
final start = DateTime.utc(2026, 11, 23);
String dayKey(DateTime d) => d.toIso8601String().substring(0, 10);
DateTime monday(DateTime d) =>
    DateTime.utc(d.year, d.month, d.day - d.weekday + 1);
// Name, required kit, work target, unit, technique cue.
const catalogue = <String, (String, int, String, String)>{
  'Assisted pull-up': (
    'assisted pull-up',
    6,
    'reps',
    'Use enough assistance to keep three clean reps in reserve.',
  ),
  'Cable row': ('cable', 10, 'reps', 'Draw elbows back without shrugging.'),
  'Tuck L-sit': (
    '',
    10,
    'seconds',
    'Press down and lift bent knees within comfortable range.',
  ),
  'Seated leg press': (
    'machines',
    8,
    'reps',
    'Use a seated leg press with a backrest and footplate, without shoulder pads. Skip if unavailable. Start with a fresh load.',
  ),
  'DB Romanian deadlift': (
    'dumbbells',
    8,
    'reps',
    'Hinge at the hips with the weights close.',
  ),
  'Single-leg glute bridge': (
    '',
    8,
    'reps/side',
    'Lie on your back, plant one foot and raise your hips with your pelvis level. Use bodyweight.',
  ),
  'Easy swim': (
    'pool',
    20,
    'minutes',
    'Warm up gradually. Use smooth strokes and an easy breathing rhythm.',
  ),
  'External rotation': (
    'cable',
    12,
    'reps',
    'Keep the elbow close to the ribs.',
  ),
  'Wall push-up plus': (
    '',
    10,
    'reps',
    'At the top gently push the wall away without shrugging.',
  ),
  'DB bench press': (
    'dumbbells',
    8,
    'reps',
    'Use a comfortable grip and shallow pain-free depth.',
  ),
  'Assisted dip': (
    'assisted dip',
    6,
    'reps',
    'Use assistance and short depth. Stop for anterior shoulder pain.',
  ),
  'Pike hold': (
    '',
    15,
    'seconds',
    'Start with feet grounded and load the shoulders gradually.',
  ),
  'Push-up': ('', 8, 'reps', 'Use an incline if needed to keep control.'),
  'Glute bridge': (
    '',
    10,
    'reps',
    'Drive through the heels and keep Friday easy.',
  ),
  'Easy run': (
    '',
    5,
    'km',
    'Warm up gradually, keep conversational pace and follow your asthma action plan.',
  ),
};
const prehab = ['External rotation', 'Wall push-up plus'];
const split = [
  ['Assisted pull-up', 'Cable row', 'Tuck L-sit', ...prehab],
  ['Seated leg press', 'DB Romanian deadlift', 'Single-leg glute bridge'],
  ['Easy swim', ...prehab],
  ['DB bench press', 'Assisted dip', 'Pike hold', ...prehab],
  ['Cable row', 'Push-up', 'Glute bridge', ...prehab],
  ['Easy run'],
  <String>[],
];

const pathways = {
  'Assisted pull-up': [
    'Assisted pull-up',
    'Controlled negative',
    'Strict pull-up',
    'Strict volume',
    'Chest-to-bar',
    'Explosive pull',
    'Muscle-up prerequisites',
  ],
  'Tuck L-sit': [
    'Tuck L-sit',
    'Single-leg L-sit',
    'Full L-sit',
    'Extended full hold',
  ],
  'Pike hold': [
    'Wrist preparation + pike hold',
    'Wall handstand',
    'Freestanding practice',
    'Press preparation',
  ],
};
List<Row> draft(DateTime week, List<Row> history, {Row baseline = const {}}) {
  final number = monday(week).difference(start).inDays ~/ 7 + 1;
  final cutoff = dayKey(monday(week));
  final prior = history.where((r) => r['date'].compareTo(cutoff) < 0).toList()
    ..sort((a, b) => a['date'].compareTo(b['date']));
  final recent = prior
      .where(
        (r) =>
            r['date'].compareTo(
              dayKey(monday(week).subtract(const Duration(days: 7))),
            ) >=
            0,
      )
      .toList();
  final tired = recent.where((r) => (r['fatigue'] ?? 0) >= 8).length >= 2;
  final soreDays = recent
      .where(
        (r) => (r['exercises'] as List? ?? []).any(
          (e) => (e['pain'] ?? 0) > 3 || (e['next'] ?? 0) > 0,
        ),
      )
      .length;
  return List.generate(7, (i) {
    final date = monday(week).add(Duration(days: i));
    final before =
        history.where((r) => r['date'].compareTo(dayKey(date)) < 0).toList()
          ..sort((a, b) => a['date'].compareTo(b['date']));
    final targets = <Row>[];
    for (final name in split[i]) {
      final (kit, base, unit, cue) = catalogue[name]!;
      if (kit.isNotEmpty && !equipment.contains(kit)) continue;
      final exposures = [
        for (final r in prior)
          for (final e in (r['exercises'] as List? ?? []))
            if (e['name'] == name && r['actual'] != 'Missed') e,
      ];
      final shoulderHistory = [
        for (final r in before)
          for (final e in (r['exercises'] as List? ?? []))
            if (e['flag'] == true || e['cleared'] == true) e,
      ];
      final suspended =
          shoulderHistory.isNotEmpty && shoulderHistory.last['flag'] == true;
      final last = exposures.lastOrNull;
      final withinWeek = [
        for (final row in before)
          if (row['date'].compareTo(cutoff) >= 0 && row['actual'] != 'Missed')
            for (final entry in row['exercises'] ?? [])
              if (entry['name'] == name) entry,
      ].lastOrNull;
      final cardio = unit == 'km' || unit == 'minutes';
      var sets = cardio
          ? 1
          : (prehab.contains(name) || i == 4
                ? 2
                : number == 1
                ? 3
                : 4);
      var reps = (last?['target'] as int?) ?? base;
      final observed = last?['load'] as num?;
      num? load = observed;
      var state = 'hold',
          reason = 'Initial target. Record work and next-morning response.';
      if (last != null) {
        final pain = last['pain'] as num?, next = last['next'] as num?;
        final actual = last['sets'] as List? ?? [];
        final met =
            last['status'] == 'completed' &&
            actual.length == (last['plannedSets'] ?? sets) &&
            actual.every((v) => v >= reps);
        bool stalledWeek(List<Row> rows) => rows.any(
          (r) => (r['exercises'] as List? ?? []).any(
            (e) =>
                e['name'] == name &&
                (e['status'] != 'completed' ||
                    (e['sets'] as List? ?? []).any((v) => v < e['target'])),
          ),
        );
        final stalled =
            stalledWeek(recent) &&
            stalledWeek(
              prior
                  .where(
                    (r) =>
                        r['date'].compareTo(
                              dayKey(
                                monday(week).subtract(const Duration(days: 14)),
                              ),
                            ) >=
                            0 &&
                        !recent.contains(r),
                  )
                  .toList(),
            );
        if ((pain ?? 0) > 3 || (next ?? 0) > 0 || last['flag'] == true) {
          state = 'regress';
          reason =
              'Logged shoulder pain was ${pain ?? "unrecorded"}/10 during and ${next ?? "unrecorded"}/10 next morning. Reduce loading and review focal symptoms.';
          if (last['flag'] == true) {
            sets = 0;
          } else {
            sets = 1;
            reps = (reps * .8).ceil();
          }
        } else if (tired || soreDays >= 2 || number % 5 == 0) {
          state = 'deload';
          sets = (sets * .6).ceil();
          if (cardio) reps = (reps * .75).floor().clamp(1, reps);
          reason = tired
              ? 'Two high-fatigue sessions recorded.'
              : soreDays >= 2
              ? 'Repeated shoulder symptoms this week.'
              : 'Scheduled fifth-week deload.';
        } else if (stalled) {
          reason =
              'Two unsuccessful exposures. Review fatigue, technique and recovery.';
        } else if (number >= 3 &&
            met &&
            pain != null &&
            next == 0 &&
            (last['rir'] ?? -1) >= 3 &&
            (last['rir'] ?? 5) <= 4 &&
            recent.any((r) => (r['exercises'] as List? ?? []).contains(last))) {
          state = 'progress';
          reason =
              'Logged ${actual.join(" / ")} at ${last["rir"]} RIR and 0/10 next morning.';
          if (name.startsWith('Assisted') && observed != null && observed > 0) {
            load = observed * .95;
            reason +=
                ' Use the closest available assistance at or above this target.';
          } else if ([
                'Seated leg press',
                'DB Romanian deadlift',
                'DB bench press',
                'Cable row',
              ].contains(name) &&
              observed != null &&
              observed > 0 &&
              reps >= 12) {
            load = observed * 1.025;
            reason += ' Choose an available weight within the 2.5% increase.';
          } else if (!cardio) {
            reps += 1;
          } else {
            state = 'hold';
            reason = 'Maintain conversational aerobic work.';
          }
        } else {
          reason =
              'Hold until recent completed sets, RIR and recovery meet the progression criteria.';
        }
      }
      if (name == 'Assisted dip' &&
          state == 'progress' &&
          exposures
                  .where(
                    (e) =>
                        e['status'] == 'completed' &&
                        e['pain'] == 0 &&
                        e['next'] == 0,
                  )
                  .length <
              2) {
        state = 'hold';
        load = observed;
        reps = last['target'];
        reason =
            'Dips require two symptom-free completed exposures before increasing difficulty.';
      }
      final stages = pathways[name];
      var stage = (last?['stage'] as int?) ?? 0;
      final previousStage = stage;
      if (stages != null &&
          state == 'progress' &&
          stage < stages.length - 1 &&
          last?['skillReady'] == true &&
          exposures.reversed
                  .takeWhile(
                    (e) =>
                        e['stage'] == stage &&
                        e['status'] == 'completed' &&
                        e['next'] == 0 &&
                        (e['pain'] ?? 10) <= 3 &&
                        (e['rir'] ?? 0) >= 3 &&
                        (e['rir'] ?? 10) <= 4 &&
                        e['flag'] != true &&
                        (e['sets'] as List).length == e['plannedSets'] &&
                        (e['sets'] as List).every((v) => v >= e['target']),
                  )
                  .length >=
              2 &&
          (name != 'Assisted pull-up' ||
              (last?['load'] ?? 100) == 0 &&
                  (baseline['Max strict pull-ups'] ?? 0) >= 3)) {
        stage++;
        reps = stage == 1 && name == 'Assisted pull-up' ? 2 : base;
        load = null;
        sets = 2;
        reason =
            'Two successful exposures and readiness confirmed. Begin the next variation at reduced volume.';
      }
      if (name == 'Tuck L-sit' &&
          stage == 0 &&
          baseline['Max tuck L-sit (s)'] is num) {
        reps = reps
            .clamp(
              1,
              ((baseline['Max tuck L-sit (s)'] as num) * .75).floor().clamp(
                1,
                10000,
              ),
            )
            .toInt();
      }
      if (previousStage == stage && state == 'regress' && stage > 0) stage--;
      if (withinWeek != null &&
          ((withinWeek['pain'] ?? 0) > 3 || (withinWeek['next'] ?? 0) > 0)) {
        sets = 1;
        state = 'regress';
        reason =
            'This week’s latest exposure exceeded the shoulder limit. Reduce the next exposure.';
        reps = (base * .8).ceil();
        load = withinWeek['load'];
      }
      if (suspended &&
          ![
            'Easy run',
            'Glute bridge',
            'Single-leg glute bridge',
          ].contains(name)) {
        sets = 0;
        state = 'regress';
        reason =
            'Focal symptoms or surgery recorded. Seek physio or surgeon review before reloading.';
      }
      targets.add({
        'name': name,
        'stage': stage,
        'variation': stages?[stage] ?? name,
        'plannedSets': sets,
        'target': reps,
        'unit': unit,
        'load': load,
        'state': state,
        'reason': reason,
        'cue': cue,
        'restSeconds': prehab.contains(name) ? 75 : 150,
      });
    }
    final yesterday = history
        .where(
          (r) => r['date'] == dayKey(date.subtract(const Duration(days: 1))),
        )
        .lastOrNull;
    final actual = yesterday?['actual'];
    if (i == 4 && actual == schedule[3])
      targets.removeWhere((e) => e['name'] == 'Push-up');
    if (i == 4 && actual == schedule[0])
      targets.removeWhere((e) => e['name'] == 'Cable row');
    if (i == 4 && actual == schedule[1])
      targets.removeWhere((e) => e['name'] == 'Glute bridge');
    final missed = before
        .where(
          (r) => r['date'].compareTo(cutoff) >= 0 && r['actual'] == 'Missed',
        )
        .toList();
    if (i == 4 &&
        missed.any((r) => r['plan']?['title'] == schedule[0]) &&
        actual != schedule[0]) {
      for (final e in targets.where((e) => e['name'] == 'Cable row')) {
        e['reason'] =
            'Monday pull was missed. Keep this pulling slot without adding sets before the run.';
      }
    }
    final overlap = actual == schedule[i];
    if (overlap && i < 5)
      return {
        'date': dayKey(date),
        'title': 'Recovery after swapped session',
        'targets': <Row>[],
      };
    return {'date': dayKey(date), 'title': schedule[i], 'targets': targets};
  });
}

String? rejectSuggestion(Row suggestion, List<Row> targets) {
  if (!catalogue.containsKey(suggestion['name']))
    return 'Exercise outside the current gym programme.';
  final allowed = targets
      .where((t) => t['name'] == suggestion['name'])
      .firstOrNull;
  if (allowed == null)
    return 'Exercise outside the approved programme or equipment list.';
  if (suggestion['reason'] is! String || suggestion['reason'].trim().isEmpty)
    return 'Missing review reason.';
  for (final key in suggestion.keys) {
    if (!{'name', 'reason', 'plannedSets', 'target', 'load'}.contains(key))
      return 'Unsupported change.';
  }
  for (final key in ['plannedSets', 'target']) {
    final n = suggestion[key];
    if (n is! int || n < 0 || n > allowed[key])
      return 'Outside approved rehab or volume limit.';
  }
  if (suggestion['load'] != allowed['load'])
    return 'Outside approved resistance or assistance.';
  return null;
}

Map<String, dynamic> migrate(Row backup) {
  if (backup['format'] == 'move-strong.history.v1') {
    final history = backup['history'];
    if (history is! Row ||
        history.keys.any(
          (k) =>
              !k.startsWith('legacy/') &&
              !k.startsWith('dated/') &&
              !k.startsWith('snapshot/'),
        ))
      throw const FormatException('Invalid history archive');
    return Map.of(history);
  }
  final state = backup['state'] ?? backup;
  if (state['logs'] is! Map && state['healthOS']?['days'] is! Map)
    throw const FormatException('Expected Move Strong backup');
  return {
    for (final e in (state['logs'] as Map? ?? {}).entries)
      'legacy/${e.key}': e.value,
    for (final e in (state['healthOS']?['days'] as Map? ?? {}).entries)
      'dated/${e.key}': e.value,
  };
}

List<Row> historyEvidence(Row history) {
  const names = {
    're-mon-cablerow': 'Cable row',
    're-tue-rdl': 'DB Romanian deadlift',
    're-tue-bss': 'Split squat',
    're-wed-swim': 'Easy swim',
    're-wed-er': 'External rotation',
    're-thu-bench': 'DB bench press',
    're-thu-dip': 'Assisted dip',
    're-thu-lsit': 'Tuck L-sit',
    're-fri-pushup': 'Push-up',
    're-sat-run': 'Easy run',
  };
  final result = <Row>[];
  for (final item in history.entries) {
    if (!item.key.startsWith('dated/') || item.value is! Map) continue;
    final day = item.value as Map, work = day['workout'];
    if (work is! Map || work['exercises'] is! Map) continue;
    final entries = <Row>[];
    for (final pair in (work['exercises'] as Map).entries) {
      final name = names[pair.key], record = pair.value;
      if (name == null || record is! Map) continue;
      final target = day['plan']?['exerciseOverrides']?[pair.key];
      if (target is! Map ||
          target['targetSets'] is! int ||
          target['targetReps'] is! int)
        continue;
      num? number(dynamic value) => num.tryParse(value?.toString() ?? '');
      entries.add({
        'name': name,
        'target': target['targetReps'],
        'plannedSets': target['targetSets'],
        'sets': [
          for (final v in record['sets'] ?? [])
            if (number(v) != null) number(v),
        ],
        'rir': number(record['rir']),
        'pain': number(work['painDuring']),
        'next': number(work['painNext']),
        'status': work['complete'] == true && record['done'] == true
            ? 'completed'
            : 'modified',
        'load': number(record['load']),
      });
    }
    if (entries.isNotEmpty)
      result.add({
        'date': item.key.substring(6),
        'actual': day['plan']?['title'],
        'exercises': entries,
        'source': 'imported',
      });
  }
  return result;
}
