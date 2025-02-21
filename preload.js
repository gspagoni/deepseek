const { contextBridge, ipcRenderer } = require("electron");

// Expose a secure API to the renderer process
contextBridge.exposeInMainWorld("electronAPI", {
  // Method to send a response to the dialog
  sendDialogResponse: (response) =>
    ipcRenderer.send("dialog-response", response),

  // Method to receive dialog options
  onDialogOptions: (callback) =>
    ipcRenderer.on("dialog-options", (event, options) => callback(options)),

  // Method to receive download progress
  onDownloadProgress: (callback) =>
    ipcRenderer.on("download-progress", (event, progress) =>
      callback(progress)
    ),

  // Method to notify download completion
  onDownloadComplete: (callback) =>
    ipcRenderer.on("download-complete", () => callback()),
});
