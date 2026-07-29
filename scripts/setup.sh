#!/usr/bin/env bash
# design-on 설치 스크립트. 검사기 파서를 깔고 에이전트에 명령어를 등록한다
set -u

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# 에이전트가 읽을 경로. Windows Git Bash면 H:/... 형태로 바꾼다
if command -v cygpath >/dev/null 2>&1; then
  ROOT_FOR_AGENT="$(cygpath -m "$ROOT")"
else
  ROOT_FOR_AGENT="$ROOT"
fi

# Windows에서는 $HOME이 실제 사용자 폴더가 아닐 수 있다(SPB_Data 등).
# 에이전트 설정은 %USERPROFILE% 아래에 있으므로 그쪽을 우선한다
CFG="$HOME"
if [ -n "${USERPROFILE:-}" ] && command -v cygpath >/dev/null 2>&1; then
  CFG="$(cygpath -u "$USERPROFILE")"
fi

ok()    { printf '  \033[32m✓\033[0m %s\n' "$1"; }
skip()  { printf '  \033[33m−\033[0m %s\n' "$1"; }
fail()  { printf '  \033[31m✗\033[0m %s\n' "$1"; }
head_() { printf '\n\033[1m%s\033[0m\n' "$1"; }

head_ "design-on 설치"
echo "  디자인 지식은 이미 저장소 안에 다 들어 있습니다."
echo "  여기서는 검사기를 켜고, 에이전트에 명령어를 등록합니다."

if ! command -v node >/dev/null 2>&1; then
  fail "Node.js를 찾을 수 없습니다. 설치 후 다시 실행하세요 — https://nodejs.org"
  echo "     Node.js 없이도 페이지 생성은 되지만, AI 티 기계 검사가 돌지 않습니다."
  exit 1
fi
ok "Node.js $(node -v)"

# ---------------------------------------------------------------------------
head_ "1/3  안티패턴 검사기"
echo "  HTML/CSS를 파싱할 파서 4종을 깝니다."
echo "  없으면 축소 모드로 떨어져 대비·중첩카드·크림배경 검사가 빠집니다."

if npm ci --prefix "$ROOT/vendor/impeccable" --silent 2>/dev/null; then
  ok "파서 설치 완료"
else
  fail "파서 설치 실패 — 축소 모드로 동작합니다"
  echo "     나중에 다시: npm ci --prefix vendor/impeccable"
fi

# ---------------------------------------------------------------------------
head_ "2/3  에이전트에 등록"

# {ROOT} 자리를 실제 경로로 바꿔 쓴다
install_file() {  # $1=원본  $2=대상
  mkdir -p "$(dirname "$2")"
  sed -e "s|{ROOT}|$ROOT_FOR_AGENT|g" \
      -e "s|\${CLAUDE_PLUGIN_ROOT}|$ROOT_FOR_AGENT|g" "$1" > "$2"
}

# 스킬 파일은 PLAYBOOK 위치를 절대경로로 알려줘야 한다
append_playbook_pointer() {
  printf '\n## 실행 지침 원문\n\n반드시 이 파일을 읽고 그대로 따른다.\n\n    %s/PLAYBOOK.md\n' \
    "$ROOT_FOR_AGENT" >> "$1"
}

# --- Claude Code ---
if [ -d "$CFG/.claude" ]; then
  install_file "$ROOT/commands/design-on.md" "$CFG/.claude/commands/design-on.md"

  install_file "$ROOT/SKILL.md" "$CFG/.claude/skills/design-on/SKILL.md"
  append_playbook_pointer "$CFG/.claude/skills/design-on/SKILL.md"

  n=0
  for f in "$ROOT"/agents/design-on-*.md; do
    install_file "$f" "$CFG/.claude/agents/$(basename "$f")"
    n=$((n+1))
  done
  ok "Claude Code — /design-on 명령 + 스킬 + 서브에이전트 ${n}종"
else
  skip "Claude Code 설정 폴더($CFG/.claude)가 없어 건너뜁니다"
fi

# --- Codex ---
if [ -d "$CFG/.codex" ]; then
  install_file "$ROOT/SKILL.md" "$CFG/.codex/skills/design-on/SKILL.md"
  append_playbook_pointer "$CFG/.codex/skills/design-on/SKILL.md"
  ok "Codex — 스킬 등록"
else
  skip "Codex 설정 폴더($CFG/.codex)가 없어 건너뜁니다"
fi

echo
echo "  등록한 파일은 이 저장소를 가리킵니다. 폴더를 옮기면 이 스크립트를 다시 실행하세요."

# ---------------------------------------------------------------------------
head_ "3/3  선택 — 사진 생성 키 (없어도 됩니다)"
cat <<'EOF'
  Codex처럼 이미지 생성이 내장된 환경에서는 키가 필요 없습니다.
  그 외 환경에서 AI 사진을 쓰려면

    export GEMINI_API_KEY="발급받은-키"

  키가 없으면 실사 스톡(Unsplash) → 타이포그래피 주도 순으로 폴백합니다.
  참고로 실사 스톡이 AI 생성 이미지보다 AI 티가 덜 나는 경우가 많습니다.

  레이아웃 근거를 실제 서비스 화면에서 가져오고 싶다면 lazyweb도 있습니다.
  원격 스크립트 실행 방식이라 자동으로 돌리지 않습니다. 먼저 읽어보고 직접 실행하세요.

    curl -fsSL https://www.lazyweb.com/install.sh | less
EOF

# ---------------------------------------------------------------------------
head_ "끝났습니다. 이렇게 쓰세요"
cat <<EOF

    Claude Code   /design-on 카페 하는데 보라색 계열 사이트 만들어줘
    Codex         카페 하는데 보라색 계열 사이트 만들어줘

  한 문장이면 됩니다. 나머지는 질문 몇 개에 답하시면 됩니다.
  다 만들고 나면 상호명·전화번호 같은 실제 정보를 물어보고 직접 채워 드립니다.

  검사기만 따로 돌려보려면
    node $ROOT_FOR_AGENT/scripts/slopcheck.mjs 아무_폴더/

  출처와 라이선스는 CREDITS.md에 있습니다.
EOF
