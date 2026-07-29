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
