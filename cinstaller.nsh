!include "MUI2.nsh"
!include "FileFunc.nsh"

Section -Post
  ClearErrors
  FileOpen $0 "$INSTDIR\config.json" w
  IfErrors done
  FileWrite $0 "{$\r$\n"
  FileWrite $0 '  "installPath": "$INSTDIR",$\r$\n'
  FileWrite $0 '  "version": "${VERSION}",$\r$\n'
  FileWrite $0 '  "timestamp": "$SYSTIMESTAMP"$\r$\n'
  FileWrite $0 "}$\r$\n"
  FileClose $0
done:
SectionEnd