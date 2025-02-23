!include "MUI2.nsh"
!include "FileFunc.nsh"

RequestExecutionLevel admin

Section "CreateConfig" SEC01
  CreateDirectory "$INSTDIR"
  ClearErrors

  ; Usa cmd per ottenere il timestamp direttamente
  nsExec::ExecToStack 'cmd /c echo %DATE% %TIME%'
  Pop $0 ; Codice di uscita
  Pop $3 ; Output del comando (timestamp)
  StrCmp $0 0 0 error_timestamp_exec

  ; Rimuove eventuali newline o spazi finali dal timestamp
  StrCpy $4 $3 -2 ; Taglia gli ultimi 2 caratteri (di solito "\r\n")

  ; Scrive il config.json
  FileOpen $0 "$INSTDIR\config.json" w
  IfErrors error_config_open
  FileWrite $0 "{$\r$\n"
  FileWrite $0 "  $\"installPath$\": $\"$INSTDIR$\",$\r$\n"
  FileWrite $0 "  $\"version$\": $\"${VERSION}$\",$\r$\n"
  FileWrite $0 "  $\"timestamp$\": $\"$4$\"$\r$\n"
  FileWrite $0 "}$\r$\n"
  FileClose $0
  Goto done ; Nessun messaggio in caso di successo

error_timestamp_exec:
  MessageBox MB_OK "Errore: Impossibile ottenere il timestamp, codice: $0"
  Goto done
error_config_open:
  MessageBox MB_OK "Errore: Impossibile creare config.json in $INSTDIR"
  Goto done

done:
SectionEnd