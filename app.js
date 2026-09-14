/* Move Strong Rehab — local-first six-week programme */

const APP_VERSION = '2.0.2';
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
        ex('d3e-hang', 'Controlled full hang', '3 × 10–20 sec', 3, 'sec', 'hang', ['Step down from a box rather than jumping into the bar.', 'Start with an active shoulder position, then relax only as far as remains comfortable.', 'Come down before grip or shoulder position deteriorates.'], 'Use full bodyweight only if symptoms stay 0–2/10 and are no worse the next morning. No max-duration hangs yet.', 'Hanging capacity', 'controlled dead hang active hang'),
        ex('d3e-scap-pull', 'Scapular pull-up', '2 × 4–6', 2, 'reps', 'hang', ['Hang from the bar with elbows straight.', 'Gently pull the shoulder blades down to lift the body a few centimetres.', 'Lower slowly without shrugging into the neck.'], 'Small range only. Stop if the plate area pulls sharply or the operated side cannot stay symmetrical.', 'Pull-up preparation', 'scapular pull up technique'),
        ex('d3e-pullup-single', 'Pull-up skill single', '1–3 singles only', 3, 'reps', 'pull', ['Use a neutral or comfortable grip if available.', 'Start each rep from control, not a jump.', 'Stop the set immediately after one clean rep.'], 'This is skill exposure, not volume. Use band assistance if pain exceeds 2/10 or the rep becomes uneven.', 'Pull-up preparation', 'strict pull up single progression'),
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


