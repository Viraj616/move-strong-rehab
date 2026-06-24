/* Move Strong Rehab — local-first six-week programme */

const APP_VERSION = '1.0.0';
const STORAGE_KEY = 'moveStrongRehabStateV1';

const ex = (id, name, prescription, sets, unit, diagram, cues, rehab, group = 'Main work', videoQuery = '') => ({
  id, name, prescription, sets, unit, diagram, cues, rehab, group,
  videoQuery: videoQuery || `${name} exercise technique`
});

const PROGRAMME = [
  {
    day: 1,
    title: 'Push & scapular control',
    focus: 'Pain-free pressing, serratus function and controlled shoulder-blade movement.',
    morning: {
      title: 'Shoulder motion + squat', duration: '10–20 min', intensity: 'Easy · 3–4/10 effort',
      exercises: [
        ex('d1m-breath', 'Relaxed diaphragmatic breathing', '5 slow breaths', 1, 'breaths', 'breathing', ['Lie on your back with knees bent.', 'Breathe quietly into the lower ribs and abdomen.', 'Let the neck and shoulders stay relaxed.'], 'No forced chest expansion or shoulder elevation.', 'Reset', 'diaphragmatic breathing exercise'),
        ex('d1m-catcow', 'Cat–cow', '6–8 slow reps', 1, 'reps', 'catcow', ['Move gradually between a rounded and gently extended spine.', 'Keep elbows straight and spread pressure evenly through both hands.'], 'Use a smaller range if loading through the operated side feels uneven.', 'Mobility', 'Strength Side cat cow mobility'),
        ex('d1m-hiprot', 'Standing hip rotations', '6 each direction per leg', 2, 'reps', 'standing', ['Hold a wall lightly.', 'Make slow circles from the hip without twisting the trunk.'], 'The supporting arm is only for balance; do not hang through it.', 'Mobility', 'Strength Side hip rotations'),
        ex('d1m-wallslide', 'Forearm wall slide', '8–10 reps', 2, 'reps', 'wallslide', ['Keep forearms gently pressing into the wall.', 'Slide upward without shrugging.', 'Finish before the ribs flare.'], 'Stop before pinching, plate-site pain or loss of shoulder symmetry.', 'Shoulder control', 'serratus forearm wall slide'),
        ex('d1m-scap', 'Wall or counter scapular push-up', '10 reps', 2, 'reps', 'wallpush', ['Keep elbows straight.', 'Let the chest move slightly toward the support, then push the floor or wall away.', 'Move through the shoulder blades rather than the neck.'], 'Choose a high support so the operated side remains level.', 'Shoulder control', 'scapular push up wall'),
        ex('d1m-squat', 'Supported deep squat hold', '30–45 sec', 2, 'sec', 'squat', ['Hold a doorframe if needed.', 'Keep the whole foot grounded.', 'Breathe and gently shift between hips.'], 'Use the hands only for balance, not traction.', 'Mobility', 'Strength Side deep squat hold'),
        ex('d1m-deadbug', 'Dead bug', '6–8 each side', 2, 'reps', 'deadbug', ['Keep the lower back gently supported by the floor.', 'Move opposite arm and leg slowly.', 'Exhale as the limbs extend.'], 'Keep the operated arm within a comfortable overhead range.', 'Core', 'dead bug exercise technique')
      ]
    },
    evening: {
      title: 'Push & scapular control', duration: '55–65 min', intensity: 'Leave 2–3 reps in reserve',
      exercises: [
        ex('d1e-warm', 'Progressive warm-up', '5 min easy bike + 3 min build; 8 wall slides; 12 band external rotations; 8 counter scapular push-ups', 1, 'round', 'cardio', ['Increase temperature gradually.', 'Use the shoulder drills to check symmetry before loading.'], 'If the shoulder feels worse as you warm up, reduce the session rather than pushing through.', 'Warm-up', 'shoulder warm up wall slide external rotation'),
        ex('d1e-pushup', 'Incline push-up', '3 × 8–12', 3, 'reps', 'pushup', ['Use a bench or fixed bar.', 'Lower the chest as one unit.', 'At the top, finish with a gentle push-away rather than a shrug.'], 'Choose a height that keeps pain at 0–2/10 and both shoulders level.', 'Strength Side pairing', 'Strength Side push up technique'),
        ex('d1e-goblet', 'Goblet squat', '3 × 8–10', 3, 'reps', 'squat', ['Hold the weight close to the chest.', 'Sit between the hips while keeping the whole foot down.', 'Stand without rushing the final third.'], 'Keep the dumbbell below the clavicle and avoid resting it on the plate area.', 'Strength Side pairing', 'Strength Side goblet squat'),
        ex('d1e-landmine', 'Half-kneeling single-arm landmine press', '3 × 8 each side', 3, 'reps', 'landmine', ['Set the ribs over the pelvis.', 'Press forward and upward in the line of the bar.', 'Allow the shoulder blade to rotate naturally.'], 'Use a light load and stop before shrugging or pain near the plate.', 'Pressing strength', 'half kneeling landmine press technique'),
        ex('d1e-serratus', 'Cable serratus punch', '3 × 10–12 each side', 3, 'reps', 'press', ['Keep the arm just below shoulder height.', 'Reach forward by moving the shoulder blade around the ribs.', 'Return without pulling the shoulder aggressively back.'], 'Use a smooth range; no snapping or painful clicking.', 'Shoulder support', 'cable serratus punch'),
        ex('d1e-facepull', 'Face pull', '2–3 × 12–15', 3, 'reps', 'pull', ['Pull toward eyebrow level.', 'Keep the neck long.', 'Finish with the hands apart and shoulder blades controlled.'], 'Do not force an exaggerated squeeze behind the body.', 'Shoulder support', 'face pull exercise technique'),
        ex('d1e-triceps', 'Cable triceps press-down', '2 × 10–12', 2, 'reps', 'pressdown', ['Keep upper arms quiet beside the body.', 'Extend the elbows smoothly.', 'Avoid leaning your bodyweight onto the cable.'], 'Keep the shoulder neutral and pain-free.', 'Accessories', 'cable triceps pressdown'),
        ex('d1e-sideplank', 'Side plank', '2 × 20–40 sec each side', 2, 'sec', 'sideplank', ['Start from the knees if needed.', 'Push the supporting surface away.', 'Keep ribs and pelvis stacked.'], 'Use the knee regression on the operated side until support is comfortable and stable.', 'Core', 'side plank regression technique')
      ]
    }
  },
  {
    day: 2,
    title: 'Lower body & aerobic base',
    focus: 'Strength Side-inspired lower-body patterns with shoulder-neutral loading.',
    morning: {
      title: 'Hips + controlled upper-body range', duration: '10–20 min', intensity: 'Easy · one or two rounds',
      exercises: [
        ex('d2m-9090', '90/90 hip transitions', '6 each direction', 2, 'reps', 'hip90', ['Sit tall and rotate both knees from side to side.', 'Use the hands behind you only as much as needed.', 'Keep the movement slow.'], 'Do not lean heavily through the operated arm.', 'Hip mobility', 'Strength Side 90 90 hip switches'),
        ex('d2m-hinge', 'Straight-leg hip hinge', '8 reps + 10-sec final hold', 1, 'round', 'hinge', ['Push the hips backwards.', 'Keep the spine long and knees softly unlocked.', 'Stop when the hamstrings limit the movement.'], 'Let the arms hang naturally; do not pull the shoulders down.', 'Posterior chain', 'Strength Side pike hip hinge'),
        ex('d2m-couch', 'Couch stretch', '30–45 sec each side', 2, 'sec', 'couch', ['Place the rear knee on padding.', 'Tuck the pelvis slightly.', 'Stay tall rather than arching the lower back.'], 'Use a wall for balance with the non-operated arm if needed.', 'Hip mobility', 'Strength Side couch stretch'),
        ex('d2m-butcher', 'Supported butcher-block stretch', '20–30 sec', 2, 'sec', 'stretch', ['Place forearms on a bed or bench.', 'Sit the hips back while keeping the ribs controlled.', 'Keep pressure even through both forearms.'], 'Do not force overhead range; stop for plate-area pulling or pinching.', 'Shoulder mobility', 'Strength Side butcher block stretch'),
        ex('d2m-er', 'Band external rotation', '12–15 each arm', 2, 'reps', 'band', ['Keep the elbow against the side.', 'Rotate the forearm outward without twisting the torso.', 'Return slowly.'], 'Use a very light band and a pain-free range.', 'Rotator cuff', 'band external rotation shoulder'),
        ex('d2m-chest', 'Wall chest opener', '5 each side · 3–5-sec hold', 1, 'round', 'chestopen', ['Place the hand or forearm on the wall.', 'Turn the chest away slightly.', 'Keep the front of the shoulder relaxed.'], 'Avoid deep extension behind the body or strong stretching over the plate.', 'Mobility', 'wall chest opener shoulder'),
        ex('d2m-goodmorning', 'Bodyweight good morning', '10 reps', 2, 'reps', 'hinge', ['Keep feet rooted.', 'Hinge from the hips.', 'Stand by squeezing the glutes rather than leaning back.'], 'Keep arms folded lower across the ribs if crossing them high irritates the clavicle.', 'Patterning', 'bodyweight good morning exercise')
      ]
    },
    evening: {
      title: 'Lower-body strength + Zone 2', duration: '60–70 min', intensity: 'Controlled strength; conversational cardio',
      exercises: [
        ex('d2e-warm', 'Progressive warm-up', '8–10 min bike + hip rotations + bodyweight squats', 1, 'round', 'cardio', ['Build effort gradually.', 'Use the first squats to assess ankle, knee and hip range.'], 'Keep the handlebars light; do not brace heavily through the shoulders.', 'Warm-up', 'stationary bike warm up'),
        ex('d2e-squat', 'Goblet squat, hack squat or leg press', '4 × 6–10', 4, 'reps', 'legmachine', ['Choose the version that feels most stable.', 'Use a controlled lowering phase.', 'Keep knees tracking with the feet.'], 'Avoid a back-squat bar pressing across or near the clavicle plate.', 'Main strength', 'hack squat leg press technique'),
        ex('d2e-slrdl', 'Single-leg Romanian deadlift', '3 × 8 each leg', 3, 'reps', 'hinge', ['Keep the pelvis square.', 'Reach the free leg back as the torso inclines.', 'Use a support for balance if needed.'], 'Hold a weight in the non-operated-side hand first, or start bodyweight.', 'Strength Side pattern', 'Strength Side single leg RDL'),
        ex('d2e-bss', 'Bulgarian split squat', '3 × 8 each leg', 3, 'reps', 'lunge', ['Use a stance that allows the front heel to stay down.', 'Lower under control.', 'Drive through the front foot.'], 'Use dumbbells at the sides only if carrying them does not irritate the shoulder.', 'Unilateral strength', 'Bulgarian split squat technique'),
        ex('d2e-hamcurl', 'Seated or lying hamstring curl', '3 × 10–12', 3, 'reps', 'legmachine', ['Set the machine so the knee aligns with its pivot.', 'Curl without lifting the hips.', 'Control the return.'], 'Choose the version that does not require forceful shoulder bracing.', 'Accessories', 'hamstring curl machine technique'),
        ex('d2e-calf', 'Standing calf raise', '3 × 12–15', 3, 'reps', 'standing', ['Use a full comfortable range.', 'Pause briefly at the top.', 'Lower slowly.'], 'Use fingertips for balance rather than hanging through the shoulder.', 'Accessories', 'standing calf raise technique'),
        ex('d2e-backext', 'Reverse hyper or 45° back extension', '2–3 × 10–12', 3, 'reps', 'hinge', ['Move through the hips.', 'Finish with the body in a straight line.', 'Avoid excessive lower-back extension.'], 'Choose equipment that does not press on the clavicle or require painful gripping.', 'Posterior chain', '45 degree back extension technique'),
        ex('d2e-zone2', 'Stationary bike Zone 2', '15–25 min', 1, 'min', 'cardio', ['Use a pace where you can speak in full sentences.', 'Keep breathing controlled and shoulders relaxed.', 'Increase duration before intensity.'], 'Follow your asthma plan and keep your prescribed reliever inhaler available.', 'Conditioning', 'zone 2 stationary bike')
      ]
    }
  },
  {
    day: 3,
    title: 'Pull & supported hanging',
    focus: 'Restoring pulling strength while controlling traction through the shoulder girdle.',
    morning: {
      title: 'Ground control', duration: '10–20 min', intensity: 'Slow and precise',
      exercises: [
        ex('d3m-frog', 'Frog hold', '20–30 sec', 2, 'sec', 'frog', ['Set the knees wide on padding.', 'Sit the hips back gradually.', 'Keep the spine long and breathe.'], 'Support yourself lightly through the forearms or hands without collapsing into the operated shoulder.', 'Hip mobility', 'Strength Side frog stretch'),
        ex('d3m-dancingfrog', 'Dancing frog', '4 slow reps each side', 2, 'reps', 'frog', ['From a wide-knee position, shift the hips gently side to side.', 'Keep the movement small and controlled.'], 'Maintain even pressure through both arms.', 'Hip mobility', 'Strength Side dancing frog'),
        ex('d3m-lunge', 'Deep-lunge knee lift', '6 each side', 2, 'reps', 'lunge', ['Start in a supported deep lunge.', 'Lift and lower the rear knee without losing the front-foot tripod.', 'Keep the torso tall.'], 'Use a bench or thigh for support rather than loading heavily through the shoulder.', 'Ground strength', 'Strength Side deep lunge knee lift'),
        ex('d3m-rockback', 'Quadruped rock-back', '8–10 reps', 2, 'reps', 'quadruped', ['Set hands below shoulders and knees below hips.', 'Push the floor away gently.', 'Rock hips toward heels while maintaining shoulder position.'], 'Reduce the depth if weight shifts away from the operated side or produces pain.', 'Shoulder loading', 'quadruped rock back shoulder'),
        ex('d3m-birddog', 'Bird dog', '6 each side · 2-sec hold', 2, 'reps', 'birddog', ['Reach opposite arm and leg long.', 'Keep the trunk quiet.', 'Return without shifting the hips.'], 'Only lift the operated arm as high as you can without shrugging or twisting.', 'Core + shoulder', 'bird dog exercise technique'),
        ex('d3m-downdog', 'Supported down-dog press', '6–8 reps', 2, 'reps', 'downdog', ['Place hands on a bench or sofa.', 'Push the hips back while keeping arms long.', 'Return to a high plank angle under control.'], 'Keep the support high and pressure equal between both arms.', 'Strength Side pattern', 'Strength Side down dog press'),
        ex('d3m-transition', 'Standing-to-half-kneeling transition', '4 each side', 2, 'reps', 'transition', ['Step back to a half-kneeling position.', 'Use the legs to return to standing.', 'Move slowly enough to stay balanced.'], 'Avoid pushing hard from the floor with the operated arm.', 'Ground transitions', 'Strength Side ground transitions')
      ]
    },
    evening: {
      title: 'Pull + supported hanging', duration: '55–65 min', intensity: 'No uncontrolled traction',
      exercises: [
        ex('d3e-warm', 'Progressive warm-up', '5 min easy bike; wall slides; light rows; band external rotations', 1, 'round', 'cardio', ['Increase temperature first.', 'Use light rows to assess the shoulder before loading.'], 'Skip hanging if warm-up reveals plate pain or reduced range.', 'Warm-up', 'shoulder pulling warm up'),
        ex('d3e-hang', 'Feet-supported hang', '2 × 10–20 sec', 2, 'sec', 'hang', ['Use a box so the legs carry most of your weight.', 'Hold with both hands and keep the neck relaxed.', 'Use only mild traction.'], 'Skip unless you have been cleared for hanging. Stop for fracture-site pain, tingling, numbness or sharp pulling.', 'Supported exposure', 'supported dead hang feet on floor'),
        ex('d3e-pulldown', 'Neutral-grip lat pulldown', '3 × 8–12', 3, 'reps', 'pulldown', ['Begin with arms overhead in a comfortable range.', 'Pull the handles toward the upper chest.', 'Control the return without losing rib position.'], 'Do not force the shoulders down or use a painful overhead starting position.', 'Main pull', 'neutral grip lat pulldown technique'),
        ex('d3e-row', 'Chest-supported row', '3 × 8–12', 3, 'reps', 'row', ['Set the chest pad below the clavicle.', 'Pull elbows toward the hips.', 'Allow the shoulder blades to move naturally.'], 'Reposition the pad if it presses near the plate.', 'Main pull', 'chest supported row technique'),
        ex('d3e-cablerow', 'Single-arm cable row', '2 × 10 each side', 2, 'reps', 'row', ['Reach forward without rounding aggressively.', 'Pull the elbow beside the body.', 'Keep the torso quiet.'], 'Use the operated side independently only within a smooth, pain-free range.', 'Unilateral control', 'single arm cable row technique'),
        ex('d3e-yraise', 'Prone Y-raise or cable lower-trap raise', '2 × 10–12', 2, 'reps', 'yraise', ['Use very light resistance.', 'Reach the arms in a Y shape.', 'Keep the neck relaxed.'], 'Stop before shrugging or plate-area discomfort.', 'Scapular support', 'prone Y raise lower trap'),
        ex('d3e-er', 'Band external rotation', '2 × 12–15', 2, 'reps', 'band', ['Keep elbow by the side.', 'Rotate without twisting the body.', 'Return slowly.'], 'Use low resistance; quality matters more than fatigue.', 'Rotator cuff', 'band external rotation shoulder'),
        ex('d3e-curl', 'Neutral-grip dumbbell curl', '2 × 10–12', 2, 'reps', 'curl', ['Keep upper arms quiet.', 'Curl without swinging.', 'Lower for two seconds.'], 'Choose a load that does not pull the shoulder forward.', 'Accessories', 'hammer curl technique')
      ]
    }
  },
  {
    day: 4,
    title: 'Recovery movement & Zone 2',
    focus: 'A low-stress movement day that preserves frequency without adding heavy shoulder fatigue.',
    morning: {
      title: 'Shoulder motion + squat', duration: '10–20 min', intensity: 'Easy · 3–4/10 effort',
      exercises: [
        ex('d4m-breath', 'Relaxed diaphragmatic breathing', '5 slow breaths', 1, 'breaths', 'breathing', ['Lie on your back with knees bent.', 'Breathe into the lower ribs.', 'Relax the neck and jaw.'], 'No forced chest expansion.', 'Reset', 'diaphragmatic breathing exercise'),
        ex('d4m-catcow', 'Cat–cow', '6–8 slow reps', 1, 'reps', 'catcow', ['Move slowly between spinal positions.', 'Keep pressure even through both hands.'], 'Use a smaller range if the shoulder feels loaded.', 'Mobility', 'Strength Side cat cow mobility'),
        ex('d4m-hiprot', 'Standing hip rotations', '6 each direction per leg', 2, 'reps', 'standing', ['Hold a wall lightly.', 'Make controlled circles from the hip.'], 'Use the support only for balance.', 'Mobility', 'Strength Side hip rotations'),
        ex('d4m-wallslide', 'Forearm wall slide', '8–10 reps', 2, 'reps', 'wallslide', ['Press gently into the wall.', 'Slide without shrugging.', 'Keep ribs controlled.'], 'Stop before pain or asymmetry.', 'Shoulder control', 'serratus forearm wall slide'),
        ex('d4m-scap', 'Wall or counter scapular push-up', '10 reps', 2, 'reps', 'wallpush', ['Keep elbows straight.', 'Move the shoulder blades around the ribs.', 'Finish with a gentle push-away.'], 'Keep the support high if the operated shoulder tires.', 'Shoulder control', 'scapular push up wall'),
        ex('d4m-squat', 'Supported deep squat hold', '30–45 sec', 2, 'sec', 'squat', ['Use a doorframe for balance.', 'Keep heels down.', 'Breathe calmly.'], 'Hands are for balance only.', 'Mobility', 'Strength Side deep squat hold'),
        ex('d4m-deadbug', 'Dead bug', '6–8 each side', 2, 'reps', 'deadbug', ['Control the trunk.', 'Move opposite arm and leg.', 'Exhale during extension.'], 'Keep the operated arm in a comfortable range.', 'Core', 'dead bug exercise technique')
      ]
    },
    evening: {
      title: 'Recovery movement + aerobic base', duration: '45–60 min', intensity: 'Easy to moderate',
      exercises: [
        ex('d4e-zone2', 'Bike or incline-treadmill Zone 2', '25–35 min', 1, 'min', 'cardio', ['Keep a pace where full sentences remain possible.', 'Relax the shoulders and maintain steady breathing.', 'Use a gradual warm-up and cool-down.'], 'Follow your asthma plan; stop if breathing becomes progressively worse.', 'Aerobic base', 'zone 2 cycling incline treadmill'),
        ex('d4e-horse', 'Horse stance', '3 × 30–45 sec', 3, 'sec', 'horse', ['Use a comfortably wide stance.', 'Sit straight down rather than folding forward.', 'Keep knees tracking over the feet.'], 'Keep arms relaxed or low rather than held overhead.', 'Movement circuit', 'Strength Side horse stance'),
        ex('d4e-9090', '90/90 transitions', '3 × 6 each direction', 3, 'reps', 'hip90', ['Rotate the knees side to side.', 'Stay tall where possible.', 'Use minimal hand support.'], 'Avoid leaning heavily into the operated arm.', 'Movement circuit', 'Strength Side 90 90 hip switches'),
        ex('d4e-pigeon', 'Elevated pigeon hinge', '3 × 8 each side', 3, 'reps', 'pigeon', ['Place the front shin on a bench or box.', 'Square the hips.', 'Hinge forward with a long spine.'], 'Use a low support and light hand contact.', 'Movement circuit', 'Strength Side pigeon hinge'),
        ex('d4e-lunge', 'Deep-lunge knee lift', '3 × 6 each side', 3, 'reps', 'lunge', ['Set a stable lunge.', 'Lift and lower the rear knee.', 'Keep the front foot planted.'], 'Use support that does not require heavy shoulder loading.', 'Movement circuit', 'Strength Side deep lunge knee lift'),
        ex('d4e-crawl', 'Knees-down crawl', '3 × 5–6 steps forward/back', 3, 'steps', 'crawl', ['Keep knees on the floor.', 'Move opposite hand and knee.', 'Take short, controlled steps.'], 'Pressure should remain even. Stop if the operated side collapses or becomes painful.', 'Movement circuit', 'knees down bear crawl rehabilitation'),
        ex('d4e-pushplus', 'Counter push-up plus', '3 × 8', 3, 'reps', 'pushup', ['Perform a small incline push-up.', 'At the top, gently push the counter away.', 'Keep the neck relaxed.'], 'Use a high counter and a pain-free depth.', 'Movement circuit', 'incline push up plus serratus'),
        ex('d4e-butcher', 'Supported butcher-block stretch', '3 × 20–30 sec', 3, 'sec', 'stretch', ['Forearms on a bench.', 'Sit hips back.', 'Breathe into the upper back.'], 'Do not force the operated shoulder overhead.', 'Cool-down', 'Strength Side butcher block stretch')
      ]
    }
  },
  {
    day: 5,
    title: 'Strength Side full body',
    focus: 'The closest day to Strength Side’s public push–squat and row–hinge pairings, adapted for your clavicle.',
    morning: {
      title: 'Hips + controlled upper-body range', duration: '10–20 min', intensity: 'Easy · one or two rounds',
      exercises: [
        ex('d5m-9090', '90/90 hip transitions', '6 each direction', 2, 'reps', 'hip90', ['Rotate slowly.', 'Stay tall.', 'Use minimal hand support.'], 'Avoid leaning heavily through the operated arm.', 'Hip mobility', 'Strength Side 90 90 hip switches'),
        ex('d5m-hinge', 'Straight-leg hip hinge', '8 reps + 10-sec final hold', 1, 'round', 'hinge', ['Push hips back.', 'Keep the spine long.', 'Stop at hamstring tension.'], 'Let the arms stay relaxed.', 'Posterior chain', 'Strength Side pike hip hinge'),
        ex('d5m-couch', 'Couch stretch', '30–45 sec each side', 2, 'sec', 'couch', ['Pad the rear knee.', 'Tuck pelvis slightly.', 'Stay tall.'], 'Use the non-operated arm for balance if needed.', 'Hip mobility', 'Strength Side couch stretch'),
        ex('d5m-butcher', 'Supported butcher-block stretch', '20–30 sec', 2, 'sec', 'stretch', ['Forearms supported.', 'Sit hips back.', 'Keep ribs controlled.'], 'Do not force overhead range.', 'Shoulder mobility', 'Strength Side butcher block stretch'),
        ex('d5m-er', 'Band external rotation', '12–15 each arm', 2, 'reps', 'band', ['Elbow stays by the side.', 'Rotate slowly.', 'Keep torso still.'], 'Use a light band and pain-free range.', 'Rotator cuff', 'band external rotation shoulder'),
        ex('d5m-chest', 'Wall chest opener', '5 each side · 3–5-sec hold', 1, 'round', 'chestopen', ['Place hand or forearm on wall.', 'Turn away slightly.', 'Keep shoulder relaxed.'], 'Avoid a deep stretch over the plate.', 'Mobility', 'wall chest opener shoulder'),
        ex('d5m-goodmorning', 'Bodyweight good morning', '10 reps', 2, 'reps', 'hinge', ['Hinge from hips.', 'Keep feet grounded.', 'Stand tall without leaning back.'], 'Keep arm position comfortable.', 'Patterning', 'bodyweight good morning exercise')
      ]
    },
    evening: {
      title: 'Adapted Strength Side full body', duration: '55–65 min', intensity: 'Smooth volume; no failure',
      exercises: [
        ex('d5e-warm', 'Progressive warm-up', '8–10 min + shoulder control check', 1, 'round', 'cardio', ['Build temperature.', 'Test the push-up and row angles with easy reps.'], 'Use the warm-up to choose today’s safe range rather than forcing last session’s level.', 'Warm-up', 'full body mobility warm up'),
        ex('d5e-push', 'Incline push-up', '3 × 8–10', 3, 'reps', 'pushup', ['Lower under control.', 'Keep shoulders level.', 'Finish with a gentle push-away.'], 'Do not lower the support until all reps remain pain-free and symmetrical.', 'Circuit A', 'Strength Side push up technique'),
        ex('d5e-goblet', 'Goblet squat or toe squat', '3 × 8–10', 3, 'reps', 'squat', ['Keep the whole foot grounded.', 'Use a comfortable depth.', 'Stand smoothly.'], 'Hold any load below the clavicle rather than against it.', 'Circuit A', 'Strength Side toe squat goblet squat'),
        ex('d5e-trx', 'High-angle TRX/bodyweight row', '3 × 8–10', 3, 'reps', 'row', ['Start fairly upright.', 'Pull the chest toward the handles.', 'Keep the body in one line.'], 'Use a high angle to limit load and keep shoulder mechanics clean.', 'Circuit B', 'Strength Side bodyweight row'),
        ex('d5e-slrdl', 'Single-leg RDL', '3 × 8 each leg', 3, 'reps', 'hinge', ['Keep hips square.', 'Reach the free leg back.', 'Use support if balance limits the hinge.'], 'Start bodyweight or hold the load on the non-operated side.', 'Circuit B', 'Strength Side single leg RDL'),
        ex('d5e-sideplank', 'Side plank', '3 × 20–40 sec each side', 3, 'sec', 'sideplank', ['Push the floor away.', 'Stack ribs and pelvis.', 'Use knees bent if needed.'], 'Regress the operated side until it is stable and comfortable.', 'Circuit B', 'side plank regression technique'),
        ex('d5e-hamcurl', 'Hamstring curl', '3 × 8–12', 3, 'reps', 'legmachine', ['Curl under control.', 'Keep hips steady.', 'Use a slow return.'], 'Choose a setup that does not require hard shoulder bracing.', 'Circuit C', 'hamstring curl machine technique'),
        ex('d5e-reversehyper', 'Reverse hyper or back extension', '3 × 10–12', 3, 'reps', 'hinge', ['Move from the hips.', 'Finish in a straight line.', 'Avoid overextending.'], 'Avoid chest pads that press near the plate.', 'Circuit C', 'reverse hyper back extension'),
        ex('d5e-flow', 'Ground-transition flow', '5 min relaxed practice', 1, 'min', 'transition', ['Move between squat, kneeling and 90/90 positions.', 'Use the legs rather than pushing strongly from the floor.', 'Keep the pace conversational.'], 'No fast drops, loaded one-arm support or painful end-range shoulder positions.', 'Finish', 'Strength Side ground transitions')
      ]
    }
  },
  {
    day: 6,
    title: 'Movement conditioning',
    focus: 'Lower-body athleticism, shoulder endurance and asthma-safe intervals.',
    morning: {
      title: 'Ground control', duration: '10–20 min', intensity: 'Slow and precise',
      exercises: [
        ex('d6m-frog', 'Frog hold', '20–30 sec', 2, 'sec', 'frog', ['Set knees wide on padding.', 'Sit hips back gently.', 'Breathe.'], 'Keep arm support light and even.', 'Hip mobility', 'Strength Side frog stretch'),
        ex('d6m-dancingfrog', 'Dancing frog', '4 slow reps each side', 2, 'reps', 'frog', ['Shift hips slowly from side to side.', 'Keep the range comfortable.'], 'Avoid collapsing into either shoulder.', 'Hip mobility', 'Strength Side dancing frog'),
        ex('d6m-lunge', 'Deep-lunge knee lift', '6 each side', 2, 'reps', 'lunge', ['Set a stable deep lunge.', 'Lift and lower the rear knee.', 'Keep the front foot grounded.'], 'Use leg or bench support rather than heavy arm support.', 'Ground strength', 'Strength Side deep lunge knee lift'),
        ex('d6m-rockback', 'Quadruped rock-back', '8–10 reps', 2, 'reps', 'quadruped', ['Push floor away.', 'Rock hips back.', 'Keep shoulders level.'], 'Reduce depth if loading becomes uneven.', 'Shoulder loading', 'quadruped rock back shoulder'),
        ex('d6m-birddog', 'Bird dog', '6 each side · 2-sec hold', 2, 'reps', 'birddog', ['Reach opposite limbs.', 'Keep hips quiet.', 'Return with control.'], 'Lift the operated arm only through a smooth range.', 'Core + shoulder', 'bird dog exercise technique'),
        ex('d6m-downdog', 'Supported down-dog press', '6–8 reps', 2, 'reps', 'downdog', ['Use a bench or sofa.', 'Push hips back.', 'Return under control.'], 'Keep support high enough for equal loading.', 'Strength Side pattern', 'Strength Side down dog press'),
        ex('d6m-transition', 'Standing-to-half-kneeling transition', '4 each side', 2, 'reps', 'transition', ['Step back smoothly.', 'Lower to one knee.', 'Use legs to stand.'], 'Avoid forceful pushing from the floor.', 'Ground transitions', 'Strength Side ground transitions')
      ]
    },
    evening: {
      title: 'Movement conditioning + shoulder endurance', duration: '50–60 min', intensity: 'Moderate; intervals are not sprints',
      exercises: [
        ex('d6e-warm', 'Progressive warm-up', '10 min bike + mobility', 1, 'round', 'cardio', ['Build gradually before intervals.', 'Include easy step-ups and shoulder control work.'], 'A longer warm-up is useful for exercise-induced asthma symptoms.', 'Warm-up', 'asthma exercise warm up cycling'),
        ex('d6e-stepup', 'Step-up', '3 × 8–10 each leg', 3, 'reps', 'stepup', ['Place the whole foot on the box.', 'Drive through the working leg.', 'Control the step down.'], 'Use arms naturally or hold light weights only if shoulder carrying is comfortable.', 'Lower-body strength', 'step up exercise technique'),
        ex('d6e-lateral', 'Supported lateral lunge or box Cossack squat', '3 × 6 each side', 3, 'reps', 'lateral', ['Sit into one hip.', 'Keep the other leg long.', 'Use a box or upright support to control depth.'], 'Support with light fingertips; do not hang through the operated shoulder.', 'Lower-body strength', 'Strength Side cossack squat regression'),
        ex('d6e-toesquat', 'Toe squat or paused bodyweight squat', '2 × 8–10', 2, 'reps', 'squat', ['Use a slow lowering phase.', 'Pause briefly in a comfortable depth.', 'Stand smoothly.'], 'Keep arm position relaxed and pain-free.', 'Lower-body strength', 'Strength Side toe squat'),
        ex('d6e-wallslide', 'Serratus wall slide', '3 × 10', 3, 'reps', 'wallslide', ['Press gently into the wall.', 'Slide upward without shrugging.', 'Reach slightly at the top.'], 'Stop before loss of symmetry or plate discomfort.', 'Shoulder circuit', 'serratus wall slide technique'),
        ex('d6e-er', 'Cable external rotation', '3 × 12 each side', 3, 'reps', 'band', ['Keep elbow near the side.', 'Rotate slowly.', 'Keep torso still.'], 'Use light resistance and no forced end range.', 'Shoulder circuit', 'cable external rotation shoulder'),
        ex('d6e-tap', 'Knees-down quadruped shoulder tap', '3 × 6–8 each side', 3, 'reps', 'shouldertap', ['Use a wide knee position.', 'Shift weight slowly.', 'Tap the opposite shoulder without trunk rotation.'], 'Start with tiny weight shifts. Stop if the operated shoulder collapses or hurts.', 'Shoulder circuit', 'quadruped shoulder tap regression'),
        ex('d6e-reardelt', 'Chest-supported rear-delt raise', '3 × 12', 3, 'reps', 'yraise', ['Use light weights.', 'Raise arms slightly out to the sides.', 'Keep the neck relaxed.'], 'Position the chest pad away from the plate.', 'Shoulder circuit', 'chest supported rear delt raise'),
        ex('d6e-shift', 'Counter weight shift', '3 × 8 each direction', 3, 'reps', 'wallpush', ['Set a high-plank angle at a counter.', 'Shift weight gently left, right, forward and back.', 'Keep elbows straight.'], 'Use a small range and stop for pain or instability.', 'Shoulder circuit', 'closed chain shoulder weight shift'),
        ex('d6e-intervals', 'Bike intervals', '5–6 rounds: 1 min moderately hard + 2 min easy', 6, 'rounds', 'cardio', ['Hard efforts should feel around 7/10, not maximal.', 'Use the easy interval to restore controlled breathing.', 'Cool down for 5 minutes.'], 'Stop if asthma symptoms progressively worsen rather than settling in the easy period.', 'Conditioning', 'stationary bike intervals moderate'),
        ex('d6e-flow', 'Ground-flow finish', '2–3 slow rounds', 3, 'rounds', 'transition', ['Move stand → half-kneel → 90/90 → switch → half-kneel → supported squat → stand.', 'Perform three cycles in each direction.', 'Keep the movement quiet and controlled.'], 'No loaded one-arm support, fast crawling or drops.', 'Finish', 'Strength Side ground flow transitions')
      ]
    }
  }
];

