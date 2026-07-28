#!/usr/bin/env bash
# vendor/ 아래 벤더링한 스킬들을 업스트림 최신으로 다시 받는다
set -eu

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

ok()    { printf '  \033[32m✓\033[0m %s\n' "$1"; }
head_() { printf '\n\033[1m%s\033[0m\n' "$1"; }

head_ "designon vendor 재동기화"
echo "  현재 담긴 버전과 업스트림 최신을 비교해 갱신합니다."
echo "  라이선스 파일과 .upstream-commit도 함께 갱신됩니다."

sync_one() {
  local repo="$1" dest="$2" mode="$3"
  local dir="$TMP/$(echo "$repo" | tr '/' '_')"

  head_ "$repo → vendor/$dest"
  git clone --depth 1 -q "https://github.com/$repo.git" "$dir"
  local new; new="$(cd "$dir" && git rev-parse HEAD)"
  local old; old="$(cat "$ROOT/vendor/$dest/.upstream-commit" 2>/dev/null || echo none)"

  if [ "$new" = "$old" ]; then
    ok "이미 최신 (${new:0:8})"
    return
  fi

  # node_modules는 보존하고 나머지만 교체한다
  find "$ROOT/vendor/$dest" -mindepth 1 -maxdepth 1 ! -name node_modules -exec rm -rf {} +

  if [ "$mode" = "impeccable" ]; then
    cp -r "$dir/plugin/skills/impeccable/reference" "$ROOT/vendor/$dest/"
    cp -r "$dir/plugin/skills/impeccable/scripts"   "$ROOT/vendor/$dest/"
    cp    "$dir/plugin/skills/impeccable/SKILL.md"  "$ROOT/vendor/$dest/"
    cp    "$dir/LICENSE" "$dir/NOTICE.md"           "$ROOT/vendor/$dest/"
    # 파서 앵커는 재생성한다
    cat > "$ROOT/vendor/$dest/package.json" <<'JSON'
{
  "name": "designon-vendored-impeccable-detector",
  "private": true,
  "type": "module",
  "description": "Local dependency anchor so the vendored Impeccable detector resolves its parsers offline. Not published.",
  "dependencies": {
    "css-select": "^7.0.0",
    "css-tree": "^3.2.1",
    "domutils": "^4.0.2",
    "htmlparser2": "^12.0.0"
  }
}
JSON
  else
    cp -r "$dir/skills"  "$ROOT/vendor/$dest/"
    cp    "$dir/LICENSE" "$ROOT/vendor/$dest/"
  fi

  echo "$new" > "$ROOT/vendor/$dest/.upstream-commit"
  ok "갱신 ${old:0:8} → ${new:0:8}"
}

sync_one pbakaus/impeccable     impeccable  impeccable
sync_one Leonxlnx/taste-skill   taste-skill md
sync_one ibelick/ui-skills      ui-skills   md
sync_one emilkowalski/skill     emil-skill  md

head_ "파서 재설치"
npm install --prefix "$ROOT/vendor/impeccable" --silent && ok "완료"

head_ "완료"
echo "  변경 내용을 확인하고 커밋하세요."
echo "    git -C \"$ROOT\" status"
echo
echo "  업스트림 기능이 바뀌었을 수 있습니다. PLAYBOOK.md와 CREDITS.md가"
echo "  여전히 맞는지 확인하세요."
