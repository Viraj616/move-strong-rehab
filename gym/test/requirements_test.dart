import 'dart:convert';
import 'dart:io';
import 'package:flutter/material.dart' hide Row;
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:move_strong/gym_app.dart';
import 'package:move_strong/training.dart';
import 'package:move_strong/demo.dart';

Row entry(
  String name, {
  int pain = 0,
  int rir = 3,
  String status = 'completed',
}) => {
  'name': name,
  'status': status,
  'plannedSets': 3,
  'target': 6,
  'sets': [6, 6, 6],
  'pain': pain,
  'next': 0,
  'rir': rir,
  'stage': 0,
  'load': 0,
  'skillReady': true,
};
Row log(int offset, Row e, {int fatigue = 1}) => {
  'date': dayKey(start.add(Duration(days: offset))),
  'exercises': [e],
  'fatigue': fatigue,
};
Row target(List<Row> logs, String name, {Row baseline = const {}}) =>
    draft(start.add(const Duration(days: 14)), logs, baseline: baseline)
        .expand((p) => p['targets'] as List)
        .cast<Row>()
        .firstWhere((t) => t['name'] == name);
void main() {
  test('calendar, re-entry volume, prehab, rest and asthma cues', () {
    final first = draft(start, []),
        second = draft(start.add(const Duration(days: 7)), []);
    expect(first.map((p) => p['title']), schedule);
    expect(first.last['targets'], isEmpty);
    for (final i in [0, 3, 4])
      expect(
        (first[i]['targets'] as List).map((e) => e['name']),
        containsAll(prehab),
      );
    expect(first[1]['targets'][0]['plannedSets'], 3);
    expect(second[1]['targets'][0]['plannedSets'], 4);
    for (final p in first) {
      for (final e in p['targets']) {
        expect(frames.containsKey(e['name']), true);
        expect(e['restSeconds'], greaterThan(0));
        expect(e['cue'], isNotEmpty);
      }
    }
    expect(first[5]['targets'][0]['cue'], contains('Warm up'));
    expect(first[2]['targets'][0]['cue'], contains('Warm up'));
  });
  test('pain boundary, incomplete sets, low RIR and skipped exercises', () {
    Row review(Row e) => target([log(7, e)], 'Push-up');
    expect(review(entry('Push-up', pain: 3))['state'], 'progress');
    for (final e in [
      entry('Push-up', rir: 2),
      entry('Push-up', status: 'skipped'),
      {
        ...entry('Push-up'),
        'sets': [6, 5],
      },
    ]) {
      expect(review(e)['state'], 'hold');
    }
    expect(review(entry('Push-up', pain: 4))['state'], 'regress');
  });
  test(
    'two stalled weeks trigger review and fatigue triggers early deload',
    () {
      final e = entry('Squat', status: 'modified');
      expect(
        target([log(1, e), log(8, e)], 'Squat')['reason'],
        contains('recovery'),
      );
      expect(
        target([
          log(7, e, fatigue: 8),
          log(8, e, fatigue: 9),
        ], 'Squat')['state'],
        'deload',
      );
    },
  );
  test('focal symptoms block loading across exercises', () {
    final plan = draft(start, [
      log(0, {...entry('Push-up'), 'flag': true}),
    ]);
    expect(plan[3]['targets'].first['plannedSets'], 0);
  });
  test('calisthenics stages require performance and readiness', () {
    for (final name in pathways.keys) {
      final e = entry(name);
      final baseline = {'Max strict pull-ups': 4};
      expect(
        target([log(0, e), log(7, e)], name, baseline: baseline)['stage'],
        1,
      );
      expect(
        target(
          [
            log(0, e),
            log(7, {...e, 'skillReady': false}),
          ],
          name,
          baseline: baseline,
        )['stage'],
        0,
      );
    }
    expect(
      target([], 'Tuck L-sit', baseline: {'Max tuck L-sit (s)': 8})['target'],
      6,
    );
  });
  test('assisted dips and strength load increases stay conservative', () {
    final dip = {...entry('Assisted dip'), 'load': 20};
    expect(target([log(7, dip)], 'Assisted dip')['state'], 'hold');
    expect(target([log(0, dip), log(7, dip)], 'Assisted dip')['load'], 19);
    expect(
      target([
        log(7, {
          ...entry('Squat'),
          'target': 12,
          'sets': [12, 12, 12],
          'load': 40,
        }),
      ], 'Squat')['load'],
      41,
    );
  });
  test('AI validator checks reason, load, volume, keys and suspended work', () {
    final t = target([], 'Squat');
    final s = {
      for (final k in ['name', 'load', 'plannedSets', 'target']) k: t[k],
      'reason': 'Reviewed',
    };
    expect(rejectSuggestion(s, [t]), isNull);
    for (final edit in [
      {'reason': ''},
      {'load': 100},
      {'plannedSets': 99},
      {'target': 100},
      {'kit': 'rings'},
    ]) {
      expect(rejectSuggestion({...s, ...edit}, [t]), isNotNull);
    }
    expect(
      rejectSuggestion(s, [
        {...t, 'plannedSets': 0},
      ]),
      isNotNull,
    );
  });
  test('migration CLI preserves both versions and refuses overwrite', () async {
    final folder = await Directory.systemTemp.createTemp('gym-history-test');
    addTearDown(() => folder.delete(recursive: true));
    final a = File('${folder.path}/a.json')
      ..writeAsStringSync('{"logs":{"one":{"v":2}}}');
    final b = File('${folder.path}/b.json')
      ..writeAsStringSync('{"logs":{"one":{"v":1}}}');
    final out = File('${folder.path}/out.json');
    final sdk = Platform.environment['FLUTTER_ROOT']!;
    final dart =
        '$sdk/bin/cache/dart-sdk/bin/dart${Platform.isWindows ? ".exe" : ""}';
    final args = ['bin/migrate_history.dart', a.path, b.path, out.path];
    expect((await Process.run(dart, args)).exitCode, 0);
    final before = out.readAsStringSync();
    expect(migrate(jsonDecode(before)).length, 2);
    expect((await Process.run(dart, args)).exitCode, isNot(0));
    expect(out.readAsStringSync(), before);
    expect(a.readAsStringSync(), '{"logs":{"one":{"v":2}}}');
  });
  testWidgets(
    'Export week copies targets, logs, heat, profile and next draft',
    (tester) async {
      final week = monday(DateTime.now());
      final saved = {
        'date': dayKey(week),
        'actual': 'Pull + core',
        'heat': [
          {'type': 'steam', 'minutes': 10, 'note': 'skin fine'},
        ],
        'fatigue': 3,
        'sleep': 8,
        'exercises': [],
      };
      SharedPreferences.setMockInitialValues({
        'gym.v1': jsonEncode({
          'logs': [saved],
          'baseline': {'Max push-ups': 15},
          'kg': 66,
        }),
      });
      String? payload;
      tester.binding.defaultBinaryMessenger.setMockMethodCallHandler(
        SystemChannels.platform,
        (call) async {
          if (call.method == 'Clipboard.setData')
            payload = call.arguments['text'];
          return null;
        },
      );
      addTearDown(
        () => tester.binding.defaultBinaryMessenger.setMockMethodCallHandler(
          SystemChannels.platform,
          null,
        ),
      );
      await tester.pumpWidget(const MaterialApp(home: GymApp()));
      await tester.pumpAndSettle();
      await tester.scrollUntilVisible(find.text('Export week'), 300);
      await tester.tap(find.text('Export week'));
      await tester.pumpAndSettle();
      final data = jsonDecode(payload!);
      expect(data['logs'], [saved]);
      expect(data['baseline']['Max push-ups'], 15);
      expect(data['targets'].length, 7);
      expect(
        data['draft'].first['date'],
        dayKey(week.add(const Duration(days: 7))),
      );
      expect(data['profile']['bodyweightKg'], 66);
    },
  );
}