const PROGRESSION = [
  { week: 'Weeks 1–2', text: 'One morning round. Use two working sets for unfamiliar upper-body work. High push-up incline. Most body weight stays through the feet during supported hangs. Effort about 6–7/10.' },
  { week: 'Weeks 3–4', text: 'If the shoulder returns to baseline by the next morning, use the full listed sets, add 1–2 reps, lower the push-up support slightly, and build supported hangs toward 20 seconds.' },
  { week: 'Weeks 5–6', text: 'Change one variable at a time: add 2.5–5% load, lower the push-up incline, reduce assistance, or add repetitions. Never increase all four together.' }
];

const EXCLUDED = ['Full passive dead hangs', 'Pull-ups and chin-ups', 'Dips', 'Brachiation and swinging', 'Fast bear or monkey crawling', 'Deep crab stretches', 'Back bridges', 'Heavy shrugs', 'A bar resting across the clavicle plate'];

const defaultState = () => ({
  version: APP_VERSION,
  startDate: new Date().toISOString().slice(0, 10),
  operatedSide: 'Not set',
  morningRounds: 1,
  logs: {}
});

let state = loadState();
let route = 'home';
let selectedWeek = 1;
let selectedDay = 1;
let selectedSession = 'morning';
let deferredInstallPrompt = null;
let timerSeconds = 90;
let timerRemaining = 90;
let timerId = null;
let timerPaused = false;

