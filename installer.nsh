!include LogicLib.nsh
!include FileFunc.nsh
!include MUI2.nsh  ; Include la Modern UI

!define MUI_WELCOMEPAGE_TITLE "Deepseek Installer"
!define MUI_WELCOMEPAGE_TEXT "Benvenuto nell'installer di Deepseek."
!define MUI_FINISHPAGE_RUN "$INSTDIR\your_executable.exe"  ; Modifica con il nome del tuo eseguibile

!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES

; Definisci le lingue supportate
!insertmacro MUI_LANGUAGE "English"

Section "Install" Sec01
  SetOutPath $INSTDIR

  ; Ottieni la data e l'ora correnti
  System::Call "kernel32::GetLocalTime(w .r0)"
  StrCpy $year $r0 0 4
  StrCpy $month $r0 4 2
  StrCpy $day $r0 6 2
  StrCpy $hour $r0 8 2
  StrCpy $minute $r0 10 2
  StrCpy $second $r0 12 2

  ; Formatta la data e l'ora in formato ISO 8601 (YYYY-MM-DDTHH:mm:ss)
  StrCpy $timestamp "$year-$month-$day`T$hour:$minute:$second"

  ; Crea il contenuto del file config.json
  StrCpy $config '{\r\n'
  StrCpy $config "$config  \"installationPath\": \"$INSTDIR\",\r\n"
  StrCpy $config "$config  \"version\": \"${APP_VERSION}\",\r\n"  ; APP_VERSION è fornita da electron-builder
  StrCpy $config "$config  \"installationTimestamp\": \"$timestamp\"\r\n"
  StrCpy $config "$config }"

  ; Scrivi il file config.json
  FileOpen $configFile $INSTDIR\config.json w
  ${If} $configFile != error
    FileWrite $configFile $config
    FileClose $configFile
  ${Else}
    MessageBox MB_OK "Errore durante la creazione del file config.json!"
  ${EndIf}

  ; Imposta l'immagine header
  SetBrandingImage "headerImage.bmp"

  ; Scrivi i file dell'applicazione (esempio)
  File /r *.*

SectionEnd

Section "Uninstall"
  ; Codice per disinstallare l'applicazione (rimuovere file, chiavi di registro, ecc.)
  Delete "$INSTDIR\config.json"
  RMDir /r "$INSTDIR"
SectionEnd

Function .onInit
  ; Imposta la directory di installazione predefinita
  StrCpy $INSTDIR "$PROGRAMFILES\${APP_PRODUCT_NAME}"
FunctionEnd