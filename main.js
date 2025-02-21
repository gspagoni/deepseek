const { app, BrowserWindow, ipcMain } = require("electron");
const { autoUpdater } = require("electron-updater");
const log = require("electron-log");
const path = require("path");

// Configure the logger
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = "info";

// Disable default notifications
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = false;

let mainWindow;
let dialogWindow = null; // Main dialog window
let restartDialogWindow = null; // Restart dialog window

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"), // Use the preload.js file
      nodeIntegration: false, // Disable nodeIntegration for security
      contextIsolation: true, // Enable contextIsolation for security
    },
  });

  mainWindow.loadFile("index.html");

  // Check for updates
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
      preload: path.join(__dirname, "preload.js"), // Use the preload.js file
      nodeIntegration: false, // Disable nodeIntegration for security
      contextIsolation: true, // Enable contextIsolation for security
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
      preload: path.join(__dirname, "preload.js"), // Use the preload.js file
      nodeIntegration: false, // Disable nodeIntegration for security
      contextIsolation: true, // Enable contextIsolation for security
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
  log.info("Application version", app.getVersion());
});

// Auto-updater events
autoUpdater.on("checking-for-update", () => {
  log.info("Checking for updates...");
});

autoUpdater.on("update-available", (info) => {
  log.info("Update available:", info);

  const dialogOptions = {
    file: "dialog.html",
    title: "Update available",
    message: "A new version is available. Do you want to download it now?",
    buttons: ["Yes", "No"],
  };

  dialogWindow = createDialog(dialogOptions);

  ipcMain.once("dialog-response", (event, response) => {
    if (response === 0) {
      // User chose to download the update
      autoUpdater.downloadUpdate();

      // Send download progress to the dialog window
      autoUpdater.on("download-progress", (progressObj) => {
        log.info("Download progress:", progressObj); // Debug: log progress
        if (dialogWindow && !dialogWindow.isDestroyed()) {
          dialogWindow.webContents.send("download-progress", progressObj);
        }
      });
    } else {
      log.info("Download canceled by the user");
      if (dialogWindow && !dialogWindow.isDestroyed()) {
        dialogWindow.close();
      }
    }
  });
});

autoUpdater.on("update-downloaded", (info) => {
  log.info("Update downloaded:", info);

  if (dialogWindow && !dialogWindow.isDestroyed()) {
    // Notify the renderer process that the download is complete
    dialogWindow.webContents.send("download-complete");
    dialogWindow.close();
  }

  const dialogOptions = {
    file: "dialog.html",
    title: "Update downloaded",
    message:
      "The update has been downloaded. Do you want to restart the app now?",
    buttons: ["Restart", "Later"],
  };

  restartDialogWindow = createRestartDialog(dialogOptions);

  ipcMain.once("dialog-response", (event, response) => {
    if (response === 0) {
      // Close the restart window before restarting the app
      if (restartDialogWindow && !restartDialogWindow.isDestroyed()) {
        restartDialogWindow.close();
      }

      // Restart the app to apply the update
      autoUpdater.quitAndInstall();
    } else {
      log.info("Restart postponed by the user");

      // Close the restart window if the user chooses to restart later
      if (restartDialogWindow && !restartDialogWindow.isDestroyed()) {
        restartDialogWindow.close();
      }
    }
  });
});

autoUpdater.on("update-not-available", (info) => {
  log.info("No updates available:", info);
});

autoUpdater.on("error", (error) => {
  log.error("Error while checking for updates:", error);
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
