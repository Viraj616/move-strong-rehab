import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class SetEntry extends StatefulWidget {
  const SetEntry(this.exercise, {super.key});
  final Map<String, dynamic> exercise;
  @override
  State<SetEntry> createState() => _SetEntryState();
}

class _SetEntryState extends State<SetEntry> {
  late final List<String> values;
  @override
  void initState() {
    super.initState();
    final e = widget.exercise, saved = e['sets'] as List;
    final positions = e['setNumbers'] as List?;
    values = List.filled(e['plannedSets'] as int, '', growable: true);
    for (var i = 0; i < saved.length; i++) {
      final slot =
          positions != null &&
              i < positions.length &&
              positions[i] is int &&
              positions[i] > 0
          ? positions[i] as int
          : i + 1;
      values.addAll(List.filled(math.max(0, slot - values.length), ''));
      values[slot - 1] = saved[i].toString();
    }
  }

  void save() {
    final numbers = <int>[], sets = <num>[];
    for (var i = 0; i < values.length; i++) {
      final n = num.tryParse(values[i]);
      if (n != null && n.isFinite && n >= 0) {
        numbers.add(i + 1);
        sets.add(n);
      }
    }
    widget.exercise['sets'] = sets;
    widget.exercise['setNumbers'] = numbers;
  }

  @override
  Widget build(BuildContext context) {
    final unit = widget.exercise['unit'] as String;
    final reps = unit.startsWith('reps');
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: [
            for (var i = 0; i < values.length; i++)
              SizedBox(
                width: 112,
                child: TextFormField(
                  key: ValueKey(i),
                  initialValue: values[i],
                  decoration: InputDecoration(
                    labelText: 'Set ${i + 1}',
                    helperText: unit,
                  ),
                  keyboardType: TextInputType.numberWithOptions(decimal: !reps),
                  textInputAction: TextInputAction.next,
                  inputFormatters: reps
                      ? [FilteringTextInputFormatter.digitsOnly]
                      : null,
                  validator: (s) {
                    if (s == null || s.isEmpty) return null;
                    final n = num.tryParse(s);
                    return n == null ||
                            !n.isFinite ||
                            n < 0 ||
                            (reps && n != n.truncate())
                        ? 'Check value'
                        : null;
                  },
                  onChanged: (v) => values[i] = v,
                  onSaved: (_) => save(),
                ),
              ),
          ],
        ),
        if (widget.exercise['plannedSets'] > 0)
          TextButton.icon(
            icon: const Icon(Icons.add),
            label: const Text('Add set'),
            onPressed: () => setState(() => values.add('')),
          ),
      ],
    );
  }
}
