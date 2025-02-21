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
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.loadFile("index.html");
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
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
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
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
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
      autoUpdater.downloadUpdate();

      autoUpdater.on("download-progress", (progressObj) => {
        log.info("Progresso del download:", progressObj);
        if (dialogWindow && !dialogWindow.isDestroyed()) {
          dialogWindow.webContents.send("download-progress", progressObj);
        }
      });
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

  // Chiudi la finestra di download immediatamente
  if (dialogWindow && !dialogWindow.isDestroyed()) {
    dialogWindow.close();
    dialogWindow = null; // Assicurati che la variabile venga resettata
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
      // Chiudi tutte le finestre prima di avviare l'aggiornamento
      if (restartDialogWindow && !restartDialogWindow.isDestroyed()) {
        restartDialogWindow.close();
        restartDialogWindow = null; // Resetta la variabile
      }
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.close();
        mainWindow = null; // Resetta la variabile
      }

      // Ritarda leggermente il quitAndInstall per garantire che tutte le finestre siano chiuse
      setTimeout(() => {
        autoUpdater.quitAndInstall();
      }, 100);
    } else {
      log.info("Riavvio posticipato dall'utente");
      if (restartDialogWindow && !restartDialogWindow.isDestroyed()) {
        restartDialogWindow.close();
      }
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
