# Cinernet — Electrical Topology Dashboard
# Uruchom ten skrypt aby wystartowac aplikacje
# Pozniej otworz przegladarke na http://localhost:3000

$env:PATH = "$env:USERPROFILE\.fnm;$env:PATH"
$env:FNM_DIR = "$env:USERPROFILE\.fnm"
$fnmEnv = fnm env --shell powershell 2>&1
$fnmEnv | ForEach-Object { Invoke-Expression $_ }

Set-Location $PSScriptRoot
npm run dev