const HOME_SESSIONS = [
  {
    title: 'Home kit push & scapular control', duration: '45–55 min', intensity: 'Minimal equipment · leave 2–3 reps in reserve',
    exercises: [
      ex('d1h-warm', 'Home progressive warm-up', '5 min walk/stairs + 8 wall slides + 12 band external rotations + 8 counter scapular push-ups', 1, 'round', 'cardio', ['Raise body temperature before loading.', 'Use the shoulder drills to check the operated side before pressing.', 'Keep the first round easier than you think you need.'], 'If the shoulder feels worse as you warm up, reduce the session or stop the upper-body work.', 'Warm-up', 'shoulder warm up wall slide external rotation'),
      ex('d1h-pushup', 'Counter or sofa-arm incline push-up', '3 × 8–12', 3, 'reps', 'pushup', ['Use a stable kitchen counter, table edge or sofa arm.', 'Lower the chest as one unit.', 'Finish with a gentle push-away rather than a shrug.'], 'Choose a high support that keeps pain at 0–2/10 and both shoulders level.', 'Strength Side pairing', 'Strength Side incline push up technique'),
      ex('d1h-goblet', '10 kg kettlebell goblet squat', '3 × 10–15', 3, 'reps', 'squat', ['Hold the kettlebell close but below the collarbone.', 'Sit between the hips while keeping the whole foot down.', 'Stand without bouncing out of the bottom.'], 'Do not rest the kettlebell on the plate area. Use bodyweight squats if holding it irritates the clavicle.', 'Strength Side pairing', 'kettlebell goblet squat technique'),
      ex('d1h-floorpress', 'Neutral-grip dumbbell floor press', '3 × 10–15', 3, 'reps', 'press', ['Lie on your back with one 5 kg dumbbell in each hand.', 'Keep elbows about 30–45 degrees from the ribs.', 'Pause lightly when upper arms touch the floor, then press smoothly.'], 'The floor limits depth. Stop if the operated shoulder rolls forward, shrugs or feels sharp plate-site pain.', 'Pressing strength', 'neutral grip dumbbell floor press'),
      ex('d1h-serratus', 'Band serratus punch', '3 × 12 each side', 3, 'reps', 'press', ['Anchor the band behind you around chest height.', 'Reach forward by moving the shoulder blade around the ribs.', 'Return slowly without yanking the shoulder back.'], 'Keep the arm below shoulder height and use a very light band.', 'Shoulder support', 'band serratus punch'),
      ex('d1h-facepull', 'Band face pull', '3 × 12–15', 3, 'reps', 'pull', ['Anchor the band to the pull-up bar or a secure door anchor.', 'Pull toward eyebrow level.', 'Keep the neck long and finish without forcing the elbows behind the body.'], 'Use light tension and avoid an aggressive shoulder-blade squeeze.', 'Shoulder support', 'band face pull exercise'),
      ex('d1h-triceps', 'Band triceps press-down', '2 × 12–15', 2, 'reps', 'pressdown', ['Anchor the band overhead.', 'Keep upper arms quiet beside the body.', 'Extend the elbows smoothly.'], 'Keep the shoulder neutral; do not lean your bodyweight onto the band.', 'Accessories', 'band triceps pressdown'),
      ex('d1h-sideplank', 'Side plank', '2 × 20–40 sec each side', 2, 'sec', 'sideplank', ['Start from the knees if needed.', 'Push the supporting surface away.', 'Keep ribs and pelvis stacked.'], 'Use the knee regression on the operated side until support is comfortable and stable.', 'Core', 'side plank regression technique')
    ]
  },
  {
    title: 'Home lower-body strength + Zone 2', duration: '55–65 min', intensity: 'Knee strength + conversational cardio',
    exercises: [
      ex('d2h-warm', 'Home lower-body warm-up', '8–10 min brisk walk/stairs + hip rotations + bodyweight squats', 1, 'round', 'cardio', ['Build effort gradually.', 'Use the first squats to assess ankle, knee and hip range.', 'Keep breathing controlled.'], 'Keep any hand support light; do not hang through the shoulders.', 'Warm-up', 'home lower body warm up'),
      ex('d2h-goblet', '10 kg kettlebell goblet squat', '4 × 8–12', 4, 'reps', 'squat', ['Hold the kettlebell below the collarbone.', 'Lower for about two seconds.', 'Keep knees tracking with the feet.'], 'Switch to bodyweight tempo squats if front loading irritates the plate area.', 'Main strength', 'kettlebell goblet squat technique'),
      ex('d2h-split', 'Split squat or reverse lunge', '3 × 8–10 each leg', 3, 'reps', 'lunge', ['Use a stance that lets the front heel stay down.', 'Lower under control.', 'Drive through the front foot to stand.'], 'Hold the 5 kg dumbbells at your sides only if carrying them does not tug on the operated shoulder.', 'Unilateral strength', 'reverse lunge split squat technique'),
      ex('d2h-slrdl', 'Single-leg Romanian deadlift', '3 × 8 each leg', 3, 'reps', 'hinge', ['Use bodyweight, the 10 kg kettlebell or one 5 kg dumbbell.', 'Keep hips square.', 'Reach the free leg back as the torso inclines.'], 'Hold the weight in the non-operated-side hand first, or start bodyweight.', 'Strength Side pattern', 'Strength Side single leg RDL'),
      ex('d2h-slidercurl', 'Hamstring slider curl', '3 × 8–12', 3, 'reps', 'legmachine', ['Lie on your back with heels on towels or socks on a smooth floor.', 'Lift hips lightly, curl heels in, then slide out slowly.', 'Keep ribs down.'], 'Keep arms relaxed on the floor; do not brace hard through the shoulders.', 'Posterior chain', 'hamstring slider curl technique'),
      ex('d2h-wallsit', 'Wall sit', '2–3 × 30–45 sec', 3, 'sec', 'squat', ['Back against a wall.', 'Choose a knee angle you can hold without sharp pain.', 'Keep feet flat and breathing steady.'], 'Arms can rest by your sides; avoid pressing the shoulders hard into the wall.', 'Knee capacity', 'wall sit exercise technique'),
      ex('d2h-calf', 'Single- or double-leg calf raise', '3 × 12–20', 3, 'reps', 'standing', ['Use a wall for light balance.', 'Rise smoothly and lower slowly.', 'Pause briefly at the top.'], 'Use fingertips for balance only; no hanging through the operated arm.', 'Lower-body support', 'calf raise exercise technique'),
      ex('d2h-zone2', 'Brisk walk Zone 2', '20–30 min', 1, 'min', 'cardio', ['Keep a pace where you can speak in full sentences.', 'Nasal breathing is optional, not mandatory.', 'Cool down gradually.'], 'Reduce pace if asthma symptoms build rather than settling.', 'Conditioning', 'zone 2 brisk walking')
    ]
  },
  {
    title: 'Home pull + supported hanging', duration: '45–55 min', intensity: 'Controlled pulling; no full pull-ups yet',
    exercises: [
      ex('d3h-warm', 'Pull warm-up', '5–8 min easy walk + band pull-aparts + wall slides + light rows', 1, 'round', 'cardio', ['Start with low band tension.', 'Move the shoulder blades freely without forcing them back.', 'Check that the operated side is not shrugging.'], 'If overhead reach feels restricted today, skip hanging and overhead band work.', 'Warm-up', 'band shoulder pull warm up'),
      ex('d3h-hang', 'Controlled full hang from pull-up bar', '3 × 10–20 sec', 3, 'sec', 'hang', ['Step off a chair into the hang; do not jump.', 'Keep ribs controlled and let the shoulders settle only within a comfortable range.', 'Come down before grip or shoulder position deteriorates.'], 'Use bodyweight only if symptoms stay 0–2/10 and are no worse the next morning. Keep a chair close for assistance.', 'Hanging capacity', 'controlled dead hang active hang'),
      ex('d3h-scap-pull', 'Scapular pull-up', '2 × 4–6', 2, 'reps', 'hang', ['Hang with elbows straight.', 'Gently pull the shoulder blades down to lift the body a few centimetres.', 'Lower slowly without shrugging into the neck.'], 'Small range only. Stop if the operated side cannot stay symmetrical or the plate area pulls sharply.', 'Pull-up preparation', 'scapular pull up technique'),
      ex('d3h-pullup-single', 'Pull-up skill single', '1–3 singles only', 3, 'reps', 'pull', ['Use a neutral or comfortable grip if available.', 'Start each rep from control, not a jump.', 'Stop the set immediately after one clean rep.'], 'This is skill exposure, not volume. Use a band if pain exceeds 2/10 or the rep becomes uneven.', 'Pull-up preparation', 'strict pull up single progression'),
      ex('d3h-pulldown', 'Band lat pulldown from pull-up bar', '3 × 10–15', 3, 'reps', 'pulldown', ['Loop the band securely over the bar.', 'Kneel or sit tall.', 'Pull elbows toward the ribs without leaning back hard.'], 'Use light band tension and avoid yanking from overhead.', 'Pulling strength', 'band lat pulldown pull up bar'),
      ex('d3h-row', 'Band row', '3 × 12–15', 3, 'reps', 'row', ['Anchor the band around chest height.', 'Pull elbows back until hands reach the ribs.', 'Return slowly and let the shoulder blades move.'], 'No aggressive squeeze behind the body; keep the neck long.', 'Pulling strength', 'band row exercise technique'),
      ex('d3h-dbrow', 'Supported one-arm dumbbell row', '3 × 10–15 each side', 3, 'reps', 'row', ['Use a sofa or table for light support.', 'Row the 5 kg dumbbell toward the hip.', 'Lower for two seconds.'], 'Keep support light through the operated arm. If bracing irritates it, use band rows instead.', 'Pulling strength', 'one arm dumbbell row supported'),
      ex('d3h-pullapart', 'Band pull-apart', '2–3 × 12–15', 3, 'reps', 'pull', ['Hold the band at chest height.', 'Pull apart smoothly.', 'Stop before the arms move far behind the body.'], 'Use very light tension and avoid deep shoulder extension.', 'Shoulder support', 'band pull apart exercise'),
      ex('d3h-er', 'Band external rotation', '2 × 12–15 each arm', 2, 'reps', 'band', ['Keep elbow against the side.', 'Rotate the forearm outward without twisting the torso.', 'Return slowly.'], 'Light resistance only; no forced end range.', 'Rotator cuff', 'band external rotation shoulder'),
      ex('d3h-curl', 'Dumbbell hammer curl', '2 × 10–15', 2, 'reps', 'curl', ['Use the 5 kg dumbbells.', 'Keep elbows near the ribs.', 'Lower under control.'], 'Keep shoulders relaxed rather than pulled down hard.', 'Accessory', 'dumbbell hammer curl')
    ]
  },
  {
    title: 'Home recovery movement + aerobic base', duration: '45–60 min', intensity: 'Restorative; not a hard workout',
    exercises: [
      ex('d4h-walk', 'Brisk walk or easy cycling if available', '25–35 min', 1, 'min', 'cardio', ['Keep the pace conversational.', 'Use this as recovery, not testing fitness.', 'Cool down gradually.'], 'Reduce intensity if asthma symptoms build.', 'Aerobic base', 'zone 2 walking workout'),
      ex('d4h-horse', 'Horse stance', '3 × 30–45 sec', 3, 'sec', 'horse', ['Set feet wide.', 'Sit straight down within a comfortable range.', 'Keep pressure even through the feet.'], 'Arms can rest relaxed; do not hold a loaded position overhead.', 'Movement circuit', 'Strength Side horse stance'),
      ex('d4h-9090', '90/90 transitions', '3 × 6 each direction', 3, 'reps', 'hip90', ['Rotate knees from side to side.', 'Sit tall.', 'Use the hands only as lightly as needed.'], 'Do not lean heavily through the operated arm.', 'Movement circuit', 'Strength Side 90 90 hip switches'),
      ex('d4h-pigeon', 'Elevated pigeon hinge', '3 × 8 each side', 3, 'reps', 'pigeon', ['Place the front shin on a sofa or bed.', 'Hinge from the hips.', 'Use a comfortable stretch only.'], 'Use hands lightly for balance; avoid shoulder bracing.', 'Movement circuit', 'pigeon hinge mobility'),
      ex('d4h-lunge', 'Deep-lunge knee lift', '3 × 6 each side', 3, 'reps', 'lunge', ['Set a stable deep lunge.', 'Lift and lower the rear knee.', 'Keep the front foot grounded.'], 'Use leg or furniture support rather than heavy arm support.', 'Movement circuit', 'Strength Side deep lunge knee lift'),
      ex('d4h-crawl', 'Knees-down crawl', '3 × 5–6 steps forward/back', 3, 'reps', 'crawl', ['Move slowly.', 'Keep knees on the floor.', 'Place equal pressure through both hands.'], 'Keep the range small and stop if the operated shoulder collapses or hurts.', 'Movement circuit', 'knees down crawl regression'),
      ex('d4h-plus', 'Counter push-up plus', '3 × 8', 3, 'reps', 'wallpush', ['Use a counter angle.', 'Keep elbows straight at the plus portion.', 'Reach the upper back gently toward the ceiling.'], 'High support only; no pain or shrugging.', 'Movement circuit', 'scapular push up plus counter'),
      ex('d4h-butcher', 'Supported butcher-block stretch', '3 × 20–30 sec', 3, 'sec', 'stretch', ['Forearms on sofa or table.', 'Sit the hips back.', 'Keep ribs controlled.'], 'Do not force overhead range or plate-area pulling.', 'Finish', 'Strength Side butcher block stretch')
    ]
  },
  {
    title: 'Home full-body Strength Side-style session', duration: '45–55 min', intensity: 'Circuit-based; clean reps only',
    exercises: [
      ex('d5h-warm', 'Full-body home warm-up', '5–8 min mobility + easy push-up and row checks', 1, 'round', 'cardio', ['Open hips, ankles and shoulders gradually.', 'Check today’s safe push-up angle.', 'Check today’s band-row tension.'], 'Use the warm-up to choose today’s range rather than forcing last session’s level.', 'Warm-up', 'full body mobility warm up'),
      ex('d5h-push', 'Incline push-up', '3 × 8–10', 3, 'reps', 'pushup', ['Use a stable counter, table or sofa arm.', 'Lower under control.', 'Finish with a gentle push-away.'], 'Do not lower the support until all reps remain pain-free and symmetrical.', 'Circuit A', 'Strength Side push up technique'),
      ex('d5h-goblet', '10 kg kettlebell goblet squat or toe squat', '3 × 10–15', 3, 'reps', 'squat', ['Keep the whole foot grounded.', 'Use a comfortable depth.', 'Stand smoothly.'], 'Hold the kettlebell below the clavicle or use bodyweight if front loading irritates the plate.', 'Circuit A', 'Strength Side toe squat goblet squat'),
      ex('d5h-row', 'Band row', '3 × 12–15', 3, 'reps', 'row', ['Anchor the band securely.', 'Pull hands toward the ribs.', 'Return with control.'], 'Use a band tension that lets the operated side move evenly.', 'Circuit B', 'band row exercise technique'),
      ex('d5h-slrdl', 'Single-leg RDL', '3 × 8 each leg', 3, 'reps', 'hinge', ['Keep hips square.', 'Reach the free leg back.', 'Use support if balance limits the hinge.'], 'Start bodyweight or hold the load on the non-operated side.', 'Circuit B', 'Strength Side single leg RDL'),
      ex('d5h-sideplank', 'Side plank', '3 × 20–40 sec each side', 3, 'sec', 'sideplank', ['Push the floor away.', 'Stack ribs and pelvis.', 'Use knees bent if needed.'], 'Regress the operated side until it is stable and comfortable.', 'Circuit B', 'side plank regression technique'),
      ex('d5h-slidercurl', 'Hamstring slider curl', '3 × 8–12', 3, 'reps', 'legmachine', ['Keep hips steady.', 'Curl heels in slowly.', 'Return with control.'], 'Arms relaxed; no hard shoulder bracing.', 'Circuit C', 'hamstring slider curl technique'),
      ex('d5h-hipbridge', 'Hip bridge', '3 × 10–15', 3, 'reps', 'hinge', ['Drive through the heels.', 'Finish with ribs down and glutes on.', 'Lower slowly.'], 'Keep arms relaxed and avoid pressing hard through the shoulders.', 'Circuit C', 'glute bridge exercise technique'),
      ex('d5h-flow', 'Ground-transition flow', '5 min relaxed practice', 1, 'min', 'transition', ['Move between squat, kneeling and 90/90 positions.', 'Use the legs rather than pushing strongly from the floor.', 'Keep the pace conversational.'], 'No fast drops, loaded one-arm support or painful end-range shoulder positions.', 'Finish', 'Strength Side ground transitions')
    ]
  },
  {
    title: 'Home movement conditioning + shoulder endurance', duration: '45–60 min', intensity: 'Moderate; intervals are not sprints',
    exercises: [
      ex('d6h-warm', 'Progressive home warm-up', '10 min brisk walk/stairs + mobility', 1, 'round', 'cardio', ['Build gradually before intervals.', 'Include easy step-ups and shoulder control work.', 'Keep breathing calm before the harder rounds.'], 'A longer warm-up is useful if exercise triggers asthma symptoms.', 'Warm-up', 'asthma exercise warm up'),
      ex('d6h-stepup', 'Step-up on stairs or sturdy step', '3 × 8–12 each leg', 3, 'reps', 'stepup', ['Place the whole foot on the step.', 'Drive through the working leg.', 'Control the step down.'], 'Use arms naturally or hold light weights only if shoulder carrying is comfortable.', 'Lower-body strength', 'step up exercise technique'),
      ex('d6h-lateral', 'Supported lateral lunge or box Cossack squat', '3 × 6 each side', 3, 'reps', 'lateral', ['Sit into one hip.', 'Keep the other leg long.', 'Use a chair or sofa to control depth.'], 'Support with light fingertips; do not hang through the operated shoulder.', 'Lower-body strength', 'Strength Side cossack squat regression'),
      ex('d6h-pausesquat', 'Paused bodyweight squat', '2 × 10–15', 2, 'reps', 'squat', ['Lower slowly.', 'Pause for one second in a comfortable depth.', 'Stand smoothly.'], 'Keep arm position relaxed and pain-free.', 'Lower-body strength', 'paused bodyweight squat'),
      ex('d6h-wallslide', 'Serratus wall slide', '3 × 10', 3, 'reps', 'wallslide', ['Press gently into the wall.', 'Slide upward without shrugging.', 'Reach slightly at the top.'], 'Stop before loss of symmetry or plate discomfort.', 'Shoulder circuit', 'serratus wall slide technique'),
      ex('d6h-er', 'Band external rotation', '3 × 12 each side', 3, 'reps', 'band', ['Keep elbow near the side.', 'Rotate slowly.', 'Keep torso still.'], 'Use light resistance and no forced end range.', 'Shoulder circuit', 'band external rotation shoulder'),
      ex('d6h-tap', 'Knees-down quadruped shoulder tap', '3 × 6–8 each side', 3, 'reps', 'shouldertap', ['Use a wide knee position.', 'Shift weight slowly.', 'Tap the opposite shoulder without trunk rotation.'], 'Start with tiny weight shifts. Stop if the operated shoulder collapses or hurts.', 'Shoulder circuit', 'quadruped shoulder tap regression'),
      ex('d6h-reardelt', 'Band rear-delt pull-apart', '3 × 12–15', 3, 'reps', 'yraise', ['Use a light band.', 'Pull to a comfortable width.', 'Keep the neck relaxed.'], 'Do not pull the arms far behind the body.', 'Shoulder circuit', 'band rear delt pull apart'),
      ex('d6h-shift', 'Counter weight shift', '3 × 8 each direction', 3, 'reps', 'wallpush', ['Set a high-plank angle at a counter.', 'Shift weight gently left, right, forward and back.', 'Keep elbows straight.'], 'Use a small range and stop for pain or instability.', 'Shoulder circuit', 'closed chain shoulder weight shift'),
      ex('d6h-intervals', 'Walk or stair intervals', '5–6 rounds: 1 min moderately hard + 2 min easy', 6, 'rounds', 'cardio', ['Hard efforts should feel around 7/10, not maximal.', 'Use the easy interval to restore controlled breathing.', 'Cool down for 5 minutes.'], 'Stop if asthma symptoms progressively worsen rather than settling in the easy period.', 'Conditioning', 'walking intervals asthma safe'),
      ex('d6h-flow', 'Ground-flow finish', '2–3 slow rounds', 3, 'rounds', 'transition', ['Move stand → half-kneel → 90/90 → switch → half-kneel → supported squat → stand.', 'Perform three cycles in each direction.', 'Keep the movement quiet and controlled.'], 'No loaded one-arm support, fast crawling or drops.', 'Finish', 'Strength Side ground flow transitions')
    ]
  }
];