const main = document.getElementById('mainContent');
const pageTitle = document.getElementById('pageTitle');
const backBtn = document.getElementById('backBtn');
const bottomNav = document.getElementById('bottomNav');
const installBtn = document.getElementById('installBtn');
const importInput = document.getElementById('importInput');

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    return { ...defaultState(), ...parsed, logs: parsed.logs || {} };
  } catch {
    return defaultState();
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function todayPosition() {
  if (!state.startDate) return { week: 1, day: 1, rest: false, before: false, after: false };
  const start = new Date(`${state.startDate}T00:00:00`);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diff = Math.floor((now - start) / 86400000);
  if (diff < 0) return { week: 1, day: 1, rest: false, before: true, after: false };
  const week = Math.floor(diff / 7) + 1;
  const dayInWeek = (diff % 7) + 1;
  return { week: Math.min(6, week), day: Math.min(6, dayInWeek), rest: dayInWeek === 7, before: false, after: week > 6 };
}

function sessionKey(week, day, session) {
  return `w${week}-d${day}-${session}`;
}

function getSessionLog(week, day, session) {
  const key = sessionKey(week, day, session);
  if (!state.logs[key]) {
    state.logs[key] = { complete: false, exercises: {}, painDuring: '', painAfter: '', painNext: '', notes: '', updatedAt: '' };
  }
  return state.logs[key];
}

function completedSessionsInWeek(week) {
  let count = 0;
  for (let day = 1; day <= 6; day++) {
    for (const session of ['morning', 'evening']) {
      if (state.logs[sessionKey(week, day, session)]?.complete) count++;
    }
  }
  return count;
}

function dayComplete(week, day) {
  return Boolean(state.logs[sessionKey(week, day, 'morning')]?.complete && state.logs[sessionKey(week, day, 'evening')]?.complete);
}

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timeout);
  showToast.timeout = setTimeout(() => toast.classList.remove('show'), 2200);
}

