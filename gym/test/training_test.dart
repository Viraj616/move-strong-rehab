import 'package:flutter_test/flutter_test.dart';
import 'package:move_strong/training.dart';

void main() {
  test(
    'imported dated evidence keeps missing recovery unknown and original heat notes intact',
    () {
      final backup = {
        'healthOS': {
          'days': {
            '2026-11-23': {
              'sauna': {'skin': 'fine'},
              'plan': {
                'exerciseOverrides': {
                  're-fri-pushup': {'targetSets': 2, 'targetReps': 8},
                },
              },
              'workout': {
                'complete': true,
                'exercises': {
                  're-fri-pushup': {
                    'sets': ['8', '8'],
                    'done': true,
                    'rir': '3',
                  },
                },
              },
            },
          },
        },
      };
      final archive = migrate(backup), evidence = historyEvidence(archive);
      expect(evidence.single['exercises'].single['next'], isNull);
      expect(archive['dated/2026-11-23']['sauna']['skin'], 'fine');
    },
  );
  Row pull(List<Row> logs, int w) =>
      draft(start.add(Duration(days: 7 * w)), logs)[0]['targets'][0];
  Row record(
    int week,
    Row target, {
    int pain = 0,
    int? next = 0,
    int rir = 3,
  }) => {
    'date': dayKey(start.add(Duration(days: 7 * week))),
    'exercises': [
      {
        ...target,
        'load': target['load'] ?? 20,
        'status': 'completed',
        'sets': List.filled(target['plannedSets'], target['target']),
        'pain': pain,
        'next': next,
        'rir': rir,
      },
    ],
  };
  test('three weeks drive fourth week assistance and deterministic export', () {
    final logs = <Row>[];
    for (var w = 0; w < 3; w++) {
      logs.add(record(w, pull(logs, w)));
    }
    expect(pull(logs, 3)['load'], lessThan(pull(logs, 2)['load']));
    expect(pull(logs, 3), pull(logs, 3));
  });
  test('hold incomplete recovery and regress symptoms', () {
    final t = pull([], 1);
    expect(pull([record(1, t, next: null)], 2)['state'], 'hold');
    expect(pull([record(1, t, pain: 4)], 2)['state'], 'regress');
    expect(pull([record(1, t, next: 1)], 2)['state'], 'regress');
  });
  test('week five deload; unknown kit and inflated AI suggestion rejected', () {
    final t = pull([], 3);
    expect(pull([record(3, t)], 4)['state'], 'deload');
    expect(
      catalogue.values.every((e) => e.$1.isEmpty || equipment.contains(e.$1)),
      true,
    );
    expect(rejectSuggestion({'name': 'ring dip'}, [t]), isNotNull);
    expect(rejectSuggestion({...t, 'plannedSets': 100}, [t]), isNotNull);
  });
  test('migration retains both original records', () {
    expect(
      migrate({
        'state': {
          'logs': {
            'w1': {'notes': 'test'},
          },
          'healthOS': {
            'days': {
              '2026-01-01': {'workout': {}},
            },
          },
        },
      }).keys,
      containsAll(['legacy/w1', 'dated/2026-01-01']),
    );
  });
}
