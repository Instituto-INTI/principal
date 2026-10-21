#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"
if [ -z "${QUIZ_ADMIN_PASSWORD:-}" ]; then
  read -r -s -p 'Crie sua senha administrativa (mínimo 8 caracteres): ' QUIZ_ADMIN_PASSWORD
  echo
  export QUIZ_ADMIN_PASSWORD
fi
python3 app.py
