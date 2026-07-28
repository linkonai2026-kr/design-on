---
description: 한 문장만 말하면 컬러·서체·사진·카피까지 정해서 완성된 웹페이지를 만든다. 병렬 7트랙 + AI 티 기계 검사.
argument-hint: 예) 카페 운영하는데 보라색 계열 사이트 만들어줘
---

사용자 요청: **$ARGUMENTS**

`${CLAUDE_PLUGIN_ROOT}/PLAYBOOK.md`를 읽고 그 절차를 처음부터 끝까지 그대로 실행해라. 요약본으로 대충 만들지 말고 원문을 읽어라.

## 반드시 지킬 것

**질문은 STEP 1에서 딱 한 번.** 팔레트 DB를 먼저 조회해 실제 후보를 손에 쥔 다음, 그 근거로 3개 이하를 한 번에 묻는다. 답을 받으면 더 묻지 말고 끝까지 만든다.

**STEP 3과 STEP 5는 병렬이다.** 서브에이전트를 한 메시지에 전부 띄운다. 하나씩 순서대로 돌리지 마라.

- STEP 3 제작 — `designon-researcher`, `designon-copywriter`, `designon-photographer`, `designon-motion`
- STEP 5 검수 — `designon-critic`, `designon-korean` (기계 검사는 직접 실행)

**기계 검사를 건너뛰지 마라.** STEP 5에서 반드시 돌린다.

```bash
node ${CLAUDE_PLUGIN_ROOT}/scripts/slopcheck.mjs site/
```

발견된 안티패턴을 STEP 6에서 일괄 수정하고 **한 번만** 재검사한다. 루프를 돌지 마라.

## 경로

| 용도 | 경로 |
|---|---|
| 팔레트 78세트 | `${CLAUDE_PLUGIN_ROOT}/data/palettes.json` |
| 디자인 툴 883개 | `${CLAUDE_PLUGIN_ROOT}/data/tools.json` |
| 품질 하한선 | `${CLAUDE_PLUGIN_ROOT}/vendor/impeccable/reference/craft-floor.md` |
| 브리프 추론·다이얼 | `${CLAUDE_PLUGIN_ROOT}/vendor/taste-skill/skills/taste-skill/SKILL.md` |
| 컴포넌트 제약 | `${CLAUDE_PLUGIN_ROOT}/vendor/ui-skills/skills/baseline-ui/SKILL.md` |
| 애니메이션 | `${CLAUDE_PLUGIN_ROOT}/vendor/emil-skill/skills/emil-design-eng/SKILL.md` |

결과물은 `site/index.html` 단일 파일이다.
