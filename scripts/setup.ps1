# designon 설치 스크립트(Windows). 안티패턴 디텍터 파서를 깔고 선택 스킬을 안내한다

$Root = Split-Path -Parent $PSScriptRoot

function Write-Ok   { param($m) Write-Host "  [OK] $m" -ForegroundColor Green }
function Write-Skip { param($m) Write-Host "  [--] $m" -ForegroundColor Yellow }
function Write-Fail { param($m) Write-Host "  [!!] $m" -ForegroundColor Red }
function Write-Head { param($m) Write-Host "`n$m" -ForegroundColor White }

Write-Head "designon 설치"
Write-Host "  스킬 지식은 이미 vendor/에 들어 있습니다. 여기서는 검사기만 켭니다."

if ($null -eq (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Fail "Node.js를 찾을 수 없습니다. 설치 후 다시 실행하세요 - https://nodejs.org"
    Write-Host "     Node.js 없이도 페이지 생성은 되지만, AI 티 기계 검사가 돌지 않습니다."
    exit 1
}
Write-Ok "Node.js $(node -v)"

# ---------------------------------------------------------------------------
Write-Head "1/3  안티패턴 디텍터 (필수)"
Write-Host "  Impeccable 디텍터가 HTML/CSS를 파싱하려면 파서 4종이 필요합니다."
Write-Host "  없으면 축소 모드로 떨어져 대비/중첩카드/크림배경 검사가 빠집니다."
Write-Host ""

try {
    npm install --prefix "$Root\vendor\impeccable" --silent
    if ($LASTEXITCODE -eq 0) {
        Write-Ok "파서 설치 완료"
    } else {
        Write-Fail "파서 설치 실패 - 축소 모드로 동작합니다"
        Write-Host "     나중에 다시: npm install --prefix vendor/impeccable"
    }
} catch {
    Write-Fail "파서 설치 실패 - 축소 모드로 동작합니다"
    Write-Host "     나중에 다시: npm install --prefix vendor/impeccable"
}

# ---------------------------------------------------------------------------
Write-Head "2/3  선택 - lazyweb (실제 제품 화면 레퍼런스)"
Write-Host @"
  레이아웃 근거를 실제 서비스 화면에서 가져오고 싶다면 설치하세요.
  없어도 designon은 웹 검색으로 대체합니다.

  설치 방식이 원격 스크립트 실행이라 자동으로 돌리지 않습니다.
  Git Bash 또는 WSL에서 내용을 확인한 뒤 직접 실행하세요.

    curl -fsSL https://www.lazyweb.com/install.sh | less    # 먼저 읽어보기
    curl -fsSL https://www.lazyweb.com/install.sh | bash    # 설치
"@

# ---------------------------------------------------------------------------
Write-Head "3/3  선택 - 사진 생성 키"
Write-Host @"
  Codex처럼 이미지 생성이 내장된 환경에서는 키가 필요 없습니다.
  그 외 환경에서 AI 사진을 쓰려면

    `$env:GEMINI_API_KEY = "발급받은-키"

  키가 없으면 실사 스톡(Unsplash) → 타이포그래피 주도 순으로 폴백합니다.
  참고로 실사 스톡이 AI 생성 이미지보다 AI 티가 덜 나는 경우가 많습니다.
"@

# ---------------------------------------------------------------------------
Write-Head "완료"
Write-Host @"
  이렇게 쓰면 됩니다.

    Claude Code   /designon 카페 하는데 보라색 계열 사이트 만들어줘
    Codex         카페 하는데 보라색 계열 사이트 만들어줘

  Claude Code에 플러그인으로 등록하려면 이 폴더 경로를 쓰세요.
    $Root

  검사기를 따로 돌려보려면
    node scripts/slopcheck.mjs site/

  출처와 라이선스는 CREDITS.md에 있습니다.
"@
