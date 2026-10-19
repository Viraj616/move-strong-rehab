(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.MassageGunGuidance = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const TARGET_RULES = [
    {
      id: 'quads', label: 'Quadriceps', priority: 1,
      pattern: /squat|split squat|lunge|step[- ]?up|leg press|hack squat|knee lift|bike|cycling|rowing|rower|stair|run|jog/i
    },
    {
      id: 'glutes', label: 'Glute muscle bellies', priority: 2,
      pattern: /squat|split squat|lunge|step[- ]?up|hinge|romanian|\brdl\b|good morning|bridge|back extension|reverse hyper|run|jog|bike|cycling|rowing|rower/i
    },
    {
      id: 'hamstrings', label: 'Hamstrings', priority: 3,
      pattern: /hinge|romanian|\brdl\b|hamstring|good morning|bridge|back extension|reverse hyper|run|jog/i
    },
    {
      id: 'calves', label: 'Calves', priority: 4,
      pattern: /calf|run|jog|walk|stair|step[- ]?up|interval/i
    },
    {
      id: 'upper-back', label: 'Lat / upper-back muscle bellies', priority: 5,
      pattern: /\brow\b|pull|hang|down[- ]?dog|bird dog|y[- ]?raise|face pull|lat /i,
      shoulderCaution: true
    },
    {
      id: 'arms', label: 'Triceps or forearms', priority: 6,
      pattern: /push[- ]?up|press|triceps|curl|pull[- ]?up|hang/i,
      exclude: /leg press/i,
      shoulderCaution: true
    }
  ];

  function unique(values) {
    return [...new Set(values)];
  }

  function targetsForExercises(exercises) {
    const safeExercises = Array.isArray(exercises) ? exercises : [];
    return TARGET_RULES.map(rule => {
      const exerciseNames = unique(safeExercises
        .map(exercise => String(exercise?.name || '').trim())
        .filter(name => name && rule.pattern.test(name) && !rule.exclude?.test(name)));
      return exerciseNames.length ? { ...rule, exerciseNames } : null;
    }).filter(Boolean).sort((a, b) => a.priority - b.priority);
  }

  function forExercises(exercises) {
    const targets = targetsForExercises(exercises);
    return {
      targets,
      hasShoulderAdjacentTarget: targets.some(target => target.shoulderCaution),
      before: {
        speed: 'Speed 1 (2,000 rpm)',
        heat: 'Heat off',
        attachment: 'Soft ball head',
        duration: '30–45 sec per selected muscle · 3 min total max'
      },
      after: {
        speed: 'Speed 1–2',
        heat: 'Heat off by default; low heat (40°C) is optional later',
        attachment: 'Soft ball head; heat head only for low heat',
        duration: '60–90 sec per sore muscle · 6 min total max'
      }
    };
  }

  return { forExercises, targetsForExercises };
});
