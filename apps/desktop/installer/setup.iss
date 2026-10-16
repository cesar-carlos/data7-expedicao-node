#define MyAppName "Data7 Expedicao"
#define MyAppVersion "1.1.2"
#define MyAppExeName "Data7Expedicao.exe"
#define MyAppId "{{7E4C1A2B-9D30-4F55-8A61-2C8B0E4D6F19}"

[Setup]
AppId={#MyAppId}
UsePreviousAppDir=no
DisableDirPage=yes
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher=Data7
DefaultDirName={autopf}\Data7 Expedicao
DefaultGroupName={#MyAppName}
DisableProgramGroupPage=yes
PrivilegesRequired=admin
OutputDir=..\dist
OutputBaseFilename=Data7 Expedicao Server-Setup
Compression=lzma2
SolidCompression=yes
ArchitecturesAllowed=x64compatible
ArchitecturesInstallIn64BitMode=x64compatible
AppMutex=Local\Data7Expedicao
CloseApplications=no
UninstallDisplayIcon={app}\{#MyAppExeName}
SetupIconFile=..\assets\icon.ico
WizardStyle=modern

[Languages]
Name: "brazilianportuguese"; MessagesFile: "compiler:Languages\BrazilianPortuguese.isl"

[Dirs]
Name: "{commonappdata}\data7-expedicao"; Permissions: users-modify; Flags: uninsneveruninstall
Name: "{commonappdata}\data7-expedicao\logs"; Permissions: users-modify; Flags: uninsneveruninstall

[Files]
Source: "..\dist\win-unpacked\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{commonprograms}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"
Name: "{commondesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"

[Run]
Filename: "{app}\{#MyAppExeName}"; Description: "Iniciar Data7 Expedicao"; Flags: nowait postinstall skipifsilent

[Code]
function UninstallKey: String;
begin
  Result := ExpandConstant('Software\Microsoft\Windows\CurrentVersion\Uninstall\{#MyAppId}_is1');
end;

procedure KeepExistingConfig;
var
  OldConfig, NewConfig, NewDir: String;
begin
  OldConfig := ExpandConstant('{userappdata}\data7-expedicao\config.json');
  NewDir := ExpandConstant('{commonappdata}\data7-expedicao');
  NewConfig := NewDir + '\config.json';
  if FileExists(NewConfig) or (not FileExists(OldConfig)) then
    Exit;
  ForceDirectories(NewDir);
  if not FileCopy(OldConfig, NewConfig, False) then
    RaiseException('Não foi possível preservar a configuração existente.');
end;

procedure RemoveInstalledCopy(RootKey: Integer);
var
  UninstallString: String;
  ResultCode: Integer;
begin
  if not RegQueryStringValue(RootKey, UninstallKey, 'UninstallString', UninstallString) then
    Exit;
  UninstallString := RemoveQuotes(UninstallString);
  if not Exec(UninstallString, '/VERYSILENT /NORESTART /SUPPRESSMSGBOXES', '', SW_HIDE, ewWaitUntilTerminated, ResultCode) then
    RaiseException('Não foi possível remover a instalação anterior.');
  if ResultCode <> 0 then
    RaiseException('Feche o Data7 Expedição pela bandeja e execute o instalador de novo.');
end;

procedure CurStepChanged(CurStep: TSetupStep);
begin
  if CurStep <> ssInstall then
    Exit;
  KeepExistingConfig;
  RemoveInstalledCopy(HKLM64);
  RemoveInstalledCopy(HKLM);
  RemoveInstalledCopy(HKCU);
end;
