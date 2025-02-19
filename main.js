autoUpdater.on("update-available", async (info) => {
  log.info("Update available:", info);

  const dialogOptions = {
    file: "dialog.html",
    title: "Aggiornamento disponibile",
    message: "È disponibile una nuova versione. Vuoi scaricarla ora?",
    buttons: ["Sì", "No"],
  };

  const dialogWindow = createDialog(dialogOptions);

  // Usa `once` per rimuovere automaticamente il listener dopo l'uso
  ipcMain.once("dialog-response", (event, response) => {
    if (response === 0) {
      autoUpdater.downloadUpdate();
    } else {
      log.info("Download annullato dall'utente");
    }

    // Chiudi la finestra di dialogo se non è già distrutta
    if (!dialogWindow.isDestroyed()) {
      dialogWindow.close();
    }
  });

  // Gestisci la chiusura della finestra
  dialogWindow.on("closed", () => {
    dialogWindow = null;
  });
});

autoUpdater.on("update-downloaded", async (info) => {
  log.info("Update downloaded:", info);

  const dialogOptions = {
    file: "dialog.html",
    title: "Aggiornamento scaricato",
    message: "L'aggiornamento è stato scaricato. Vuoi riavviare l'app ora?",
    buttons: ["Riavvia", "Più tardi"],
  };

  const dialogWindow = createDialog(dialogOptions);

  // Usa `once` per rimuovere automaticamente il listener dopo l'uso
  ipcMain.once("dialog-response", (event, response) => {
    if (response === 0) {
      autoUpdater.quitAndInstall();
    } else {
      log.info("Riavvio posticipato dall'utente");
    }

    // Chiudi la finestra di dialogo se non è già distrutta
    if (!dialogWindow.isDestroyed()) {
      dialogWindow.close();
    }
  });

  // Gestisci la chiusura della finestra
  dialogWindow.on("closed", () => {
    dialogWindow = null;
  });
});