const TRANSITION_SESSIONS = {
  2: {
    run: {
      title: 'Easy run/walk base', duration: '25–35 min', intensity: 'Conversational · asthma-safe base',
      exercises: [
        ex('d2r-warmwalk', 'Brisk walk warm-up', '8–10 min', 1, 'min', 'run', ['Start easier than you think you need.', 'Let breathing settle before jogging.', 'Keep shoulders low and relaxed.'], 'A gradual warm-up reduces sudden breathlessness and keeps upper-body tension lower.', 'Warm-up', 'easy running warm up asthma'),
        ex('d2r-runwalk', 'Easy jog/walk block', '20 min total', 1, 'min', 'run', ['Alternate easy jogging and walking as needed.', 'Use full-sentence pace; this is not a test.', 'Keep arm swing relaxed and symmetrical.'], 'If coughing, wheezing or chest tightness builds, walk and record it in notes.', 'Base run', 'beginner run walk easy jog'),
        ex('d2r-cooldown', 'Walk cool-down + calf mobility', '5 min walk + 60 sec calf/hip mobility', 1, 'round', 'standing', ['Walk until breathing is calm.', 'Do gentle calf raises or ankle rocks.', 'Do not stretch aggressively when tired.'], 'No shoulder loading required.', 'Cool-down', 'running cool down calf mobility')
      ]
    }
  },
  3: {
    skill: {
      title: 'Pull-up skill + muscle-up prep', duration: '18–25 min', intensity: 'Skill practice; stop well before fatigue',
      exercises: [
        ex('d3s-hang', 'Full hang', '3 × 10–20 sec', 3, 'sec', 'hang', ['Use a full overhand grip.', 'Start with the shoulders relaxed but not painful.', 'Come down before grip or shoulder control fails.'], 'Only use full hangs if next-morning symptoms stay 0–2/10. No max holds yet.', 'Pull-up base', 'dead hang shoulder active hang'),
        ex('d3s-active', 'Active hang / scapular pull-up', '3 × 4–6', 3, 'reps', 'hang', ['Keep elbows straight.', 'Pull the shoulder blades slightly down and around the ribs.', 'Use a small clean range, then relax with control.'], 'Small range only; stop if the clavicle or plate area feels sharp or tugged.', 'Pull-up base', 'scapular pull up active hang'),
        ex('d3s-single', 'Strict pull-up single', '1–3 singles', 3, 'reps', 'pulldown', ['Start from a controlled active hang.', 'Pull smoothly without kicking.', 'Lower under control but not as a long negative.'], 'One clean single is enough for now. Do not chase reps, negatives or failure.', 'Pull-up base', 'strict pull up technique'),
        ex('d3s-hollow', 'Hollow hold', '3 × 15–30 sec', 3, 'sec', 'hollow', ['Lower back gently presses into the floor.', 'Ribs stay down.', 'Start with knees bent if needed.'], 'No shoulder strain required; keep arms by sides or overhead only if comfortable.', 'Muscle-up prerequisite', 'hollow body hold beginner'),
        ex('d3s-knee', 'Hanging knee raise regression', '2 × 6–10', 2, 'reps', 'kneeraise', ['Use captain-chair position, lying reverse crunch, or hanging knee raises if controlled.', 'Posteriorly tilt the pelvis slightly.', 'Lower slowly.'], 'Choose the version that does not increase shoulder traction or next-morning symptoms.', 'Muscle-up prerequisite', 'hanging knee raise regression')
      ]
    }
  },
  4: {
    run: {
      title: 'Zone 2 run/walk option', duration: '30–40 min', intensity: 'Easy aerobic base',
      exercises: [
        ex('d4r-warm', 'Walk warm-up', '8–10 min', 1, 'min', 'run', ['Start very easy.', 'Keep nasal breathing optional, not forced.', 'Relax the arms and jaw.'], 'Use this instead of bike/treadmill Zone 2 when travelling, not as an extra hard session.', 'Warm-up', 'zone 2 run warm up'),
        ex('d4r-zone2', 'Easy run/walk Zone 2', '20–30 min', 1, 'min', 'run', ['Keep full-sentence pace.', 'Use walk breaks before breathing becomes strained.', 'Finish feeling like you could continue.'], 'If asthma symptoms build, slow to a walk and log it.', 'Aerobic base', 'zone 2 running beginner'),
        ex('d4r-mobility', 'Post-run mobility reset', '5 min', 1, 'min', 'hip90', ['Do 90/90 switches, calf raises and a short couch stretch.', 'Move slowly.', 'Leave the shoulder relaxed.'], 'No loaded shoulder positions after the run.', 'Cool-down', 'post run hip mobility')
      ]
    }
  },
  5: {
    skill: {
      title: 'Muscle-up prerequisites', duration: '18–25 min', intensity: 'Foundation strength; no dips yet',
      exercises: [
        ex('d5s-support', 'Feet-assisted straight-bar top support', '3 × 10–20 sec', 3, 'sec', 'support', ['Use a low bar, bench assistance or feet on the floor.', 'Elbows locked gently; chest tall.', 'Press the bar down without shrugging.'], 'This prepares the muscle-up finish without loading deep dips. Keep most weight through the feet initially.', 'Support strength', 'straight bar support hold regression'),
        ex('d5s-pushup', 'Floor or incline push-up quality set', '2–3 × 5–8', 3, 'reps', 'pushup', ['Use the hardest incline that remains clean.', 'Lower as one unit.', 'Finish with a gentle push-away.'], 'Stop before shoulder asymmetry. This is quality practice, not a max set.', 'Pressing base', 'calisthenics push up progression'),
        ex('d5s-rowline', 'Chest-to-bar line band row', '3 × 8–12', 3, 'reps', 'row', ['Anchor the band high enough to pull toward lower chest.', 'Drive elbows down and back slightly.', 'Keep ribs controlled.'], 'Do not force the elbows far behind the body or jam the front shoulder.', 'Pulling line', 'chest to bar row regression'),
        ex('d5s-hollow', 'Hollow hold or dead bug hollow', '3 × 20–30 sec', 3, 'sec', 'hollow', ['Keep ribs down.', 'Use bent knees to preserve lower-back position.', 'Breathe shallowly without losing tension.'], 'Keep arms comfortable; overhead position is optional.', 'Muscle-up prerequisite', 'hollow body progression'),
        ex('d5s-scap', 'Scapular depression drill on bar or band', '2 × 6–8', 2, 'reps', 'hang', ['Think shoulders away from ears.', 'Move slowly.', 'Keep elbows straight if using the bar.'], 'Use a band version if hanging is more irritable that day.', 'Shoulder control', 'scapular depression pull up bar')
      ]
    }
  },
  6: {
    run: {
      title: 'Run intervals', duration: '30–40 min', intensity: 'Moderate; not all-out',
      exercises: [
        ex('d6r-warm', 'Long walk/jog warm-up', '10 min', 1, 'min', 'run', ['Walk first, then add easy jogging.', 'Do not start the first interval cold.', 'Keep shoulders relaxed.'], 'A longer warm-up is useful with mild asthma.', 'Warm-up', 'running warm up asthma'),
        ex('d6r-intervals', 'Run/walk intervals', '5–6 rounds: 1 min moderate + 2 min walk', 6, 'rounds', 'run', ['Moderate means about 7/10, not sprinting.', 'Use the walk to regain controlled breathing.', 'Stop the set if form or breathing deteriorates.'], 'Avoid hard efforts if asthma symptoms are active or the shoulder is already irritated from upper-body work.', 'Conditioning', 'beginner run walk intervals'),
        ex('d6r-cooldown', 'Walk cool-down', '5–8 min', 1, 'min', 'run', ['Walk until breathing is calm.', 'Log asthma response and any shoulder tension.', 'Hydrate and finish easy.'], 'No extra upper-body loading after intervals.', 'Cool-down', 'running cooldown walk')
      ]
    }
  }
};


PROGRAMME.forEach((day, index) => {
  day.home = HOME_SESSIONS[index];
  const transition = TRANSITION_SESSIONS[day.day];
  if (transition?.skill) day.skill = transition.skill;
  if (transition?.run) day.run = transition.run;
});

const SESSION_OPTIONS = [
  { key: 'morning', label: 'Morning', card: 'Morning', progressLabel: 'Morning' },
  { key: 'evening', label: 'Evening gym', card: 'Gym evening', progressLabel: 'Evening gym' },
  { key: 'home', label: 'Home kit', card: 'Home kit', progressLabel: 'Home kit' },
  { key: 'skill', label: 'Pull skill', card: 'Skill', progressLabel: 'Pull skill' },
  { key: 'run', label: 'Run', card: 'Run', progressLabel: 'Run' }
];

function availableSessionsForDay(day) {
  return SESSION_OPTIONS.filter((option) => Boolean(day[option.key]));
}

function sessionLabel(sessionKey, field = 'label') {
  return SESSION_OPTIONS.find((item) => item.key === sessionKey)?.[field] || sessionKey;
}

function trainingSessionComplete(week, day) {
  return Boolean(state.logs[sessionKey(week, day, 'evening')]?.complete || state.logs[sessionKey(week, day, 'home')]?.complete);
}

const PROGRESSION = [
  { week: 'Weeks 1–2', text: 'One morning round. Use conservative loads. Full hangs stay at 10–20 seconds and pull-up exposure is limited to clean singles only if symptoms remain 0–2/10.' },
  { week: 'Weeks 3–4', text: 'If the shoulder returns to baseline by the next morning, use the full listed sets, add 1–2 reps, lower the push-up support slightly, and build full hangs toward 20–30 seconds.' },
  { week: 'Weeks 5–6', text: 'Change one variable at a time: add 2.5–5% load, lower the push-up incline, add a band-assisted pull-up single, reduce assistance, or add repetitions. Never increase all four together.' }
];

const EXCLUDED = ['Max-duration passive hangs', 'Pull-up volume sets or reps to failure', 'Kipping pull-ups', 'Dips', 'Brachiation and swinging', 'Fast bear or monkey crawling', 'Deep crab stretches', 'Back bridges', 'Heavy shrugs', 'A bar resting across the clavicle plate'];

const defaultState = () => ({
  version: APP_VERSION,
  startDate: new Date().toISOString().slice(0, 10),
  operatedSide: 'Not set',
  morningRounds: 1,
  goals: { pullups: '', dips: '', hollow: '', kneeRaises: '', support: '', runMinutes: '', checklist: {}, notes: '' },
  logs: {}
});

let storageReadError = false;
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
    if (!parsed || typeof parsed !== 'object' || !parsed.logs || Array.isArray(parsed.logs)) throw new Error('Invalid stored state');
    if (parsed.healthOS) parsed.healthOS = HealthModel.normalize(parsed.healthOS);
    const base = defaultState();
    return { ...base, ...parsed, goals: { ...base.goals, ...(parsed.goals || {}) }, logs: parsed.logs || {} };
  } catch {
    storageReadError = true;
    return defaultState();
  }
}

function saveState() {
  if (storageReadError) throw new Error('Original data must be recovered before saving');
  const existing = localStorage.getItem(STORAGE_KEY);
  if (existing && !localStorage.getItem('moveStrongRehabPreHealthOSV1')) {
    localStorage.setItem('moveStrongRehabPreHealthOSV1', existing);
  }
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
    if (state.logs[sessionKey(week, day, 'morning')]?.complete) count++;
    if (trainingSessionComplete(week, day)) count++;
  }
  return count;
}

function optionalSessionsInWeek(week) {
  let total = 0;
  let complete = 0;
  for (let dayNumber = 1; dayNumber <= 6; dayNumber++) {
    const day = PROGRAMME[dayNumber - 1];
    ['skill', 'run'].forEach((session) => {
      if (!day[session]) return;
      total++;
      if (state.logs[sessionKey(week, dayNumber, session)]?.complete) complete++;
    });
  }
  return { complete, total };
}

