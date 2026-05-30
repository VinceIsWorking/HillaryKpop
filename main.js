const grid = document.getElementById("grid");
const searchInput = document.getElementById("searchInput");
const count = document.getElementById("count");
const toggleArtistMapButton = document.getElementById("toggleArtistMap");
const artistMapSection = document.getElementById("artistMapSection");
const artistMap = document.getElementById("artistMap");
const clearArtistFilterButton = document.getElementById("clearArtistFilter");
const loadMoreButton = document.getElementById("loadMoreButton");

let videos = [];
let currentList = [];
let visibleCount = 24;

const PAGE_SIZE = 24;

async function loadData() {
  try {
    const response = await fetch("https://script.google.com/macros/s/AKfycbwlpl1_Ndpznng_BhgnDSxzaZezfJpfBGcm34lSeH9ik_yDsKVfv0taBfNWwv1lKPeK/exec");

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    videos = await response.json();

    videos = videos.map((item) => ({
      ...item,
      artist: normalizeArtistName(item.artist || "Unknown Artist")
    }));

    videos.sort(sortByNewestDate);

    currentList = videos;
    visibleCount = PAGE_SIZE;

    renderArtistMap(videos);
    renderVideos(currentList);
  } catch (error) {
    console.error("Failed to load data:", error);
    count.textContent = "";
    grid.innerHTML = `<p class="empty">Failed to load video data.</p>`;
    loadMoreButton.classList.add("hidden");
  }
}

function normalizeArtistName(name) {
  const raw = String(name).trim();

  const key = raw
    .toLowerCase()
    .replaceAll("’", "'")
    .replace(/\s+/g, " ");

  const aliasMap = {
    "twice": "TWICE",
    "blackpink": "BLACKPINK",
    "aespa": "AESPA",
    "le sserafim": "LE SSERAFIM",
    "gfriend": "GFRIEND",
    "kiss of life": "KISS OF LIFE",
    "fifty fifty": "FIFTY FIFTY",
    "newjeans": "NewJeans",
    "wjsn cosmic girls": "WJSN Cosmic Girls",
    "wjsn": "WJSN Cosmic Girls",
    "girls' generation": "Girls' Generation",
    "girls’ generation": "Girls' Generation",
    "iz*one": "IZ*ONE",
    "produce 48": "PRODUCE 48",
    "purple kiss": "Purple Kiss",
    "dreamcatcher": "Dreamcatcher",
    "illit": "ILLIT",
    "ive": "IVE",
    "stayc": "STAYC",
    "mamamoo": "MAMAMOO",
    "everglow": "EVERGLOW",
    "misamo": "MISAMO",
    "loona": "LOONA",
    "soojin": "SOOJIN",
    "meovv": "MEOVV",
    "katseye": "KATSEYE",
    "xg": "XG",
    "yena": "YENA",
    "babymonster": "BABYMONSTER",
    "girls' day": "GIRL'S DAY",
    "got the beat": "GOT the beat",
    "wjsn chocome": "WJSN CHOCOME",
    "yeji x giselle x julie": "YEJI X GISELLE X JULIE"
  };

  return aliasMap[key] || raw;
}

function sortByNewestDate(a, b) {
  const dateA = a.performanceDate || "0000-00";
  const dateB = b.performanceDate || "0000-00";
  return dateB.localeCompare(dateA);
}

function renderVideos(list) {
  const visibleItems = list.slice(0, visibleCount);

  count.textContent = `Showing ${visibleItems.length} of ${list.length} video${
    list.length === 1 ? "" : "s"
  }`;

  if (list.length === 0) {
    grid.innerHTML = `<p class="empty">No videos found.</p>`;
    loadMoreButton.classList.add("hidden");
    return;
  }

  grid.innerHTML = visibleItems
    .map((item) => {
      const image = item.outfitImage || item.thumbnail || "";
      const artist = item.artist || "Unknown Artist";
      const songTitle = item.songTitle || "Unknown Song";
      const location = item.location || "Location unknown";
      const date = item.performanceDate || "Date unknown";
      const dancerRole = item.dancerRole || "";

      return `
        <article class="card">
          <img 
            src="${image}" 
            alt="${escapeHtml(artist)} - ${escapeHtml(songTitle)}" 
            loading="lazy" 
          />

          <div class="card-content">
            <div class="artist">${escapeHtml(artist)}</div>
            <h2 class="song">${escapeHtml(songTitle)}</h2>

          <div class="meta">
            <div>${escapeHtml(location)}</div>
            <div>${escapeHtml(date)}</div>
            ${dancerRole ? `<div class="role">as ${escapeHtml(dancerRole)}</div>` : ""}
          </div>

            <a 
              class="watch" 
              href="${escapeHtml(item.youtubeUrl)}" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              Watch on YouTube
            </a>
          </div>
        </article>
      `;
    })
    .join("");

  updateLoadMoreButton(list);
}

function updateLoadMoreButton(list) {
  if (visibleCount >= list.length) {
    loadMoreButton.classList.add("hidden");
  } else {
    loadMoreButton.classList.remove("hidden");
    loadMoreButton.textContent = `Load More (${list.length - visibleCount} left)`;
  }
}

function loadMoreVideos() {
  visibleCount += PAGE_SIZE;
  renderVideos(currentList);
}

function renderArtistMap(list) {
  const artistCounts = {};

  list.forEach((item) => {
    const artist = item.artist || "Unknown Artist";
    artistCounts[artist] = (artistCounts[artist] || 0) + 1;
  });

  const sortedArtists = Object.entries(artistCounts).sort((a, b) => {
    return b[1] - a[1] || a[0].localeCompare(b[0]);
  });

  artistMap.innerHTML = "";

  sortedArtists.forEach(([artist, total]) => {
    const button = document.createElement("button");
    button.className = `artist-block ${getArtistBlockSize(total)}`;
    button.type = "button";

    button.innerHTML = `
      <span class="artist-block-name">${escapeHtml(artist)}</span>
      <span class="artist-block-count">${total} video${total === 1 ? "" : "s"}</span>
    `;

    button.addEventListener("click", () => {
      searchInput.value = artist;
      searchVideos();
      window.scrollTo({
        top: document.querySelector(".toolbar").offsetTop,
        behavior: "smooth"
      });
    });

    artistMap.appendChild(button);
  });
}

function getArtistBlockSize(total) {
  if (total >= 5) return "big";
  if (total >= 2) return "medium";
  return "small";
}

function searchVideos() {
  const keyword = searchInput.value.trim().toLowerCase();

  currentList = videos
    .filter((item) => {
      return (
        item.artist?.toLowerCase().includes(keyword) ||
        item.songTitle?.toLowerCase().includes(keyword) ||
        item.location?.toLowerCase().includes(keyword) ||
        item.performanceDate?.toLowerCase().includes(keyword)
      );
    })
    .sort(sortByNewestDate);

  visibleCount = PAGE_SIZE;
  renderVideos(currentList);
}

function toggleArtistMap() {
  artistMapSection.classList.toggle("hidden");

  const isHidden = artistMapSection.classList.contains("hidden");
  toggleArtistMapButton.textContent = isHidden
    ? "Show Artist Board"
    : "Hide Artist Board";
}

function clearArtistFilter() {
  searchInput.value = "";
  currentList = videos;
  visibleCount = PAGE_SIZE;
  renderVideos(currentList);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

searchInput.addEventListener("input", searchVideos);
toggleArtistMapButton.addEventListener("click", toggleArtistMap);
clearArtistFilterButton.addEventListener("click", clearArtistFilter);
loadMoreButton.addEventListener("click", loadMoreVideos);

loadData();
