// ------------------------------
// Global State
// ------------------------------
let feed = [];
let index = 0;
let viewer = document.getElementById("viewer");

// ------------------------------
// Load Feed
// ------------------------------
document.getElementById("loadBtn").onclick = async () => {
  let url = document.getElementById("feedUrl").value.trim();
  if (!url) return alert("Enter a URL");

  try {
    let res = await fetch(url);
    feed = (await res.json()).items || [];
    if (!feed.length) {
      alert("Feed has no items");
      return;
    }
    document.getElementById("feedInput").style.display = "none";
    index = 0;
    showSlide(index);
  } catch (e) {
    alert("Failed to load feed: " + e);
  }
};

// ------------------------------
// Render a slide
// ------------------------------
function createSlide(item) {
  let div = document.createElement("div");
  div.className = "slide";

  if (item.type === "video") {
    let v = document.createElement("video");
    v.src = item.url;
    v.autoplay = true;
    v.loop = true;
    v.muted = true;
    v.playsInline = true;
    div.appendChild(v);
  } else {
    let img = document.createElement("img");
    img.src = item.url;
    div.appendChild(img);
  }

  return div;
}

function showSlide(i) {
  viewer.innerHTML = "";
  viewer.appendChild(createSlide(feed[i]));
  preload(i + 1);
}

function preload(i) {
  if (i >= feed.length) return;
  let item = feed[i];
  if (item.type === "video") {
    let v = document.createElement("video");
    v.src = item.url;
  } else {
    let img = new Image();
    img.src = item.url;
  }
}

// ------------------------------
// Swipe handling
// ------------------------------
let startY = 0;

viewer.addEventListener("touchstart", e => {
  startY = e.touches[0].clientY;
});

viewer.addEventListener("touchend", e => {
  let endY = e.changedTouches[0].clientY;
  let dy = endY - startY;

  if (Math.abs(dy) < 50) return;

  if (dy < 0 && index < feed.length - 1) {
    index++;
    showSlide(index);
  } else if (dy > 0 && index > 0) {
    index--;
    showSlide(index);
  }
});

// Install service worker
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js");
}
