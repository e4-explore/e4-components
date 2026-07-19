#!/usr/bin/env bash
#
# sim-up.sh — get a React Native / Expo app running in the iOS Simulator,
# bootstrapping the toolchain when it's missing. Idempotent; safe to re-run.
#
#   ./sim-up.sh [path-to-project]      # defaults to the current directory
#
# Automates:
#   - Xcode selection + license, iOS Simulator runtime check
#   - Homebrew, CocoaPods, Node, Watchman (installs any that are absent)
#   - npm install, expo prebuild, pod install (with hang detection)
#   - Booting a Simulator device and launching the app
#
# Can't do for you (it stops and tells you exactly what to do):
#   - Install full Xcode — App Store / Apple ID required. Command Line Tools
#     ALONE have no Simulator, so this is a hard prerequisite.
#   - Type your sudo password (license accept + xcode-select need it).

set -uo pipefail

PROJECT_DIR="${1:-$PWD}"
LOG_DIR="${TMPDIR:-/tmp}/sim-up"; mkdir -p "$LOG_DIR"

# ---------- output helpers ----------
b(){    printf "\n\033[1m%s\033[0m\n" "$*"; }
ok(){   printf "  \033[32m✓\033[0m %s\n" "$*"; }
warn(){ printf "  \033[33m!\033[0m %s\n" "$*"; }
die(){  printf "\n  \033[31m✗ %s\033[0m\n" "$*" >&2; exit 1; }

# ---------- portable timeout (macOS ships no `timeout`) ----------
run_timeout(){ # run_timeout SECS cmd... ; returns 137 if it had to be killed
  local secs=$1; shift
  "$@" & local pid=$!
  ( sleep "$secs"; kill -9 "$pid" 2>/dev/null ) & local w=$!
  wait "$pid" 2>/dev/null; local rc=$?
  kill -9 "$w" 2>/dev/null; wait "$w" 2>/dev/null
  return $rc
}

[ "$(uname)" = "Darwin" ] || die "The iOS Simulator only exists on macOS."

# ====================================================================
b "1. Xcode"
# ====================================================================
if ! xcode-select -p >/dev/null 2>&1; then
  warn "Command Line Tools missing — launching the installer (GUI prompt)…"
  xcode-select --install 2>/dev/null || true
  die "Finish the Command Line Tools install, then re-run this script."
fi
if ! xcode-select -p | grep -q "Xcode.app"; then
  if [ -d /Applications/Xcode.app ]; then
    warn "Pointing xcode-select at Xcode.app (needs sudo)…"
    sudo xcode-select -s /Applications/Xcode.app/Contents/Developer || die "xcode-select failed."
  else
    die "Full Xcode is required (Command Line Tools have no Simulator).
     Install it from the App Store, then re-run:
     https://apps.apple.com/app/xcode/id497799835"
  fi
fi
if ! xcodebuild -version >/dev/null 2>&1; then
  warn "Accepting the Xcode license (needs sudo)…"
  sudo xcodebuild -license accept || die "Xcode license not accepted."
fi
ok "$(xcodebuild -version | head -1)"

if ! xcrun simctl list runtimes 2>/dev/null | grep -qi "iOS"; then
  die "No iOS Simulator runtime installed.
     Open Xcode → Settings → Components (Platforms) and download an iOS runtime, then re-run."
fi
ok "iOS Simulator runtime present"

# ====================================================================
b "2. Toolchain (Homebrew · CocoaPods · Node · Watchman)"
# ====================================================================
command -v brew >/dev/null 2>&1 || { [ -x /opt/homebrew/bin/brew ] && eval "$(/opt/homebrew/bin/brew shellenv)"; }
if ! command -v brew >/dev/null 2>&1; then
  warn "Installing Homebrew…"
  NONINTERACTIVE=1 /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)" \
    || die "Homebrew install failed."
  eval "$(/opt/homebrew/bin/brew shellenv)"
fi
ok "Homebrew $(brew --version | head -1 | awk '{print $2}')"

for tool in cocoapods node watchman; do
  bin="$tool"; [ "$tool" = cocoapods ] && bin=pod
  if ! command -v "$bin" >/dev/null 2>&1; then
    warn "Installing $tool…"; brew install "$tool" || die "Failed to install $tool."
  fi
  ok "$tool $($bin --version 2>/dev/null | head -1)"
