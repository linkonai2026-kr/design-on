# design-kit 동료 스킬 3종을 설치하는 Windows 스크립트. 실패해도 design-kit 단독 동작에는 지장이 없다

function Write-Ok   { param($m) Write-Host "  [OK] $m" -ForegroundColor Green }
function Write-Skip { param($m) Write-Host "  [--] $m" -ForegroundColor Yellow }
function Write-Head { param($m) Write-Host "`n$m" -ForegroundColor White }

Write-Head "design-kit 동료 스킬 설치"
Write-Host "  세 개 다 선택 사항입니다. 실패해도 design-kit은 그대로 동작합니다."

$hasNpx = $null -ne (Get-Command npx -ErrorAction SilentlyContinue)

Write-Head "1/3  애니메이션 스킬 (emilkowalski)"
if ($hasNpx) {
    try {
        npx -y skills add emilkowalski/skill
        if ($LASTEXITCODE -eq 0) { Write-Ok "설치 완료" }
        else { Write-Skip "건너뜀 - 나중에: npx skills add emilkowalski/skill" }
    } catch { Write-Skip "건너뜀 - 나중에: npx skills add emilkowalski/skill" }
} else {
    Write-Skip "npx 없음 - Node.js 설치 후 재시도하세요"
}

Write-Head "2/3  UI 스킬셋 (ui-skills)"
if ($hasNpx) {
    try {
        npx -y skills add ibelick/ui-skills
        if ($LASTEXITCODE -eq 0) { Write-Ok "설치 완료" }
        else { Write-Skip "건너뜀 - 나중에: npx ui-skills start" }
    } catch { Write-Skip "건너뜀 - 나중에: npx ui-skills start" }
} else {
    Write-Skip "npx 없음"
}

Write-Head "3/3  레퍼런스 검색 (lazyweb)"
Write-Host "  lazyweb은 bash 설치 스크립트를 씁니다. Git Bash 또는 WSL에서 아래를 실행하세요."
Write-Host "    curl -fsSL https://www.lazyweb.com/install.sh | bash" -ForegroundColor Cyan

Write-Head "완료"
Write-Host @"
  이제 이렇게 쓰면 됩니다.

    Claude Code   /design 카페 운영하는데 보라색 계열 사이트 만들어줘
    Codex         카페 운영하는데 보라색 계열 사이트 만들어줘

  사진을 직접 생성하려면 (선택)
    `$env:GEMINI_API_KEY = "발급받은-키"

  Codex처럼 이미지 생성이 내장된 환경에서는 키가 없어도 됩니다.
"@
