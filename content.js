const SETTINGS = {
  blockHomeFeed: true,
  hideWatchRecommendations: true,
  hideComments: true,
  hideShorts: true,
  hideAutoplay: true,
};

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

  if (document.getElementById("minimalYoutube-blocker")) return;

  const blocker = document.createElement("div");
  blocker.id = "minimalYoutube-blocker";
  blocker.innerHTML = `
    <div style="
         ">
        
    </div>
  `;

  feed.innerHTML = "";
  feed.appendChild(blocker);
}

function hideSelectors(selectors) {
  selectors.forEach((selector) => {
    document.querySelectorAll(selector).forEach((el) => {
      el.style.setProperty("display", "none", "important");
    });
  });
}

function applyFilters() {
  if (SETTINGS.blockHomeFeed && isHomePage()) {
    blockHomeFeed();
  }

  if (SETTINGS.hideWatchRecommendations && isWatchPage()) {
    hideSelectors([
      "#related",
      "ytd-compact-video-renderer",
      "ytd-watch-next-secondary-results-renderer",
    ]);
  }

  if (SETTINGS.hideComments && isWatchPage()) {
    hideSelectors(["#comments"]);
  }

  if (SETTINGS.hideShorts) {
    hideSelectors([
      "ytd-reel-shelf-renderer",
      "ytd-rich-shelf-renderer[is-shorts]",
      "a[href*='/shorts/']",
      "ytd-reel-video-renderer",
    ]);
  }

  if (SETTINGS.hideAutoplay && isWatchPage()) {
    const toggle = document.querySelector(".ytp-autonav-toggle-button");
    if (toggle && toggle.getAttribute("aria-pressed") === "true") {
      toggle.click();
    }
  }
}

let timer;
const observer = new MutationObserver(() => {
  clearTimeout(timer);
  timer = setTimeout(applyFilters, 250);
});

function start() {
  applyFilters();
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", start);
} else {
  start();
}

