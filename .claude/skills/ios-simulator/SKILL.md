---
name: ios-simulator
description: Run an e4-components consumer app in the iOS Simulator, bootstrapping the entire toolchain (Xcode selection, Homebrew, CocoaPods, Node, Watchman, pods, Simulator boot) with one idempotent script. Use whenever the user asks to "run the e4 app in the simulator", "open the simulator", "run it on iOS", "launch the app natively", "see it on a phone/device", or wants to verify native-only behavior of e4-components — the Shantell Sans fonts, the Select bottom sheet, toasts — even if they don't say the word "simulator". Also use when a previous native run failed (pod install hang, code-signing stall) and the user says to retry.
---

# Run the e4 app in the iOS Simulator

One command gets a consumer app from "maybe nothing is installed" to running in the
Simulator. The script is idempotent — re-running after a failure is always safe and
cheap (download caches are preserved).

```bash
.claude/skills/ios-simulator/scripts/sim-up.sh [path-to-app]   # default: $PWD
```

The default target is the consumer test app at `~/code/e4-consumer-test` (a plain
Expo app that installs `e4-components` from GitHub). Pass any Expo or bare RN app
path; the script detects which and uses `expo run:ios` or `react-native run-ios`
accordingly.

## How to run it

1. Run the script with Bash `run_in_background: true` — the first build compiles
   the whole native project and takes **5–15 minutes**. Pass the app path
   explicitly: `~/code/sim-up.sh` also exists but the repo copy above is canonical.
2. Watch the output as it streams. Each numbered section prints `✓` on success;
   any `✗` line is terminal and comes with specific advice (see the table below).
3. The verbose CocoaPods log lives at `$TMPDIR/sim-up/pod-install.log` — read its
   tail if pods fail.
4. When the build finishes and the Simulator shows the app, verify the success
   criteria below (a screenshot via the computer-use tools is good proof).

The script needs `sudo` only for two one-time steps (Xcode license, xcode-select).
If it stops asking for those, tell the user to run that step themselves — never
type a password for them.

## Which code the Simulator actually runs (read before verifying an edit)

The consumer app depends on `e4-components` as a **GitHub install**
(`"e4-components": "github:e4-explore/e4-components"`), so the running app bundles
the copy in `~/code/e4-consumer-test/node_modules/e4-components/` — **not** your
local `~/e4-components` checkout. npm pins that copy to an exact commit in
`package-lock.json` (`resolved: git+…#<sha>`), so it does not track your local
edits *or* new commits you push. Metro then bundles from that node_modules copy.

This bites in two directions — check which case you're in before trusting what the
Simulator shows:

- **Verifying a local edit you have NOT pushed** — the file the sim runs is the
  stale node_modules copy. Sync your changed file(s) in, then reload Metro:
  ```bash
  cp ~/e4-components/src/components/Toast.tsx \
     ~/code/e4-consumer-test/node_modules/e4-components/src/components/Toast.tsx
  ```
  (The package's `main` is `src/index.ts` — it ships raw source, no build step, so
  copying the `.tsx` is enough.) Then press **Cmd+R** in the Simulator to rebundle.
  Confirm the copy took before reloading:
  `grep -n <something-from-your-change> ~/code/e4-consumer-test/node_modules/e4-components/src/...`
- **Verifying a change you already pushed to GitHub** — a push alone changes
  nothing on the machine. The lockfile still pins the old sha, so `npm install`
  and Metro reload both keep serving it. You must re-resolve the dependency first:
  ```bash
  cd ~/code/e4-consumer-test && npm update e4-components   # re-pins lockfile to branch HEAD
  ```
  then relaunch the app (re-run the script). A freshly merged commit can also just
  not have propagated yet — if `npm update` doesn't move the sha, confirm the
  commit is on the default branch and retry.

Symptom that means you're on the wrong copy: you changed native-only behavior
(safe-area insets, the Select sheet, fonts) and the Simulator shows the *old*
behavior even after Cmd+R. That's almost always the node_modules copy being stale,
not your fix being wrong.

## Failure → what to do

The script fails fast with advice rather than hanging. Known modes, all hit and
solved in real sessions:

| Script says | Meaning | Action |
|---|---|---|
| Full Xcode is required | Only Command Line Tools installed — they have no Simulator | User must install Xcode from the App Store (Apple ID gate — cannot be scripted), then re-run |
| No iOS Simulator runtime installed | Xcode present but no runtime downloaded | User opens Xcode → Settings → Components, downloads an iOS runtime, re-run |
| code-signing validation is wedged | The **amfid stall**: right after a big Xcode install, the signature-validation queue wedges and the first dlopen of a signed native lib hangs forever. The script probes for this in 30 s instead of letting `pod install` hang ~40 min | **Reboot the Mac**, then re-run. Caches survive; the retry is fast |
| pod install stalled 180s with no progress | Same amfid hang, caught mid-install by the log-growth watchdog | Reboot and re-run; check `$TMPDIR/sim-up/pod-install.log` |
| pod install failed | A real pods error (not a hang) | Read the log tail the script printed; fix the underlying issue |

The script also self-heals two states without asking: it clears a half-written
`ios/Pods/` left by an interrupted run (deadlocks the next reconcile otherwise),
and it kills any stale `pod install` process before starting its own.

## Success criteria

The run is only done when all of these hold on the booted Simulator:

- App boots with no red screen.
- Title/body text renders in **Shantell Sans** (hand-drawn face, not a system
  fallback).
- On the phone-sized Simulator, opening **"Pick a sport"** slides a **bottom
  sheet** up from the bottom edge (not a top-pinned dropdown); tapping an option
  selects it and dismisses the sheet.
- The **"Say hello"** button fires a toast that drops in at the top **below** the
  status bar / Dynamic Island — not overlapping it. Toast top-inset spacing is
  native-only (the web build has no notch), so this is a real thing to eyeball;
  zoom the top ~130px of the phone to check clearance.

The bottom-sheet and toast-inset checks matter most: both are native-only fixes
(`Select` sheet, safe-area padding) that cannot be verified from a headless bundle
or the web build.

## Hard limits (tell the user, don't work around)

- Installing full Xcode and downloading an iOS runtime require the App Store /
  Apple ID — no script or agent can do it.
- `sudo` password entry is the user's alone.
- The amfid stall is only cleared by a reboot.
