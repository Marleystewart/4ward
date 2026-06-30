# 4ward — case study test notes

Triage of findings from the June 28 case-study run (12 profiles). Status legend:
✅ fixed · 🔧 in progress · 🅿️ parked (post-July-17) · ❓ needs repro/screenshot

## Bugs
- ✅ **Résumé feedback shown when none uploaded** (Darius) — fresh build now clears
  `figuredResumeAnalysis` + `figuredResumeGuidelines`, not just `figuredResumeFeedback`. (commit fbc9dcc)
- ✅ **"JUNK / X" card in paths** (Jordan) — `sanitizeTracks()` drops placeholder/junk
  rows, caps to 3, before render.
- ✅ **"~30 sec" loading label dishonest** (Wei 37s, Ethan 43s, Marcus 50s, Aaliyah 37s,
  Hana 37s, Olivia 33s) — copy now "up to a min" / "30 to 60 seconds"; progress bar
  creep stretched 26s → 55s to match real load times.
- ✅ **"Stale trajectory on reload"** (Darius) — DIAGNOSED: not a cache bug. Screenshots
  showed the trajectory genuinely regenerates (sales → real estate → financial advisor);
  all are sales-adjacent so it *reads* as "still sales." Root cause = the vague goal
  ("something that pays well") gives the AI nothing to anchor, so it reshuffles. Real fix
  is the parked pick-your-direction feature (also solves Priya + Sofia). Interim shipped:
  one-time bypassable vague-goal nudge in onboarding (`looksVagueGoal` + `vagueGoalWarned`).
- ✅ **Extra bubble under Trajectories** (Wei) — same root cause as Jordan's JUNK card:
  the AI emitted a 4th malformed/empty track that rendered as a blank bubble.
  `sanitizeTracks()` drops empty/junk rows, so this is covered by the same fix.
  (Re-test to confirm; if it persists it's specific to the Trajectory tab.)

## Content quality (prompt tuning)
- ✅ **Opportunities too generic + vague goal breaks them** (Ethan, Marcus, Tyler,
  Olivia, Darius) — Opportunities + networking now derive from the trajectory's
  primary track (`trajectoryDirection` → `renderOpportunities`), re-rendered when
  the AI lands. Specific even from a vague goal ("something that pays well" →
  "Sales Development Representative internships"); neutral "Your field" pre-AI
  instead of echoing the messy goal. Also fixed coarse domain mis-bucketing
  (e.g. "Sales Development" no longer maps to Software via /develop/).
- 🔧 **Output collapses to one direction** (Priya: only consulting, not biotech too).
  Related to the parked Sofia "pick active track" feature.

## Bigger / parked
- ✅ **Pick your direction** (Sofia + Priya + Darius) — path cards are now selectable.
  Tapping one re-points Opportunities + pay + networking to it instantly (light switch,
  no AI). A selected non-primary card shows "Rebuild my plan around this →" which
  regenerates the whole trajectory toward it (one AI call, cached per direction); an
  "Exploring: <role> · Back to my goal" banner lets them revert. Hybrid = cheap switch
  by default, deep rebuild on demand. (selectedTrackRole / activeDirection in script.js.)
- 🅿️ **Salary / tree "does this look right?"** (Aaliyah, Hana, Wei) — review judgments,
  not bugs.

## Live glitch (mid-call)
- ✅ **Résumé uploaded in onboarding missing from dashboard Résumé tab** (had to re-upload).
  Two causes: (1) the fresh-build cleanup wiped figuredResumeAnalysis even when the student
  uploaded one in the SAME session — now guarded by resumeUploadedThisSession; (2) the
  résumé parse is a ~10s+ Opus call but the build overlay redirected after ~3.4s, losing an
  in-flight parse to navigation — "Build My Path" now waits on resumeParsePromise (capped
  22s) before redirecting. (onboarding.js)

## Case study notes pt 2 (June 29 batch)
- ✅ **Reginald couldn't load** ("claude-sonnet-4-6 did not finish within 43s") — Vercel
  Hobby 60s timeout under Anthropic overload; both Opus + Sonnet net ran long. Fixed with
  a silent client auto-retry on transient errors (maybeRunAI / isTransientAiError); kept
  Opus effort high (advisor quality). Pro upgrade later removes the timeout entirely.
- ✅ **Opportunities still broad** (Theo "Government", recurring) — searchTerm chopped AI
  roles at "/"; new cleanRoleTitle keeps the specific role ("Public Sector Auditor").
- 🅿️ **Bianca: no "back to a previously explored direction"** — rebuild re-roots the plan;
  "Back to my goal" only returns to the original. Multi-slot cache makes re-selecting free,
  but there's no breadcrumb UI. Nice-to-have nav enhancement.
- 🅿️ **Camille "add a marketing vs business course"** — minor AI wording nuance.
- 🅿️ **Andre tone / "what about the tech part"** — pick-direction/rebuild covers the second
  path; tone is a review judgment.
