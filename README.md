# design-kit

한 문장만 말하면 컬러·서체·사진·카피까지 알아서 정해서 **완성된 웹페이지**를 만들어주는 디자인 스킬. **Claude Code와 Codex 양쪽에서 쓸 수 있다.**

Instagram [@suraj.dsgn](https://www.instagram.com/suraj.dsgn/) 게시물 325개를 분석해 뽑은 **디자인 툴 883개**와 **컬러 팔레트 78세트**를 데이터로 내장한다.

---

## 쓰는 법

명령은 하나뿐이다.

```
/design 카페 운영하는데 보라색 계열 사이트 만들어줘
```

Codex에서는 슬래시 없이 그냥 말하면 된다.

```
카페 운영하는데 보라색 계열 사이트 만들어줘
```

이 한 줄이면 끝난다. 되묻지 않고 아래를 전부 처리한다.

1. 업종·색상·분위기를 해석한다
2. 팔레트 78세트에서 배색을 고르고 배경·본문·강조 역할을 배정한다 (대비 4.5:1 계산 검증)
3. 업종에 맞는 한글 서체 조합을 정한다
4. 사진을 확보한다
5. AI 티가 나지 않는 규칙으로 단일 HTML을 만든다
6. `site/index.html`로 저장하고 교체할 예시 정보를 알려준다

다른 예시.

```
40대 여성 타겟 필라테스 스튜디오 페이지, 차분한 톤으로
동네 세무사무소 소개 페이지
도자기 공방 브랜드 사이트, 흙색 계열
```

---

## 설치

```bash
git clone https://github.com/vionai2026-lab/design-kit.git
cd design-kit
bash scripts/setup.sh          # Windows는 powershell -File scripts/setup.ps1
```

`setup` 스크립트는 아래 동료 스킬 3종을 설치한다. **전부 선택 사항이다.** 하나도 없어도 design-kit은 단독으로 동작한다.

| 스킬 | 맡는 일 | 출처 |
|---|---|---|
| emilkowalski/skill | 애니메이션 설계·검수 | [emilkowal.ski/skill](https://emilkowal.ski/skill) |
| ui-skills | 컴포넌트 베이스라인, 모션 카테고리 | [ui-skills.com](https://www.ui-skills.com/) |
| lazyweb | 실제 제품 화면 레퍼런스 검색 | [lazyweb-skill](https://github.com/aboul3ata/lazyweb-skill) |

설치돼 있으면 design-kit이 **자동으로 감지해서 해당 작업을 위임한다.** 사용자가 어떤 스킬을 언제 부를지 신경 쓸 필요가 없다. 없으면 조용히 건너뛰고 내장 규칙으로 만든다.

### 에이전트별 등록

**Claude Code** — 플러그인 디렉토리로 등록하면 `/design`이 활성화된다. `commands/`와 `skills/`가 함께 들어 있어 슬래시 명령과 자동 발동이 모두 된다.

**Codex** — 저장소를 작업 폴더에 두면 `AGENTS.md`를 읽고 동작한다. 또는 `npx skills add`로 스킬 디렉토리에 설치한다.

---

## 사진 처리

네 단계로 자동 폴백한다.

| 순서 | 방식 | 조건 |
|---|---|---|
| 1 | **실행 환경의 네이티브 이미지 생성** | Codex처럼 이미지 생성이 내장된 경우. 키 불필요 |
| 2 | Gemini API | `GEMINI_API_KEY`가 있을 때 |
| 3 | 실사 스톡 사진 | 웹 검색으로 Unsplash CDN URL 확보 |
| 4 | 타이포그래피 주도 디자인 | 위가 다 안 될 때 |

Gemini 키를 넣으려면 이렇게 한다.

```bash
export GEMINI_API_KEY="your-key"
```

**Codex에서는 키가 필요 없다.** 내장 이미지 생성을 먼저 쓴다.

생성 프롬프트에는 필름 카메라 스펙과 불완전함(`slightly off-center`, `natural imperfections`)을 명시해 생성 이미지 특유의 매끈함을 억제한다. 실사 스톡이 AI 생성물보다 "AI 티"가 덜 나는 경우도 많아서, 3번 경로도 품질이 충분하다.

---

## AI 티를 없애는 규칙

이 스킬의 핵심이다. 생성 시 아래를 금지한다.

- 보라→파랑 대각선 그라디언트 히어로
- 가운데 정렬 히어로 + 버튼 2개 조합
- 이모지를 아이콘으로 쓴 3단 특징 카드
- "최고의 경험을 선사합니다" 류의 번역투 카피
- 모든 요소에 걸린 둥근 모서리와 옅은 그림자
- 한국어 페이지에 영문 전용 서체 단독 사용
- 스크롤마다 걸리는 페이드인
- 꽉 찬 대칭 12컬럼 그리드

대신 이렇게 만든다.

- 비대칭 레이아웃, 어긋난 비율(5:7)
- 업종별 한글 서체 조합 (카페는 나눔명조, 병원은 프리텐다드 등)
- 숫자·요일·품목명이 들어간 구체적인 카피
- 히어로를 78vh로 잘라 다음 섹션이 보이게 하는 처리
- 본문 대비 4.5:1 이상 계산 검증

---

## 구조

```
design-kit/
├── PLAYBOOK.md              전체 방법론 (모든 진입점이 이 파일을 읽는다)
├── AGENTS.md                Codex 등 범용 에이전트 진입점
├── SKILL.md                 npx skills 형식 진입점
├── commands/design.md       Claude Code 슬래시 명령
├── skills/design-kit/       Claude Code 스킬 (자동 발동)
├── data/palettes.json       컬러 팔레트 78세트, HEX 369개
├── data/tools.json          디자인 툴 883개
└── scripts/setup.*          동료 스킬 설치
```

지침이 `PLAYBOOK.md` 한 곳에만 있어서, 규칙을 고치면 모든 에이전트에 동시에 반영된다.

---

## 데이터

`tools.json`의 `seen` 값은 원본 계정에서 반복 소개된 횟수다. 3 이상이면 여러 번 검증된 툴로 볼 수 있다(35개).

원본 데이터의 한계. 무료·유료 구분은 랜딩페이지 스크린샷 기준 추정이므로 결제 전 재확인이 필요하다. 일부 HEX는 이미지 판독값이라 `note`에 재확인 표시가 있다.

---

## 라이선스

MIT. 내장 데이터는 공개 게시물에서 추출한 툴 이름·URL·색상값 등 사실 정보다.
