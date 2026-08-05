# design-on v2 체크리스트

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
- [x] `commands/design-on.md`, `skills/design-on/SKILL.md`, `SKILL.md`, `AGENTS.md` 동기화
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

---

# v4 체크리스트

목표. **STEP 7에서 끝나던 것을 STEP 8까지 끌고 간다.** 지어낸 상호명·전화번호를 실제 값으로 바꾸는 것까지가 완성이다.

## 8. 개명 — designon → design-on

- [x] GitHub 저장소 rename (`linkonai2026-kr/design-on`, 구주소는 자동 리다이렉트)
- [x] 로컬 폴더 `H:/insta-design/design-on`
- [x] `git remote set-url`
- [x] 파일명 — `commands/design-on.md`, `agents/design-on-*.md` 6종, `skills/design-on/`
- [x] 문서·스크립트 내 문자열 127곳 전부 치환 (대소문자 변형 없음 확인)
- [x] `plugin.json` name·homepage·repository·agents 경로
- [x] 에이전트 frontmatter `name:` 6종
- [x] 구버전 로컬 설치 제거 후 재설치

## 9. STEP 8 — 완성 후 대화

- [x] 8-1 만족도 A/B/C — C를 방어하지 말 것을 명시
- [x] 8-2 실제 정보 채우기 — **페이지에 실제로 들어간 가짜 값만** 묻는다. 업종별 질문 항목 6종
- [x] 쇼핑몰 사업자 정보는 법정 필수 표시 항목이라 별도 경고 주석 규정
- [x] 받은 값을 `grep`으로 전 페이지 확인 (멀티페이지에서 전화번호가 3곳에 있다)
- [x] 가짜 값은 `031-000-0000` 형태로 넣어 찾기 쉽게 (STEP 4 규칙에 추가)
- [x] 다 채우면 예시 주석 삭제
- [x] 8-3 사진 — 자리별로 뭐가 보이는지 적고 하나씩. **바꿀 방법을 먼저 묻고 나서** 손댄다 (a 분위기 / b 소재 / c 직접 사진 / d 제거)
- [x] 8-4 방향 재설정 — HTML이 아니라 STEP 2 아트 디렉션으로 되감기, 1회만. 2회 실패 시 레퍼런스 URL 요청
- [x] 8-5 일괄 반영 → 재검사 1회 → 바뀐 것/못 바꾼 것 보고
- [x] 최대 2라운드 상한
- [x] **STEP 6 "루프 금지"와의 충돌 해소 문단** — 자가 QA 루프와 사람에게 묻는 것은 다르다

## 10. 출력 형태 확장

- [x] STEP 1-2를 "출력 형태 결정"으로 승격 — 단일 HTML / 멀티페이지 / React + Vite
- [x] React 조건을 좁게 정의 (다중 필터·단계형 폼·로그인 분기). "화려하게"는 조건 아님
- [x] React 선택 시 STEP 1-4에서 터미널 비용을 미리 고지
- [x] React 규칙 5개 — UI 라이브러리 금지, 상태 라이브러리 금지, 의존성 4개, 한국어 실행법, `base:'./'`
- [x] `npm run build` → `dist/`에 slopcheck 돌리는 경로 명시
- [x] STEP 4 기술 요건의 "React·Vue 쓰지 않는다" 문장 제거
- [x] 아트 디렉션 카드 `구성` → `출력 형태`

## 11. Astryx 재검토

- [x] 실제 문서 재확인 — 3패키지 필수, 빌드 필수, CDN 없음, 테마 7종, 토큰은 CSS 변수
- [x] 제외 사유를 "빌드 필요"에서 **"목적이 반대"**로 교체 (단일 HTML 제약이 풀렸으므로 기존 논거 무효)
- [x] 테마 7종이 `palettes.json` 78세트보다 좁다는 점 기록

## 12. 초보자 설치 경로

- [x] `setup.sh`/`setup.ps1`가 검사기뿐 아니라 **에이전트 등록까지** 수행
- [x] `{ROOT}`·`${CLAUDE_PLUGIN_ROOT}` → 절대경로 치환해서 설치
- [x] 스킬 파일에 PLAYBOOK 절대경로 포인터 추가
- [x] Windows `$HOME`이 실제 홈이 아닌 경우(SPB_Data) `%USERPROFILE%` 우선
- [x] `~/.claude`·`~/.codex` 없으면 조용히 건너뛰기
- [x] 실제 실행 검증 — 명령·스킬·에이전트 6종 등록, 플레이스홀더 잔여 0, PLAYBOOK 경로 실재 확인

## 13. 검증

- [x] `pick.mjs` 정상 동작 (sed 치환 후 회귀 없음)
- [x] `slopcheck.mjs` 정상 동작 — 위반 주입 파일에서 10건 검출, 전체 모드 확인
- [x] `examples/studio/` 0건 유지
- [x] 커밋 · push

---

# v4.1 체크리스트 — 다 비슷하게 나오던 문제

목표. **색만 바뀐 같은 페이지가 나오지 않게 한다.** 디텍터가 못 잡는 층이다.

## 14. 원인 제거

