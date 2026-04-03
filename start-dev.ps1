# ============================================================
#  QRMEAL - Dev Starter
#  Run from project root: .\start-dev.ps1
#  Opens all 4 services in separate PowerShell windows
# ============================================================

$root = Split-Path -Parent $MyInvocation.MyCommand.Path

$services = @(
    @{ label = "QRMEAL :: API (Backend)";     cmd = "npm run dev:api"      },
    @{ label = "QRMEAL :: Customer Web";       cmd = "npm run dev:customer" },
    @{ label = "QRMEAL :: Kitchen Web";        cmd = "npm run dev:kitchen"  },
    @{ label = "QRMEAL :: Admin Web";          cmd = "npm run dev:admin"    }
)

Write-Host ""
Write-Host "  =================================" -ForegroundColor DarkCyan
Write-Host "   QRMEAL Dev Environment Starter  " -ForegroundColor Cyan
Write-Host "  =================================" -ForegroundColor DarkCyan
Write-Host ""

foreach ($svc in $services) {
    Write-Host "  Starting: $($svc.label)" -ForegroundColor Yellow
    Start-Process powershell -ArgumentList @(
        "-NoExit",
        "-Command",
        "& { `$host.UI.RawUI.WindowTitle = '$($svc.label)'; Set-Location '$root'; $($svc.cmd) }"
    ) -WindowStyle Normal
    Start-Sleep -Milliseconds 600
}

Write-Host ""
Write-Host "  All 4 services launched in separate terminals!" -ForegroundColor Green
Write-Host ""
