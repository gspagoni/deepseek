!include "MUI2.nsh"
!include "FileFunc.nsh"

Name "Mia Applicazione"
OutFile "dist\Installer.exe"
InstallDir "$PROGRAMFILES\Mia Applicazione"
RequestExecutionLevel admin

!define MUI_PAGE_CUSTOMFUNCTION_LEAVE "DirectoryLeave"
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

!insertmacro MUI_LANGUAGE "Italian"

Section "MainSection" SEC01
  SetOutPath "$INSTDIR"
  File /r ".\dist\win-unpacked\*.*"
SectionEnd

Function DirectoryLeave
  StrCpy $INSTDIR $INSTDIR
FunctionEnd

Section -Post
  ClearErrors
  FileOpen $0 "$INSTDIR\config.json" w
  IfErrors done
  FileWrite $0 "{$\r$\n"
  FileWrite $0 '  "installPath": "$INSTDIR",$\r$\n'
  FileWrite $0 '  "version": "1.0.0",$\r$\n' ; Sostituisci con la tua versione
  FileWrite $0 '  "timestamp": "$SYSTIMESTAMP"$\r$\n'
  FileWrite $0 "}$\r$\n"
  FileClose $0
done:
SectionEnd