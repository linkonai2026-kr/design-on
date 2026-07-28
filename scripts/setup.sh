#!/usr/bin/env bash
# design-kit 동료 스킬 3종을 설치하는 스크립트. 실패해도 design-kit 단독 동작에는 지장이 없다
set -u

ok()   { printf '  \033[32m✓\033[0m %s\n' "$1"; }
skip() { printf '  \033[33m−\033[0m %s\n' "$1"; }
info() { printf '\n\033[1m%s\033[0m\n' "$1"; }

info "design-kit 동료 스킬 설치"
echo "  세 개 다 선택 사항입니다. 실패해도 design-kit은 그대로 동작합니다."

# 1. emilkowalski/skill — 애니메이션 설계·검수
info "1/3  애니메이션 스킬 (emilkowalski)"
if command -v npx >/dev/null 2>&1; then
  if npx -y skills add emilkowalski/skill </dev/null 2>/dev/null; then
    ok "설치 완료"
  else
    skip "건너뜀 — 나중에: npx skills add emilkowalski/skill"
  fi
else
  skip "npx 없음 — Node.js 설치 후 재시도하세요"
fi

# 2. ibelick/ui-skills — 디자인 엔지니어용 UI 스킬셋
info "2/3  UI 스킬셋 (ui-skills)"
if command -v npx >/dev/null 2>&1; then
  if npx -y skills add ibelick/ui-skills </dev/null 2>/dev/null; then
    ok "설치 완료"
  else
    skip "건너뜀 — 나중에: npx ui-skills start"
  fi
else
  skip "npx 없음"
fi

# 3. lazyweb — 실제 제품 화면 레퍼런스 검색
info "3/3  레퍼런스 검색 (lazyweb)"
if command -v curl >/dev/null 2>&1; then
  echo "  설치 스크립트를 외부에서 받아 실행합니다: https://www.lazyweb.com/install.sh"
  printf "  진행할까요? [y/N] "
  read -r reply </dev/tty 2>/dev/null || reply="n"
  case "$reply" in
    [yY]*)
      if curl -fsSL https://www.lazyweb.com/install.sh | bash; then
        ok "설치 완료"
      else
        skip "건너뜀"
      fi ;;
    *) skip "건너뜀 — 나중에: curl -fsSL https://www.lazyweb.com/install.sh | bash" ;;
  esac
else
  skip "curl 없음"
fi

info "완료"
cat <<'EOF'
  이제 이렇게 쓰면 됩니다.

    Claude Code   /design 카페 운영하는데 보라색 계열 사이트 만들어줘
    Codex         카페 운영하는데 보라색 계열 사이트 만들어줘

  사진을 직접 생성하려면 (선택)
    export GEMINI_API_KEY="발급받은-키"

  Codex처럼 이미지 생성이 내장된 환경에서는 키가 없어도 됩니다.
EOF
