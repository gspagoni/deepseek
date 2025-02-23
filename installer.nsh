!include LogicLib.nsh
!include FileFunc.nsh

; Dichiarazione delle variabili
Var year
Var month
Var day
Var hour
Var minute
Var second
Var timestamp
Var config
Var configFile
Var appVersion  ; Variabile per memorizzare la versione dell'app

Section "Install" Sec01
  SetOutPath $INSTDIR

  ; Leggi la variabile d'ambiente APP_VERSION
  ReadEnvStr $appVersion "APP_VERSION"

  ; Ottieni la data e l'ora correnti usando System.dll
  System::Call "kernel32::GetLocalTime(w .r0)"
  System::Get $year $r0 0  ; year
  System::Get $month $r0 2 ; month
  System::Get $day $r0 4   ; day
  System::Get $hour $r0 6  ; hour
  System::Get $minute $r0 8 ; minute
  System::Get $second $r0 10 ; second

  ; Formatta la data e l'ora in formato ISO 8601 (YYYY-MM-DDTHH:mm:ss)
  StrCpy $timestamp "$year-$month-$day`T$hour:$minute:$second"

  ; Crea il contenuto del file config.json
  StrCpy $config '{\r\n'
  StrCpy $config "$config  \"installationPath\": \"$INSTDIR\",\r\n"
  StrCpy $config "$config  \"version\": \"$appVersion\",\r\n"    ; Versione dell'app
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

  ; Scrivi i file dell'applicazione (esempio)
  File /r *.*

SectionEnd

Section "Uninstall"
  ; Codice per disinstallare l'applicazione (rimuovere file, chiavi di registro, ecc.)
  Delete "$INSTDIR\config.json"
  RMDir /r "$INSTDIR"
SectionEnd