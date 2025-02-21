// Use the API exposed by preload.js
window.electronAPI.onDialogOptions((options) => {
  document.getElementById("dialog-title").textContent = options.title;
  document.getElementById("dialog-message").textContent = options.message;

  // Handle button clicks
  document.getElementById("btn-yes").addEventListener("click", () => {
    window.electronAPI.sendDialogResponse(0); // "Yes" response

    // Show the progress bar and progress info
    const progressBar = document.getElementById("progress-bar");
    const progressInfo = document.getElementById("progress-info");
    progressBar.style.display = "block";
    progressInfo.style.display = "block";
  });

  document.getElementById("btn-no").addEventListener("click", () => {
    window.electronAPI.sendDialogResponse(1); // "No" response
  });
});

// Update the progress bar and progress info
window.electronAPI.onDownloadProgress((progress) => {
  console.log("Download progress received:", progress); // Debug: log progress

  // Update the progress bar
  const progressBarInner = document.getElementById("progress-bar-inner");
  const percent = progress.percent || 0;
  progressBarInner.style.width = `${percent}%`;

  // Update the completion percentage
  const progressPercent = document.getElementById("progress-percent");
  progressPercent.textContent = `${percent.toFixed(1)}%`;

  // Update the transferred bytes (converted to MB)
  const progressTransferred = document.getElementById("progress-transferred");
  const transferredMB = (progress.transferred / 1024 / 1024).toFixed(2);
  progressTransferred.textContent = `${transferredMB} MB`;

  // Update the download speed (converted to KB/s)
  const progressSpeed = document.getElementById("progress-speed");
  const speedKBps = (progress.bytesPerSecond / 1024).toFixed(2);
  progressSpeed.textContent = `${speedKBps} KB/s`;
});

// Hide the progress bar and progress info when the download is complete
window.electronAPI.onDownloadComplete(() => {
  const progressBar = document.getElementById("progress-bar");
  const progressInfo = document.getElementById("progress-info");
  progressBar.style.display = "none";
  progressInfo.style.display = "none";
});