function dayComplete(week, day) {
  return Boolean(state.logs[sessionKey(week, day, 'morning')]?.complete && trainingSessionComplete(week, day));
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

  if (HealthUI.renderRoute()) return;
  if (route === 'archive') renderPlan();
  if (route === 'old-progress') renderProgress();

  if (route === 'home') renderHome();
  if (route === 'plan') renderPlan();
  if (route === 'progress') renderProgress();
  if (route === 'goals') renderGoals();
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
  const optional = optionalSessionsInWeek(selectedWeek);
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
        <div><h2>Week ${selectedWeek}</h2><p>${completed}/12 core sessions · ${optional.complete}/${optional.total} skill/run</p></div>
        <strong>${Math.round((completed / 12) * 100)}%</strong>
      </div>
      ${renderWeekStrip(selectedWeek, pos.rest ? 7 : selectedDay)}
    </section>

    <section class="section">
      <div class="section-heading"><div><h2>${pos.rest ? 'Next training day' : `Day ${selectedDay}`}</h2><p>${escapeHtml(day.title)}</p></div></div>
      <div class="session-grid">
        ${availableSessionsForDay(day).map((option) => renderSessionCard(selectedWeek, selectedDay, option.key, day[option.key])).join('')}
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
        <p class="eyebrow">${escapeHtml(sessionLabel(sessionName, 'card'))} · ${escapeHtml(session.duration)}</p>
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
      <p>Days 1, 3 and 5 provide the main upper-body stimulus. Day 2 is lower-body dominant. Day 4 is deliberately restorative. Day 6 adds controlled conditioning. Day 7 is rest. Use either Evening gym or Home kit for a day, not both as hard sessions. The new Skill and Run tabs are transition work toward pull-ups, muscle-ups and running; use them as short practice or cardio replacements, not extra punishment.</p>
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
              ${availableSessionsForDay(day).map((option) => `<div class="mini-session"><div><strong>${escapeHtml(option.label)}</strong><br><span>${escapeHtml(day[option.key].title)} · ${escapeHtml(day[option.key].duration)}</span></div><button class="secondary-btn" data-plan-open="${option.key}" data-day="${day.day}">Open</button></div>`).join('')}
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
  if (!day[selectedSession]) selectedSession = 'morning';
  const session = day[selectedSession];
  const log = getSessionLog(selectedWeek, selectedDay, selectedSession);
  pageTitle.textContent = `Day ${selectedDay} · ${sessionLabel(selectedSession)}`;

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
        ${availableSessionsForDay(day).map((option) => `<button data-session-mode="${option.key}" class="${selectedSession === option.key ? 'active' : ''}">${option.label}</button>`).join('')}
      </div>
    </section>

    <div class="session-tools">
      <select id="weekSelect" aria-label="Programme week">${[1,2,3,4,5,6].map((week) => `<option value="${week}" ${week === selectedWeek ? 'selected' : ''}>Week ${week}</option>`).join('')}</select>
      ${selectedSession === 'morning' ? `<select id="roundSelect" aria-label="Morning rounds"><option value="1" ${state.morningRounds === 1 ? 'selected' : ''}>10 min · 1 round</option><option value="2" ${state.morningRounds === 2 ? 'selected' : ''}>18–20 min · 2 rounds</option></select>` : `<button class="secondary-btn" data-start-timer="90">Start 90-sec timer</button>`}
      <button class="secondary-btn" data-scroll-summary>Session notes ↓</button>
    </div>

    <div class="card safety-card">
      <strong>Today’s loading check</strong>
      <p>Proceed only if pain is no more than mild, range is not reduced, and the operated shoulder is not more irritable than yesterday. Home kit is a replacement for the gym session when travelling, not an extra hard session. Skill and run tabs should stay submaximal while the clavicle is still adapting. Tap any diagram or Technique guide for a larger step-by-step guide. These guides support technique but do not replace your physiotherapist’s advice.</p>
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
  const instructions = getExerciseInstructions(exercise);
  const entry = log.exercises[exercise.id] || { done: false, sets: Array(exercise.sets).fill(''), load: '' };
  if (!Array.isArray(entry.sets)) entry.sets = Array(exercise.sets).fill('');
  while (entry.sets.length < exercise.sets) entry.sets.push('');
  const guide = getExerciseGuide(exercise);
  const setInputs = Array.from({ length: exercise.sets }, (_, index) => `
    <div class="log-field"><label>Set ${index + 1} · ${escapeHtml(exercise.unit)}</label><input inputmode="decimal" data-exercise-id="${exercise.id}" data-set-index="${index}" value="${escapeHtml(entry.sets[index] || '')}" placeholder="–"></div>`).join('');
  return `
    <article class="exercise-card" data-card-id="${exercise.id}">
      <div class="exercise-top">
        <button class="exercise-visual guide-thumb" data-guide-exercise="${exercise.id}" aria-label="Open detailed guide for ${escapeHtml(exercise.name)}">
          ${makeDiagram(exercise.diagram)}
          <span>Guide</span>
        </button>
        <button class="exercise-title title-button" data-guide-exercise="${exercise.id}" aria-label="Open detailed guide for ${escapeHtml(exercise.name)}"><h3>${escapeHtml(exercise.name)}</h3><p>${escapeHtml(exercise.prescription)}</p></button>
        <button class="exercise-check ${entry.done ? 'checked' : ''}" data-check-exercise="${exercise.id}" aria-label="Mark ${escapeHtml(exercise.name)} complete">✓</button>
      </div>
      <div class="exercise-body">
        <details open>
          <summary>How to do it · step by step</summary>
          ${instructionBullets(instructions.steps)}
        </details>
        <details>
          <summary>Starting position</summary>
          ${instructionBullets(instructions.setup)}
        </details>
        <details>
          <summary>Common mistakes to avoid</summary>
          ${instructionBullets(instructions.mistakes)}
        </details>
        <div class="rehab-note"><strong>Clavicle note:</strong> ${escapeHtml(exercise.rehab)}</div>
        <button class="guide-inline-btn" data-guide-exercise="${exercise.id}">Open full technique guide</button>
        <div class="log-row">${setInputs}<div class="log-field"><label>Load / level</label><input data-exercise-load="${exercise.id}" value="${escapeHtml(entry.load || '')}" placeholder="e.g. 8 kg / bench 5"></div></div>
        <div class="exercise-actions">
          ${exercise.sets > 1 ? `<button data-rest-for="${exercise.id}">Rest timer</button>` : ''}
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
  main.querySelectorAll('[data-guide-exercise]').forEach((button) => button.addEventListener('click', () => {
    const exercise = session.exercises.find((item) => item.id === button.dataset.guideExercise);
    if (exercise) openExerciseGuide(exercise);
  }));

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
  const complete = [1,2,3,4,5,6].reduce((total, week) => total + completedSessionsInWeek(week), 0);
  const optionalAll = [1,2,3,4,5,6].reduce((acc, week) => { const item = optionalSessionsInWeek(week); return { complete: acc.complete + item.complete, total: acc.total + item.total }; }, { complete: 0, total: 0 });
  const painValues = allLogs.flatMap((log) => [log.painDuring, log.painAfter, log.painNext]).filter((value) => value !== '' && value !== null && value !== undefined).map(Number).filter((value) => Number.isFinite(value) && value >= 0);
  const averagePain = painValues.length ? (painValues.reduce((a, b) => a + b, 0) / painValues.length).toFixed(1) : '–';
  const highResponses = allLogs.filter((log) => Math.max(Number(log.painDuring) || 0, Number(log.painAfter) || 0, Number(log.painNext) || 0) >= 3).length;

  main.innerHTML = `
    <section class="progress-ring-row">
      <div class="metric"><strong>${complete}</strong><span>core sessions complete</span></div>
      <div class="metric"><strong>${averagePain}</strong><span>average logged pain</span></div>
      <div class="metric"><strong>${highResponses}</strong><span>responses ≥3/10</span></div>
      <div class="metric"><strong>${optionalAll.complete}/${optionalAll.total}</strong><span>skill/run complete</span></div>
    </section>

    <section class="section">
      <div class="section-heading"><div><h2>Completion by week</h2><p>12 core sessions plus optional skill/run sessions</p></div></div>
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
    const match = key.match(/w(\d+)-d(\d+)-(morning|evening|home|skill|run)/);
    const title = match ? `Week ${match[1]} · Day ${match[2]} · ${sessionLabel(match[3], 'progressLabel')}` : key;
    return `<article class="card"><strong>${title}</strong><p class="help-text">During: ${log.painDuring || '–'} · After: ${log.painAfter || '–'} · Next morning: ${log.painNext || '–'}</p>${log.notes ? `<p>${escapeHtml(log.notes)}</p>` : ''}</article>`;
  }).join('');
}


