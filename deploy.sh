#!/bin/bash
# deploy.sh — portfolio-demos 자동 배포 스크립트
# 사용법: bash ~/Projects/resume/portfolio-demos/deploy.sh "커밋 메시지"

set -e

REPO="$HOME/Projects/resume/portfolio-demos"
MSG="${1:-auto: update}"

echo "🔧 Lock 파일 정리 중..."
rm -f "$REPO/.git/index.lock"
rm -f "$REPO/admin-dashboard/.git/index.lock" 2>/dev/null || true

cd "$REPO/admin-dashboard"

echo "📦 npm install 중..."
npm install --silent

cd "$REPO"

echo "📁 변경사항 스테이징 중..."
git add -A

echo "💾 커밋: $MSG"
git commit -m "$MSG" || echo "커밋할 변경사항 없음"

echo "🚀 GitHub 푸시 중..."
git push

echo "✅ 완료! Vercel이 자동 배포를 시작합니다."
