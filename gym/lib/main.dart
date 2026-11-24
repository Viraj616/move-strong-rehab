import 'package:flutter/material.dart';
import 'gym_app.dart';
import 'appearance.dart';

void main() => runApp(
  MaterialApp(
    title: 'Move Strong',
    theme: gymTheme(),
    debugShowCheckedModeBanner: false,
    home: const GymApp(),
  ),
);
