document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("toggle") as HTMLButtonElement;
  const status = document.getElementById("status") as HTMLElement;
  const presetBtns = document.querySelectorAll<HTMLButtonElement>("[data-preset]");

  let enabled = true;
  let currentPreset = "medium";

  function updateUI() {
    toggle.textContent = enabled ? "STEAD: ON" : "STEAD: OFF";
    toggle.className = enabled
      ? "w-full py-2 rounded-lg text-sm font-semibold bg-green-400 text-slate-950 transition-all"
      : "w-full py-2 rounded-lg text-sm font-semibold bg-slate-700 text-slate-400 transition-all";
    presetBtns.forEach(btn => {
      const isActive = btn.dataset.preset === currentPreset;
      btn.className = isActive
        ? "flex-1 py-1.5 rounded-md text-xs font-medium bg-green-400/20 border border-green-400/60 text-green-300 transition-all"
        : "flex-1 py-1.5 rounded-md text-xs font-medium bg-slate-800 border border-slate-700 text-slate-400 transition-all";
    });
  }

  if (typeof chrome !== "undefined" && chrome.storage) {
    chrome.storage.local.get(["steadEnabled", "steadPreset"], (result) => {
      enabled = result.steadEnabled !== false;
      currentPreset = result.steadPreset ?? "medium";
      updateUI();
    });
  } else {
    updateUI();
  }

  toggle.addEventListener("click", () => {
    enabled = !enabled;
    chrome.storage.local.set({ steadEnabled: enabled });
    updateUI();
  });

  presetBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      currentPreset = btn.dataset.preset!;
      chrome.storage.local.set({ steadPreset: currentPreset });
      updateUI();
    });
  });
});