done

# ====================================================================
b "3. Code-signing warm-up (catches the post-Xcode-install amfid stall)"
# ====================================================================
# Right after a large Xcode install, macOS's code-signature validation queue
# can wedge. The first dlopen of CocoaPods' native gem extensions then hangs
# forever — pod install looks stuck at "Analyzing dependencies" with zero
# output. Force that validation now under a short timeout, so we fail fast
# with real advice instead of hanging ~40 min mid-install.
if command -v ruby >/dev/null 2>&1; then
  run_timeout 30 ruby -e "require 'nkf'; require 'json'; require 'digest/md5'; require 'openssl'" >/dev/null 2>&1
  [ $? -eq 137 ] && die "macOS code-signing validation is wedged (loading a signed native lib hung).
     Known state right after installing Xcode. Fix:
       → Reboot your Mac, then re-run this script.
     Your CocoaPods download cache is preserved, so the retry is fast."
fi
ok "code-signing responsive"

# ====================================================================
b "4. Project — $PROJECT_DIR"
# ====================================================================
cd "$PROJECT_DIR" || die "No such directory: $PROJECT_DIR"
[ -f package.json ] || die "No package.json here — point me at an app directory."
IS_EXPO=false; grep -q '"expo"' package.json && IS_EXPO=true

[ -d node_modules ] || { warn "npm install…"; npm install || die "npm install failed."; }
ok "dependencies installed"

if $IS_EXPO && [ ! -d ios ]; then
  warn "Generating native iOS project (expo prebuild)…"
  npx expo prebuild -p ios --no-install || die "expo prebuild failed."
fi
[ -d ios ] || die "No ios/ project and not an Expo app — can't continue."
ok "native ios project present"

# ====================================================================
b "5. CocoaPods (clean state + hang detection)"
# ====================================================================
# A half-written Pods dir from an interrupted run can deadlock the next
# reconcile. The download cache lives elsewhere, so this stays cheap.
if [ -d ios/Pods ] && [ ! -f ios/Podfile.lock ]; then
  warn "Clearing partial ios/Pods from a prior interrupted run…"; rm -rf ios/Pods
fi
pkill -9 -f "pod install" 2>/dev/null && sleep 1   # never let two runs fight

POD_LOG="$LOG_DIR/pod-install.log"
( cd ios && LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8 pod install --verbose >"$POD_LOG" 2>&1 ) &
POD_PID=$!
# Watchdog: if the log stops growing for STALL_S while pod is alive, it's the
# amfid/deadlock hang — kill and advise rather than wait forever. (Legit slow
# phases still emit output within this window.)
STALL_S=180; last=-1; still=0
while kill -0 "$POD_PID" 2>/dev/null; do
  sleep 15
  sz=$(wc -c <"$POD_LOG" 2>/dev/null || echo 0)
  if [ "$sz" = "$last" ]; then still=$((still+15)); else still=0; last=$sz; fi
  if [ "$still" -ge "$STALL_S" ]; then
    kill -9 "$POD_PID" 2>/dev/null; pkill -9 -f "pod install" 2>/dev/null
    echo "--- last lines ---"; tail -3 "$POD_LOG"
    die "pod install stalled ${STALL_S}s with no progress (likely the amfid code-sign hang).
       → Reboot and re-run. Full log: $POD_LOG"
  fi
done
wait "$POD_PID" 2>/dev/null
grep -q "Pod installation complete" "$POD_LOG" \
  || { echo "--- tail ---"; tail -15 "$POD_LOG"; die "pod install failed. Log: $POD_LOG"; }
ok "pods installed"

# ====================================================================
b "6. Boot Simulator + launch"
# ====================================================================
open -a Simulator 2>/dev/null || true
if ! xcrun simctl list devices booted 2>/dev/null | grep -q "Booted"; then
  DEV_ID=$(xcrun simctl list devices available 2>/dev/null \
           | grep -oE "\([0-9A-F-]{36}\)" | tr -d '()' | head -1)
  [ -n "${DEV_ID:-}" ] && xcrun simctl boot "$DEV_ID" 2>/dev/null || true
fi

if $IS_EXPO; then
  b "→ npx expo run:ios   (first build is slow: ~5–15 min)"
  npx expo run:ios
else
  b "→ npx react-native run-ios"
  npx react-native run-ios
fi
