const grid = document.getElementById("grid");
const searchInput = document.getElementById("searchInput");
const count = document.getElementById("count");
const toggleArtistMapButton = document.getElementById("toggleArtistMap");
const artistMapSection = document.getElementById("artistMapSection");
const artistMap = document.getElementById("artistMap");
const clearArtistFilterButton = document.getElementById("clearArtistFilter");

let videos = [];

async function loadData() {
  try {
    const response = await fetch("./kpop_dance_index_data.json");

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    videos = await response.json();
    videos.sort(sortByNewestDate);

    renderArtistMap(videos);
    renderVideos(videos);
  } catch (error) {
    console.error("Failed to load data:", error);
    count.textContent = "";
    grid.innerHTML = `<p class="empty">Failed to load video data.</p>`;
  }
}

function sortByNewestDate(a, b) {
  const dateA = a.performanceDate || "0000-00";
  const dateB = b.performanceDate || "0000-00";
  return dateB.localeCompare(dateA);
}

function renderVideos(list) {
  count.textContent = `${list.length} video${list.length === 1 ? "" : "s"} found`;

  if (list.length === 0) {
    grid.innerHTML = `<p class="empty">No videos found.</p>`;
    return;
  }

  grid.innerHTML = list
    .map((item) => {
      const image = item.outfitImage || item.thumbnail || "";
      const artist = item.artist || "Unknown Artist";
      const songTitle = item.songTitle || "Unknown Song";
      const location = item.location || "Location unknown";
      const date = item.performanceDate || "Date unknown";

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
  if (total >= 4) return "big";
  if (total >= 2) return "medium";
  return "small";
}

function searchVideos() {
  const keyword = searchInput.value.trim().toLowerCase();

  const filtered = videos
    .filter((item) => {
      return (
        item.artist?.toLowerCase().includes(keyword) ||
        item.songTitle?.toLowerCase().includes(keyword) ||
        item.location?.toLowerCase().includes(keyword) ||
        item.performanceDate?.toLowerCase().includes(keyword)
      );
    })
    .sort(sortByNewestDate);

  renderVideos(filtered);
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
  renderVideos(videos);
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

loadData();
