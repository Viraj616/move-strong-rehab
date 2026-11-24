import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:move_strong/appearance.dart';
import 'package:move_strong/gym_app.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  testWidgets(
    'training week fits a narrow phone and supports week navigation',
    (tester) async {
      SharedPreferences.setMockInitialValues({});
      await tester.binding.setSurfaceSize(const Size(320, 640));
      addTearDown(() => tester.binding.setSurfaceSize(null));
      await tester.pumpWidget(
        MaterialApp(theme: gymTheme(), home: const GymApp()),
      );
      await tester.pumpAndSettle();
      expect(find.text('0 of 6 sessions logged'), findsOneWidget);
      final initial = tester.widget<WeekBanner>(find.byType(WeekBanner)).week;
      await tester.tap(find.byTooltip('Next week'));
      await tester.pumpAndSettle();
      expect(
        tester
            .widget<WeekBanner>(find.byType(WeekBanner))
            .week
            .difference(initial)
            .inDays,
        7,
      );
      await tester.tap(find.byTooltip('Previous week'));
      await tester.pumpAndSettle();
      expect(tester.widget<WeekBanner>(find.byType(WeekBanner)).week, initial);
      expect(tester.takeException(), isNull);
    },
  );
}