function routeTo(nextRoute) {
  route = nextRoute;
  window.scrollTo({ top: 0, behavior: 'instant' });
  render();
}

function render() {
  backBtn.classList.toggle('hidden', route !== 'workout');
  bottomNav.classList.toggle('hidden', route === 'workout');
  document.querySelectorAll('.nav-item').forEach((button) => button.classList.toggle('active', button.dataset.route === route));

  if (route === 'home') renderHome();
  if (route === 'plan') renderPlan();
  if (route === 'progress') renderProgress();
  if (route === 'settings') renderSettings();
  if (route === 'workout') renderWorkout();
}

function renderHome() {
  pageTitle.textContent = 'Move Strong Rehab';
  const pos = todayPosition();
  selectedWeek = pos.week;
  if (!pos.rest) selectedDay = pos.day;
  const day = PROGRAMME[selectedDay - 1];
  const completed = completedSessionsInWeek(selectedWeek);
  let headline = `Week ${selectedWeek} · Day ${selectedDay}`;
  let intro = day.focus;
  if (pos.before) {
    headline = 'Programme ready';
    intro = `Your start date is ${formatDate(state.startDate)}. You can still preview or complete any session.`;
  } else if (pos.rest) {
    headline = `Week ${selectedWeek} · Rest day`;
    intro = 'Walk, recover and review any next-morning shoulder response. No formal session is scheduled.';
  } else if (pos.after) {
    headline = 'Six-week block complete';
    intro = 'Export your data before replacing the programme. Review pain trends, push-up angle, pulling strength and supported-hang tolerance.';
  }

  main.innerHTML = `
    <section class="hero">
      <p class="eyebrow">${escapeHtml(headline)}</p>
      <h2>${pos.rest ? 'Recover deliberately.' : escapeHtml(day.title)}</h2>
      <p>${escapeHtml(intro)}</p>
      <div class="hero-actions">
        ${pos.rest ? `<button class="primary-btn" data-action="review-progress">Review progress</button>` : `<button class="primary-btn" data-action="start-current">Start today</button>`}
        <button class="secondary-btn" data-action="open-plan">View full plan</button>
      </div>
    </section>

    <section class="section">
      <div class="section-heading">
        <div><h2>Week ${selectedWeek}</h2><p>${completed}/12 sessions complete</p></div>
        <strong>${Math.round((completed / 12) * 100)}%</strong>
      </div>
      ${renderWeekStrip(selectedWeek, pos.rest ? 7 : selectedDay)}
    </section>

    <section class="section">
      <div class="section-heading"><div><h2>${pos.rest ? 'Next training day' : `Day ${selectedDay}`}</h2><p>${escapeHtml(day.title)}</p></div></div>
      <div class="session-grid">
        ${renderSessionCard(selectedWeek, selectedDay, 'morning', day.morning)}
        ${renderSessionCard(selectedWeek, selectedDay, 'evening', day.evening)}
      </div>
    </section>

    <section class="section">
      <div class="card safety-card">
        <strong>Clavicle rule for every session</strong>
        <p>Keep discomfort at 0–2/10, preserve shoulder symmetry, and expect symptoms to return to baseline by the following morning. Sharp plate-site pain, new swelling, deformity, neurological symptoms or pain after a fall require clinical review.</p>
      </div>
    </section>
  `;
  bindHomeEvents();
}

