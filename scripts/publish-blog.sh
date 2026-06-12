#!/usr/bin/env bash
# 옵시디언 vault → 블로그 발행 원커맨드 (전역 alias: blogpub)
# 어디서 실행하든 레포로 이동해 sync → 커밋 → 푸시(=자동 배포)까지 처리한다.
set -euo pipefail

REPO="/Users/kang1027/project/portfolio/portfolio_front"
cd "$REPO"

branch=$(git branch --show-current)
if [ "$branch" != "main" ]; then
  echo "지금 main이 아니라 '$branch' 브랜치임 — 발행 중단" >&2
  exit 1
fi

git pull --rebase origin main
node scripts/sync-obsidian-blog.mjs

git add -A src/content/blog/posts
[ -d public/blog ] && git add -A public/blog

if git diff --cached --quiet; then
  echo "발행할 변경 없음 — 끝"
  exit 0
fi

changed=$(git diff --cached --name-only | grep -c "\.md$" || true)
echo "변경된 파일:"
git diff --cached --name-only | sed "s/^/  /"

# 콘텐츠(md·이미지)만 커밋하므로 lint 훅은 생략
git commit --no-verify -m "post: 블로그 글 발행 (${changed}편 변경)"
git push origin main

echo ""
echo "푸시 완료 — 자동 배포 시작됨. 몇 분 뒤 https://kang1027.com/blog 에 반영돼."
