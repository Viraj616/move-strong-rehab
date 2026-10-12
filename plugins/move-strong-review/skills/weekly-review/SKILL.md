---
name: weekly-review
description: Review the user's latest bounded Move Strong workout week and prepare a conservative next-week draft for explicit in-app approval.
---

# Move Strong weekly review

Use this skill when the user asks to review, progress, build, or check their next Move Strong training week.

## Workflow

1. Call `get_review_status` for the requested Monday, or the latest available week when the user did not specify one.
2. Stop if the week is not ready. Explain whether five completed sessions or the weekly boundary is still missing.
3. Call `get_week_for_review` for the ready source week. Treat its output as private health data and do not repeat unnecessary detail.
4. Compare every completed exercise against its planned target using sets, reps, resistance, completion, RIR, technique, effort, pain during/after, breathing symptoms, reliever use, and next-morning recovery.
5. Save exactly one next-week draft with `save_next_week_draft`. Never claim it is active; the user must approve it in Move Strong.

## Guardrails

- Missing technique, RIR, or next-morning recovery means HOLD for shoulder-loading work.
- Poor technique, shoulder pain at least 4/10 during training, pain at least 3/10 next morning, worse recovery, plate-site symptoms, or moderate/stopping asthma symptoms means REGRESS or MODIFY.
- PROGRESS requires a completed target, clean technique, 2–4 RIR, effort below 9/10, shoulder pain no higher than 2/10, and stable next-morning recovery.
- Change only one major variable per exercise: reps, sets, resistance, leverage/variation, tempo, or assistance.
- Cardio may rise by no more than 10%, remains conversational, and includes a gradual warm-up. Hold or regress for asthma symptoms or reliever use beyond the user's normal action plan.
- Prescribe only equipment explicitly present in the snapshot. When no heavier resistance exists, use reps, tempo, pauses, assistance, range, or leverage.
- Preserve exercises without useful evidence instead of inventing progress.
- A draft is not medical clearance. Flag sharp plate-site pain, new swelling, weakness, neurological symptoms, or a significant asthma flare for appropriate clinical review.

## Draft quality

For each changed or explicitly held item, include the prior work, state (`PROGRESS`, `HOLD`, or `REGRESS`), concrete next prescription, and a concise evidence-based reason. Strength items require machine-readable target sets/reps, implement, resistance label/load when relevant, and variation. Cardio requires whole minutes.
