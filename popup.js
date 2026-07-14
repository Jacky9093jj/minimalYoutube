
const toggleBtn = document.getElementById("toggleBtn");
const switchEl = document.getElementById("switch");
const labelEl = document.getElementById("label");

function render(enabled) {
  switchEl.classList.toggle("on", enabled);
  labelEl.textContent = enabled ? "ON" : "OFF";
}

chrome.storage.local.get({ enabled: true }, ({ enabled }) => {
  render(enabled);
});

toggleBtn.addEventListener("click", () => {
  chrome.storage.local.get({ enabled: true }, ({ enabled }) => {
    const newValue = !enabled;
    chrome.storage.local.set({ enabled: newValue }, () => {
      render(newValue);
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, {
            type: "setEnabled",
            enabled: newValue,
          });
        }
      });
    });
  });
});

