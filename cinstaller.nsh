!include "MUI2.nsh"
!include "FileFunc.nsh"

RequestExecutionLevel admin

Section "Uninstall"
  ExecWait 'taskkill /F /IM "Deepseek.exe"'
SectionEnd

Section -Post
  ClearErrors
  FileOpen $0 "$INSTDIR\config.json" w
  IfErrors error
  FileWrite $0 "{$\r$\n"
  FileWrite $0 '  "installPath": "$INSTDIR",$\r$\n'
  FileWrite $0 '  "version": "9.10.12",$\r$\n'
  FileWrite $0 '  "timestamp": "$SYSTIMESTAMP"$\r$\n'
  FileWrite $0 "}$\r$\n"
  FileClose $0
  MessageBox MB_OK "config.json creato con successo in $INSTDIR"
  Goto done
error:
  MessageBox MB_OK "Errore nella creazione di config.json"
done:
SectionEnd