function renderWeekStrip(week, activeDay) {
  const labels = ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'Rest'];
  return `<div class="week-strip">${labels.map((label, index) => {
    const day = index + 1;
    const complete = day <= 6 && dayComplete(week, day);
    return `<button class="day-chip ${day === activeDay ? 'active' : ''} ${complete ? 'complete' : ''}" data-day="${day}" ${day === 7 ? 'aria-label="Rest day"' : ''}><strong>${label}</strong><small>${day <= 6 ? PROGRAMME[index].title.split(' ')[0] : 'Recover'}</small></button>`;
  }).join('')}</div>`;
}

function renderSessionCard(week, dayNumber, sessionName, session) {
  const log = getSessionLog(week, dayNumber, sessionName);
  const doneCount = Object.values(log.exercises || {}).filter((entry) => entry.done).length;
  return `
    <article class="session-card">
      <div>
        <p class="eyebrow">${sessionName === 'morning' ? 'Morning' : 'Gym evening'} · ${escapeHtml(session.duration)}</p>
        <h3>${escapeHtml(session.title)}</h3>
        <p>${doneCount}/${session.exercises.length} exercises checked</p>
      </div>
      <div class="session-status"><span class="status-pill ${log.complete ? 'done' : ''}">${log.complete ? 'Complete' : 'Ready'}</span></div>
      <button class="${log.complete ? 'secondary-btn' : 'primary-btn'}" data-open-session="${sessionName}" data-day="${dayNumber}">${log.complete ? 'Review session' : 'Start session'}</button>
    </article>`;
}

function bindHomeEvents() {
  main.querySelector('[data-action="start-current"]')?.addEventListener('click', () => {
    selectedSession = 'morning';
    routeTo('workout');
  });
  main.querySelector('[data-action="review-progress"]')?.addEventListener('click', () => routeTo('progress'));
  main.querySelector('[data-action="open-plan"]')?.addEventListener('click', () => routeTo('plan'));
  main.querySelectorAll('[data-open-session]').forEach((button) => button.addEventListener('click', () => {
    selectedDay = Number(button.dataset.day);
    selectedSession = button.dataset.openSession;
    routeTo('workout');
  }));
  main.querySelectorAll('.day-chip').forEach((button) => button.addEventListener('click', () => {
    const day = Number(button.dataset.day);
    if (day === 7) {
      showToast('Day 7 is your recovery day');
      return;
    }
    selectedDay = day;
    renderHome();
  }));
}

function renderPlan() {
  pageTitle.textContent = 'Six-day plan';
  main.innerHTML = `
    <section class="card safety-card">
      <strong>Structure</strong>
      <p>Days 1, 3 and 5 provide the main upper-body stimulus. Day 2 is lower-body dominant. Day 4 is deliberately restorative. Day 6 adds controlled conditioning. Day 7 is rest.</p>
    </section>

    <section class="section">
      <div class="section-heading"><div><h2>Weekly schedule</h2><p>Tap a session to open workout mode</p></div></div>
      <div class="day-list">
        ${PROGRAMME.map((day) => `
          <article class="day-card">
            <div class="day-card-header">
              <div class="day-number">${day.day}</div>
              <div><h3>${escapeHtml(day.title)}</h3><p>${escapeHtml(day.focus)}</p></div>
            </div>
            <div class="day-card-details">
              <div class="mini-session"><div><strong>Morning</strong><br><span>${escapeHtml(day.morning.title)} · ${escapeHtml(day.morning.duration)}</span></div><button class="secondary-btn" data-plan-open="morning" data-day="${day.day}">Open</button></div>
              <div class="mini-session"><div><strong>Evening</strong><br><span>${escapeHtml(day.evening.title)} · ${escapeHtml(day.evening.duration)}</span></div><button class="secondary-btn" data-plan-open="evening" data-day="${day.day}">Open</button></div>
            </div>
          </article>`).join('')}
      </div>
    </section>

    <section class="section">
      <div class="section-heading"><div><h2>Six-week progression</h2><p>Progress only when next-morning response is stable</p></div></div>
      ${PROGRESSION.map((item) => `<div class="card"><strong>${item.week}</strong><p class="help-text">${escapeHtml(item.text)}</p></div>`).join('')}
    </section>

    <section class="section">
      <div class="card">
        <strong>Excluded in this first block</strong>
        <ul>${EXCLUDED.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
        <p class="help-text">These are not permanently banned. They should be earned through pain-free push-ups, rows, overhead range, supported hangs and restored strength.</p>
      </div>
    </section>
  `;
  main.querySelectorAll('[data-plan-open]').forEach((button) => button.addEventListener('click', () => {
    selectedDay = Number(button.dataset.day);
    selectedSession = button.dataset.planOpen;
    routeTo('workout');
  }));
}

function renderWorkout() {
  const day = PROGRAMME[selectedDay - 1];
  const session = day[selectedSession];
  const log = getSessionLog(selectedWeek, selectedDay, selectedSession);
  pageTitle.textContent = `Day ${selectedDay} · ${selectedSession === 'morning' ? 'Morning' : 'Evening'}`;

  let lastGroup = '';
  const exerciseHtml = session.exercises.map((exercise) => {
    const groupHeading = exercise.group !== lastGroup ? `<div class="group-label">${escapeHtml(exercise.group)}</div>` : '';
    lastGroup = exercise.group;
    return groupHeading + renderExerciseCard(exercise, log);
  }).join('');

  main.innerHTML = `
    <section class="workout-header">
      <p class="eyebrow">Week ${selectedWeek} · Day ${selectedDay}</p>
      <h2>${escapeHtml(day.title)}</h2>
      <p>${escapeHtml(session.title)} · ${escapeHtml(session.duration)} · ${escapeHtml(session.intensity)}</p>
      <div class="mode-toggle">
        <button data-session-mode="morning" class="${selectedSession === 'morning' ? 'active' : ''}">Morning</button>
        <button data-session-mode="evening" class="${selectedSession === 'evening' ? 'active' : ''}">Evening gym</button>
      </div>
    </section>

    <div class="session-tools">
      <select id="weekSelect" aria-label="Programme week">${[1,2,3,4,5,6].map((week) => `<option value="${week}" ${week === selectedWeek ? 'selected' : ''}>Week ${week}</option>`).join('')}</select>
      ${selectedSession === 'morning' ? `<select id="roundSelect" aria-label="Morning rounds"><option value="1" ${state.morningRounds === 1 ? 'selected' : ''}>10 min · 1 round</option><option value="2" ${state.morningRounds === 2 ? 'selected' : ''}>18–20 min · 2 rounds</option></select>` : `<button class="secondary-btn" data-start-timer="90">Start 90-sec timer</button>`}
      <button class="secondary-btn" data-scroll-summary>Session notes ↓</button>
    </div>

    <div class="card safety-card">
      <strong>Today’s loading check</strong>
      <p>Proceed only if pain is no more than mild, range is not reduced, and the operated shoulder is not more irritable than yesterday. The diagrams are position guides, not substitutes for your physiotherapist’s technique advice.</p>
    </div>

    <section class="section">${exerciseHtml}</section>

    <section id="sessionSummary" class="session-summary card">
      <div class="section-heading"><div><h2>Shoulder response</h2><p>Record this even when the session felt good</p></div></div>
      <div class="form-grid">
        <div class="field"><label for="painDuring">Peak pain during (0–10)</label><input id="painDuring" type="number" min="0" max="10" step="1" value="${escapeHtml(log.painDuring)}"></div>
        <div class="field"><label for="painAfter">Pain after (0–10)</label><input id="painAfter" type="number" min="0" max="10" step="1" value="${escapeHtml(log.painAfter)}"></div>
        <div class="field"><label for="painNext">Next-morning pain (0–10)</label><input id="painNext" type="number" min="0" max="10" step="1" value="${escapeHtml(log.painNext)}"></div>
        <div class="field full"><label for="sessionNotes">Notes</label><textarea id="sessionNotes" placeholder="Push-up height, weights, clicking, stiffness, asthma response…">${escapeHtml(log.notes)}</textarea></div>
      </div>
      <p id="painMessage" class="help-text">Pain above 2/10 or worse next-morning symptoms means regress the next exposure.</p>
      <button id="completeSessionBtn" class="${log.complete ? 'secondary-btn' : 'primary-btn'} full-width">${log.complete ? 'Session complete ✓ · Tap to reopen' : 'Mark session complete'}</button>
    </section>
  `;

  bindWorkoutEvents(session, log);
}

