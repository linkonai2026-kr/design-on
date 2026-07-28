# designon 동료 스킬 설치 스크립트(Windows). 실패해도 designon 단독 동작에는 지장이 없다

function Write-Ok   { param($m) Write-Host "  [OK] $m" -ForegroundColor Green }
function Write-Skip { param($m) Write-Host "  [--] $m" -ForegroundColor Yellow }
function Write-Head { param($m) Write-Host "`n$m" -ForegroundColor White }

Write-Head "designon 동료 스킬 설치"
Write-Host "  designon은 이 스킬들이 없어도 혼자 동작합니다. 있으면 결과가 더 좋아집니다."

if ($null -eq (Get-Command npx -ErrorAction SilentlyContinue)) {
    Write-Skip "npx를 찾을 수 없습니다. Node.js 설치 후 다시 실행하세요."
    Write-Host "     https://nodejs.org"
    exit 0
}

Write-Head "1/2  ui-skills - 컴포넌트/모션 베이스라인"
try {
    npx -y skills add ibelick/ui-skills
    if ($LASTEXITCODE -eq 0) { Write-Ok "설치 완료" }
    else { Write-Skip "건너뜀 - 나중에: npx skills add ibelick/ui-skills" }
} catch { Write-Skip "건너뜀 - 나중에: npx skills add ibelick/ui-skills" }

Write-Head "2/2  emilkowalski/skill - 애니메이션 설계/검수"
try {
    npx -y skills add emilkowalski/skill
    if ($LASTEXITCODE -eq 0) { Write-Ok "설치 완료" }
    else { Write-Skip "건너뜀 - 나중에: npx skills add emilkowalski/skill" }
} catch { Write-Skip "건너뜀 - 나중에: npx skills add emilkowalski/skill" }

Write-Head "선택 - lazyweb (실제 제품 화면 레퍼런스 검색)"
Write-Host @"
  레이아웃 근거를 실제 서비스 화면에서 가져오고 싶다면 추가로 설치하세요.
  설치 방식이 원격 스크립트 실행이라 자동으로 돌리지 않습니다.
  Git Bash 또는 WSL에서 내용을 확인한 뒤 실행하세요.

    curl -fsSL https://www.lazyweb.com/install.sh | bash
"@

Write-Head "완료"
Write-Host @"
  이렇게 쓰면 됩니다.

    Claude Code   /designon 카페 하는데 보라색 계열 사이트 만들어줘
    Codex         카페 하는데 보라색 계열 사이트 만들어줘

  사진을 직접 생성하려면 (선택)
    `$env:GEMINI_API_KEY = "발급받은-키"

  Codex처럼 이미지 생성이 내장된 환경에서는 키가 없어도 됩니다.
"@
