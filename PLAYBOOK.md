<!-- design-kit의 실행 지침 원본. 모든 에이전트 진입점이 이 파일을 읽는다 -->
# design-kit 실행 지침

한 문장 요청에서 완성된 웹페이지까지 한 번에 간다. 중간에 "어떤 스타일을 원하세요?" 같은 질문을 던지지 마라. 아래 절차대로 스스로 결정한다. 질문은 요청이 근본적으로 모순될 때만 한다.

`{ROOT}`는 이 플러그인이 설치된 디렉토리다. Claude Code에서는 `${CLAUDE_PLUGIN_ROOT}`, 그 외에는 이 파일이 있는 폴더다.

---

## STEP 0 — 동료 스킬 확인 (5초)

design-kit은 아래 스킬이 있으면 자동으로 위임한다. **없으면 그냥 건너뛴다. 설치를 요구하며 멈추지 마라.**

| 스킬 | 있으면 맡길 일 | 확인 방법 |
|---|---|---|
| **lazyweb** | 업종별 실제 제품 화면 레퍼런스 수집 | `/lazyweb-quick-search` 또는 `lazyweb-quick-references` 존재 |
| **emil-design-eng** | 애니메이션 설계와 검수 | `emil-design-eng`, `review-animations` 존재 |
| **ui-skills** | 컴포넌트 베이스라인, 모션 카테고리 | `npx ui-skills list` 실행 가능 |

확인은 사용 가능한 스킬 목록을 보고 판단한다. 없는 스킬을 호출해 에러를 내지 마라.

세 개 다 없으면 이 문서만으로 끝까지 만든다. 결과물 품질은 충분하다. 마지막 보고에서 "이 스킬을 깔면 더 좋아진다"고 한 줄만 안내한다.

---

## STEP 1 — 요청 해석

요청에서 아래를 뽑는다. 없는 항목은 업종 통념으로 **직접 정한다.** 되묻지 않는다.

| 항목 | 미지정 시 |
|---|---|
| 업종 | 문맥에서 추론 |
| 색상 선호 | 업종에 맞는 팔레트를 DB에서 선택 |
| 페이지 성격 | 업종 표준 (카페 = 브랜드 + 메뉴 + 위치) |
| 분위기 | 업종 표준 |
| 언어 | 한국어 (요청이 영어면 영어) |

**지역 소상공인 업종(카페·미용실·공방·식당·필라테스·학원 등)은 사업자가 직접 보는 결과물이다.** 개발자용 SaaS 랜딩 문법(다크모드 + 그라디언트 + 영문 슬로건)을 쓰지 마라.

---

## STEP 2 — 팔레트 선택

`{ROOT}/data/palettes.json`을 읽는다. 78세트, 구조는 이렇다.

```json
{"name":"...","tone":"전체 톤 설명","hex":["#RRGGBB",...],"industry":"어울리는 업종","note":"..."}
```

1. 색상 언급이 있으면 `tone`·`name`에서 그 계열을 찾는다. "보라색" → 퍼플·라벤더·자수정·오키드·라일락·플럼.
2. 언급이 없으면 `industry`로 매칭한다.
3. 후보가 여럿이면 **HEX 4개 이상 + 명도 폭이 넓은** 세트를 고른다. 밝은 배경·중간 톤·어두운 텍스트가 다 있어야 한다.
4. 밝은 배경색이 없으면 가장 밝은 색을 채도 8~12%로 희석해 직접 만든다.

**역할 배정**

- `--bg` 가장 밝은 색
- `--surface` bg보다 살짝 어두운 색 (섹션 구분)
- `--ink` 가장 어두운 색 (본문. 순검정 `#000` 금지)
- `--accent` 채도 가장 높은 색
- `--muted` 중간 톤 (보조 텍스트)

**대비를 계산해서 검증한다.** 본문·배경 4.5:1 이상. 미달이면 ink를 더 어둡게 조정한다.

액센트 색이 배경 대비 4.5:1에 못 미치면(보라·민트 계열에서 흔하다) **버튼 배경으로 쓰지 마라.** 그럴 때는 버튼을 `--ink` 배경 + 밝은 글자로 하고, 액센트는 밑줄·테두리·작은 장식에만 쓴다. 이 편이 시각적으로도 더 세련되다.

---

## STEP 3 — 레퍼런스 수집 (lazyweb이 있을 때만)

lazyweb이 있으면 업종 키워드로 실제 화면을 찾아 레이아웃 구조를 참고한다. 예: 카페면 실제 카페·베이커리 브랜드 사이트의 섹션 순서와 사진 배치.

**레퍼런스를 베끼지 마라.** 구조와 정보 위계만 참고하고 비주얼은 고른 팔레트로 새로 만든다.

