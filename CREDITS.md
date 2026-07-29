# 출처와 라이선스

designon은 혼자 만든 것이 아니다. 아래 프로젝트들의 지식과 코드를 **저장소 안에 함께 싣고**(vendoring) 하위 지식·하위 에이전트로 쓴다.

전부 원저작자의 라이선스가 재배포를 허용하는 것만 담았다. 각 폴더에 원본 `LICENSE`와 원본 커밋 해시(`.upstream-commit`)를 그대로 보존했다.

---

## 함께 싣는 것 (vendor/)

### Impeccable — 품질 하한선 + 안티패턴 디텍터

| | |
|---|---|
| 만든 사람 | Paul Bakaus ([@pbakaus](https://github.com/pbakaus)) |
| 원본 | https://github.com/pbakaus/impeccable · https://impeccable.style |
| 라이선스 | **Apache License 2.0** |
| 담은 경로 | `vendor/impeccable/` |
| 담은 것 | `SKILL.md`, `reference/` 25종, 번들 디텍터 `scripts/` |

**designon에서 가장 중요한 부품이다.** designon v1과 v2를 가르는 것이 이것 하나다.

- `reference/craft-floor.md` — STEP 4 빌드 직전에 읽는 품질 하한선. 대비·깊이·여백·타이포·모션·상태·카피·커버리지 검증 기준과 절대 금지 목록
- `reference/` 나머지 24종 — new-work, typeset, layout, animate, colorize, clarify, audit, critique, polish, harden, distill, adapt, optimize, operate 등. 필요할 때 참조
- `scripts/detect.mjs` — 안티패턴 **59종** 기계 검사기. `scripts/slopcheck.mjs`가 이걸 감싼다

디텍터가 잡는 것 일부. `gradient-text`, `side-tab`, `nested-cards`, `dark-glow`, `cream-palette`, `ai-color-palette`, `hero-eyebrow-chip`, `kicker-above-heading`, `numbered-section-labels`, `overused-font`, `single-font`, `low-contrast`, `gray-on-color`, `tiny-text`, `tight-leading`, `skipped-heading`, `italic-serif-display`, `marquee`, `pulsing-dot`, `bounce-easing`.

Apache-2.0 4조에 따라 원본 `LICENSE`와 `NOTICE.md`를 `vendor/impeccable/`에 함께 보존했다. 원본을 수정하지 않고 그대로 담았다.

> 원본 저장소에는 이 밖에도 Chrome 확장, CI용 CLI(`npx impeccable detect`), 훅 연동, 전용 서브에이전트 4종이 있다. designon은 그중 스킬 페이로드와 디텍터만 쓴다. 전체 기능이 필요하면 원본을 직접 설치하는 편이 낫다.

---

### tasteskill — 브리프 추론과 디자인 방향 설정

| | |
|---|---|
| 만든 사람 | [Leonxlnx](https://github.com/Leonxlnx) |
| 원본 | https://github.com/Leonxlnx/taste-skill · https://www.tasteskill.dev |
| 라이선스 | **MIT** |
| 담은 경로 | `vendor/taste-skill/` |
| 담은 것 | `skills/` 13종 (SKILL.md 전부) |

**STEP 2 아트 디렉션의 뼈대다.** designon v1에는 "디자인 방향을 정하는 단계"가 아예 없었고, 그게 결과물이 밋밋했던 큰 이유였다.

- **브리프 추론** — 코드를 쓰기 전에 "이 페이지를 무엇으로 읽었는지" 한 줄로 선언하게 한다
- **3다이얼** — `DESIGN_VARIANCE` / `MOTION_INTENSITY` / `VISUAL_DENSITY`. designon은 소상공인 기준으로 기본값을 낮춰 쓴다(원본 8/6/4 → designon 6/3/4)
- **안티 디폴트 규율** — AI 보라 그라디언트, 다크 메시 위 가운데 히어로, 동일 크기 특징 카드 3개, Inter + slate-900 같은 LLM 기본값을 명시적으로 배제
- 그 밖에 brandkit, image-to-code, redesign, minimalist/soft/brutalist 스타일 변형 등

---

### UI Skills — 컴포넌트·타이포·모션 제약

| | |
|---|---|
| 만든 사람 | Julien Thibeaut ([@ibelick](https://github.com/ibelick)) |
| 원본 | https://github.com/ibelick/ui-skills · https://www.ui-skills.com |
| 라이선스 | **MIT** |
| 담은 경로 | `vendor/ui-skills/` |
| 담은 것 | `skills/` 7종 |

- `baseline-ui` — MUST/NEVER 형태의 단정적 제약. 컴포넌트 프리미티브, 인터랙션, 애니메이션, 타이포, 레이아웃, 성능, 디자인 각 항목
- `fixing-accessibility` — 접근성 수정
- `fixing-motion-performance` — 레이아웃 스래싱, 컴포지터 속성, 스크롤 연동 모션, 블러 성능
- `improve-ui`, `create-design-md`, `fixing-metadata`, `ui-skills-root`

designon은 `baseline-ui`의 애니메이션·타이포 절을 STEP 3 모션 트랙과 STEP 4 빌드 규칙에 반영했다.

> 원본은 Tailwind + React 스택을 전제한다. designon은 순수 HTML/CSS를 만들므로 스택 종속 규칙(`cn` 유틸, `motion/react`, Base UI 등)은 빼고 **원칙만** 가져왔다.

---

### emilkowalski/skill — 애니메이션 설계와 검수

| | |
|---|---|
| 만든 사람 | Emil Kowalski ([@emilkowalski](https://github.com/emilkowalski)) |
| 원본 | https://github.com/emilkowalski/skill · https://emilkowal.ski/skill |
| 라이선스 | **MIT** |
| 담은 경로 | `vendor/emil-skill/` |
| 담은 것 | `skills/` 8종 |

- `emil-design-eng` — 애니메이션 기법과 디자인 가이드 (674줄)
- `review-animations` — 기준에 맞춰 애니메이션 평가
- `improve-animations` — 코드베이스 감사 후 실행 가능한 개선안
- `find-animation-opportunities` — 모션이 어울릴 UI 요소 탐색
- `animation-vocabulary` — 모션 요청을 정확한 용어로 전달
- `apple-design` — Apple 인터페이스·모션 원칙
- `pick-ui-library`, `prototype`

designon의 `designon-motion` 트랙이 이걸 참고 원본으로 읽는다.

---

### Fontshare — 라틴 디스플레이 서체

| | |
|---|---|
| 만든 곳 | Indian Type Foundry (ITF) |
| 원본 | https://www.fontshare.com |
| 라이선스 | 자체 무료 라이선스. **개인·상업 사용 모두 무료** |
| 쓰는 방법 | 코드 복제 없음. `<link>` 한 줄로 CDN 호출 |

`data/fonts.json`의 `latinAccent`가 여기서 온다. 폰트 파일을 저장소에 담지 않고 Google Fonts처럼 CDN으로 부른다.

```html
<link rel="stylesheet" href="https://api.fontshare.com/v2/css?f[]=clash-display@600,700&display=swap">
```

**왜 필요했나.** 한글 서체는 라틴 글자와 숫자가 약한 경우가 많다. `1,200원`·`USB-C`·`OPEN 08:30` 같은 표기에서 티가 난다. 그렇다고 `Inter`를 쓰면 디텍터가 `overused-font`로 잡는다. Fontshare의 Clash Display·Satoshi·Switzer·Boska·Sentient는 품질이 높으면서 남용 목록에 없다.

주의. Fontshare에도 `Plus Jakarta Sans`·`Montserrat`·`Poppins`가 있는데 이 셋은 남용 목록에 걸린다. `fonts.json`의 `avoid.fontshareCaution`에 적어뒀다.

### YouMind ai-image-prompts-skill — 프롬프트 작성 기법

| | |
|---|---|
| 만든 곳 | [YouMind-OpenLab](https://github.com/YouMind-OpenLab/ai-image-prompts-skill) |
| 라이선스 | MIT |
| 담은 것 | **없음. 형식만 배웠다** |

프롬프트 14,976개짜리 라이브러리다. 처음에는 통째로 담으려 했는데 실제로 열어보고 생각을 바꿨다.

designon 규칙(실사·3D 렌더 금지·첨부 이미지 의존 금지)으로 기계 필터를 돌리니 7,338개 중 2,609개(36%)가 남았다. 그런데 남은 것들도 표본을 보니 패션 에디토리얼 인물 사진, Blender·Octane 렌더, 스튜디오 제품컷이었다. **동네 카페의 라떼 한 잔이 아니다.** designon이 없애려는 바로 그 광택이었다.

그래서 44MB를 담는 대신 **구조화 스키마만** 가져왔다. 프롬프트를 한 문장으로 길게 쓰지 않고 `subject / light / camera / mood / negative`로 끊어 쓰는 형식이다. 이렇게 하면 모델이 앞부분만 반영하는 문제가 없어진다.

내용은 designon이 한국 소상공인 기준으로 새로 썼다. `data/photo-recipes.json`에 업종 7종이 들어 있고 `pick.mjs photo`로 조회한다.

---

## 검토했지만 넣지 않은 것

넣어달라는 요청을 받았지만, 실제로 열어보고 designon과 맞지 않아 제외한 것들이다. 억지로 끼워 넣으면 designon의 약속(한 문장 → 더블클릭하면 열리는 파일)이 깨진다.

### Finn-loop

| | |
|---|---|
| 원본 | https://github.com/finna/Finn-loop (MIT, Alex Finn) |
| 하는 일 | Linear 이슈 → PR → 리뷰 → 사람이 머지하는 소프트웨어 공장 |

**Linear 워크스페이스와 커넥터가 필수다.** `finn-spec`이 이슈를 만들고, `finn-build`가 그걸 집어 PR을 열고, `finn-review`가 판정한다. designon은 이슈도 PR도 만들지 않는다. 한 문장을 받아 HTML을 내놓는다. 목적이 겹치지 않는다.

다만 `finn-spec`의 인터뷰 원칙 — **"코드베이스가 답할 수 있는 것은 사용자에게 묻지 마라"**, "라운드당 1~4개, 각 선택지에 추천안을 먼저" — 은 designon STEP 1이 이미 같은 형태로 쓰고 있다. 팔레트를 먼저 조회한 다음 그 근거로 3개 이하를 한 번에 묻는 흐름이 그것이다.

소프트웨어를 이슈 단위로 굴리고 싶다면 Finn-loop를 **designon과 별개로** 설치해서 쓰는 것이 맞다.

### Astryx

| | |
|---|---|
| 원본 | https://github.com/facebook/astryx (MIT, Meta) |
| 하는 일 | 150+ 컴포넌트 디자인 시스템. React + StyleX |

npm 패키지 4종(`@astryxdesign/core` 외)으로만 배포되고 **CDN 빌드가 없다.** `@astryxdesign/core` 0.1.9의 exports를 확인해보니 2,474개 파일이 전부 `dist/*.js`와 `*.d.ts`였다. 독립 CSS 파일이 없다.

즉 쓰려면 npm 설치 + React + StyleX 빌드 파이프라인이 필요하다. designon의 결과물은 **더블클릭하면 열리는 HTML 파일**이다. 사업자가 파일을 받아 열어보는 것이 전제다. 빌드 도구를 요구하는 순간 그게 불가능해진다.

React 앱을 만드는 프로젝트라면 Astryx는 좋은 선택이다. designon의 출력 형식과 안 맞을 뿐이다.

---

## 싣지 않고 런타임에 감지하는 것

### lazyweb — 실제 제품 화면 레퍼런스

| | |
|---|---|
| 만든 사람 | [@aboul3ata](https://github.com/aboul3ata) |
| 원본 | https://github.com/aboul3ata/lazyweb-skill · https://www.lazyweb.com |
| 라이선스 | MIT |

**MIT라서 담을 수는 있지만 담지 않았다.** 실제 기능이 호스팅 API와 발급 토큰에 있어서, `SKILL.md`만 복사해봐야 토큰이 없으면 동작하지 않는다. 껍데기를 넣어놓고 "포함됨"이라고 하는 게 더 나쁘다고 판단했다.

designon은 런타임에 lazyweb이 있으면 STEP 3 리서치 트랙을 위임하고, 없으면 웹 검색과 `data/tools.json`으로 대체한다.

직접 설치하려면 아래를 쓴다. **원격 스크립트를 바로 실행하는 방식이므로 내용을 먼저 확인하고 판단하시길 권한다.**

```bash
curl -fsSL https://www.lazyweb.com/install.sh | bash
```

### originkit — 인터랙티브 컴포넌트

| | |
|---|---|
| 원본 | https://www.originkit.dev |
| 라이선스 | 명시 없음 |

컴포넌트 소스를 받으려면 originkit.dev에서 무료 API 키를 발급받아 자체 MCP 서버(`mcp.originkit.dev`)에 연결해야 한다. designon이 대신 발급받아 줄 수 없고, **라이선스가 명시돼 있지 않아 코드를 복제해 담지 않았다.**

MCP로 연결해두면 designon이 자동 감지해서 필요할 때 실시간으로 가져오고, 반드시 선택한 팔레트 색상·카피 규칙으로 **변형해서** 쓴다. 소스를 이 저장소에 저장하지 않는다.

### animos.app — 홍보 영상

https://animos.app/editor 는 템플릿에 사진을 넣어 MP4/WebM을 만드는 브라우저 툴이다. API가 없어 에이전트가 대신 조작할 수 없다. 페이지 완성 후 SNS용 짧은 영상이 필요하면 사용자가 직접 방문해서 만드는 **수동 참고 도구**로만 안내한다.

---

## 데이터 출처

`data/tools.json`(883개)과 `data/palettes.json`(78세트)은 Instagram [@suraj.dsgn](https://www.instagram.com/suraj.dsgn/)의 공개 게시물 325개를 분석해 추출한 것이다. 툴 이름, 공식 URL, 카테고리, 색상 HEX 값 같은 **사실 정보**만 담았다.

---

## 업스트림 재동기화

벤더링한 것은 시간이 지나면 낡는다. 최신으로 다시 받으려면 아래를 쓴다.

```bash
bash scripts/update-vendor.sh
```

현재 담긴 버전은 각 폴더의 `.upstream-commit`에 있다.

---

## designon 자체 라이선스

MIT. 단, `vendor/` 아래는 각 원저작자의 라이선스를 따른다. `vendor/impeccable/`은 Apache-2.0이다.
