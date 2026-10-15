$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

$Desktop = Resolve-Path (Join-Path $PSScriptRoot '..')
$Root = Resolve-Path (Join-Path $Desktop '..\..')
$NodeVersion = '26.12.0'
$Cache = Join-Path $Desktop '.cache'
$NodeHome = Join-Path $Cache "node-v$NodeVersion-win-x64"
$Zip = Join-Path $Cache "node-v$NodeVersion-win-x64.zip"
$ZipUrl = "https://nodejs.org/dist/v$NodeVersion/node-v$NodeVersion-win-x64.zip"
$Staging = Join-Path $Desktop 'staging'
$ServerStage = Join-Path $Staging 'server'
$NodeStage = Join-Path $Staging 'node'
$Iscc = 'C:\Program Files (x86)\Inno Setup 6\ISCC.exe'

function Assert-NoSecrets([string]$Directory) {
  $envFile = Join-Path $Directory 'src\.env'
  $firebase = Get-ChildItem -Path $Directory -Recurse -Filter 'secret_firebase.json' -File -ErrorAction SilentlyContinue |
    Where-Object { $_.FullName -notmatch '\\node_modules\\' }
  if (Test-Path $envFile) {
    throw 'O pacote não pode levar o arquivo .env.'
  }
  if ($firebase) {
    throw 'O pacote não pode levar o JSON do Firebase.'
  }
}

New-Item -ItemType Directory -Force -Path $Cache | Out-Null
if (-not (Test-Path (Join-Path $NodeHome 'node.exe'))) {
  if (-not (Test-Path $Zip)) {
    Write-Host "Baixando Node $NodeVersion"
    Invoke-WebRequest -Uri $ZipUrl -OutFile $Zip
  }
  if (Test-Path $NodeHome) {
    Remove-Item $NodeHome -Recurse -Force
  }
  Expand-Archive -Path $Zip -DestinationPath $Cache -Force
}

if (Test-Path $ServerStage) {
  Remove-Item $ServerStage -Recurse -Force
}
New-Item -ItemType Directory -Force -Path $NodeStage | Out-Null
Copy-Item (Join-Path $NodeHome 'node.exe') (Join-Path $NodeStage 'node.exe') -Force
$env:PATH = "$NodeHome;$env:PATH"

Push-Location $Root
try {
  Write-Host 'Compilando a API'
  npx tsc --outDir $ServerStage --pretty false
  if ($LASTEXITCODE -ne 0) { throw 'tsc da API falhou' }
  npx copyfiles './src/sql/**/*' $ServerStage
  if ($LASTEXITCODE -ne 0) { throw 'cópia do SQL falhou' }
  if (-not (Test-Path (Join-Path $ServerStage 'src\sql'))) {
    throw 'SQL compilado não ficou em src/sql, que é o caminho resolvido por __dirname.'
  }
} finally {
  Pop-Location
}

Copy-Item (Join-Path $Root 'package.json') (Join-Path $ServerStage 'package.json') -Force
Copy-Item (Join-Path $Root 'package-lock.json') (Join-Path $ServerStage 'package-lock.json') -Force
$env:DESKTOP_SERVER_PACKAGE = Join-Path $ServerStage 'package.json'
node -e "const fs=require('fs'); const file=process.env.DESKTOP_SERVER_PACKAGE; const pkg=JSON.parse(fs.readFileSync(file,'utf8')); pkg.engines={node:'>=26 <27'}; fs.writeFileSync(file, JSON.stringify(pkg,null,2));"

$npm = Join-Path $NodeHome 'npm.cmd'
Write-Host 'Instalando dependências de produção do servidor'
& $npm ci --omit=dev --prefix $ServerStage
if ($LASTEXITCODE -ne 0) { throw 'npm ci do servidor falhou' }
Assert-NoSecrets $ServerStage

Write-Host 'Testes no Node 26.12'
Push-Location $Root
try {
  & (Join-Path $NodeHome 'node.exe') .\node_modules\vitest\vitest.mjs run
  if ($LASTEXITCODE -ne 0) { throw 'npm test no Node 26 falhou' }
  & (Join-Path $NodeHome 'node.exe') .\node_modules\typescript\bin\tsc --noEmit --pretty false
  if ($LASTEXITCODE -ne 0) { throw 'tsc --noEmit no Node 26 falhou' }
} finally {
  Pop-Location
}

Push-Location $Desktop
try {
  if (-not (Test-Path (Join-Path $Desktop 'node_modules'))) {
    npm install
    if ($LASTEXITCODE -ne 0) { throw 'npm install do aplicativo falhou' }
  }
  npm run build
  if ($LASTEXITCODE -ne 0) { throw 'build do aplicativo falhou' }
  $env:CSC_IDENTITY_AUTO_DISCOVERY = 'false'
  npx electron-builder --win dir --publish never
  if ($LASTEXITCODE -ne 0) { throw 'electron-builder falhou' }
} finally {
  Pop-Location
}

$packedModules = Join-Path $Desktop 'dist\win-unpacked\resources\server\node_modules'
if (-not (Test-Path (Join-Path $packedModules 'sybase\package.json'))) {
  Write-Host 'Copiando node_modules do servidor para o pacote'
  New-Item -ItemType Directory -Force -Path $packedModules | Out-Null
  & robocopy (Join-Path $ServerStage 'node_modules') $packedModules /E /NFL /NDL /NJH /NJS /nc /ns /np
  if ($LASTEXITCODE -ge 8) { throw 'cópia do node_modules falhou' }
  $global:LASTEXITCODE = 0
}

if (-not (Test-Path $Iscc)) {
  throw "Inno Setup não encontrado em $Iscc"
}
& $Iscc (Join-Path $Desktop 'installer\setup.iss')
if ($LASTEXITCODE -ne 0) { throw 'ISCC falhou' }

Write-Host "Instalador em $(Join-Path $Desktop 'dist\Data7Expedicao-Setup.exe')"
