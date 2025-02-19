const { app, BrowserWindow, ipcMain } = require("electron");
const { autoUpdater } = require("electron-updater");
const log = require("electron-log");

// Configure logging
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

  // Check for updates
  autoUpdater.checkForUpdatesAndNotify();
}

app.whenReady().then(createWindow);

// Auto-updater events
autoUpdater.on("update-available", () => {
  log.info("Update available");
  mainWindow.webContents.send("update_available");
});

autoUpdater.on("update-downloaded", () => {
  log.info("Update downloaded");
  mainWindow.webContents.send("update_downloaded");
});

autoUpdater.on("error", (error) => {
  log.error("Error in auto-updater:", error);
  mainWindow.webContents.send("error");
});

// Quit and install the update
ipcMain.on("restart_app", () => {
  autoUpdater.quitAndInstall();
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
