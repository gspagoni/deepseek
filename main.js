const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const { autoUpdater } = require("electron-updater");
const log = require("electron-log");

// Configura il logger
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = "info";

let mainWindow;

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

app.whenReady().then(createWindow);

// Eventi dell'auto-updater
autoUpdater.on("update-available", async (info) => {
  log.info("Update available:", info);

  // Mostra una finestra di dialogo per chiedere all'utente se vuole scaricare l'aggiornamento
  const { response } = await dialog.showMessageBox(mainWindow, {
    type: "info",
    title: "Aggiornamento disponibile",
    message: "È disponibile una nuova versione. Vuoi scaricarla ora?",
    buttons: ["Sì", "No"],
    defaultId: 0,
    cancelId: 1,
  });

  if (response === 0) {
    // L'utente ha scelto di scaricare l'aggiornamento
    autoUpdater.downloadUpdate();
  } else {
    // L'utente ha scelto di non scaricare l'aggiornamento
    log.info("Download annullato dall'utente");
  }
});

autoUpdater.on("update-downloaded", async (info) => {
  log.info("Update downloaded:", info);

  // Mostra una finestra di dialogo per chiedere all'utente se vuole riavviare l'app
  const { response } = await dialog.showMessageBox(mainWindow, {
    type: "info",
    title: "Aggiornamento scaricato",
    message: "L'aggiornamento è stato scaricato. Vuoi riavviare l'app ora?",
    buttons: ["Riavvia", "Più tardi"],
    defaultId: 0,
    cancelId: 1,
  });

  if (response === 0) {
    // L'utente ha scelto di riavviare l'app
    autoUpdater.quitAndInstall();
  } else {
    // L'utente ha scelto di riavviare più tardi
    log.info("Riavvio posticipato dall'utente");
  }
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
