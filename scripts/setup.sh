#!/usr/bin/env bash
# designon 동료 스킬 설치 스크립트. 실패해도 designon 단독 동작에는 지장이 없다
set -u

ok()   { printf '  \033[32m✓\033[0m %s\n' "$1"; }
skip() { printf '  \033[33m−\033[0m %s\n' "$1"; }
head_() { printf '\n\033[1m%s\033[0m\n' "$1"; }

head_ "designon 동료 스킬 설치"
echo "  designon은 이 스킬들이 없어도 혼자 동작합니다. 있으면 결과가 더 좋아집니다."

if ! command -v npx >/dev/null 2>&1; then
  skip "npx를 찾을 수 없습니다. Node.js 설치 후 다시 실행하세요."
  echo "     https://nodejs.org"
  exit 0
fi

# 자동 설치 대상. npx skills가 스킬 폴더에 파일만 내려받는 방식이라 안전하다
head_ "1/2  ui-skills — 컴포넌트·모션 베이스라인"
if npx -y skills add ibelick/ui-skills </dev/null 2>/dev/null; then
  ok "설치 완료"
else
  skip "건너뜀 — 나중에: npx skills add ibelick/ui-skills"
fi

head_ "2/2  emilkowalski/skill — 애니메이션 설계·검수"
if npx -y skills add emilkowalski/skill </dev/null 2>/dev/null; then
  ok "설치 완료"
else
  skip "건너뜀 — 나중에: npx skills add emilkowalski/skill"
fi

# lazyweb은 원격 스크립트를 bash로 실행하는 방식이라 자동 설치하지 않는다
head_ "선택 — lazyweb (실제 제품 화면 레퍼런스 검색)"
cat <<'EOF'
  레이아웃 근거를 실제 서비스 화면에서 가져오고 싶다면 추가로 설치하세요.
  설치 방식이 원격 스크립트 실행이라 자동으로 돌리지 않습니다. 직접 확인 후 실행하세요.

    curl -fsSL https://www.lazyweb.com/install.sh | bash

  스크립트 내용을 먼저 보려면
    curl -fsSL https://www.lazyweb.com/install.sh | less
EOF

head_ "완료"
cat <<'EOF'
  이렇게 쓰면 됩니다.

    Claude Code   /designon 카페 하는데 보라색 계열 사이트 만들어줘
    Codex         카페 하는데 보라색 계열 사이트 만들어줘

  사진을 직접 생성하려면 (선택)
    export GEMINI_API_KEY="발급받은-키"

  Codex처럼 이미지 생성이 내장된 환경에서는 키가 없어도 됩니다.
EOF
