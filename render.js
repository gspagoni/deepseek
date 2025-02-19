const { ipcRenderer } = require("electron");

ipcRenderer.on("update_available", () => {
  console.log("Update available");
  // Notify the user (e.g., show a notification or modal)
  alert("A new update is available. Downloading...");
});

ipcRenderer.on("update_downloaded", () => {
  console.log("Update downloaded");
  // Prompt the user to restart the app
  const shouldRestart = confirm(
    "A new update is ready. Restart the app to apply it?"
  );
  if (shouldRestart) {
    ipcRenderer.send("restart_app");
  }
});