function renderGoals() {
  pageTitle.textContent = 'Goals';
  const goals = state.goals || defaultState().goals;
  const checks = goals.checklist || {};
  const items = [
    ['pain', 'Upper-body symptoms stay 0–2/10', 'No focal plate pain and no next-morning flare after hangs, rows or push-ups.'],
    ['hang30', '30-sec comfortable hang', 'Full hang without grip panic, shoulder shrugging or symptoms the next day.'],
    ['pull3', '3 clean strict pull-ups', 'First milestone. Still not enough for muscle-up attempts.'],
    ['pull8', '8–10 strict pull-ups', 'Target range before serious muscle-up transition work.'],
    ['support30', '30-sec straight-bar top support', 'Initially feet-assisted; progress only when shoulder feels stable.'],
    ['dipbase', 'Pain-free dip base', 'Start with support holds and assisted shallow dips before straight-bar dips.'],
    ['hollow30', '30-sec hollow hold', 'Clean ribs-down body line for calisthenics and running posture.'],
    ['kneeraise10', '10 controlled hanging knee raises', 'Use lying or captain-chair regressions until hanging is easy.'],
    ['run2', 'Two easy runs per week', 'Conversational pace with no asthma flare.'],
    ['runinterval', 'Controlled intervals tolerated', 'Day 6 intervals feel moderate, not like all-out sprints.']
  ];

  main.innerHTML = `
    <section class="hero">
      <p class="eyebrow">Transition goal</p>
      <h2>Calisthenics + running foundation.</h2>
      <p>This block is still protecting the clavicle, but it now tracks the prerequisites for pull-ups, future muscle-ups and regular running.</p>
      <div class="hero-actions"><button class="primary-btn" data-open-day="3" data-open-session="skill">Pull skill</button><button class="secondary-btn" data-open-day="6" data-open-session="run">Run intervals</button></div>
    </section>

    <section class="section">
      <div class="section-heading"><div><h2>Current benchmarks</h2><p>Update these once per week, not every day</p></div></div>
      <div class="card">
        <div class="goal-number-grid">
          <div class="field"><label>Strict pull-ups</label><input id="goalPullups" inputmode="numeric" value="${escapeHtml(goals.pullups)}" placeholder="e.g. 1"></div>
          <div class="field"><label>Pain-free dips</label><input id="goalDips" inputmode="numeric" value="${escapeHtml(goals.dips)}" placeholder="not yet"></div>
          <div class="field"><label>Hollow hold sec</label><input id="goalHollow" inputmode="numeric" value="${escapeHtml(goals.hollow)}" placeholder="e.g. 20"></div>
          <div class="field"><label>Knee raises</label><input id="goalKneeRaises" inputmode="numeric" value="${escapeHtml(goals.kneeRaises)}" placeholder="e.g. 6"></div>
          <div class="field"><label>Support hold sec</label><input id="goalSupport" inputmode="numeric" value="${escapeHtml(goals.support)}" placeholder="e.g. 15 assisted"></div>
          <div class="field"><label>Weekly run min</label><input id="goalRunMinutes" inputmode="numeric" value="${escapeHtml(goals.runMinutes)}" placeholder="e.g. 45"></div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="section-heading"><div><h2>Readiness checklist</h2><p>This decides when we move toward advanced calisthenics</p></div></div>
      <div class="card">
        ${items.map(([id, title, detail]) => `<label class="goal-check"><input type="checkbox" data-goal-check="${id}" ${checks[id] ? 'checked' : ''}><span><strong>${escapeHtml(title)}</strong><span>${escapeHtml(detail)}</span></span></label>`).join('')}
      </div>
    </section>

    <section class="section">
      <div class="card safety-card"><strong>Muscle-up gate</strong><p>No real muscle-up attempts yet. The next target is repeated pain-free pull-up singles, a 30-second hang, hollow-body control, and assisted top-support confidence. Dips and transitions come after the shoulder tolerates support holds and pushing without a next-morning flare.</p></div>
    </section>

    <section class="section">
      <div class="card">
        <strong>Goal notes</strong>
        <textarea id="goalNotes" class="full-width" style="margin-top:10px; min-height:110px; border:1px solid var(--border); border-radius:13px; padding:11px;" placeholder="e.g. pull-up felt smooth, right plate area 1/10 next morning…">${escapeHtml(goals.notes || '')}</textarea>
      </div>
    </section>
  `;

  main.querySelectorAll('[data-open-session]').forEach((button) => button.addEventListener('click', () => {
    selectedDay = Number(button.dataset.openDay);
    selectedSession = button.dataset.openSession;
    routeTo('workout');
  }));
  const fields = {
    goalPullups: 'pullups', goalDips: 'dips', goalHollow: 'hollow', goalKneeRaises: 'kneeRaises', goalSupport: 'support', goalRunMinutes: 'runMinutes', goalNotes: 'notes'
  };
  Object.entries(fields).forEach(([elementId, key]) => {
    document.getElementById(elementId).addEventListener('change', (event) => {
      state.goals = { ...defaultState().goals, ...(state.goals || {}) };
      state.goals[key] = event.target.value;
      saveState();
      showToast('Goal saved');
    });
  });
  main.querySelectorAll('[data-goal-check]').forEach((checkbox) => checkbox.addEventListener('change', () => {
    state.goals = { ...defaultState().goals, ...(state.goals || {}) };
    state.goals.checklist = { ...(state.goals.checklist || {}) };
    state.goals.checklist[checkbox.dataset.goalCheck] = checkbox.checked;
    saveState();
    showToast('Checklist updated');
  }));
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
      <p class="help-text">On Android Chrome: menu → Add to home screen → Install. Once installed, the plan, diagrams, detailed technique guides and logs work offline.</p>
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
      <p class="help-text">This v1.5 update adds animated mini-demos, clearer movement visuals, and expanded tap-to-open technique guides. This is an independent, Strength Side-inspired training plan. It is not affiliated with Strength Side and does not reproduce a paid programme. It is a training log, not a medical device.</p>
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
    if (!incoming || typeof incoming !== 'object' || !incoming.logs || typeof incoming.logs !== 'object' || Array.isArray(incoming.logs)) throw new Error('Invalid backup');
    for (const [key, log] of Object.entries(incoming.logs)) {
      if (!/^w[1-6]-d[1-6]-(morning|evening|home|skill|run)$/.test(key) || !log || typeof log !== 'object' || !log.exercises || typeof log.exercises !== 'object' || Array.isArray(log.exercises)) throw new Error('Invalid workout record');
    }
    const restoredHealth = HealthModel.normalize(incoming.healthOS);
    const hasLocalRecords = Boolean(localStorage.getItem(STORAGE_KEY));
    const currentHealth = hasLocalRecords ? state.healthOS : undefined;
    if (storageReadError) throw new Error('Recover original storage first');
    localStorage.setItem('moveStrongRehabPreImport', JSON.stringify(state));
    const merged = hasLocalRecords ? { ...incoming, ...state, goals: { ...(incoming.goals || {}), ...state.goals }, logs: { ...incoming.logs, ...state.logs }, healthOS: HealthModel.mergeHealth(restoredHealth, currentHealth) } : { ...defaultState(), ...incoming, healthOS: restoredHealth };
    // Persist before changing the in-memory view so failed imports cannot appear successful.
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    state = merged;
    showToast('Backup merged; existing records kept');
    routeTo('settings');
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


function getExerciseGuide(exercise) {
  const name = exercise.name.toLowerCase();
  const diagram = exercise.diagram || '';
  const base = {
    purpose: 'Practise the movement with control while keeping the operated shoulder calm and symmetrical.',
    setup: 'Set up in a stable position first. Start easier than the prescription if the movement feels unfamiliar today.',
    execution: 'Move slowly through the working range, pause briefly where control is hardest, then return without rushing.',
    breathing: 'Breathe continuously. Exhale through the hardest part and avoid bracing so hard that your neck or traps take over.',
    mistake: 'Rushing the rep, losing rib position, shrugging the operated shoulder, or chasing range when the joint is not ready.',
    regression: 'Reduce range, reduce load, use a higher support, add band assistance, or perform fewer reps.',
    progression: 'Add reps first, then a small load increase or harder angle only if next-morning symptoms stay stable.',
    stop: 'Stop for sharp clavicle or plate pain, numbness, tingling, sudden weakness, new swelling, or symptoms that worsen rep to rep.'
  };

  const apply = (patch) => ({ ...base, ...patch });

  if (name.includes('breathing')) return apply({
    purpose: 'Down-regulate tension and check that the neck and upper traps are not doing the work of breathing.',
    setup: 'Lie on your back with knees bent, one hand on the lower ribs and one hand on the stomach.',
    execution: 'Inhale quietly through the nose or mouth and let the lower ribs expand. Exhale slowly and let the ribs soften down.',
    mistake: 'Lifting the shoulders, arching the lower back, or forcing a huge breath into the upper chest.',
    progression: 'Use the same breathing while sitting, standing, or during your warm-up sets.'
  });
  if (name.includes('cat') || diagram === 'catcow') return apply({
    purpose: 'Restore gentle spine and shoulder-blade motion before loading.',
    setup: 'Start on hands and knees with hands under shoulders, knees under hips, and pressure spread through the full hand.',
    execution: 'Round the spine slowly, then reverse into a gentle extension. Keep the elbows straight and let the shoulder blades glide.',
    mistake: 'Dumping weight unevenly into the operated arm or forcing the neck to create the movement.',
    regression: 'Do it standing with hands on a bench if quadruped loading feels too much.',
    progression: 'Add a slow rock-back after each rep once both shoulders feel even.'
  });
  if (name.includes('wall slide') || diagram === 'wallslide') return apply({
    purpose: 'Train serratus and upward rotation without heavy pressing.',
    setup: 'Stand facing a wall with forearms on the wall, elbows slightly below shoulder height and ribs stacked over pelvis.',
    execution: 'Slide the forearms up only as far as you can keep the neck relaxed and ribs down. Lightly push into the wall throughout.',
    mistake: 'Shrugging, flaring the ribs, losing forearm contact, or forcing overhead range.',
    regression: 'Reduce the height or do one arm at a time with very light pressure.',
    progression: 'Add a light mini-band around the forearms only when the movement is pain-free and smooth.'
  });
  if (name.includes('scapular push') || name.includes('push-up plus') || name.includes('push up plus')) return apply({
    purpose: 'Build serratus strength and shoulder-blade control for push-ups, hand support and future calisthenics.',
    setup: 'Use a wall, counter or floor depending on tolerance. Keep elbows straight and hands under or slightly wider than shoulders.',
    execution: 'Let the chest sink a few centimetres as the shoulder blades move together, then push the surface away and spread the shoulder blades.',
    mistake: 'Bending the elbows, craning the neck, shrugging, or allowing the operated shoulder to lag behind.',
    regression: 'Use a higher surface or smaller shoulder-blade movement.',
    progression: 'Move from wall to counter to floor, or add slow shoulder taps only after control is symmetrical.'
  });
  if (name.includes('incline push') || name.includes('counter') && name.includes('push') || name.includes('push-up')) return apply({
    purpose: 'Rebuild pressing strength while controlling shoulder-blade motion and clavicle loading.',
    setup: 'Choose a stable support height where you can complete every rep with 0–2/10 discomfort. Hands just wider than shoulders.',
    execution: 'Lower as one unit, elbows about 30–45 degrees from the ribs. Press up and finish with a small controlled push-away.',
    mistake: 'Collapsing into the bottom, shrugging at the top, letting one shoulder dip, or progressing to a lower height too soon.',
    regression: 'Raise the hands to a higher surface or reduce the range.',
    progression: 'Lower the surface slightly once you can complete all sets with stable next-morning symptoms.'
  });
  if (name.includes('landmine')) return apply({
    purpose: 'Introduce angled overhead pressing with a more shoulder-friendly path than a vertical dumbbell press.',
    setup: 'Half-kneel with ribs stacked, glute gently engaged on the down-knee side, and the bar close to the shoulder.',
    execution: 'Press forward and up along the bar path. Let the shoulder blade rotate naturally, then lower slowly to the start.',
    mistake: 'Leaning back, flaring the ribs, shrugging, or turning it into a max-effort press.',
    regression: 'Use the empty bar, reduce range, or replace with incline push-ups/floor press.',
    progression: 'Add small plates only after both sides look the same and there is no next-day irritation.'
  });
  if (name.includes('floor press')) return apply({
    purpose: 'Train horizontal pressing with a built-in range limit that protects the front of the shoulder.',
    setup: 'Lie on your back, feet planted, dumbbells in a neutral grip, elbows about 30–45 degrees from your ribs.',
    execution: 'Lower until the upper arms lightly touch the floor. Pause, then press smoothly without bouncing.',
    mistake: 'Letting the shoulder roll forward, bouncing off the floor, or chasing a deep stretch that the floor press is designed to avoid.',
    regression: 'Use one dumbbell at a time or reduce reps.',
    progression: 'Add reps, tempo, or a slightly heavier dumbbell later rather than forcing extra depth.'
  });
  if (name.includes('serratus punch')) return apply({
    purpose: 'Strengthen the shoulder blade’s reach function for stable pressing and overhead movement.',
    setup: 'Anchor the cable or band behind you around chest height. Stand tall with the arm below shoulder height.',
    execution: 'Reach forward by letting the shoulder blade wrap around the ribs. Return slowly without yanking back.',
    mistake: 'Twisting the torso, locking the neck, or pulling the shoulder blade aggressively behind the body.',
    regression: 'Use a lighter band/cable and smaller range.',
    progression: 'Progress tension only when the reach stays smooth and pain-free.'
  });
  if (name.includes('face pull')) return apply({
    purpose: 'Build rear-shoulder and upper-back capacity without heavy compression through the clavicle.',
    setup: 'Set the band/cable around upper-chest to face height. Stand tall and start with arms reaching forward.',
    execution: 'Pull toward the face, let the hands separate, and finish with elbows slightly below or level with shoulders.',
    mistake: 'Cranking elbows far behind the body, shrugging, arching the back, or using too much weight.',
    regression: 'Use a lighter band and pull to chest height.',
    progression: 'Add reps before increasing load.'
  });
  if (name.includes('external rotation')) return apply({
    purpose: 'Train rotator-cuff control for stable pressing, hanging and pulling.',
    setup: 'Keep elbow close to the side, forearm across the body, and shoulder relaxed.',
    execution: 'Rotate the forearm outward without twisting the torso. Pause briefly, then return slowly.',
    mistake: 'Using the torso to cheat, flaring the elbow, or forcing end range.',
    regression: 'Use no band or a lighter band.',
    progression: 'Increase band tension only after clean, slow reps are easy.'
  });
  if (name.includes('squat') || name.includes('wall sit') || diagram === 'squat' || diagram === 'horse') return apply({
    purpose: 'Build knee, hip and ankle strength/control while keeping shoulder loading minimal.',
    setup: 'Feet roughly shoulder width unless the exercise states otherwise. Keep the whole foot grounded.',
    execution: 'Sit between the hips, keep knees tracking with toes, pause briefly if prescribed, and stand smoothly.',
    mistake: 'Rushing the bottom, letting knees cave in, lifting heels, or resting front-loaded weight on the plate area.',
    regression: 'Use a higher box, hold a support, reduce depth, or use bodyweight only.',
    progression: 'Add reps, tempo, or a small load increase while keeping knee tracking clean.'
  });
  if (name.includes('split') || name.includes('lunge') || diagram === 'lunge' || diagram === 'stepup' || diagram === 'lateral') return apply({
    purpose: 'Improve single-leg strength, knee tracking and hip control for running and athletic movement.',
    setup: 'Choose a stance or step height where the front foot stays flat and the pelvis feels level.',
    execution: 'Lower under control, keep the knee tracking over the middle toes, then drive through the working leg to stand.',
    mistake: 'Pushing mostly from the back leg, wobbling through the knee, rushing, or using the arms for heavy support.',
    regression: 'Use a smaller range, lower step, or light hand support.',
    progression: 'Add range first, then load, then tempo.'
  });
  if (name.includes('hinge') || name.includes('romanian') || name.includes('rdl') || diagram === 'hinge') return apply({
    purpose: 'Build posterior-chain strength and hamstring mobility without heavy upper-body loading.',
    setup: 'Stand tall, soften the knees, and keep the spine long. For single-leg work, square the hips to the floor.',
    execution: 'Push the hips back until hamstrings limit the range, then drive the hips forward to return.',
    mistake: 'Rounding the back, twisting the pelvis, reaching with the shoulders, or turning it into a squat.',
    regression: 'Use bodyweight, hold a support, or shorten the range.',
    progression: 'Add a dumbbell/kettlebell or slow the lowering phase.'
  });
  if (name.includes('90/90') || diagram === 'hip90') return apply({
    purpose: 'Improve hip rotation for squatting, running mechanics and ground movement.',
    setup: 'Sit with both knees bent around 90 degrees. Hands can be behind you for light support.',
    execution: 'Rotate the knees from one side to the other slowly. Try to keep the chest tall and control the end range.',
    mistake: 'Dumping weight through the hands, rushing, or forcing the knees down.',
    regression: 'Lean back on the hands or widen the angles.',
    progression: 'Use less hand support or add a hip lift/transition.'
  });
  if (name.includes('couch stretch') || name.includes('pigeon') || name.includes('butcher') || name.includes('chest opener') || name.includes('stretch')) return apply({
    purpose: 'Restore usable range without forcing the healing shoulder or irritating the plate area.',
    setup: 'Set the position gently and support yourself before moving deeper.',
    execution: 'Breathe slowly, hold a mild stretch, and adjust the angle rather than pushing through discomfort.',
    mistake: 'Chasing maximum range, holding breath, leaning heavily through the operated arm, or creating sharp pulling.',
    regression: 'Use pillows, a higher support, shorter holds, or a smaller angle.',
    progression: 'Increase hold time first; deeper range comes later.'
  });
  if (name.includes('hang') || name.includes('pull-up') || name.includes('pull up') || diagram === 'hang') return apply({
    purpose: 'Build hanging tolerance and the foundation for strict pull-ups and future muscle-ups.',
    setup: 'Use a secure bar. Step into position from a chair rather than jumping. Keep a chair close for assistance.',
    execution: 'Start with control. For hangs, keep ribs controlled and shoulder position comfortable. For scapular reps, move only a few centimetres. For singles, stop after one clean rep.',
    mistake: 'Maxing out, dropping into the bottom, kipping, twisting, or continuing after the operated side loses symmetry.',
    regression: 'Use foot support, band assistance, shorter holds, or skip full bodyweight that day.',
    progression: 'Build consistent pain-free hangs, then multiple clean singles, then volume later.',
    stop: 'Stop for sharp clavicle/plate pain, nerve symptoms, worsening pain during the set, or next-morning irritation above baseline.'
  });
  if (name.includes('row') || name.includes('pulldown') || name.includes('pull-apart')) return apply({
    purpose: 'Build pulling strength and shoulder-blade control for pull-ups without overloading the clavicle too quickly.',
    setup: 'Choose a band, cable or body angle that lets both shoulders move evenly.',
    execution: 'Pull with elbows, pause briefly, then return slowly while allowing the shoulder blades to move naturally.',
    mistake: 'Yanking, shrugging, over-squeezing behind the body, twisting, or using a load that changes your shoulder position.',
    regression: 'Use lighter tension, a more upright row angle, or fewer reps.',
    progression: 'Add reps first, then tension or a harder body angle.'
  });
  if (name.includes('support')) return apply({
    purpose: 'Prepare the top position of dips and muscle-ups without doing full dips yet.',
    setup: 'Use a straight bar and keep feet on the floor or a box so the arms do not take full bodyweight.',
    execution: 'Press the bar down, keep elbows straight, ribs controlled and shoulders away from ears. Hold only as long as position stays clean.',
    mistake: 'Letting shoulders roll forward, sinking into the bar, shrugging, or turning the hold into a dip.',
    regression: 'Use more foot assistance or shorten the hold.',
    progression: 'Gradually reduce foot help before adding any dip motion.'
  });
  if (name.includes('hollow') || name.includes('dead bug') || name.includes('knee raise') || name.includes('side plank')) return apply({
    purpose: 'Build trunk control for calisthenics, running posture and shoulder-friendly strength work.',
    setup: 'Start in the easiest position that lets the ribs stay down and the lower back controlled.',
    execution: 'Move slowly, exhale through the hard part, and stop before the lower back arches or shoulders tense.',
    mistake: 'Holding breath, arching the back, shrugging, or chasing longer holds with poor position.',
    regression: 'Bend knees, shorten the lever, or use fewer seconds/reps.',
    progression: 'Increase hold time or lever length gradually.'
  });
  if (name.includes('crawl') || name.includes('quadruped') || name.includes('bird dog') || name.includes('transition') || name.includes('frog') || name.includes('down-dog')) return apply({
    purpose: 'Improve ground movement, shoulder weight-bearing tolerance and whole-body coordination.',
    setup: 'Start slow. Spread the hands, keep elbows soft but not collapsed, and distribute weight evenly.',
    execution: 'Move one segment at a time and keep the operated shoulder from shrugging or dipping.',
    mistake: 'Moving too fast, dumping bodyweight into one arm, holding breath, or forcing end ranges.',
    regression: 'Use hands on a bench, reduce range, or remove the weight-bearing portion.',
    progression: 'Add slow steps, longer holds, or smoother transitions before adding speed.'
  });
  if (name.includes('run') || name.includes('walk') || diagram === 'run' || diagram === 'cardio') return apply({
    purpose: 'Build aerobic capacity and running tolerance while keeping asthma risk controlled.',
    setup: 'Warm up gradually. Start easier than you think, especially in cold air or when hay fever/asthma symptoms are present.',
    execution: 'Keep easy days conversational. For intervals, finish each rep feeling like you could do more.',
    mistake: 'Starting too fast, skipping the warm-up, turning Zone 2 into a race, or ignoring wheeze/chest tightness.',
    regression: 'Use brisk walking, shorter run intervals or a bike.',
    progression: 'Add total minutes before adding speed.'
  });
  return base;
}


function getExerciseFeel(exercise) {
  const name = exercise.name.toLowerCase();
  const diagram = exercise.diagram || '';
  if (name.includes('wall slide') || name.includes('scapular push') || name.includes('serratus') || name.includes('face pull') || name.includes('external rotation')) return 'You should mostly feel the area around the shoulder blade, upper back and back of the shoulder working — not the neck or upper traps taking over.';
  if (name.includes('push') || name.includes('press') || diagram === 'pushup' || diagram === 'press' || diagram === 'landmine') return 'You should mostly feel chest, triceps and serratus working, with the shoulder feeling stable rather than pinchy.';
  if (name.includes('hang') || name.includes('pull-up') || name.includes('pull up') || name.includes('row') || name.includes('pulldown') || name.includes('curl')) return 'You should mostly feel lats, mid-back, biceps and your grip, while the shoulder stays connected and controlled.';
  if (name.includes('squat') || name.includes('lunge') || name.includes('step') || name.includes('wall sit') || diagram === 'squat' || diagram === 'lunge') return 'You should mostly feel quads and glutes, with pressure spread through the full foot and no knee collapse inward.';
  if (name.includes('hinge') || name.includes('rdl') || name.includes('romanian')) return 'You should mostly feel the hamstrings and glutes loading as the hips move back, not your lower back doing all the work.';
  if (name.includes('90/90') || name.includes('couch') || name.includes('stretch') || name.includes('pigeon') || name.includes('frog') || diagram === 'hip90' || diagram === 'stretch') return 'You should feel a mild stretch or controlled end-range effort. It should feel productive, not sharp or aggressive.';
  if (name.includes('hollow') || name.includes('dead bug') || name.includes('side plank') || name.includes('knee raise')) return 'You should mostly feel your trunk working: abs, deep core and front-of-body tension without straining the neck.';
  if (name.includes('run') || name.includes('walk') || diagram === 'run' || diagram === 'cardio') return 'You should feel the effort mostly in your legs and breathing system, while still being able to control the pace.';
  return 'You should feel the target area working while the operated shoulder stays calm, even and controlled.';
}

function getExerciseTempo(exercise) {
  const name = exercise.name.toLowerCase();
  const diagram = exercise.diagram || '';
  if (name.includes('stretch') || name.includes('couch') || name.includes('pigeon') || name.includes('hang') || name.includes('hollow') || name.includes('side plank') || diagram === 'stretch' || diagram === 'hang') return 'Hold still and breathe. If the prescription is a hold, aim for a calm, steady position rather than squeezing harder and harder.';
  if (name.includes('run') || name.includes('walk') || diagram === 'run' || diagram === 'cardio') return 'Settle into an even rhythm. Easy runs should feel conversational; interval reps should be controlled, not all-out.';
  return 'Use a smooth 2–3 second lowering phase, a brief pause where control is hardest, then a smooth return. No bouncing or jerking.';
}

function getExerciseChecklist(exercise) {
  const name = exercise.name.toLowerCase();
  const diagram = exercise.diagram || '';
  if (name.includes('wall slide') || name.includes('scapular push') || name.includes('push-up plus')) return [
    'Keep the neck long and the upper traps quiet.',
    'Let the shoulder blade move; do not bend the elbows to cheat.',
    'Stop the rep before the ribs flare or the operated shoulder shrugs.'
  ];
  if (name.includes('push') || name.includes('press') || diagram === 'pushup' || diagram === 'press' || diagram === 'landmine') return [
    'Hands set, ribs stacked, and both shoulders level before the first rep.',
    'Lower under control with elbows roughly 30–45° from the ribs.',
    'Finish by pressing away without shrugging or twisting.'
  ];
  if (name.includes('hang') || name.includes('pull-up') || name.includes('pull up') || diagram === 'hang') return [
    'Step into position rather than jumping to the bar.',
    'Keep your body quiet and stop before your shoulders lose symmetry.',
    'One clean rep is more useful than several messy reps right now.'
  ];
  if (name.includes('row') || name.includes('pulldown') || name.includes('pull-apart')) return [
    'Set the ribcage and keep the neck relaxed.',
    'Lead with the elbows and let the shoulder blades glide naturally.',
    'Return the weight under control; do not let it yank you forward.'
  ];
  if (name.includes('squat') || name.includes('lunge') || name.includes('step') || diagram === 'squat' || diagram === 'lunge') return [
    'Keep the whole foot grounded.',
    'Let the knee track over the middle toes rather than collapsing inward.',
    'Move through a range you can own — not the deepest range possible.'
  ];
  if (name.includes('hinge') || name.includes('rdl') || name.includes('romanian')) return [
    'Push the hips back first.',
    'Keep the spine long and the ribs quiet.',
    'Feel the hamstrings load before you think about returning to stand.'
  ];
  if (name.includes('90/90') || name.includes('frog') || name.includes('pigeon') || name.includes('couch') || diagram === 'hip90') return [
    'Go slowly into the end range.',
    'Use enough hand support to stay controlled.',
    'Mild stretch is fine; sharp joint pain is not.'
  ];
  if (name.includes('run') || name.includes('walk') || diagram === 'run' || diagram === 'cardio') return [
    'Warm up gradually, especially with asthma.',
    'Keep easy sessions genuinely easy.',
    'If wheeze or chest tightness rises instead of settling, back off.'
  ];
  return [
    'Set up carefully before the first rep.',
    'Move smoothly and keep the operated shoulder quiet.',
    'If symptoms rise across the set, regress the next exposure.'
  ];
}

function openExerciseGuide(exercise) {
  const instructions = getExerciseInstructions(exercise);
  const guide = getExerciseGuide(exercise);
  const overlay = document.getElementById('exerciseOverlay');
  const content = document.getElementById('guideContent');
  const checklist = getExerciseChecklist(exercise).map((item) => `<li>${escapeHtml(item)}</li>`).join('');
  content.innerHTML = `
    <p class="eyebrow">Technique guide</p>
    <h2>${escapeHtml(exercise.name)}</h2>
    <p class="guide-prescription">${escapeHtml(exercise.prescription)} · ${escapeHtml(exercise.group)}</p>
    <div class="guide-diagram-large">${makeDiagram(exercise.diagram)}</div>
    <div class="guide-steps">
      <div><strong>1 · Starting position</strong>${instructionBullets(instructions.setup)}</div>
      <div><strong>2 · How to do it</strong>${instructionBullets(instructions.steps)}</div>
      <div><strong>3 · Breathe</strong>${instructionBullets(['Keep breathing throughout the movement.', 'For strength exercises, breathe out as you push, pull or stand; breathe in as you return.', 'Do not force your breathing or hold your breath.'])}</div>
    </div>
    <section class="guide-section guide-grid guide-grid-three">
      <div><h3>What it's for</h3><p>${escapeHtml(guide.purpose)}</p></div>
      <div><h3>What you should feel</h3><p>${escapeHtml(getExerciseFeel(exercise))}</p></div>
      <div><h3>Tempo</h3><p>${escapeHtml(getExerciseTempo(exercise))}</p></div>
    </section>
    <section class="guide-section"><h3>Position checklist</h3><ul>${checklist}</ul></section>
    <section class="guide-section"><h3>Common mistakes to avoid</h3>${instructionBullets(instructions.mistakes)}</section>
    <section class="guide-section guide-grid">
      <div><h3>Make it easier</h3><p>${escapeHtml(guide.regression)}</p></div>
      <div><h3>Progress when ready</h3><p>${escapeHtml(guide.progression)}</p></div>
    </section>
    <section class="guide-section rehab-note"><strong>Clavicle rule:</strong> ${escapeHtml(exercise.rehab)}</section>
    <section class="guide-section stop-note"><strong>Stop signal:</strong> ${escapeHtml(guide.stop)}</section>
  `;
  overlay.classList.remove('hidden');
  document.body.classList.add('modal-open');
}

function closeExerciseGuide() {
  document.getElementById('exerciseOverlay')?.classList.add('hidden');
  document.body.classList.remove('modal-open');
}

function makeDiagram(kind) {
  const c = '#101a17';
  const c2 = '#566760';
  const a = '#879e16';
  const soft = '#dfe5dd';
  const bg = '#eef3e8';
  const line = (x1,y1,x2,y2,color=c,width=4,extra='') => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${width}" stroke-linecap="round" ${extra}/>`;
  const circle = (cx,cy,r=6,color=c,width=4,fill='none',extra='') => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="${color}" stroke-width="${width}" ${extra}/>`;
  const rect = (x,y,w,h,fill=soft,rx=4,extra='') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" ${extra}/>`;
  const path = (d,color=c,width=4,extra='') => `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
  const person = ({ head, torso, arms = [], legs = [] }, color = c) => [
    circle(head[0], head[1], 6, color),
    line(...torso, color),
    ...arms.map((seg) => line(...seg, color)),
    ...legs.map((seg) => line(...seg, color))
  ].join('');
  const frame = (content, start = true) => `<g class="pose ${start ? 'pose-start' : 'pose-end'}">${content}<animate attributeName="opacity" values="${start ? '1;1;0;0;1' : '0;0;1;1;0'}" dur="2.4s" repeatCount="indefinite"/></g>`;
  const motionArrow = (d) => `<path d="${d}" fill="none" stroke="${a}" stroke-width="4" stroke-linecap="round" marker-end="url(#arrow)" stroke-dasharray="7 6"><animate attributeName="stroke-dashoffset" from="26" to="0" dur="1.05s" repeatCount="indefinite"/></path>`;
  const defs = `<defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill="${a}"/></marker></defs>`;
  const wrap = (start, end, motions = '', extras = '') => `<svg class="motion-diagram" viewBox="0 0 140 100" role="img" aria-label="Animated exercise guide" xmlns="http://www.w3.org/2000/svg">${defs}<rect x="0" y="0" width="140" height="100" rx="18" fill="${bg}"/>${extras}${frame(start, true)}${frame(end, false)}${motions}</svg>`;

  const standingStart = person({ head:[46,18], torso:[46,25,46,56], arms:[[46,38,30,47],[46,38,62,47]], legs:[[46,56,36,83],[46,56,56,83]] });
  const standingArmsUp = person({ head:[46,18], torso:[46,25,46,56], arms:[[46,34,38,12],[46,34,58,12]], legs:[[46,56,36,83],[46,56,56,83]] });
  const squatPose = person({ head:[50,18], torso:[50,25,50,49], arms:[[50,35,36,46],[50,35,64,46]], legs:[[50,49,35,64],[35,64,24,82],[50,49,66,64],[66,64,77,82]] });
  const hingePose = person({ head:[43,23], torso:[46,28,63,50], arms:[[51,37,36,54],[51,37,68,45]], legs:[[63,50,48,82],[63,50,76,82]] });
  const lungePose = person({ head:[46,18], torso:[46,25,46,51], arms:[[46,35,33,46],[46,35,61,46]], legs:[[46,51,30,65],[30,65,21,83],[46,51,69,65],[69,65,83,65]] });
  const lateralPose = person({ head:[49,20], torso:[49,27,49,52], arms:[[49,37,29,45],[49,37,69,45]], legs:[[49,52,27,67],[27,67,16,82],[49,52,80,64],[80,64,102,64]] });
  const pushHigh = person({ head:[75,40], torso:[69,44,42,54], arms:[[69,44,95,50]], legs:[[42,54,18,70],[42,54,67,71]] });
  const pushLow = person({ head:[73,50], torso:[67,54,40,60], arms:[[67,54,94,57]], legs:[[40,60,18,74],[40,60,65,75]] }, c2);
  const quadrupedNeutral = [circle(28,40,6,c), path('M35 44 Q52 46 66 48', c), line(39,46,32,69,c), line(62,48,69,69,c), line(39,45,17,55,c), line(63,48,84,41,c)].join('');
  const quadrupedRound = [circle(28,40,6,c2), path('M35 48 Q52 38 68 47', c2), line(39,49,32,69,c2), line(64,47,71,68,c2), line(39,47,17,58,c2), line(63,47,84,38,c2)].join('');
  const birdDogStart = quadrupedNeutral;
  const birdDogEnd = [circle(28,40,6,c2), path('M35 44 Q52 46 66 48', c2), line(39,46,32,69,c2), line(62,48,69,69,c2), line(37,45,16,32,c2), line(65,49,88,39,c2)].join('');
  const deadBugStart = [line(16,72,92,72,c), circle(29,57,6,c), line(35,62,58,68,c), line(58,68,78,58,c), line(58,68,77,80,c), line(35,60,21,46,c)].join('');
  const deadBugEnd = [line(16,72,92,72,c2), circle(29,57,6,c2), line(35,62,56,69,c2), line(56,69,74,47,c2), line(56,69,74,81,c2), line(35,60,18,35,c2)].join('');
  const hip9090A = person({ head:[48,18], torso:[48,25,48,49], arms:[[48,35,32,47],[48,35,64,47]], legs:[[48,49,29,63],[29,63,42,79],[48,49,68,63],[68,63,57,80]] });
  const hip9090B = person({ head:[48,18], torso:[48,25,48,49], arms:[[48,35,32,47],[48,35,64,47]], legs:[[48,49,36,65],[36,65,24,80],[48,49,61,65],[61,65,75,78]] }, c2);
  const hangStart = [line(20,14,82,14,c), person({ head:[51,30], torso:[51,37,51,61], arms:[[51,42,31,15],[51,42,71,15]], legs:[[51,61,40,84],[51,61,62,84]] }), rect(28,82,44,5,soft,2)].join('');
  const hangKnees = [line(20,14,82,14,c2), person({ head:[51,30], torso:[51,37,51,60], arms:[[51,42,31,15],[51,42,71,15]], legs:[[51,60,41,72],[51,60,63,72]] }, c2), rect(28,82,44,5,soft,2)].join('');
  const runA = person({ head:[46,20], torso:[48,27,58,49], arms:[[52,35,32,43],[55,37,74,29]], legs:[[58,49,38,63],[38,63,22,82],[58,49,79,61],[79,61,93,80]] });
  const runB = person({ head:[49,20], torso:[51,27,59,48], arms:[[53,36,72,44],[55,34,36,27]], legs:[[59,48,43,61],[43,61,28,79],[59,48,79,60],[79,60,93,40]] }, c2);
  const cycleA = [circle(42,66,18,c), circle(95,66,18,c), circle(42,66,5,c,3,'#fff'), circle(95,66,5,c,3,'#fff'), person({ head:[60,23], torso:[60,30,70,48], arms:[[60,38,86,36]], legs:[[70,48,45,64],[70,48,96,64]] })].join('');
  const cycleB = [circle(42,66,18,c2), circle(95,66,18,c2), circle(42,66,5,c2,3,'#fff'), circle(95,66,5,c2,3,'#fff'), person({ head:[60,23], torso:[60,30,71,47], arms:[[60,38,86,36]], legs:[[71,47,51,76],[71,47,97,55]] }, c2)].join('');
  const supportA = [line(20,44,92,44,c), person({ head:[56,18], torso:[56,25,56,48], arms:[[43,31,34,44],[69,31,78,44]], legs:[[56,48,45,76],[56,48,68,76]] })].join('');
  const supportB = [line(20,44,92,44,c2), person({ head:[56,18], torso:[56,25,56,46], arms:[[43,30,34,44],[69,30,78,44]], legs:[[56,46,48,74],[56,46,66,74]] }, c2)].join('');

  switch (kind) {
    case 'breathing':
      return wrap(
        [line(16,72,92,72,c), circle(28,57,6,c), line(34,62,57,68,c), line(57,68,78,55,c), line(57,68,79,80,c), `<ellipse cx="51" cy="61" rx="9" ry="4" fill="rgba(135,158,22,.18)" stroke="${a}" stroke-width="2"/>`].join(''),
        [line(16,72,92,72,c2), circle(28,57,6,c2), line(34,62,57,68,c2), line(57,68,78,55,c2), line(57,68,79,80,c2), `<ellipse cx="51" cy="61" rx="13" ry="7" fill="rgba(135,158,22,.18)" stroke="${a}" stroke-width="2"/>`].join(''),
        motionArrow('M106 63 C118 56, 118 44, 106 36')
      );
    case 'catcow': return wrap(quadrupedNeutral, quadrupedRound, motionArrow('M102 34 C112 40, 112 56, 102 62'));
    case 'wallslide': return wrap(
      rect(96,8,6,82,soft,2) + person({ head:[50,24], torso:[50,31,50,58], arms:[[50,40,73,49],[73,49,96,46]], legs:[[50,58,39,84],[50,58,61,84]] }),
      rect(96,8,6,82,soft,2) + person({ head:[50,24], torso:[50,31,50,58], arms:[[50,38,76,34],[76,34,96,24]], legs:[[50,58,39,84],[50,58,61,84]] }, c2),
      motionArrow('M83 52 L83 22')
    );
    case 'wallpush': return wrap(
      rect(98,8,6,82,soft,2) + person({ head:[38,25], torso:[42,31,55,57], arms:[[45,39,98,43]], legs:[[55,57,39,84],[55,57,67,84]] }),
      rect(98,8,6,82,soft,2) + person({ head:[34,25], torso:[38,31,53,57], arms:[[41,39,98,43]], legs:[[53,57,37,84],[53,57,65,84]] }, c2),
      motionArrow('M61 24 C74 32, 74 45, 61 53')
    );
    case 'squat': case 'horse': return wrap(standingStart, squatPose, motionArrow('M101 24 L101 72'));
    case 'deadbug': case 'hollow': return wrap(deadBugStart, deadBugEnd, motionArrow('M80 48 L69 38'));
    case 'standing': return wrap(standingStart, person({ head:[46,18], torso:[46,25,46,56], arms:[[46,38,30,47],[46,38,62,47]], legs:[[46,56,37,84],[46,56,69,70]] }, c2), motionArrow('M78 30 C92 36, 92 50, 78 56'));
    case 'hip90': return wrap(hip9090A, hip9090B, motionArrow('M92 69 C105 61, 118 61, 128 69'));
    case 'hinge': return wrap(standingStart, hingePose, motionArrow('M93 24 C106 32, 106 46, 93 54'));
    case 'couch': return wrap(
      rect(92,48,8,38,soft,2) + person({ head:[51,18], torso:[51,25,51,51], arms:[[51,35,37,47],[51,35,67,46]], legs:[[51,51,31,64],[31,64,31,82],[51,51,71,64],[71,64,92,52]] }),
      rect(92,48,8,38,soft,2) + person({ head:[51,16], torso:[51,23,51,50], arms:[[51,33,37,45],[51,33,67,45]], legs:[[51,50,31,63],[31,63,31,82],[51,50,71,63],[71,63,92,52]] }, c2),
      motionArrow('M70 26 L70 14')
    );
    case 'stretch': case 'chestopen': case 'pigeon': return wrap(
      rect(82,52,44,7,soft,3) + person({ head:[46,24], torso:[50,30,64,49], arms:[[50,38,36,67]], legs:[[64,49,75,52],[64,49,98,52]] }),
      rect(82,52,44,7,soft,3) + person({ head:[42,22], torso:[47,28,61,47], arms:[[47,36,32,68]], legs:[[61,47,75,52],[61,47,98,52]] }, c2),
      motionArrow('M49 20 C58 28, 64 34, 72 40')
    );
    case 'band': return wrap(
      person({ head:[48,19], torso:[48,26,48,57], arms:[[48,38,34,49],[48,38,58,50]], legs:[[48,57,38,84],[48,57,58,84]] }) + path('M34 49 Q48 61 58 50', a, 3, 'stroke-dasharray="4 4"'),
      person({ head:[48,19], torso:[48,26,48,57], arms:[[48,38,32,44],[48,38,68,45]], legs:[[48,57,38,84],[48,57,58,84]] }, c2) + path('M32 44 Q48 59 68 45', a, 3, 'stroke-dasharray="4 4"'),
      motionArrow('M62 45 L78 38')
    );
    case 'frog': case 'transition': return wrap(hip9090A, person({ head:[34,18], torso:[34,25,34,53], arms:[[34,36,22,46],[34,36,46,46]], legs:[[34,53,25,82],[34,53,47,82]] }, c2) + motionArrow('M62 52 L85 52'), '');
    case 'lunge': case 'stepup': return wrap(standingStart + (kind === 'stepup' ? rect(74,59,38,23,soft,3) : ''), lungePose + (kind === 'stepup' ? rect(74,59,38,23,soft,3) : ''), motionArrow(kind === 'stepup' ? 'M93 49 L93 28' : 'M70 78 L70 54'));
    case 'quadruped': case 'crawl': case 'shouldertap': return wrap(quadrupedNeutral, birdDogEnd, motionArrow('M86 48 L110 48'));
    case 'birddog': return wrap(birdDogStart, birdDogEnd, motionArrow('M91 35 L106 28'));
    case 'downdog': return wrap(
      rect(90,48,42,7,soft,3) + [circle(74,38,6,c), line(68,42,48,61,c), line(48,61,28,82,c), line(48,61,70,82,c), line(70,44,90,51,c)].join(''),
      rect(90,48,42,7,soft,3) + [circle(70,34,6,c2), line(64,38,48,58,c2), line(48,58,28,82,c2), line(48,58,73,82,c2), line(66,40,90,51,c2)].join(''),
      motionArrow('M49 35 L49 52')
    );
    case 'pushup': return wrap(pushHigh, pushLow, motionArrow('M81 30 L81 46'));
    case 'landmine': return wrap(
      person({ head:[42,20], torso:[42,27,42,56], arms:[[42,39,65,28],[65,28,108,10]], legs:[[42,56,29,82],[42,56,57,72],[57,72,73,72]] }) + line(65,28,110,9,a,3),
      person({ head:[42,20], torso:[42,27,42,56], arms:[[42,39,61,33],[61,33,95,18]], legs:[[42,56,29,82],[42,56,57,72],[57,72,73,72]] }, c2) + line(61,33,97,18,a,3),
      motionArrow('M74 34 L95 24')
    );
    case 'press': case 'pressdown': return wrap(
      person({ head:[46,19], torso:[46,26,46,57], arms:[[46,38,62,40]], legs:[[46,57,36,84],[46,57,56,84]] }),
      person({ head:[46,19], torso:[46,26,46,57], arms:[[46,34,66,28]], legs:[[46,57,36,84],[46,57,56,84]] }, c2),
      motionArrow(kind === 'pressdown' ? 'M61 50 L61 69' : 'M64 38 L90 31')
    );
    case 'pull': case 'row': case 'pulldown': case 'yraise': case 'curl': return wrap(
      person({ head:[48,20], torso:[48,27,48,57], arms: kind === 'pulldown' ? [[48,42,28,21],[48,42,68,21]] : [[48,38,23,36],[48,38,73,36]], legs:[[48,57,37,84],[48,57,60,84]] }) + (kind === 'pulldown' ? line(20,13,76,13,c,4) : ''),
      person({ head:[48,20], torso:[48,27,48,57], arms: kind === 'curl' ? [[48,38,34,53],[48,38,62,53]] : kind === 'yraise' ? [[48,39,28,18],[48,39,68,18]] : kind === 'pulldown' ? [[48,42,36,34],[48,42,60,34]] : [[48,38,34,38],[48,38,62,38]], legs:[[48,57,37,84],[48,57,60,84]] }, c2) + (kind === 'pulldown' ? line(20,13,76,13,c2,4) : ''),
      motionArrow(kind === 'curl' ? 'M31 60 L31 44' : kind === 'yraise' ? 'M72 31 L78 19' : 'M78 36 L58 36')
    );
    case 'sideplank': return wrap(
      [circle(28,40,6,c), line(34,44,69,59,c), line(69,59,92,70,c), line(38,46,27,68,c), line(69,59,88,51,c)].join(''),
      [circle(28,37,6,c2), line(34,41,69,55,c2), line(69,55,93,66,c2), line(38,43,27,65,c2), line(69,55,89,47,c2)].join(''),
      motionArrow('M52 69 L52 52')
    );
    case 'legmachine': return wrap(
      rect(20,58,42,8,soft,3) + rect(58,45,8,36,soft,3) + person({ head:[38,38], torso:[42,43,55,57], arms:[[42,48,26,55]], legs:[[55,57,80,57],[80,57,99,73]] }),
      rect(20,58,42,8,soft,3) + rect(58,45,8,36,soft,3) + person({ head:[38,38], torso:[42,43,55,57], arms:[[42,48,26,55]], legs:[[55,57,80,57],[80,57,101,58]] }, c2),
      motionArrow('M98 72 L112 58')
    );
    case 'hang': case 'kneeraise': return wrap(hangStart, kind === 'kneeraise' ? hangKnees : [line(20,14,82,14,c2), person({ head:[51,30], torso:[51,37,51,61], arms:[[51,42,31,15],[51,42,71,15]], legs:[[51,61,42,82],[51,61,60,82]] }, c2), rect(28,82,44,5,soft,2)].join(''), motionArrow(kind === 'kneeraise' ? 'M67 78 L55 60' : 'M92 25 C92 36, 92 48, 92 58'));
    case 'support': return wrap(supportA, supportB, motionArrow('M56 48 L56 34'));
    case 'run': return wrap(runA, runB, motionArrow('M95 27 L121 27'));
    case 'cardio': return wrap(cycleA, cycleB, motionArrow('M111 28 L128 28'));
    default:
      return wrap(standingStart, standingArmsUp, motionArrow('M74 45 L98 45'));
  }
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
document.getElementById('guideClose')?.addEventListener('click', closeExerciseGuide);
document.getElementById('exerciseOverlay')?.addEventListener('click', (event) => { if (event.target.id === 'exerciseOverlay') closeExerciseGuide(); });
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeExerciseGuide(); });

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

// health-os.js starts the UI once all modules have loaded.