function renderExerciseCard(exercise, log) {
  const entry = log.exercises[exercise.id] || { done: false, sets: Array(exercise.sets).fill(''), load: '' };
  if (!Array.isArray(entry.sets)) entry.sets = Array(exercise.sets).fill('');
  while (entry.sets.length < exercise.sets) entry.sets.push('');
  const setInputs = Array.from({ length: exercise.sets }, (_, index) => `
    <div class="log-field"><label>Set ${index + 1} · ${escapeHtml(exercise.unit)}</label><input inputmode="decimal" data-exercise-id="${exercise.id}" data-set-index="${index}" value="${escapeHtml(entry.sets[index] || '')}" placeholder="–"></div>`).join('');
  return `
    <article class="exercise-card" data-card-id="${exercise.id}">
      <div class="exercise-top">
        <div class="exercise-visual">${makeDiagram(exercise.diagram)}</div>
        <div class="exercise-title"><h3>${escapeHtml(exercise.name)}</h3><p>${escapeHtml(exercise.prescription)}</p></div>
        <button class="exercise-check ${entry.done ? 'checked' : ''}" data-check-exercise="${exercise.id}" aria-label="Mark ${escapeHtml(exercise.name)} complete">✓</button>
      </div>
      <div class="exercise-body">
        <details open>
          <summary>How to perform it</summary>
          <ul>${exercise.cues.map((cue) => `<li>${escapeHtml(cue)}</li>`).join('')}</ul>
        </details>
        <div class="rehab-note"><strong>Clavicle note:</strong> ${escapeHtml(exercise.rehab)}</div>
        <div class="log-row">${setInputs}<div class="log-field"><label>Load / level</label><input data-exercise-load="${exercise.id}" value="${escapeHtml(entry.load || '')}" placeholder="e.g. 8 kg / bench 5"></div></div>
        <div class="exercise-actions">
          ${exercise.sets > 1 ? `<button data-rest-for="${exercise.id}">Rest timer</button>` : ''}
          <a href="https://www.youtube.com/results?search_query=${encodeURIComponent(exercise.videoQuery)}" target="_blank" rel="noopener">Video fallback ↗</a>
        </div>
      </div>
    </article>`;
}

function bindWorkoutEvents(session, log) {
  main.querySelectorAll('[data-session-mode]').forEach((button) => button.addEventListener('click', () => {
    selectedSession = button.dataset.sessionMode;
    renderWorkout();
  }));
  document.getElementById('weekSelect').addEventListener('change', (event) => {
    selectedWeek = Number(event.target.value);
    renderWorkout();
  });
  document.getElementById('roundSelect')?.addEventListener('change', (event) => {
    state.morningRounds = Number(event.target.value);
    saveState();
    showToast(`${state.morningRounds === 1 ? 'One' : 'Two'} morning round${state.morningRounds === 1 ? '' : 's'} selected`);
  });
  main.querySelector('[data-start-timer]')?.addEventListener('click', () => openTimer(90));
  main.querySelector('[data-scroll-summary]').addEventListener('click', () => document.getElementById('sessionSummary').scrollIntoView({ behavior: 'smooth' }));

  main.querySelectorAll('[data-check-exercise]').forEach((button) => button.addEventListener('click', () => {
    const id = button.dataset.checkExercise;
    const current = log.exercises[id] || { done: false, sets: [], load: '' };
    current.done = !current.done;
    log.exercises[id] = current;
    log.updatedAt = new Date().toISOString();
    saveState();
    button.classList.toggle('checked', current.done);
  }));

  main.querySelectorAll('[data-set-index]').forEach((input) => input.addEventListener('change', () => {
    const id = input.dataset.exerciseId;
    const index = Number(input.dataset.setIndex);
    const current = log.exercises[id] || { done: false, sets: [], load: '' };
    if (!Array.isArray(current.sets)) current.sets = [];
    current.sets[index] = input.value;
    log.exercises[id] = current;
    log.updatedAt = new Date().toISOString();
    saveState();
  }));

  main.querySelectorAll('[data-exercise-load]').forEach((input) => input.addEventListener('change', () => {
    const id = input.dataset.exerciseLoad;
    const current = log.exercises[id] || { done: false, sets: [], load: '' };
    current.load = input.value;
    log.exercises[id] = current;
    log.updatedAt = new Date().toISOString();
    saveState();
  }));

  main.querySelectorAll('[data-rest-for]').forEach((button) => button.addEventListener('click', () => openTimer(90)));

  ['painDuring', 'painAfter', 'painNext', 'sessionNotes'].forEach((id) => {
    document.getElementById(id).addEventListener('change', (event) => {
      const map = { painDuring: 'painDuring', painAfter: 'painAfter', painNext: 'painNext', sessionNotes: 'notes' };
      log[map[id]] = event.target.value;
      log.updatedAt = new Date().toISOString();
      saveState();
      updatePainMessage(log);
    });
  });

  updatePainMessage(log);
  document.getElementById('completeSessionBtn').addEventListener('click', () => {
    log.complete = !log.complete;
    log.updatedAt = new Date().toISOString();
    saveState();
    showToast(log.complete ? 'Session saved as complete' : 'Session reopened');
    renderWorkout();
  });
}

function updatePainMessage(log) {
  const message = document.getElementById('painMessage');
  if (!message) return;
  const values = [log.painDuring, log.painAfter, log.painNext].map(Number).filter(Number.isFinite);
  const max = values.length ? Math.max(...values) : 0;
  if (max >= 4) {
    message.textContent = 'High response recorded: stop progressing this movement and seek clinical advice if symptoms persist, worsen, or are focused at the fracture/plate site.';
    message.style.color = 'var(--danger-ink)';
  } else if (max >= 3) {
    message.textContent = 'Regress the next exposure: reduce load, range or difficulty. The target is 0–2/10 with baseline restored by the next morning.';
    message.style.color = '#7a5a00';
  } else {
    message.textContent = 'Target met when symptoms remain 0–2/10 and return to baseline by the following morning.';
    message.style.color = 'var(--muted)';
  }
}

function renderProgress() {
  pageTitle.textContent = 'Progress';
  const allLogs = Object.values(state.logs);
  const complete = allLogs.filter((log) => log.complete).length;
  const painValues = allLogs.flatMap((log) => [log.painDuring, log.painAfter, log.painNext]).filter((value) => value !== '' && value !== null && value !== undefined).map(Number).filter((value) => Number.isFinite(value) && value >= 0);
  const averagePain = painValues.length ? (painValues.reduce((a, b) => a + b, 0) / painValues.length).toFixed(1) : '–';
  const highResponses = allLogs.filter((log) => Math.max(Number(log.painDuring) || 0, Number(log.painAfter) || 0, Number(log.painNext) || 0) >= 3).length;

  main.innerHTML = `
    <section class="progress-ring-row">
      <div class="metric"><strong>${complete}</strong><span>sessions complete</span></div>
      <div class="metric"><strong>${averagePain}</strong><span>average logged pain</span></div>
      <div class="metric"><strong>${highResponses}</strong><span>responses ≥3/10</span></div>
    </section>

    <section class="section">
      <div class="section-heading"><div><h2>Completion by week</h2><p>12 sessions available each week</p></div></div>
      <div class="card week-progress">
        ${[1,2,3,4,5,6].map((week) => {
          const done = completedSessionsInWeek(week);
          return `<div class="progress-line"><strong>Week ${week}</strong><div class="progress-track"><div class="progress-fill" style="width:${(done/12)*100}%"></div></div><span>${done}/12</span></div>`;
        }).join('')}
      </div>
    </section>

    <section class="section">
      <div class="section-heading"><div><h2>Shoulder response log</h2><p>Sessions with recorded pain or notes</p></div></div>
      ${renderPainHistory()}
    </section>

    <section class="section">
      <div class="card safety-card"><strong>How to interpret this</strong><p>A single mild reading matters less than the pattern. Repeated pain above 2/10, rising next-morning pain, decreasing range, night pain or focal plate-site symptoms should stop progression and prompt review.</p></div>
    </section>
  `;
}

