const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const { autoUpdater } = require("electron-updater");
const log = require("electron-log");
const path = require("path");

// Configura il logger
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = "info";

// Disabilita le notifiche predefinite
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = false;

let mainWindow;
let dialogWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile("index.html");

  // Controlla gli aggiornamenti
  autoUpdater.checkForUpdates();
}

function createDialog(options) {
  dialogWindow = new BrowserWindow({
    width: 400,
    height: 300,
    resizable: false,
    frame: false, // Rimuove la barra del titolo
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  dialogWindow.loadFile(options.file);

  // Passa i dati alla finestra di dialogo
  dialogWindow.webContents.on("did-finish-load", () => {
    dialogWindow.webContents.send("dialog-options", options);
  });

  dialogWindow.once("ready-to-show", () => {
    dialogWindow.show();
  });

  return dialogWindow;
}

app.whenReady().then(createWindow);

// Eventi dell'auto-updater
autoUpdater.on("update-available", async (info) => {
  log.info("Update available:", info);

  // Crea una finestra di dialogo personalizzata
  const dialogOptions = {
    file: "dialog.html",
    title: "Aggiornamento disponibile",
    message: "È disponibile una nuova versione. Vuoi scaricarla ora?",
    buttons: ["Sì", "No"],
  };

  const dialogWindow = createDialog(dialogOptions);

  // Gestisci la risposta dell'utente
  ipcMain.on("dialog-response", (event, response) => {
    if (response === 0) {
      // L'utente ha scelto di scaricare l'aggiornamento
      autoUpdater.downloadUpdate();
    } else {
      // L'utente ha scelto di non scaricare l'aggiornamento
      log.info("Download annullato dall'utente");
    }

    // Chiudi la finestra di dialogo
    dialogWindow.close();
  });
});

autoUpdater.on("update-downloaded", async (info) => {
  log.info("Update downloaded:", info);

  // Crea una finestra di dialogo personalizzata
  const dialogOptions = {
    file: "dialog.html",
    title: "Aggiornamento scaricato",
    message: "L'aggiornamento è stato scaricato. Vuoi riavviare l'app ora?",
    buttons: ["Riavvia", "Più tardi"],
  };

  const dialogWindow = createDialog(dialogOptions);

  // Gestisci la risposta dell'utente
  ipcMain.on("dialog-response", (event, response) => {
    if (response === 0) {
      // L'utente ha scelto di riavviare l'app
      autoUpdater.quitAndInstall();
    } else {
      // L'utente ha scelto di riavviare più tardi
      log.info("Riavvio posticipato dall'utente");
    }

    // Chiudi la finestra di dialogo
    dialogWindow.close();
  });
});

autoUpdater.on("error", (error) => {
  log.error("Errore durante il controllo degli aggiornamenti:", error);

  // Mostra una finestra di dialogo per l'errore
  dialog.showMessageBox(mainWindow, {
    type: "error",
    title: "Errore",
    message:
      "Si è verificato un errore durante il controllo degli aggiornamenti.",
    buttons: ["OK"],
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
