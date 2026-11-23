import 'dart:convert';
import 'dart:io';
import '../lib/training.dart';

/// Outputs a new importable archive. Existing files, including the input,
/// cannot be overwritten. Conflicting historical snapshots stay independent.
void main(List<String> args) {
  if (args.length < 2) {
    stderr.writeln(
      'Usage: dart run bin/migrate_history.dart NEWEST_COPY [OLDER_COPY ...] NEW_OUTPUT',
    );
    exitCode = 64;
    return;
  }
  try {
    final history = <String, dynamic>{};
    final provenance = <Row>[];
    int duplicates = 0, versions = 0;
    for (final path in args.take(args.length - 1)) {
      final source = jsonDecode(File(path).readAsStringSync()) as Row;
      final state = source['state'] ?? source;
      provenance.add({
        'exportedAt': source['exportedAt'],
        'startDate': state['startDate'],
      });
      for (final e in migrate(source).entries) {
        if (!history.containsKey(e.key)) {
          history[e.key] = e.value;
          continue;
        }
        if (jsonEncode(history[e.key]) == jsonEncode(e.value)) {
          duplicates++;
          continue;
        }
        history['snapshot/${provenance.length}/${e.key}'] = e.value;
        versions++;
      }
    }
    final usable = <Row>[], failed = <String>[];
    for (final entry in history.entries) {
      try {
        if (entry.value is! Map) throw const FormatException();
        usable.addAll(historyEvidence({entry.key: entry.value}));
      } catch (_) {
        failed.add(entry.key);
      }
    }
    final archive = {
      'format': 'move-strong.history.v1',
      'history': history,
      'sources': provenance,
    };
    final bytes = utf8.encode(jsonEncode(archive));
    final target = File(args.last)..createSync(exclusive: true);
    target.writeAsBytesSync(bytes, flush: true);
    final verified = migrate(jsonDecode(target.readAsStringSync()));
    if (jsonEncode(history) != jsonEncode(verified))
      throw StateError('Archive verification failed');
    print(
      jsonEncode({
        'duplicates': duplicates,
        'olderVersions': versions,
        'legacy': history.keys.where((k) => k.startsWith('legacy/')).length,
        'dated': history.keys.where((k) => k.startsWith('dated/')).length,
        'archived': history.length,
        'evidenceDays': usable.length,
        'evidenceExercises': usable.fold<int>(
          0,
          (n, r) => n + (r['exercises'] as List).length,
        ),
        'malformedRecords': failed,
        'roundTrip': true,
      }),
    );
    if (failed.isNotEmpty) exitCode = 2;
  } catch (e) {
    stderr.writeln('Migration failed: $e');
    exitCode = 1;
  }
}
