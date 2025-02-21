const { app, BrowserWindow, ipcMain } = require("electron");
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
let dialogWindow = null; // Finestra di dialogo principale
let restartDialogWindow = null; // Finestra di dialogo per il riavvio

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"), // Usa il file preload.js
      nodeIntegration: false, // Disabilita nodeIntegration per sicurezza
      contextIsolation: true, // Abilita contextIsolation per sicurezza
    },
  });

  mainWindow.loadFile("index.html");

  // Controlla gli aggiornamenti
  autoUpdater.checkForUpdates();
}

function createDialog(options) {
  if (dialogWindow && !dialogWindow.isDestroyed()) {
    dialogWindow.close();
  }

  dialogWindow = new BrowserWindow({
    width: 400,
    height: 300,
    resizable: false,
    frame: false,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"), // Usa il file preload.js
      nodeIntegration: false, // Disabilita nodeIntegration per sicurezza
      contextIsolation: true, // Abilita contextIsolation per sicurezza
    },
  });

  dialogWindow.loadFile("dialog.html");

  dialogWindow.webContents.on("did-finish-load", () => {
    if (dialogWindow && !dialogWindow.isDestroyed()) {
      dialogWindow.webContents.send("dialog-options", options);
    }
  });

  dialogWindow.once("ready-to-show", () => {
    if (dialogWindow && !dialogWindow.isDestroyed()) {
      dialogWindow.show();
    }
  });

  dialogWindow.on("closed", () => {
    dialogWindow = null;
  });

  return dialogWindow;
}

function createRestartDialog(options) {
  if (restartDialogWindow && !restartDialogWindow.isDestroyed()) {
    restartDialogWindow.close();
  }

  restartDialogWindow = new BrowserWindow({
    width: 400,
    height: 300,
    resizable: false,
    frame: false,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"), // Usa il file preload.js
      nodeIntegration: false, // Disabilita nodeIntegration per sicurezza
      contextIsolation: true, // Abilita contextIsolation per sicurezza
    },
  });

  restartDialogWindow.loadFile("dialog.html");

  restartDialogWindow.webContents.on("did-finish-load", () => {
    if (restartDialogWindow && !restartDialogWindow.isDestroyed()) {
      restartDialogWindow.webContents.send("dialog-options", options);
    }
  });

  restartDialogWindow.once("ready-to-show", () => {
    if (restartDialogWindow && !restartDialogWindow.isDestroyed()) {
      restartDialogWindow.show();
    }
  });

  restartDialogWindow.on("closed", () => {
    restartDialogWindow = null;
  });

  return restartDialogWindow;
}

app.whenReady().then(() => {
  createWindow();
  log.info("Applicazione versione", app.getVersion());
});

// Eventi dell'auto-updater
autoUpdater.on("checking-for-update", () => {
  log.info("Controllo degli aggiornamenti in corso...");
});

autoUpdater.on("update-available", (info) => {
  log.info("Aggiornamento disponibile:", info);

  const dialogOptions = {
    file: "dialog.html",
    title: "Aggiornamento disponibile",
    message: "È disponibile una nuova versione. Vuoi scaricarla ora?",
    buttons: ["Sì", "No"],
  };

  dialogWindow = createDialog(dialogOptions);

  ipcMain.once("dialog-response", (event, response) => {
    if (response === 0) {
      // L'utente ha scelto di scaricare l'aggiornamento
      autoUpdater.downloadUpdate();

      // Invia i progressi del download alla finestra di dialogo
      autoUpdater.on("download-progress", (progressObj) => {
        log.info("Progresso del download:", progressObj); // Debug: log del progresso
        if (dialogWindow && !dialogWindow.isDestroyed()) {
          dialogWindow.webContents.send("download-progress", progressObj);
        }
      });

      // Mostra la progress bar nella finestra di dialogo
      if (dialogWindow && !dialogWindow.isDestroyed()) {
        dialogWindow.webContents.send("show-progress-bar");
      }
    } else {
      log.info("Download annullato dall'utente");
      if (dialogWindow && !dialogWindow.isDestroyed()) {
        dialogWindow.close();
      }
    }
  });
});

autoUpdater.on("update-downloaded", (info) => {
  log.info("Aggiornamento scaricato:", info);

  if (dialogWindow && !dialogWindow.isDestroyed()) {
    dialogWindow.close();
  }

  const dialogOptions = {
    file: "dialog.html",
    title: "Aggiornamento scaricato",
    message: "L'aggiornamento è stato scaricato. Vuoi riavviare l'app ora?",
    buttons: ["Riavvia", "Più tardi"],
  };

  restartDialogWindow = createRestartDialog(dialogOptions);

  ipcMain.once("dialog-response", (event, response) => {
    if (response === 0) {
      // Riavvia l'app per applicare l'aggiornamento
      autoUpdater.quitAndInstall();
    } else {
      log.info("Riavvio posticipato dall'utente");
    }

    if (restartDialogWindow && !restartDialogWindow.isDestroyed()) {
      restartDialogWindow.close();
    }
  });
});

autoUpdater.on("update-not-available", (info) => {
  log.info("Nessun aggiornamento disponibile:", info);
});

autoUpdater.on("error", (error) => {
  log.error("Errore durante il controllo degli aggiornamenti:", error);
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
