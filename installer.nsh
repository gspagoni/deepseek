!include LogicLib.nsh
!include FileFunc.nsh

!macro customInstall

  ; Ottieni la data e l'ora correnti
  System::Call "kernel32::GetLocalTime(w .r0)" #r0 will now contain the SYSTEMTIME structure
  ; Extract the values to use
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

!macroend

!insertmacro customInstall

!macro customHeader
  ; Set the default install directory
  StrCpy $INSTDIR "$PROGRAMFILES\${APP_PRODUCT_NAME}"
!macroend

!insertmacro customHeader