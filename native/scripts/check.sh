#!/bin/sh
set -eu
npm run check
npx expo-doctor
npx expo export --platform all
npm audit
# Nonzero audit exit is intentional until upstream dependency findings are fixed.
