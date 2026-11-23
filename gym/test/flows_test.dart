import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:move_strong/gym_app.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  Future<void> launch(WidgetTester t) async {
    SharedPreferences.setMockInitialValues({});
    await t.binding.setSurfaceSize(const Size(900, 1400));
    addTearDown(() => t.binding.setSurfaceSize(null));
    await t.pumpWidget(const MaterialApp(home: GymApp()));
    await t.pumpAndSettle();
  }

  Future<void> tap(WidgetTester t, String label) async {
    final found = find.text(label).first;
    await t.ensureVisible(found);
    await t.tap(found);
    await t.pumpAndSettle();
  }

  testWidgets(
    'logging saves actual sets, load, RIR, recovery and both heat rounds',
    (t) async {
      await launch(t);
      await tap(t, 'Pull + core');
      final fields = find.byType(TextFormField);
      for (final pair in [
        (0, '6, 5, 4'),
        (1, '20'),
        (2, '3'),
        (3, '2'),
        (4, '0'),
      ]) {
        await t.ensureVisible(fields.at(pair.$1));
        await t.enterText(fields.at(pair.$1), pair.$2);
      }
      await tap(t, 'Add sauna');
      await tap(t, 'Add steam');
      for (final pair in [
        (3, '6'),
        (2, 'skin fine'),
        (1, '5'),
        (0, 'chest fine'),
      ]) {
        final f = fields.at(fields.evaluate().length - 1 - pair.$1);
        await t.ensureVisible(f);
        await t.enterText(f, pair.$2);
      }
      await tap(t, 'Save workout');
      final saved = jsonDecode(
        (await SharedPreferences.getInstance()).getString('gym.v1')!,
      )['logs'].single;
      expect(saved['heat'], [
        {'type': 'sauna', 'minutes': 6, 'note': 'skin fine'},
        {'type': 'steam', 'minutes': 5, 'note': 'chest fine'},
      ]);
      final e = saved['exercises'].first;
      expect(e['sets'], [6, 5, 4]);
      expect(e['load'], 20);
      expect(e['rir'], 3);
      expect(e['pain'], 2);
      expect(e['next'], 0);
    },
  );
  testWidgets('profile starting weight and retests persist edits', (t) async {
    await launch(t);
    await tap(t, 'Progress');
    await tap(t, 'Bodyweight · 65.0 kg');
    await t.enterText(find.byType(TextFormField), '66');
    await tap(t, 'Save');
    await tap(t, 'Max strict pull-ups');
    await t.enterText(find.byType(TextFormField), '4');
    await tap(t, 'Save');
    final data = jsonDecode(
      (await SharedPreferences.getInstance()).getString('gym.v1')!,
    );
    expect(data['kg'], 66);
    expect(data['baseline']['Max strict pull-ups'], 4);
  });
  testWidgets('Android reminder sends one selected time and cancellation', (
    t,
  ) async {
    debugDefaultTargetPlatformOverride = TargetPlatform.android;
    final messages = <dynamic>[];
    const channel = MethodChannel('move_strong/reminder');
    t.binding.defaultBinaryMessenger.setMockMethodCallHandler(channel, (
      call,
    ) async {
      messages.add(call.arguments);
      return null;
    });
    try {
      await launch(t);
      await tap(t, 'Progress');
      await tap(t, 'Workout reminder');
      await tap(t, 'OK');
      await t.tap(find.byIcon(Icons.notifications_off));
      await t.pumpAndSettle();
      expect(messages, [900, -1]);
    } finally {
      debugDefaultTargetPlatformOverride = null;
      t.binding.defaultBinaryMessenger.setMockMethodCallHandler(channel, null);
    }
  });
}
