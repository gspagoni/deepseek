!include "MUI2.nsh"
!include "FileFunc.nsh"

RequestExecutionLevel admin

Function .onInstSuccess
  CreateDirectory "$INSTDIR"
  ClearErrors

  ; Crea un file batch temporaneo per ottenere il timestamp
  FileOpen $1 "$TEMP\gettime.bat" w
  FileWrite $1 "@echo off\r\n"
  FileWrite $1 "echo %DATE% %TIME% > \"$INSTDIR\\timestamp.txt\"\r\n"
  FileClose $1

  ; Esegue il batch e aspetta
  ExecWait '"$TEMP\gettime.bat"'

  ; Legge il timestamp dal file temporaneo
  ClearErrors
  FileOpen $2 "$INSTDIR\timestamp.txt" r
  IfErrors error
  FileRead $2 $3
  FileClose $2
  Delete "$INSTDIR\timestamp.txt"
  Delete "$TEMP\gettime.bat"

  ; Scrive il config.json
  FileOpen $0 "$INSTDIR\config.json" w
  IfErrors error
  FileWrite $0 "{\r\n"
  FileWrite $0 "  \"installPath\": \"$INSTDIR\",\r\n"
  FileWrite $0 "  \"version\": \"9.10.15\",\r\n"
  FileWrite $0 "  \"timestamp\": \"$3\"\r\n" ; $3 contiene il timestamp
  FileWrite $0 "}\r\n"
  FileClose $0
  MessageBox MB_OK "config.json creato con successo in $INSTDIR"
  Goto done

error:
  MessageBox MB_OK "Errore nella creazione di config.json"
done:
FunctionEnd