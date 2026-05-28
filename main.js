const grid = document.getElementById("grid");
const searchInput = document.getElementById("searchInput");
const count = document.getElementById("count");
const toggleArtistMapButton = document.getElementById("toggleArtistMap");
const artistMapSection = document.getElementById("artistMapSection");
const artistMap = document.getElementById("artistMap");

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
              href="${item.youtubeUrl}" 
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

  const sortedArtists = Object.entries(artistCounts).sort((a, b) => b[1] - a[1]);

  artistMap.innerHTML = sortedArtists
    .map(([artist, total]) => {
      return `
        <button 
          class="artist-block" 
          style="--weight: ${total};" 
          onclick="filterByArtist('${escapeForAttribute(artist)}')"
          title="Show ${escapeHtml(artist)} videos"
        >
          <span class="artist-block-name">${escapeHtml(artist)}</span>
          <span class="artist-block-count">${total} video${total === 1 ? "" : "s"}</span>
        </button>
      `;
    })
    .join("");
}

function filterByArtist(artist) {
  searchInput.value = artist;
  searchVideos();
  window.scrollTo({
    top: document.querySelector(".toolbar").offsetTop,
    behavior: "smooth"
  });
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
    ? "Show Artist Map"
    : "Hide Artist Map";
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeForAttribute(value) {
  return String(value)
    .replaceAll("\\", "\\\\")
    .replaceAll("'", "\\'")
    .replaceAll('"', "&quot;");
}

searchInput.addEventListener("input", searchVideos);
toggleArtistMapButton.addEventListener("click", toggleArtistMap);

loadData();
