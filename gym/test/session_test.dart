import 'package:flutter/material.dart' hide Row;
import 'package:flutter_test/flutter_test.dart';
import 'package:move_strong/gym_app.dart';
import 'package:move_strong/training.dart';

void main() {
  testWidgets('set entry keeps keyboard focus through inset changes', (
    tester,
  ) async {
    final day = draft(start, []).first;
    await tester.pumpWidget(MaterialApp(home: Session(day: day)));
    final field = find.byType(TextFormField).first;
    await tester.ensureVisible(field);
    await tester.tap(field);
    await tester.enterText(field, '6, 6');
    tester.view.viewInsets = const FakeViewPadding(bottom: 240);
    addTearDown(tester.view.resetViewInsets);
    await tester.pump();
    expect(
      tester
          .widget<EditableText>(find.byType(EditableText).first)
          .focusNode
          .hasFocus,
      isTrue,
    );
    expect(find.text('6, 6'), findsOneWidget);
  });
  test(
    'missed training supplies no evidence and swapped legs get recovery',
    () {
      final t = draft(start, [])[1];
      final log = {
        'date': dayKey(start),
        'actual': t['title'],
        'exercises': [],
      };
      expect(draft(start, [log])[1]['targets'], isEmpty);
      expect(
        draft(start, [
          {...log, 'actual': 'Missed'},
        ])[1]['targets'],
        isNotEmpty,
      );
    },
  );
}
