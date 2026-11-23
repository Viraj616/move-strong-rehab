import 'package:web/web.dart' as web;

String? readOldStorage() =>
    web.window.localStorage.getItem('moveStrongRehabStateV1');