lazyweb이 없으면 아래 업종별 기본 구조를 쓴다.

| 업종 | 섹션 순서 |
|---|---|
| 카페·베이커리·식당 | 히어로 → 소개(짧게) → 대표 메뉴 3~5개 → 공간 사진 → 위치·영업시간 |
| 미용실·네일·에스테틱 | 히어로 → 시술 메뉴+가격 → 디자이너 소개 → 시술 사진 → 예약 |
| 공방·스튜디오 | 히어로 → 작업 철학 → 작품 갤러리 → 클래스 안내 → 문의 |
| 필라테스·헬스 | 히어로 → 프로그램 → 강사 → 시설 → 수업 시간표 → 상담 신청 |
| 세무·법률·병원 | 히어로 → 업무 분야 → 약력 → 상담 절차 → 오시는 길 |

---

## STEP 4 — 사진 확보

**순서대로 시도하고 되는 데서 멈춘다.**

### 4-A. 실행 환경의 네이티브 이미지 생성

지금 돌고 있는 에이전트가 이미지를 직접 만들 수 있으면 **그걸 먼저 쓴다.** Codex처럼 이미지 생성이 내장된 환경이 여기 해당한다. 별도 API 키가 필요 없고 가장 자연스럽다.

3~5장을 만든다. 히어로 1장, 본문용 2~3장, 필요하면 배경 텍스처 1장.

### 4-B. Gemini API (`GEMINI_API_KEY`가 있을 때)

```bash
echo "${GEMINI_API_KEY:+set}"
```

`set`이면 아래로 생성한다. 모델은 `gemini-3-pro-image-preview`, 실패 시 `gemini-2.5-flash-image`.

```bash
mkdir -p site/assets
curl -s "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent" \
  -H "x-goog-api-key: $GEMINI_API_KEY" -H 'Content-Type: application/json' \
  -d '{"contents":[{"parts":[{"text":"PROMPT"}]}]}' \
  | python -c "import sys,json,base64;d=json.load(sys.stdin);[open('site/assets/hero.jpg','wb').write(base64.b64decode(p['inlineData']['data'])) for c in d['candidates'] for p in c['content']['parts'] if 'inlineData' in p]"
```

### 4-C. 실사 스톡 사진

웹 검색으로 업종 키워드 + `unsplash`를 찾고, `images.unsplash.com/photo-...` 형태의 CDN URL을 추출한다. 핫링크가 허용되고 영구적이다. 뒤에 `?w=1600&q=80&fm=jpg&fit=crop`을 붙인다.

페이지 하단에 출처를 작게 밝힌다.

### 4-D. 사진 없이

억지로 넣지 말고 **타이포그래피 주도**로 간다. 큰 헤드라인, 넓은 여백, 색면 블록, CSS 노이즈. 어설픈 이미지보다 이쪽이 훨씬 고급스럽다.

```css
.grain::after{content:'';position:absolute;inset:0;opacity:.06;pointer-events:none;
background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='.8'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");}
```

### 이미지 생성 프롬프트 규칙 (4-A·4-B 공통)

이걸 안 지키면 AI 티가 그대로 난다.

- 카메라 스펙을 명시한다. `shot on 35mm film, natural window light, shallow depth of field`
- 불완전함을 요청한다. `slightly off-center, natural imperfections, unstyled, lived-in`
- 금지어를 넣는다. `no text, no logo, no watermark, not oversaturated, not glossy, no perfect symmetry`
- 사람은 정면 클로즈업을 피한다. 손·뒷모습·측면이 자연스럽다.
- 팔레트 색을 프롬프트에 녹인다. `muted plum and warm cream tones`

카페 예시.

```
A ceramic cup of latte on a worn wooden counter, morning light from a side window,
soft shadows, muted plum and cream tones, shot on 35mm film, slightly off-center
composition, natural imperfections, no text, no logo, not oversaturated
```

---

## STEP 5 — 페이지 생성

### 반드시 피할 것 (AI 티의 정체)

**하나도 쓰지 마라.**

1. **보라→파랑 대각선 그라디언트 히어로.** 요청이 "보라색"이어도 그라디언트로 도망치지 말고 단색 면으로 처리한다.
2. **가운데 정렬 히어로 + 부제 + 버튼 2개.** 왼쪽 정렬하거나 비대칭으로 배치한다.
3. **아이콘 3개가 가로로 놓인 특징 카드.** 특히 이모지를 아이콘으로 쓰는 것.
4. **번역투 카피.** "최고의 경험을 선사합니다", "당신만을 위한", "지금 바로 시작하세요" 전부 금지.
5. **모든 요소에 걸린 `border-radius:12px`와 옅은 그림자.** 모서리는 0 또는 2~4px, 그림자는 거의 안 쓴다.
6. **`Inter` 단독 사용.** 특히 한국어 페이지에서.
7. **스크롤마다 걸리는 페이드인.** 애니메이션은 한두 곳에만.
8. **꽉 찬 대칭 12컬럼 그리드.** 의도적으로 어긋나게 배치한다.

