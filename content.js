let enabled = true;
let observer;
let timer;
let savedHomeFeed = null;

const STYLE_ID = "minimalYoutube-style";

const CSS = `
#minimalYoutube-blocker {
  width: 100%;
}

#minimalYoutube-blocker > div {
  width: 100%;
}

ytd-reel-shelf-renderer,
ytd-rich-shelf-renderer[is-shorts],
ytd-reel-video-renderer,
a[href*="/shorts/"] {
  display: none !important;
}

#related,
ytd-compact-video-renderer,
ytd-watch-next-secondary-results-renderer,
ytd-mini-guide-renderer,
ytd-live-chat-frame,
yt-video-metadata-carousel-view-model,
#comments,
#guide-button,
#secondary {
  display: none !important;
}
`;

function injectStyle() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = CSS;
  document.head.appendChild(style);
}

function removeStyle() {
  document.getElementById(STYLE_ID)?.remove();
}

function isHomePage() {
  return location.pathname === "/";
}

function isWatchPage() {
  return location.pathname === "/watch";
}

function blockHomeFeed() {
  const feed =
    document.querySelector("ytd-browse[page-subtype='home'] #primary") ||
    document.querySelector("ytd-browse[page-subtype='home'] #contents") ||
    document.querySelector("ytd-two-column-browse-results-renderer #primary");

  if (!feed) return;

  if (!savedHomeFeed) {
    savedHomeFeed = feed.cloneNode(true);
  }

  if (!document.getElementById("minimalYoutube-blocker")) {
    feed.innerHTML = "";
    const blocker = document.createElement("div");
    blocker.id = "minimalYoutube-blocker";
    blocker.innerHTML = "<div></div>";
    feed.appendChild(blocker);
  }
}

function restoreHomeFeed() {
  const feed =
    document.querySelector("ytd-browse[page-subtype='home'] #primary") ||
    document.querySelector("ytd-browse[page-subtype='home'] #contents") ||
    document.querySelector("ytd-two-column-browse-results-renderer #primary");

  if (!feed || !savedHomeFeed) return;
  feed.replaceWith(savedHomeFeed.cloneNode(true));
}

function hideSelectors(selectors) {
  selectors.forEach((selector) => {
    document.querySelectorAll(selector).forEach((el) => {
      el.dataset.minimalYoutubeHidden = "1";
      el.style.setProperty("display", "none", "important");
    });
  });
}

function restoreHiddenElements() {
  document.querySelectorAll("[data-minimal-youtube-hidden], [data-minimalYoutubeHidden='1']").forEach((el) => {
    el.style.removeProperty("display");
    delete el.dataset.minimalYoutubeHidden;
  });
}

function applyFilters() {
  if (!enabled) return;

  injectStyle();

  if (isHomePage()) {
    blockHomeFeed();
  }

  if (isWatchPage()) {
    hideSelectors([
      "#related",
      "ytd-compact-video-renderer",
      "ytd-watch-next-secondary-results-renderer",
      "#comments",
    ]);
  }

  hideSelectors([
    "ytd-reel-shelf-renderer",
    "ytd-rich-shelf-renderer[is-shorts]",
    "ytd-reel-video-renderer",
    'a[href*="/shorts/"]',
  ]);
}

function startObserver() {
  observer = new MutationObserver(() => {
    clearTimeout(timer);
    timer = setTimeout(applyFilters, 250);
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
}

function stopObserver() {
  observer?.disconnect();
}

function turnOn() {
  enabled = true;
  injectStyle();
  applyFilters();
  startObserver();
}

function turnOff() {
  enabled = false;
  stopObserver();
  removeStyle();
  restoreHiddenElements();
  restoreHomeFeed();
}

chrome.storage.local.get({ enabled: true }, ({ enabled: storedEnabled }) => {
  if (storedEnabled) turnOn();
  else turnOff();
});

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "setEnabled") {
    msg.enabled ? turnOn() : turnOff();
  }
});

