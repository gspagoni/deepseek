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
let dialogWindow = null;
let restartDialogWindow = null;

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
  log.info("Finestra principale creata, avvio controllo aggiornamenti...");
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
  log.info("Aggiornamento disponibile:", JSON.stringify(info));

  const dialogOptions = {
    file: "dialog.html",
    title: "Aggiornamento disponibile",
    message: "È disponibile una nuova versione. Vuoi scaricarla ora?",
    buttons: ["Sì", "No"],
  };

  dialogWindow = createDialog(dialogOptions);

  ipcMain.once("dialog-response", (event, response) => {
    if (response === 0) {
      log.info("Utente ha scelto di scaricare l'aggiornamento");
      autoUpdater.downloadUpdate();

      autoUpdater.on("download-progress", (progressObj) => {
        log.info("Progresso del download:", JSON.stringify(progressObj));
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
  log.info("Aggiornamento scaricato con successo:", JSON.stringify(info));

  if (dialogWindow && !dialogWindow.isDestroyed()) {
    dialogWindow.close();
    dialogWindow = null;
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
      log.info("Utente ha scelto di riavviare per installare l'aggiornamento");

      // Chiudi tutte le finestre
      if (restartDialogWindow && !restartDialogWindow.isDestroyed()) {
        restartDialogWindow.close();
        restartDialogWindow = null;
      }
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.close();
        mainWindow = null;
      }

      // Esegui quitAndInstall immediatamente
      log.info("Chiusura finestre completata, avvio quitAndInstall...");
      try {
        autoUpdater.quitAndInstall(true, true); // Forza l'installazione e il riavvio
        log.info("quitAndInstall eseguito con successo"); // Questo potrebbe non essere scritto se l'app si chiude subito
      } catch (error) {
        log.error("Errore durante quitAndInstall:", error.message);
        app.quit(); // Forza la chiusura se fallisce
      }
    } else {
      log.info("Riavvio posticipato dall'utente");
      if (restartDialogWindow && !restartDialogWindow.isDestroyed()) {
        restartDialogWindow.close();
      }
    }
  });
});

autoUpdater.on("update-not-available", (info) => {
  log.info("Nessun aggiornamento disponibile:", JSON.stringify(info));
});

autoUpdater.on("error", (error) => {
  log.error("Errore durante il processo di aggiornamento:", error.message);
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
