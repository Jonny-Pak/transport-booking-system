$ErrorActionPreference = 'Stop'
$workspacePath = Split-Path -Parent $PSScriptRoot
$envPath = Join-Path $workspacePath 'backend/.env'
if (-not (Test-Path -LiteralPath $envPath)) {
    throw 'Copy backend/.env.example to backend/.env and configure DB_PASSWORD first.'
}
# Load simple KEY=VALUE configuration as data, never as executable shell code.
foreach ($line in Get-Content -LiteralPath $envPath -Encoding UTF8) {
    if ($line -match '^\s*([A-Z][A-Z0-9_]*)=(.*)$') {
        [Environment]::SetEnvironmentVariable($Matches[1], $Matches[2], 'Process')
    }
}
Push-Location (Join-Path $workspacePath 'backend')
try {
    & .\mvnw.cmd spring-boot:run
    if ($LASTEXITCODE -ne 0) { throw "Backend exited with code $LASTEXITCODE" }
} finally { Pop-Location }
