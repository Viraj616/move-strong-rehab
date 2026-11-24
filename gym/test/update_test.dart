import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:move_strong/update_tile.dart';

void main() {
  testWidgets(
    'updater checks on demand and starts installer only after confirmation',
    (t) async {
      const channel = MethodChannel('move_strong/updates');
      final calls = <String>[];
      int? version;
      final messenger = t.binding.defaultBinaryMessenger;
      messenger.setMockMethodCallHandler(channel, (c) async {
        calls.add(c.method);
        if (c.method == 'check') return version;
        return calls.length == 3 ? 'permission' : 'installer';
      });
      addTearDown(() => messenger.setMockMethodCallHandler(channel, null));
      await t.pumpWidget(const MaterialApp(home: Scaffold(body: UpdateTile())));
      Future<void> tap(String label) async {
        await t.tap(find.text(label));
        await t.pumpAndSettle();
      }

      await tap('Check for updates');
      expect(find.text('You have the latest release.'), findsOneWidget);
      version = 9;
      await tap('Check for updates');
      expect(calls, ['check', 'check']);
      await tap('Update to 1.0.9');
      expect(find.textContaining('Allow from this source'), findsOneWidget);
      await tap('Update to 1.0.9');
      expect(find.textContaining('Confirm Update'), findsOneWidget);
    },
  );
}
