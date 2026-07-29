# designon v2 체크리스트

목표. 한 문장 요청에서 **10년차 디자이너가 만든 것 같은** 페이지가 한 번에 나온다. AI 티를 사람의 판단이 아니라 **기계 검사**로 잡는다.

## 1. 조사

- [x] tasteskill (Leonxlnx/taste-skill) — MIT. 브리프 추론 + 3다이얼 + 디자인시스템 매핑
- [x] impeccable (pbakaus/impeccable) — Apache-2.0. 59종 안티패턴 디텍터 + 23 커맨드 + craft-floor
- [x] ui-skills (ibelick/ui-skills) — MIT. baseline-ui 제약, 접근성·모션성능 수정
- [x] emil-skill (emilkowalski/skill) — MIT. 애니메이션 설계·검수, Apple 원칙
- [x] lazyweb (aboul3ata/lazyweb-skill) — MIT이지만 호스팅 API + 토큰 필요 → 벤더링 제외, 런타임 감지
- [x] 라이선스 전수 확인 → 4종 벤더링 가능

## 2. 벤더링

- [x] `vendor/impeccable/` — SKILL.md + reference 25종 + 번들 디텍터 + LICENSE + NOTICE
- [x] `vendor/taste-skill/` — skills 13종 + LICENSE
- [x] `vendor/ui-skills/` — skills 7종 + LICENSE
- [x] `vendor/emil-skill/` — skills 8종 + LICENSE
- [x] 각 벤더에 `.upstream-commit` 기록 (출처 추적)
- [x] `vendor/impeccable/package.json` — 디텍터 파서 4종 로컬 앵커
- [x] 디텍터 전체 모드 동작 검증 (26종 검출 확인)

## 3. 오케스트레이션

- [x] `scripts/slopcheck.mjs` — 디텍터 래퍼, 의존성 없으면 축소 모드로 degrade
- [x] 병렬 서브에이전트 5종 정의 (`agents/`)
- [x] PLAYBOOK.md 재작성 — 병렬 2단계(제작 4트랙 / 검수 3트랙)
- [x] 브리프 우선 원칙 — 사용자가 보라색을 요청하면 `ai-color-palette` 경고보다 브리프가 이긴다
- [x] 서체 페어링 강제 (`single-font` 회피)
- [x] 크림/베이지 기본값 금지 (`cream-palette` 회피)

## 4. 배선

- [x] `.claude-plugin/plugin.json` — agents 등록
- [x] `commands/designon.md`, `skills/designon/SKILL.md`, `SKILL.md`, `AGENTS.md` 동기화
- [x] `scripts/setup.sh` / `setup.ps1` — 벤더 의존성 설치 + 에이전트 등록
- [x] `scripts/update-vendor.sh` — 업스트림 재동기화
- [x] `CREDITS.md` — 하위 에이전트로 쓰는 모든 출처 명시
- [x] `.gitignore` — `vendor/*/node_modules`

## 5. 검증

- [x] 실제 페이지 생성 후 `slopcheck` 0건 통과
- [x] 대비 4.5:1 실측
- [x] README 예시를 실제 산출물 기준으로 교체

## 6. 배포

- [x] 커밋
- [x] push

## 7. 멀티페이지 지원 (후속)

- [x] STEP 1-2에 페이지 구성 판단 추가 — 기본 원페이지, 요청·내용량에 따라 분할
- [x] 아트 디렉션 카드에 `구성` 항목 추가 (병렬 트랙이 산출물 단위를 이걸로 정한다)
- [x] STEP 4에 멀티페이지 규칙 8개 (공통 CSS, 헤더·푸터 동일, `aria-current`, 상대경로 등)
- [x] researcher — 페이지별 섹션 + 역할 출력
- [x] copywriter — 페이지별 문구 + 페이지마다 다른 title·description
- [x] critic·korean — 모든 페이지 검수, 멀티페이지 전용 체크 항목
- [x] 디텍터가 외부 CSS를 따라가는지 검증 (따라감 — 검사 범위 안 줄어듦)
- [x] 안쪽 페이지가 실제로 스캔되는지 검증 (위반 주입 → visit.html에서 검출 확인)
- [x] `examples/salon/` 3페이지 실제 제작 → 안티패턴 0건
- [x] 구조 규칙 자동 검증 (링크·nav 일치·aria-current·title 중복·인라인 CSS)
- [x] 대비 검증 (index·menu 모두 0건 실패)
