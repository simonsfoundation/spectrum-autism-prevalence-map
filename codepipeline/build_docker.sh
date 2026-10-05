#!/usr/bin/env bash
docker build -f docker/Dockerfile --pull --no-cache --target deploy -t prevalencemap .
exit "${?}"
