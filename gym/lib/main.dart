import 'package:flutter/material.dart';
import 'gym_app.dart';

void main() => runApp(
  MaterialApp(
    title: 'Move Strong',
    theme: ThemeData(colorSchemeSeed: const Color(0xff205948)),
    home: const GymApp(),
  ),
);
