# design-on 설치 스크립트(Windows). 검사기 파서를 깔고 에이전트에 명령어를 등록한다

$Root = Split-Path -Parent $PSScriptRoot
# 에이전트가 읽을 경로는 슬래시로 통일한다
$RootForAgent = $Root -replace '\\', '/'
$Home_ = $env:USERPROFILE

function Write-Ok   { param($m) Write-Host "  [OK] $m" -ForegroundColor Green }
function Write-Skip { param($m) Write-Host "  [--] $m" -ForegroundColor Yellow }
function Write-Fail { param($m) Write-Host "  [!!] $m" -ForegroundColor Red }
function Write-Head { param($m) Write-Host "`n$m" -ForegroundColor White }

Write-Head "design-on 설치"
Write-Host "  디자인 지식은 이미 저장소 안에 다 들어 있습니다."
Write-Host "  여기서는 검사기를 켜고, 에이전트에 명령어를 등록합니다."

if ($null -eq (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Fail "Node.js를 찾을 수 없습니다. 설치 후 다시 실행하세요 - https://nodejs.org"
    Write-Host "     Node.js 없이도 페이지 생성은 되지만, AI 티 기계 검사가 돌지 않습니다."
    exit 1
}
Write-Ok "Node.js $(node -v)"

# ---------------------------------------------------------------------------
Write-Head "1/3  안티패턴 검사기"
Write-Host "  HTML/CSS를 파싱할 파서 4종을 깝니다."
Write-Host "  없으면 축소 모드로 떨어져 대비/중첩카드/크림배경 검사가 빠집니다."

try {
    npm install --prefix "$Root\vendor\impeccable" --silent
    if ($LASTEXITCODE -eq 0) { Write-Ok "파서 설치 완료" }
    else {
        Write-Fail "파서 설치 실패 - 축소 모드로 동작합니다"
        Write-Host "     나중에 다시: npm install --prefix vendor/impeccable"
    }
} catch {
    Write-Fail "파서 설치 실패 - 축소 모드로 동작합니다"
    Write-Host "     나중에 다시: npm install --prefix vendor/impeccable"
}

# ---------------------------------------------------------------------------
Write-Head "2/3  에이전트에 등록"

# {ROOT} 자리를 실제 경로로 바꿔 쓴다
function Install-File {
    param($Src, $Dest)
    $dir = Split-Path -Parent $Dest
    if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
    $text = Get-Content -Raw -Encoding utf8 $Src
    $text = $text -replace '\{ROOT\}', $RootForAgent
    $text = $text -replace '\$\{CLAUDE_PLUGIN_ROOT\}', $RootForAgent
    Set-Content -Path $Dest -Value $text -Encoding utf8
}

# 스킬 파일은 PLAYBOOK 위치를 절대경로로 알려줘야 한다
function Add-PlaybookPointer {
    param($Path)
    $ptr = "`n## 실행 지침 원문`n`n반드시 이 파일을 읽고 그대로 따른다.`n`n    $RootForAgent/PLAYBOOK.md`n"
    Add-Content -Path $Path -Value $ptr -Encoding utf8
}

# --- Claude Code ---
if (Test-Path "$Home_\.claude") {
    Install-File "$Root\commands\design-on.md" "$Home_\.claude\commands\design-on.md"

    Install-File "$Root\SKILL.md" "$Home_\.claude\skills\design-on\SKILL.md"
    Add-PlaybookPointer "$Home_\.claude\skills\design-on\SKILL.md"

    $n = 0
    Get-ChildItem "$Root\agents\design-on-*.md" | ForEach-Object {
        Install-File $_.FullName "$Home_\.claude\agents\$($_.Name)"
        $n++
    }
    Write-Ok "Claude Code - /design-on 명령 + 스킬 + 서브에이전트 ${n}종"
} else {
    Write-Skip "Claude Code 설정 폴더(~\.claude)가 없어 건너뜁니다"
}

# --- Codex ---
if (Test-Path "$Home_\.codex") {
    Install-File "$Root\SKILL.md" "$Home_\.codex\skills\design-on\SKILL.md"
    Add-PlaybookPointer "$Home_\.codex\skills\design-on\SKILL.md"
    Write-Ok "Codex - 스킬 등록"
} else {
    Write-Skip "Codex 설정 폴더(~\.codex)가 없어 건너뜁니다"
}

Write-Host ""
Write-Host "  등록한 파일은 이 저장소를 가리킵니다. 폴더를 옮기면 이 스크립트를 다시 실행하세요."

# ---------------------------------------------------------------------------
Write-Head "3/3  선택 - 사진 생성 키 (없어도 됩니다)"
Write-Host @"
  Codex처럼 이미지 생성이 내장된 환경에서는 키가 필요 없습니다.
  그 외 환경에서 AI 사진을 쓰려면

    `$env:GEMINI_API_KEY = "발급받은-키"

  키가 없으면 실사 스톡(Unsplash) → 타이포그래피 주도 순으로 폴백합니다.
  참고로 실사 스톡이 AI 생성 이미지보다 AI 티가 덜 나는 경우가 많습니다.
"@

# ---------------------------------------------------------------------------
Write-Head "끝났습니다. 이렇게 쓰세요"
Write-Host @"

    Claude Code   /design-on 카페 하는데 보라색 계열 사이트 만들어줘
    Codex         카페 하는데 보라색 계열 사이트 만들어줘

  한 문장이면 됩니다. 나머지는 질문 몇 개에 답하시면 됩니다.
  다 만들고 나면 상호명/전화번호 같은 실제 정보를 물어보고 직접 채워 드립니다.

  검사기만 따로 돌려보려면
    node $RootForAgent/scripts/slopcheck.mjs 아무_폴더/

  출처와 라이선스는 CREDITS.md에 있습니다.
"@
