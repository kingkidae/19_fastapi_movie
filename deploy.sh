#!/usr/bin/env bash
# EC2 서버에서 실행: GitHub 최신 코드로 컨테이너를 다시 빌드해 교체한다
set -euo pipefail
cd "$(dirname "$0")"

git pull --ff-only
docker compose up -d --build
docker image prune -f # 교체되고 남은 옛 이미지 정리
docker compose ps
