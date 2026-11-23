import 'package:flutter/material.dart';

// Side-view landmarks, in order: shoulder, pelvis, knee, foot, elbow, hand.
const poses = <String, List<int>>{
  'stand': [45, 24, 45, 49, 44, 67, 43, 86, 49, 40, 52, 52],
  'squat': [42, 36, 50, 57, 34, 62, 40, 86, 50, 42, 55, 36],
  'hinge': [25, 39, 53, 48, 47, 68, 44, 86, 26, 52, 29, 67],
  'lunge': [44, 37, 43, 60, 27, 61, 28, 84, 45, 49, 46, 60],
  'hang': [45, 36, 45, 55, 44, 71, 44, 85, 45, 23, 45, 10],
  'pull': [45, 17, 46, 37, 45, 53, 45, 67, 33, 25, 45, 10],
  'row': [54, 31, 54, 57, 35, 56, 28, 74, 39, 36, 23, 41],
  'rowEnd': [54, 31, 54, 57, 35, 56, 28, 74, 67, 44, 51, 46],
  'support': [41, 27, 42, 47, 40, 62, 41, 77, 41, 39, 41, 51],
  'dip': [41, 37, 42, 57, 40, 72, 41, 86, 54, 44, 41, 51],
  'tuck': [42, 28, 44, 52, 29, 45, 30, 60, 41, 42, 40, 56],
  'plank': [60, 40, 41, 50, 26, 57, 13, 64, 60, 53, 60, 66],
  'low': [60, 53, 40, 58, 26, 61, 13, 64, 71, 58, 60, 66],
  'bench': [59, 51, 37, 51, 23, 63, 23, 80, 60, 39, 60, 25],
  'benchLow': [59, 51, 37, 51, 23, 63, 23, 80, 72, 55, 67, 42],
  'pike': [52, 48, 38, 26, 23, 46, 12, 69, 57, 57, 63, 68],
  'wall': [52, 30, 41, 52, 35, 65, 29, 82, 60, 34, 69, 31],
  'wallEnd': [56, 30, 44, 52, 36, 65, 29, 82, 61, 38, 69, 31],
  'cuff': [47, 29, 47, 52, 47, 67, 47, 83, 47, 46, 57, 47],
  'cuffEnd': [47, 29, 47, 52, 47, 67, 47, 83, 47, 46, 36, 47],
  'bridge': [63, 65, 40, 66, 30, 48, 19, 70, 52, 69, 42, 71],
  'bridgeEnd': [63, 65, 40, 49, 30, 44, 19, 70, 52, 69, 42, 71],
  'swim': [54, 46, 33, 47, 22, 48, 10, 50, 65, 35, 74, 43],
  'swimEnd': [54, 46, 33, 47, 22, 51, 10, 52, 66, 44, 79, 44],
  'run': [49, 27, 43, 49, 57, 54, 45, 67, 38, 39, 45, 42],
  'runEnd': [49, 27, 43, 49, 35, 62, 23, 62, 57, 43, 65, 38],
};
const frames = {
  'Squat': ['stand', 'squat'],
  'DB Romanian deadlift': ['stand', 'hinge'],
  'Split squat': ['stand', 'lunge'],
  'Assisted pull-up': ['hang', 'pull'],
  'Cable row': ['row', 'rowEnd'],
  'Tuck L-sit': ['tuck', 'tuck'],
  'Easy swim': ['swim', 'swimEnd'],
  'External rotation': ['cuff', 'cuffEnd'],
  'Wall push-up plus': ['wall', 'wallEnd'],
  'DB bench press': ['benchLow', 'bench'],
  'Assisted dip': ['support', 'dip'],
  'Pike hold': ['pike', 'pike'],
  'Push-up': ['plank', 'low'],
  'Glute bridge': ['bridge', 'bridgeEnd'],
  'Easy run': ['run', 'runEnd'],
};

class MotionDemo extends StatefulWidget {
  final String name;
  const MotionDemo(this.name, {super.key});
  @override
  State<MotionDemo> createState() => _MotionDemoState();
}

class _MotionDemoState extends State<MotionDemo>
    with SingleTickerProviderStateMixin {
  late final controller = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 1400),
  )..repeat(reverse: true);
  @override
  void dispose() {
    controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => CustomPaint(
    size: const Size(130, 105),
    painter: _Pose(widget.name, controller),
  );
}

class _Pose extends CustomPainter {
  final String name;
  final Animation<double> animation;
  _Pose(this.name, this.animation) : super(repaint: animation);
  @override
  void paint(Canvas canvas, Size size) {
    final pair = frames[name];
    if (pair == null) return;
    final a = poses[pair[0]]!,
        b = poses[pair[1]]!,
        t = Curves.easeInOut.transform(animation.value);
    Offset point(int i) =>
        Offset(a[i] + (b[i] - a[i]) * t, a[i + 1] + (b[i + 1] - a[i + 1]) * t);
    final pen = Paint()
      ..color = const Color(0xff245941)
      ..strokeWidth = 4
      ..strokeCap = StrokeCap.round;
    for (final segment in [(0, 2), (2, 4), (4, 6), (0, 8), (8, 10)]) {
      canvas.drawLine(point(segment.$1), point(segment.$2), pen);
    }
    canvas.drawCircle(point(0) + const Offset(1, -7), 5, pen);
    if (pair[0] == pair[1])
      canvas.drawLine(const Offset(20, 94), Offset(20 + 50 * t, 94), pen);
  }

  @override
  bool shouldRepaint(_Pose old) => old.name != name;
}
