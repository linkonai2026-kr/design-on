---
description: 한 문장만 말하면 구조·컬러·서체·사진·카피까지 정해서 완성된 웹페이지를 만든다. 제작 4트랙·검수 3트랙 병렬 + AI 티 기계 검사 + 완성 후 실제 정보 채우기.
argument-hint: 예) 카페 운영하는데 보라색 계열 사이트 만들어줘
---

사용자 요청: **$ARGUMENTS**

`${CLAUDE_PLUGIN_ROOT}/PLAYBOOK.md`를 읽고 그 절차를 처음부터 끝까지 그대로 실행해라. 요약본으로 대충 만들지 말고 원문을 읽어라.

## 흐름

```
STEP 1  브리프 해석 + 출력 형태 + 팔레트 조회 → 질문 딱 1회
STEP 2  아트 디렉션    2-0 구조부터 고른다
STEP 3  ⚡병렬 제작 4트랙
STEP 4  통합 빌드
STEP 5  ⚡병렬 검수 3트랙
STEP 6  일괄 수정 → 재검사 1회
STEP 7  보고 → 화면을 보여준다
STEP 8  완성 후 대화   ← 여기까지가 완성이다
```

## 건너뛰면 안 되는 다섯 가지

**1. 데이터는 `pick.mjs`로 조회한다.** `data/*.json`을 Read로 통째 읽지 마라. `tools.json` 하나가 약 87,000 토큰이다.

```bash
node ${CLAUDE_PLUGIN_ROOT}/scripts/pick.mjs layouts  --asset "목록과 가격이 핵심"
node ${CLAUDE_PLUGIN_ROOT}/scripts/pick.mjs layouts  --id index-first
node ${CLAUDE_PLUGIN_ROOT}/scripts/pick.mjs palettes --hue 보라 --industry 카페
node ${CLAUDE_PLUGIN_ROOT}/scripts/pick.mjs fonts    --industry 카페
node ${CLAUDE_PLUGIN_ROOT}/scripts/pick.mjs photo    --industry 카페
```

**2. 질문은 STEP 1에서 딱 한 번.** 팔레트를 먼저 조회해 실제 후보를 손에 쥔 다음 그 근거로 3개 이하를 한 번에 묻는다. 답을 받으면 STEP 7까지 멈추지 않는다.

**3. STEP 2-0에서 구조를 고른다.** 이걸 건너뛰면 색만 다른 같은 페이지가 나온다. 히어로에 사진 깔고 왼쪽에 제목, 아래 섹션 서너 개, 끝에 위치·전화 — 업종을 가리지 않고 이게 나오는 것이 이 도구의 가장 큰 실패 모드다. **디텍터는 그걸 못 잡는다.**

업종이 아니라 **이 가게가 가진 자산**이 구조를 정한다. 고른 이유를 아트 디렉션 카드에 한 줄로 써라. 못 쓰면 안 고른 것이다. 치수(`maxWidth`·`gutter`·`sectionGap`)도 아키텍처에서 가져온다.

**4. STEP 3과 STEP 5는 병렬이다.** 서브에이전트를 한 메시지에 전부 띄운다. 하나씩 순서대로 돌리지 마라.

- STEP 3 제작 — `design-on-researcher`, `design-on-copywriter`, `design-on-photographer`, `design-on-motion`
- STEP 5 검수 — `design-on-critic`, `design-on-korean` (기계 검사는 직접 실행)

**5. 기계 검사를 돌린다.**

```bash
node ${CLAUDE_PLUGIN_ROOT}/scripts/slopcheck.mjs site/
```

STEP 6에서 일괄 수정하고 **한 번만** 재검사한다. 자가 QA 루프를 돌리지 마라.

## STEP 7에서 멈추지 마라

보고하고 화면을 보여준 뒤 **곧바로 STEP 8로 간다.** 사용자의 다음 말을 기다리지 마라.

거기까지는 상호명·전화번호·영업시간이 전부 지어낸 값이다. 예시 정보 목록을 던지고 끝내면 HTML을 만지기 싫어서 온 사람에게 HTML을 만지라고 시키는 것이다.

1. 마음에 드는지 묻는다 (A 좋다 / B 몇 군데 / C 아니다)
2. **페이지에 실제로 들어간 가짜 값만** 빈칸 채우기로 한 번에 묻고, 받은 값을 **모든 페이지에서** 바꾼다. 다 채웠으면 예시 주석을 지운다
3. 사진은 자리마다 뭐가 보이는지 적고 하나씩 확인한다. 바꾼다고 하면 **어떻게 바꿀지 먼저 묻고 나서** 손댄다
4. C를 고르면 HTML을 고치지 말고 STEP 2 아트 디렉션으로 되감는다 (1회만)

자가 QA 루프 금지와 사용자에게 묻는 것은 다르다. 헷갈리지 마라. 다만 STEP 8은 최대 2라운드다.

## 출력 형태

**기본은 단일 HTML이다.** 더블클릭하면 열린다.

사용자가 나눠달라고 하거나 내용이 안 들어가면(시술 목록, 작품 갤러리, 공지사항 등) **멀티페이지**로 간다. 3~5개가 적당하고 CSS는 `site/assets/style.css` 하나로 공유한다.

**React + Vite는 화면에 상태가 여러 개 얽힐 때만이다.** 다중 조건 필터, 단계형 예약 폼, 로그인으로 갈리는 화면. "화려하게", "3D로", "인터랙티브하게"는 React 조건이 아니다 — 그건 CDN import map으로 붙이고 여전히 더블클릭으로 열리게 한다. React로 가도 UI 라이브러리는 깔지 않고 팔레트·서체로 직접 CSS를 쓴다.

결과물은 `site/` 아래에 둔다.

## 경로

| 용도 | 경로 |
|---|---|
| **데이터 조회 CLI** | `${CLAUDE_PLUGIN_ROOT}/scripts/pick.mjs` |
| **안티패턴 검사기** | `${CLAUDE_PLUGIN_ROOT}/scripts/slopcheck.mjs` |
| 품질 하한선 (빌드 직전에 읽는다) | `${CLAUDE_PLUGIN_ROOT}/vendor/impeccable/reference/craft-floor.md` |
| 브리프 추론·다이얼 | `${CLAUDE_PLUGIN_ROOT}/vendor/taste-skill/skills/taste-skill/SKILL.md` |
| 컴포넌트 제약 | `${CLAUDE_PLUGIN_ROOT}/vendor/ui-skills/skills/baseline-ui/SKILL.md` |
| 애니메이션 | `${CLAUDE_PLUGIN_ROOT}/vendor/emil-skill/skills/emil-design-eng/SKILL.md` |

한국어로 답한다. 문장은 마침표로 끝낸다.
