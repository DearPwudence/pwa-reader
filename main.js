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

function showSlide(i) {
    index = i;
    renderSlides();
}

// ------------------------------
// Swipe handling
// ------------------------------
let currentIndex = 0;
let startY = 0;
let currentY = 0;
let isDragging = false;

let startTime = 0;       // for velocity
let velocity = 0;

const container = document.querySelector("#viewer");

function setTransition(enabled) {
    container.style.transition = enabled ? "transform 0.25s cubic-bezier(.15,.75,.25,1)" : "none";
}

function updatePosition() {
    const offset = -currentIndex * window.innerHeight + currentY;
    container.style.transform = `translateY(${offset}px)`;
}

container.addEventListener("touchstart", (e) => {
    isDragging = true;
    startY = e.touches[0].clientY;
    currentY = 0;
    startTime = performance.now();

    setTransition(false);
});

container.addEventListener("touchmove", (e) => {
    if (!isDragging) return;
    const touchY = e.touches[0].clientY;

    currentY = touchY - startY;
    updatePosition();
});

container.addEventListener("touchend", () => {
    if (!isDragging) return;
    isDragging = false;

    const dt = performance.now() - startTime;
    const dy = currentY;

    // pixels per millisecond
    velocity = dy / dt;

    const distanceThreshold = window.innerHeight * 0.25;
    const velocityThreshold = 0.35;   // tune this ↑ for flick sensitivity

    let direction = 0;

    // momentum swipe (fast flick)
    if (velocity < -velocityThreshold) {
        direction = 1;  // next image
    } else if (velocity > velocityThreshold) {
        direction = -1; // previous
    }

    // normal slow drag
    if (currentY < -distanceThreshold) {
        direction = 1;
    } else if (currentY > distanceThreshold) {
        direction = -1;
    }

    // apply movement within bounds
    if (direction === 1 && currentIndex < container.children.length - 1) {
        currentIndex++;
    } else if (direction === -1 && currentIndex > 0) {
        currentIndex--;
    }

    // animate snap
    setTransition(true);
    currentY = 0;
    updatePosition();
});

window.addEventListener("resize", () => {
    document.body.style.width = window.innerWidth + "px";
});


// Install service worker
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js");
}
