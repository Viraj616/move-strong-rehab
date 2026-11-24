import 'package:flutter/material.dart';

const ink = Color(0xff183d38);
const paper = Color(0xfff5f5ef);
const lime = Color(0xffd6ec97);
const muted = Color(0xff526860);
const edge = Color(0xffd8dfd5);
const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const months = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

ThemeData gymTheme() {
  final colors = ColorScheme.fromSeed(seedColor: ink).copyWith(
    primary: ink,
    onPrimary: Colors.white,
    surface: paper,
    onSurface: ink,
  );
  final border = OutlineInputBorder(
    borderRadius: BorderRadius.circular(12),
    borderSide: const BorderSide(color: edge),
  );
  return ThemeData(
    colorScheme: colors,
    scaffoldBackgroundColor: paper,
    appBarTheme: const AppBarTheme(
      backgroundColor: paper,
      foregroundColor: ink,
      centerTitle: false,
      scrolledUnderElevation: 0,
      titleTextStyle: TextStyle(
        color: ink,
        fontSize: 25,
        fontWeight: FontWeight.w800,
        letterSpacing: -.9,
      ),
    ),
    cardTheme: CardThemeData(
      color: Colors.white,
      elevation: 0,
      margin: const EdgeInsets.only(bottom: 8),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: const BorderSide(color: edge),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: const Color(0xfff7f8f3),
      border: border,
      enabledBorder: border,
      focusedBorder: border.copyWith(
        borderSide: const BorderSide(color: ink, width: 2),
      ),
      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
    ),
    listTileTheme: const ListTileThemeData(
      iconColor: muted,
      titleTextStyle: TextStyle(
        color: ink,
        fontSize: 16,
        fontWeight: FontWeight.w600,
      ),
      subtitleTextStyle: TextStyle(color: muted, fontSize: 13),
    ),
    navigationBarTheme: const NavigationBarThemeData(
      backgroundColor: Colors.white,
      indicatorColor: lime,
      height: 66,
    ),
    dividerTheme: const DividerThemeData(color: edge),
  );
}

class WeekBanner extends StatelessWidget {
  const WeekBanner({
    super.key,
    required this.week,
    required this.recorded,
    required this.active,
    required this.previous,
    required this.next,
  });
  final DateTime week;
  final List<bool> recorded, active;
  final VoidCallback previous, next;
  @override
  Widget build(BuildContext context) {
    final end = week.add(const Duration(days: 6));
    final range =
        '${week.day}${week.month == end.month ? '' : ' ${months[week.month - 1]}'}–${end.day} ${months[end.month - 1]}';
    final count = [
      for (var i = 0; i < 7; i++)
        if (active[i] && recorded[i]) i,
    ].length;
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.fromLTRB(20, 16, 12, 18),
      decoration: BoxDecoration(
        color: ink,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  '$range ${end.year}',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 24,
                    fontWeight: FontWeight.w700,
                    letterSpacing: -.7,
                  ),
                ),
              ),
              IconButton(
                tooltip: 'Previous week',
                color: Colors.white,
                onPressed: previous,
                icon: const Icon(Icons.chevron_left),
              ),
              IconButton(
                tooltip: 'Next week',
                color: Colors.white,
                onPressed: next,
                icon: const Icon(Icons.chevron_right),
              ),
            ],
          ),
          Text(
            '$count of ${active.where((a) => a).length} sessions logged',
            style: const TextStyle(color: Color(0xffd6e4db)),
          ),
          const SizedBox(height: 12),
          ExcludeSemantics(
            child: Row(
              children: [
                for (var i = 0; i < 7; i++)
                  Expanded(
                    child: Container(
                      height: 6,
                      margin: const EdgeInsets.only(right: 5),
                      decoration: BoxDecoration(
                        color: active[i]
                            ? (recorded[i] ? lime : const Color(0xff52716a))
                            : Colors.transparent,
                        border: Border.all(
                          color: active[i] && recorded[i]
                              ? lime
                              : const Color(0xff759189),
                        ),
                        borderRadius: BorderRadius.circular(4),
                      ),
                    ),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class DayStamp extends StatelessWidget {
  const DayStamp(this.date, {super.key, required this.today});
  final DateTime date;
  final bool today;
  @override
  Widget build(BuildContext context) => Container(
    width: 54,
    decoration: BoxDecoration(
      color: today ? lime : const Color(0xffecf1e9),
      borderRadius: BorderRadius.circular(12),
    ),
    child: Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Text(
          dayNames[date.weekday - 1].toUpperCase(),
          style: const TextStyle(
            fontSize: 10,
            fontWeight: FontWeight.w800,
            letterSpacing: 1,
            color: muted,
          ),
        ),
        Text(
          '${date.day}',
          style: const TextStyle(
            fontSize: 19,
            fontWeight: FontWeight.w800,
            color: ink,
          ),
        ),
      ],
    ),
  );
}

class SectionLabel extends StatelessWidget {
  const SectionLabel(this.text, {super.key});
  final String text;
  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.fromLTRB(4, 16, 4, 8),
    child: Text(
      text,
      style: const TextStyle(
        color: ink,
        fontSize: 20,
        fontWeight: FontWeight.w700,
        letterSpacing: -.5,
      ),
    ),
  );
}
