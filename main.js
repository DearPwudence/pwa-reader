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
let currentY = 0;
let dragging = false;
let dragStartTime = 0;

let currentSlideEl = null;
let nextSlideEl = null;
let prevSlideEl = null;

function renderSlides() {
    viewer.innerHTML = "";

    currentSlideEl = createSlide(feed[index]);
    currentSlideEl.style.transform = "translateY(0px)";
    viewer.appendChild(currentSlideEl);

    if (index < feed.length - 1) {
        nextSlideEl = createSlide(feed[index + 1]);
        nextSlideEl.style.transform = "translateY(100vh)";
        viewer.appendChild(nextSlideEl);
    } else {
        nextSlideEl = null;
    }

    if (index > 0) {
        prevSlideEl = createSlide(feed[index - 1]);
        prevSlideEl.style.transform = "translateY(-100vh)";
        viewer.appendChild(prevSlideEl);
    } else {
        prevSlideEl = null;
    }
}

// replace your showSlide with:
function showSlide(i) {
    index = i;
    renderSlides();
}

function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
}

viewer.addEventListener("touchstart", e => {
    startY = e.touches[0].clientY;
    currentY = startY;
    dragging = true;
    dragStartTime = performance.now();

    // Disable transitions while dragging
    if (currentSlideEl) currentSlideEl.style.transition = "none";
    if (nextSlideEl) nextSlideEl.style.transition = "none";
    if (prevSlideEl) prevSlideEl.style.transition = "none";
});

viewer.addEventListener("touchmove", e => {
    if (!dragging) return;

    let y = e.touches[0].clientY;
    let dy = y - startY;
    currentY = y;

    // Move current slide with finger
    if (currentSlideEl) {
        currentSlideEl.style.transform = `translateY(${dy}px)`;
    }

    // Move next and previous slides accordingly
    if (nextSlideEl) {
        nextSlideEl.style.transform = `translateY(${100 + (dy / window.innerHeight) * 100}vh)`;
    }
    if (prevSlideEl) {
        prevSlideEl.style.transform = `translateY(${-100 + (dy / window.innerHeight) * 100}vh)`;
    }
});

viewer.addEventListener("touchend", e => {
    if (!dragging) return;
    dragging = false;

    let dy = currentY - startY;
    let dt = performance.now() - dragStartTime;
    let velocity = dy / dt;  // px per ms

    // Momentum threshold
    let fastSwipe = Math.abs(velocity) > 0.6;
    let farSwipe = Math.abs(dy) > window.innerHeight * 0.25;

    let goNext = dy < 0 && (fastSwipe || farSwipe) && index < feed.length - 1;
    let goPrev = dy > 0 && (fastSwipe || farSwipe) && index > 0;

    // Re-enable transitions for the snap animation
    if (currentSlideEl) currentSlideEl.style.transition = "";
    if (nextSlideEl) nextSlideEl.style.transition = "";
    if (prevSlideEl) prevSlideEl.style.transition = "";

    if (goNext) {
        // Slide current up, next into view
        currentSlideEl.style.transform = "translateY(-100vh)";
        if (nextSlideEl) nextSlideEl.style.transform = "translateY(0)";
        setTimeout(() => showSlide(index + 1), 250);
    } else if (goPrev) {
        currentSlideEl.style.transform = "translateY(100vh)";
        if (prevSlideEl) prevSlideEl.style.transform = "translateY(0)";
        setTimeout(() => showSlide(index - 1), 250);
    } else {
        // Snap back
        currentSlideEl.style.transform = "translateY(0)";
        if (nextSlideEl) nextSlideEl.style.transform = "translateY(100vh)";
        if (prevSlideEl) prevSlideEl.style.transform = "translateY(-100vh)";
    }
});


// Install service worker
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js");
}