- [x] `PLAYBOOK.md` STEP 4의 고정 치수 삭제 (최대 폭 1180px / 여백 20·48px / 섹션 간격 clamp(64,10vw,128) / 히어로 78vh / 텍스트:이미지 5:7)
- [x] STEP 3 트랙 A의 업종별 고정 섹션 순서표 삭제 → "방문자가 궁금한 것"을 세우고 1순위가 첫 화면
- [x] `agents/design-on-researcher.md`의 같은 표도 삭제
- [x] 두 표가 되살아나지 않는지 테스트로 고정 (`doesNotMatch`)

## 15. 구조를 데이터로 뽑는다

- [x] `data/layouts.json` — 아키텍처 10종. 각각 hero·grid·metrics·photos·signature·avoid·css
- [x] 업종이 아니라 **가게가 가진 자산**이 구조를 정한다 (`howToChoose.assetMap`)
- [x] `pick.mjs layouts` — 요약 조회 / `--asset` 좁히기 / `--id` 전체 사양
- [x] 치수를 아키텍처마다 다르게 (maxWidth 5종 이상, sectionGap 4종 이상) — 테스트로 고정
- [x] 크래프트 하한선 9개는 아키텍처와 무관하게 유지 (`universal.keepRegardless`)
- [x] PLAYBOOK STEP 2-0 신설, 아트 디렉션 카드에 `구조` + `고른 이유` 필드
- [x] 이유를 못 쓰면 안 고른 것이라고 명시

## 16. 껍데기를 사람이 잡는다

- [x] STEP 5·critic에 **교체 테스트** — 상호와 사진만 바꿔도 말이 되면 실패
- [x] critic 출력 맨 위에 교체 테스트 판정을 항상 적게 (없어도 생략 금지)
- [x] STEP 4에 "이 페이지에만 있는 것을 하나 만든다" — 업종별 예시 6종, 경계값 검증 요구
- [x] researcher가 그 요소를 제안하도록 산출물 형식 변경

## 17. 증명

- [x] `examples/tax/` — `document` 구조. **사진 0장, 히어로 없음**, 본문 세리프 / 제목 산세리프
- [x] 이 가게에만 있는 것 — 오늘 기준 다음 신고 마감 D-day 자동 계산
- [x] 날짜 로직 경계값 10종 검증 (당일 D-0, 익일 롤오버, 월말, 연말, 윤년 2/29)
- [x] JS가 죽어도 연간 일정 표가 남는지 확인
- [x] slopcheck 0건, 대비 13.78:1, 서체 3종, 크기 6단계(40/13=3.08)
- [x] 시각 테스트·스냅샷에 tax 추가
- [x] 전체 테스트 21종 통과 (repository 7 + visual 14)

---

# v4.2 체크리스트 — 인스타 게시물 4건 검토

출처. [@suraj.dsgn](https://www.instagram.com/suraj.dsgn/) 게시물 4건을 캐러셀 슬라이드까지 열어 확인했다.

## 18. 넣은 것

- [x] **Google Fonts 라틴 폴백 5종** — `data/fonts.json`의 `latinFallback`
  - [x] 문제 확인 — 페어링 9종의 라틴 서체가 **전부 Fontshare 한 곳**에서 온다(단일 장애점)
  - [x] 디텍터 `OVERUSED_FONTS` 집합에 5종 다 없는 것을 소스에서 확인
  - [x] Google Fonts CSS 엔드포인트 5개 전부 200 응답 확인
  - [x] `pick.mjs fonts` 결과에 포함, 출력 약 1,000토큰 유지
  - [x] "폴백이지 1순위 아님 / 본문·UI 전용" 명시 — 제목에 쓰면 밋밋해진다
  - [x] PLAYBOOK 2-5에 표로 배선
- [x] **무료 목업 사이트 5곳** — 상품 사진의 구멍
  - [x] PLAYBOOK STEP 8-3에 안내 목록 신설
  - [x] `agents/design-on-photographer.md`에 C-3-1 신설 — "상품 사진은 스톡으로 안 된다"
  - [x] 에이전트가 대신 못 만든다는 점 명시(PSD 합성). animos.app과 같은 수동 자료 취급
- [x] **`tools.json` 갱신** — 신규 11개 추가(894개), 재등장 3개 `seen` 증가
  - [x] URL 11개 전부 200 응답 확인
  - [x] 기존 중복 4건 사전 확인(UX Pilot·LS Graphics·Mr.Mockup·Unblast)

## 19. 넣지 않은 것

- [x] **A/B 테스트 5종** — `tools.json`에만. PLAYBOOK 어디에도 배선하지 않음
  - 트래픽·서버·분석 파이프라인이 있어야 성립한다. 월 방문자 서른 명인 동네 가게 페이지에서는 통계적으로 무의미하다
  - GrowthBook이 오픈소스라는 사실도 판단을 바꾸지 않는다
  - Unrevealed만 출시 전 검증이라 트래픽이 필요 없지만, 자동으로 부를 일은 아니다
- [x] **페이지 생성 AI 3종**(PageAI·Pen.dev·UX Pilot) — design-on과 목적이 겹치는 경쟁 도구. 디렉터리 기록만

## 20. 검증

- [x] `data/fonts.json`·`data/tools.json` JSON 유효성
- [x] 폴백 회귀 테스트 신설 — 3종 이상 / `avoid` 목록과 교차 검사 / `pick.mjs`가 실제로 반환하는지
- [x] 테스트 8종 + 시각 14종 통과
- [x] 커밋 · push
