import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:move_strong/gym_app.dart';

void main() {
  testWidgets(
    'full backup survives export and restore into a fresh installation',
    (t) async {
      final data = {
        'logs': [
          {
            'date': '2026-11-23',
            'actual': 'Pull',
            'exercises': [],
            'heat': [
              {'minutes': 11},
            ],
          },
        ],
        'history': {
          'legacy/1': {'note': 'history'},
        },
        'baseline': {'Max push-ups': 15},
        'kg': 66.5,
      };
      const channel = MethodChannel('move_strong/backup');
      const reminders = MethodChannel('move_strong/reminder');
      String? file;
      int? alarm;
      debugDefaultTargetPlatformOverride = TargetPlatform.android;
      final messenger = t.binding.defaultBinaryMessenger;
      messenger.setMockMethodCallHandler(channel, (call) async {
        if (call.method == 'export') {
          file = call.arguments as String;
          return true;
        }
        return file;
      });
      messenger.setMockMethodCallHandler(reminders, (call) async {
        alarm = call.arguments as int;
        return null;
      });
      try {
        SharedPreferences.setMockInitialValues({
          'gym.v1': jsonEncode(data),
          'reminder': '15:00',
          'reminderMinutes': 900,
          'historyImported': true,
        });
        Future<void> open() async {
          await t.pumpWidget(const MaterialApp(home: GymApp()));
          await t.pumpAndSettle();
          await t.tap(find.text('Progress'));
          await t.pumpAndSettle();
        }

        await open();
        await t.tap(find.text('Export all data'));
        await t.pumpAndSettle();
        expect(jsonDecode(file!)['history'], data['history']);
        await t.pumpWidget(const SizedBox());
        await t.pumpAndSettle();
        SharedPreferences.setMockInitialValues({});
        await open();
        await t.tap(find.text('Restore full backup'));
        await t.pumpAndSettle();
        await t.tap(find.text('Restore'));
        await t.pumpAndSettle();
        final p = await SharedPreferences.getInstance();
        expect(jsonDecode(p.getString('gym.v1')!), data);
        expect(p.getBool('historyImported'), true);
        expect(p.getString('reminder'), '15:00');
        expect(alarm, 900);
      } finally {
        debugDefaultTargetPlatformOverride = null;
        messenger.setMockMethodCallHandler(channel, null);
        messenger.setMockMethodCallHandler(reminders, null);
      }
    },
  );
}