### 타이포그래피 — 한국어

본문은 Pretendard를 CDN으로 불러온다.

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css">
```

제목은 대비되는 서체를 쓴다. 업종에 맞게 하나 고른다.

| 분위기 | 제목 서체 | 조달 |
|---|---|---|
| 따뜻함·수공예 (카페·베이커리·공방) | `Nanum Myeongjo` | Google Fonts |
| 단정·신뢰 (병원·세무·법률) | `Pretendard` 700, 자간 -0.02em | CDN |
| 감각적·편집 (뷰티·패션·스튜디오) | `Gowun Batang` | Google Fonts |
| 활동적 (헬스·필라테스·학원) | `Pretendard` 800, 크게 | CDN |

크기. 히어로 제목 `clamp(2.2rem,6vw,4.5rem)`, 본문 `17px`, 행간 `1.75`, 한글 자간 `-0.01em`.

### 레이아웃

- 히어로는 화면을 꽉 채우지 않는다. `min-height:78vh` 정도로 잘라 다음 섹션이 살짝 보이게 한다.
- 텍스트:이미지 비율을 `1:1`이 아닌 `5:7` 또는 `7:5`로 어긋나게 한다.
- 섹션 하나는 배경을 `--surface`로 바꿔 리듬을 준다.
- 최대 폭 `1180px`. 좌우 여백 모바일 `20px` / 데스크톱 `48px`.
- 섹션 간 수직 여백 `clamp(64px,10vw,128px)`.

### 애니메이션

emil-design-eng이나 ui-skills가 있으면 모션 설계를 맡긴다. 없으면 아래만 지킨다.

- 히어로 진입 1회, 그 외 스크롤 애니메이션 없음
- `transition: 200ms cubic-bezier(.2,0,0,1)` 정도의 짧고 자연스러운 이징
- `transform`과 `opacity`만 애니메이션한다
- `@media (prefers-reduced-motion: reduce)`에서 전부 끈다

### 카피 작성

**AI 티를 가장 크게 좌우하는 부분이다.** 구체적인 사실을 지어내되 현실적이어야 한다.

- 나쁜 예. "최고의 원두로 정성껏 내린 커피를 제공합니다"
- 좋은 예. "에티오피아 예가체프를 주로 씁니다. 로스팅은 매주 화요일에 합니다."

숫자·요일·지명·품목명을 넣는다. 문장은 짧게 끊는다. 감탄사와 느낌표를 쓰지 않는다. 사업자가 직접 쓴 것처럼 담백하게 쓴다.

가짜 정보를 넣을 때는 페이지 맨 아래 주석을 남긴다.

```html
<!-- 아래 정보는 예시입니다. 실제 정보로 교체하세요: 주소, 전화번호, 영업시간, 메뉴, 가격 -->
```

### 기술 요건

- 모바일 우선. `@media (min-width:768px)`로 확장
- 시맨틱 태그. `<header> <main> <section> <footer>`
- `<html lang="ko">`, `<meta name="viewport" content="width=device-width, initial-scale=1">`
- 이미지에 `alt`, `loading="lazy"`
- **다크모드는 넣지 않는다.** 소상공인 사이트에 불필요하고 AI 티가 난다
- 외부 JS 프레임워크 금지. 인터랙션은 순수 JS 10줄 이내
- 단일 HTML 파일. CSS는 `<style>`에 인라인

---

## STEP 6 — 저장과 보고

1. `site/index.html`로 저장한다. 이미지를 만들었으면 `site/assets/`에 넣는다.
2. HTML 첫 줄에 한국어 주석으로 용도를 적는다. 예: `<!-- 카페 브랜드 소개 페이지. 팔레트: Orchid/Amethyst -->`
3. 사용자에게 이렇게 보고한다.
   - 고른 팔레트 이름과 HEX
   - 고른 서체 조합
   - 사진 확보 경로 (네이티브 생성 / Gemini / 스톡 / 타이포 주도)
   - **교체해야 할 예시 정보 목록**
   - 파일 경로를 마크다운 링크로
4. 브라우저 미리보기를 쓸 수 있으면 열어서 보여준다.

과정을 장황하게 중계하지 말고 결과를 보여준다.

---

## 대화 톤

한국어로 답한다. 문장은 마침표로 끝낸다. 콜론으로 문장을 끝내지 않는다.
