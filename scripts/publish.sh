#!/usr/bin/env bash
# design-on을 GitHub 공개 저장소로 올리는 스크립트. gh auth login을 먼저 마친 뒤 실행한다
set -eu

REPO="design-on"
DESC="한 문장으로 완성된 웹페이지를 만드는 디자인 스킬. 디자인 툴 883개·컬러 팔레트 78세트 내장. Claude Code와 Codex 지원."

cd "$(dirname "$0")/.."

if ! command -v gh >/dev/null 2>&1; then
  echo "gh를 찾을 수 없습니다. PATH를 갱신하려면 터미널을 새로 여세요."
  echo "설치 위치: /c/Program Files/GitHub CLI/gh.exe"
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "GitHub 로그인이 필요합니다. 먼저 아래를 실행하세요."
  echo ""
  echo "    gh auth login"
  echo ""
  exit 1
fi

OWNER=$(gh api user --jq .login)
echo "계정: $OWNER"

if gh repo view "$OWNER/$REPO" >/dev/null 2>&1; then
  echo "저장소가 이미 있습니다. 푸시만 합니다."
  git remote get-url origin >/dev/null 2>&1 || git remote add origin "https://github.com/$OWNER/$REPO.git"
  git push -u origin HEAD
else
  echo "공개 저장소를 새로 만들고 푸시합니다."
  gh repo create "$REPO" --public --source=. --remote=origin --description "$DESC" --push
fi

echo ""
echo "완료 → https://github.com/$OWNER/$REPO"
echo ""
echo "다른 컴퓨터에서 설치할 때"
echo "    git clone https://github.com/$OWNER/$REPO.git"
echo "    cd $REPO && bash scripts/setup.sh"