function renderPainHistory() {
  const entries = Object.entries(state.logs)
    .filter(([, log]) => log.painDuring !== '' || log.painAfter !== '' || log.painNext !== '' || log.notes)
    .sort((a, b) => String(b[1].updatedAt).localeCompare(String(a[1].updatedAt)))
    .slice(0, 20);
  if (!entries.length) return '<div class="card empty-state">No shoulder-response entries yet.</div>';
  return entries.map(([key, log]) => {
    const match = key.match(/w(\d+)-d(\d+)-(morning|evening)/);
    const title = match ? `Week ${match[1]} · Day ${match[2]} · ${match[3] === 'morning' ? 'Morning' : 'Evening'}` : key;
    return `<article class="card"><strong>${title}</strong><p class="help-text">During: ${log.painDuring || '–'} · After: ${log.painAfter || '–'} · Next morning: ${log.painNext || '–'}</p>${log.notes ? `<p>${escapeHtml(log.notes)}</p>` : ''}</article>`;
  }).join('');
}

function renderSettings() {
  pageTitle.textContent = 'Settings & backup';
  main.innerHTML = `
    <section class="settings-card">
      <p class="eyebrow">Programme setup</p>
      <div class="setting-row"><label for="startDate">Block start date</label><input id="startDate" type="date" value="${escapeHtml(state.startDate)}"><span class="help-text">Day 1 begins on this date; every seventh day is treated as rest.</span></div>
      <div class="setting-row"><label for="operatedSide">Operated side</label><select id="operatedSide"><option ${state.operatedSide === 'Not set' ? 'selected' : ''}>Not set</option><option ${state.operatedSide === 'Left' ? 'selected' : ''}>Left</option><option ${state.operatedSide === 'Right' ? 'selected' : ''}>Right</option></select></div>
      <div class="setting-row"><label for="defaultRounds">Default morning duration</label><select id="defaultRounds"><option value="1" ${state.morningRounds === 1 ? 'selected' : ''}>About 10 minutes · one round</option><option value="2" ${state.morningRounds === 2 ? 'selected' : ''}>About 18–20 minutes · two rounds</option></select></div>
    </section>

    <section class="settings-card">
      <p class="eyebrow">Install</p>
      <h2>Use it like a phone app</h2>
      <p class="help-text">On Android Chrome: menu → Add to home screen → Install. Once installed, the plan, diagrams and logs work offline. Video fallback links still require data.</p>
      <div class="settings-actions"><button id="settingsInstall" class="primary-btn">Install app</button></div>
    </section>

    <section class="settings-card">
      <p class="eyebrow">Your data</p>
      <h2>Backup before programme updates</h2>
      <p class="help-text">Workout records stay in this browser on this device. Export a backup before clearing browser data, uninstalling the app, changing phones or replacing the six-week programme.</p>
      <div class="settings-actions">
        <button id="exportBtn" class="primary-btn">Export backup</button>
        <button id="importBtn" class="secondary-btn">Import backup</button>
        <button id="resetBtn" class="danger-btn">Erase all local data</button>
      </div>
    </section>

    <section class="settings-card">
      <p class="eyebrow">About</p>
      <p><strong>Move Strong Rehab v${APP_VERSION}</strong></p>
      <p class="help-text">This is an independent, Strength Side-inspired training plan. It is not affiliated with Strength Side and does not reproduce a paid programme. It is a training log, not a medical device.</p>
    </section>
  `;

  document.getElementById('startDate').addEventListener('change', (event) => { state.startDate = event.target.value; saveState(); showToast('Start date saved'); });
  document.getElementById('operatedSide').addEventListener('change', (event) => { state.operatedSide = event.target.value; saveState(); showToast('Operated side saved'); });
  document.getElementById('defaultRounds').addEventListener('change', (event) => { state.morningRounds = Number(event.target.value); saveState(); showToast('Morning duration saved'); });
  document.getElementById('settingsInstall').addEventListener('click', installApp);
  document.getElementById('exportBtn').addEventListener('click', exportBackup);
  document.getElementById('importBtn').addEventListener('click', () => importInput.click());
  document.getElementById('resetBtn').addEventListener('click', resetData);
}

