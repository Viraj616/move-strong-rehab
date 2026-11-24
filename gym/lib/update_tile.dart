import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class UpdateTile extends StatefulWidget {
  const UpdateTile({super.key});
  @override
  State<UpdateTile> createState() => _UpdateTileState();
}

class _UpdateTileState extends State<UpdateTile> {
  static const channel = MethodChannel('move_strong/updates');
  int? available;
  bool busy = false;
  String status = '';

  Future<void> update() async {
    setState(() {
      busy = true;
      status = available == null
          ? 'Checking GitHub Releases…'
          : 'Preparing signed update…';
    });
    try {
      if (available == null) {
        available = await channel.invokeMethod<int>('check');
        status = available == null
            ? 'You have the latest release.'
            : 'Tap to download and open the Android installer.';
      } else {
        final result = await channel.invokeMethod<String>('install');
        status = result == 'permission'
            ? 'Allow from this source, return here, then tap Update again.'
            : 'Confirm Update in the Android installer.';
      }
    } on PlatformException catch (e) {
      available = null;
      status =
          'Could not update. ${e.message ?? 'Check your connection and try again.'}';
    } finally {
      if (mounted) setState(() => busy = false);
    }
  }

  @override
  Widget build(BuildContext context) => ListTile(
    leading: const Icon(Icons.system_update),
    title: Text(
      available == null ? 'Check for updates' : 'Update to 1.0.$available',
    ),
    subtitle: status.isEmpty ? null : Text(status),
    onTap: busy ? null : update,
  );
}
