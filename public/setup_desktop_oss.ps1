$dir = "C:\Users\richa\DigitalLibrary"
if (!(Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
$target = Join-Path $dir "desktop_oss_core.py"
Invoke-WebRequest -Uri "https://ais-dev-uj5kbastbyei3s7qqthk72-321034705983.us-west2.run.app/desktop_oss_core.py" -OutFile $target
Write-Host "✅ desktop_oss_core.py written to $target" -ForegroundColor Green
Write-Host "🚀 Launching Desktop OSS Core on port 8080 (PRAGMA journal_mode=WAL)..." -ForegroundColor Cyan
python $target