function exportBackup() {
  const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), appVersion: APP_VERSION, state }, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `move-strong-rehab-backup-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
  showToast('Backup exported');
}

function resetData() {
  const confirmed = window.confirm('Erase all workout logs and settings stored on this device? Export a backup first if you may need them.');
  if (!confirmed) return;
  state = defaultState();
  saveState();
  showToast('Local data erased');
  renderSettings();
}

importInput.addEventListener('change', async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    const parsed = JSON.parse(await file.text());
    const incoming = parsed.state || parsed;
    if (!incoming || typeof incoming !== 'object' || !incoming.logs) throw new Error('Invalid backup');
    state = { ...defaultState(), ...incoming, logs: incoming.logs || {} };
    saveState();
    showToast('Backup restored');
    renderSettings();
  } catch {
    showToast('That file is not a valid app backup');
  } finally {
    event.target.value = '';
  }
});

function formatDate(dateString) {
  if (!dateString) return 'not set';
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(`${dateString}T00:00:00`));
}

function makeDiagram(kind) {
  const c = '#101a17';
  const a = '#879e16';
  const soft = '#dfe5dd';
  const line = (x1,y1,x2,y2,extra='') => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="4" stroke-linecap="round" ${extra}/>`;
  const head = (x,y) => `<circle cx="${x}" cy="${y}" r="6" fill="none" stroke="${c}" stroke-width="4"/>`;
  const arrow = (x1,y1,x2,y2) => `<path d="M${x1},${y1} L${x2},${y2}" stroke="${a}" stroke-width="4" stroke-linecap="round" marker-end="url(#arrow)" fill="none"/>`;
  const base = `<defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill="${a}"/></marker></defs>`;
  let art = '';
  switch (kind) {
    case 'breathing':
      art = `${line(15,65,70,65)}${head(27,49)}${line(33,55,55,63)}${line(55,63,71,48)}${line(55,63,74,72)}${arrow(45,43,45,57)}${arrow(54,43,54,57)}`; break;
    case 'catcow':
      art = `${head(28,40)}<path d="M34 45 Q55 30 72 46" fill="none" stroke="${c}" stroke-width="4" stroke-linecap="round"/>${line(38,47,32,69)}${line(68,47,72,69)}${arrow(52,24,52,37)}${head(108,42)}<path d="M114 47 Q135 62 153 46" fill="none" stroke="${c}" stroke-width="4" stroke-linecap="round"/>${line(118,50,112,70)}${line(150,49,155,70)}${arrow(134,69,134,57)}`; break;
    case 'wallslide':
      art = `<rect x="78" y="8" width="5" height="80" rx="2" fill="${soft}"/>${head(48,25)}${line(48,32,48,58)}${line(48,58,35,82)}${line(48,58,59,82)}${line(48,40,74,51)}${line(74,51,78,31)}${arrow(69,58,69,27)}`; break;
    case 'wallpush':
      art = `<rect x="78" y="8" width="5" height="80" rx="2" fill="${soft}"/>${head(35,25)}${line(39,31,53,57)}${line(53,57,38,83)}${line(53,57,66,82)}${line(45,39,78,43)}${arrow(58,27,70,37)}`; break;
    case 'squat':
      art = `${head(49,19)}${line(49,26,49,50)}${line(49,34,35,47)}${line(49,34,63,47)}${line(49,50,35,65)}${line(35,65,24,80)}${line(49,50,65,65)}${line(65,65,76,80)}${arrow(93,22,93,70)}`; break;
    case 'deadbug':
      art = `${line(15,72,80,72)}${head(27,58)}${line(33,63,54,69)}${line(50,66,71,48)}${line(52,68,68,80)}${line(39,61,26,39)}${arrow(75,40,61,51)}`; break;
    case 'standing':
      art = `${head(48,20)}${line(48,27,48,56)}${line(48,36,31,49)}${line(48,36,66,48)}${line(48,56,37,84)}${line(48,56,60,84)}${arrow(72,30,87,43)}${arrow(87,43,74,55)}`; break;
    case 'hip90':
      art = `${head(48,20)}${line(48,27,48,51)}${line(48,37,31,48)}${line(48,37,66,48)}${line(48,51,29,65)}${line(29,65,43,79)}${line(48,51,68,64)}${line(68,64,58,80)}${arrow(93,68,120,68)}`; break;
    case 'hinge':
      art = `${head(42,24)}${line(45,30,64,52)}${line(64,52,48,82)}${line(64,52,76,82)}${line(51,38,35,57)}${arrow(87,28,102,47)}`; break;
    case 'couch':
      art = `<rect x="83" y="48" width="8" height="38" rx="2" fill="${soft}"/>${head(49,18)}${line(49,25,49,52)}${line(49,35,35,49)}${line(49,52,30,65)}${line(30,65,30,83)}${line(49,52,69,66)}${line(69,66,85,52)}${arrow(64,28,64,16)}`; break;
    case 'stretch':
      art = `<rect x="73" y="52" width="44" height="7" rx="3" fill="${soft}"/>${head(42,26)}${line(47,31,62,49)}${line(62,49,74,52)}${line(62,49,95,52)}${line(47,38,34,67)}${line(34,67,25,83)}${line(34,67,48,83)}${arrow(48,18,67,37)}`; break;
    case 'band':
      art = `${head(48,19)}${line(48,26,48,57)}${line(48,57,38,84)}${line(48,57,59,84)}${line(48,38,34,48)}${line(48,38,62,48)}<path d="M34 48 Q48 61 62 48" fill="none" stroke="${a}" stroke-width="3" stroke-dasharray="4 3"/>${arrow(65,46,76,37)}`; break;
    case 'chestopen':
      art = `<rect x="80" y="8" width="5" height="80" rx="2" fill="${soft}"/>${head(48,19)}${line(48,26,48,58)}${line(48,58,38,84)}${line(48,58,59,84)}${line(48,38,80,38)}${line(48,39,36,52)}${arrow(34,28,20,42)}`; break;
    case 'frog':
      art = `${head(50,26)}${line(50,33,50,55)}${line(50,42,34,54)}${line(50,42,67,54)}${line(50,55,26,68)}${line(26,68,14,82)}${line(50,55,75,68)}${line(75,68,88,82)}${arrow(50,17,50,7)}`; break;
    case 'lunge':
      art = `${head(47,18)}${line(47,25,47,51)}${line(47,35,32,47)}${line(47,35,64,47)}${line(47,51,29,65)}${line(29,65,20,83)}${line(47,51,70,65)}${line(70,65,83,65)}${arrow(68,79,68,55)}`; break;
    case 'quadruped':
      art = `${head(27,38)}${line(34,43,67,48)}${line(39,46,32,69)}${line(63,48,72,69)}${line(67,48,80,60)}${arrow(82,35,98,50)}`; break;
    case 'birddog':
      art = `${head(28,41)}${line(35,45,65,49)}${line(40,48,34,70)}${line(62,49,69,70)}${line(65,49,88,39)}${line(37,45,15,32)}${arrow(91,35,105,29)}`; break;
    case 'downdog':
      art = `<rect x="88" y="48" width="45" height="7" rx="3" fill="${soft}"/>${head(72,38)}${line(67,42,48,61)}${line(48,61,28,82)}${line(48,61,70,82)}${line(69,44,90,51)}${arrow(48,35,48,52)}`; break;
    case 'transition':
      art = `${head(34,18)}${line(34,25,34,53)}${line(34,53,25,82)}${line(34,53,47,82)}${arrow(64,50,87,50)}${head(116,30)}${line(116,37,116,59)}${line(116,59,96,75)}${line(116,59,134,75)}`; break;
    case 'pushup':
      art = `<rect x="95" y="48" width="44" height="7" rx="3" fill="${soft}"/>${head(74,41)}${line(68,45,42,55)}${line(42,55,18,70)}${line(68,46,96,51)}${line(42,55,66,71)}${arrow(78,30,78,44)}`; break;
    case 'landmine':
      art = `${head(42,20)}${line(42,27,42,56)}${line(42,56,29,82)}${line(42,56,56,72)}${line(56,72,72,72)}${line(42,39,65,28)}${line(65,28,110,9)}${arrow(74,34,94,25)}`; break;
    case 'press':
      art = `${head(43,20)}${line(43,27,43,57)}${line(43,57,33,83)}${line(43,57,54,83)}${line(43,39,67,37)}${arrow(67,37,93,31)}`; break;
    case 'pull': case 'row':
      art = `${head(48,20)}${line(48,27,48,57)}${line(48,57,37,84)}${line(48,57,60,84)}${line(48,38,23,36)}${line(48,38,73,36)}${arrow(18,36,38,36)}${arrow(78,36,58,36)}`; break;
    case 'pressdown':
      art = `${head(48,19)}${line(48,26,48,58)}${line(48,58,37,84)}${line(48,58,59,84)}${line(48,37,36,51)}${line(48,37,60,51)}${arrow(36,52,36,70)}${arrow(60,52,60,70)}`; break;
    case 'sideplank':
      art = `${head(28,40)}${line(34,44,69,59)}${line(69,59,92,70)}${line(38,46,27,68)}${line(69,59,88,51)}${arrow(52,69,52,52)}`; break;
    case 'legmachine':
      art = `<rect x="20" y="58" width="42" height="8" rx="3" fill="${soft}"/><rect x="58" y="45" width="8" height="36" rx="3" fill="${soft}"/>${head(38,38)}${line(42,43,55,57)}${line(55,57,80,57)}${line(80,57,99,73)}${arrow(98,72,112,58)}`; break;
    case 'pulldown':
      art = `${head(48,26)}${line(48,33,48,62)}${line(48,62,37,84)}${line(48,62,59,84)}${line(48,42,28,21)}${line(48,42,68,21)}${line(20,13,76,13)}${arrow(28,19,35,34)}${arrow(68,19,61,34)}`; break;
    case 'yraise':
      art = `${head(48,22)}${line(48,29,48,58)}${line(48,58,37,84)}${line(48,58,59,84)}${line(48,39,27,18)}${line(48,39,69,18)}${arrow(24,31,18,19)}${arrow(72,31,78,19)}`; break;
    case 'curl':
      art = `${head(48,19)}${line(48,26,48,58)}${line(48,58,37,84)}${line(48,58,59,84)}${line(48,38,34,55)}${line(48,38,62,55)}${arrow(31,60,31,44)}${arrow(65,60,65,44)}`; break;
    case 'hang':
      art = `${line(20,12,78,12)}${head(49,31)}${line(49,37,49,62)}${line(49,62,38,84)}${line(49,62,60,84)}${line(49,42,29,14)}${line(49,42,69,14)}<rect x="27" y="80" width="44" height="6" rx="2" fill="${soft}"/>${arrow(86,22,86,49)}`; break;
    case 'horse':
      art = `${head(48,18)}${line(48,25,48,52)}${line(48,35,27,45)}${line(48,35,69,45)}${line(48,52,25,63)}${line(25,63,18,82)}${line(48,52,72,63)}${line(72,63,79,82)}${arrow(91,25,91,62)}`; break;
    case 'pigeon':
      art = `${head(53,23)}${line(53,30,67,49)}${line(67,49,45,61)}${line(45,61,24,61)}${line(67,49,88,67)}${line(88,67,107,72)}${arrow(48,19,64,35)}`; break;
    case 'crawl':
      art = `${head(27,40)}${line(34,44,64,49)}${line(39,47,32,68)}${line(61,49,69,68)}${line(34,45,17,56)}${line(64,49,82,39)}${arrow(88,48,111,48)}`; break;
    case 'stepup':
      art = `<rect x="67" y="59" width="45" height="25" rx="3" fill="${soft}"/>${head(43,19)}${line(43,26,43,54)}${line(43,54,31,82)}${line(43,54,69,62)}${line(43,37,29,49)}${line(43,37,58,49)}${arrow(88,49,88,29)}`; break;
    case 'lateral':
      art = `${head(49,20)}${line(49,27,49,53)}${line(49,38,29,46)}${line(49,38,69,46)}${line(49,53,26,68)}${line(26,68,14,82)}${line(49,53,79,65)}${line(79,65,101,65)}${arrow(94,38,113,38)}`; break;
    case 'shouldertap':
      art = `${head(28,39)}${line(35,44,66,49)}${line(40,47,34,69)}${line(63,49,70,69)}${line(37,45,56,35)}${arrow(55,31,67,39)}`; break;
    case 'cardio':
      art = `<circle cx="45" cy="64" r="20" fill="none" stroke="${c}" stroke-width="4"/><circle cx="96" cy="64" r="20" fill="none" stroke="${c}" stroke-width="4"/>${head(60,23)}${line(60,30,70,48)}${line(70,48,45,64)}${line(70,48,96,64)}${line(60,38,86,36)}${arrow(112,27,130,27)}`; break;
    default:
      art = `${head(48,20)}${line(48,27,48,57)}${line(48,38,31,49)}${line(48,38,65,49)}${line(48,57,37,84)}${line(48,57,59,84)}${arrow(78,49,101,49)}`;
  }
  return `<svg viewBox="0 0 140 100" role="img" aria-label="Position guide" xmlns="http://www.w3.org/2000/svg">${base}${art}</svg>`;
}

function openTimer(seconds = 90) {
  timerSeconds = seconds;
  timerRemaining = seconds;
  timerPaused = false;
  document.getElementById('timerOverlay').classList.remove('hidden');
  document.getElementById('timerPause').textContent = 'Pause';
  updateTimerDisplay();
  clearInterval(timerId);
  timerId = setInterval(() => {
    if (timerPaused) return;
    timerRemaining -= 1;
    if (timerRemaining <= 0) {
      timerRemaining = 0;
      updateTimerDisplay();
      clearInterval(timerId);
      if ('vibrate' in navigator) navigator.vibrate([180, 100, 180]);
      showToast('Rest complete');
      return;
    }
    updateTimerDisplay();
  }, 1000);
}

function updateTimerDisplay() {
  const minutes = String(Math.floor(timerRemaining / 60)).padStart(2, '0');
  const seconds = String(timerRemaining % 60).padStart(2, '0');
  document.getElementById('timerDisplay').textContent = `${minutes}:${seconds}`;
}

document.getElementById('timerMinus').addEventListener('click', () => { timerRemaining = Math.max(0, timerRemaining - 15); updateTimerDisplay(); });
document.getElementById('timerPlus').addEventListener('click', () => { timerRemaining += 15; updateTimerDisplay(); });
document.getElementById('timerPause').addEventListener('click', () => { timerPaused = !timerPaused; document.getElementById('timerPause').textContent = timerPaused ? 'Resume' : 'Pause'; });
document.getElementById('timerClose').addEventListener('click', () => { document.getElementById('timerOverlay').classList.add('hidden'); clearInterval(timerId); });

backBtn.addEventListener('click', () => routeTo('home'));
document.querySelectorAll('.nav-item').forEach((button) => button.addEventListener('click', () => routeTo(button.dataset.route)));

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  installBtn.classList.remove('hidden');
});

window.addEventListener('appinstalled', () => {
  deferredInstallPrompt = null;
  installBtn.classList.add('hidden');
  showToast('App installed');
});

async function installApp() {
  if (deferredInstallPrompt) {
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    installBtn.classList.add('hidden');
  } else {
    showToast('Chrome menu → Add to home screen → Install');
  }
}
installBtn.addEventListener('click', installApp);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
}

render();
