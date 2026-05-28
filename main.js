const grid = document.getElementById("grid");
const searchInput = document.getElementById("searchInput");
const count = document.getElementById("count");

let videos = [];

async function loadData() {
  try {
    const response = await fetch("./kpop_dance_index_data.json");
    videos = await response.json();
    renderVideos(videos);
  } catch (error) {
    console.error("Failed to load data:", error);
    grid.innerHTML = `<p class="empty">Failed to load video data.</p>`;
  }
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
      const location = item.location || "Unknown location";
      const date = item.performanceDate || "Date unknown";

      return `
        <article class="card">
          <img src="${image}" alt="${artist} - ${songTitle}" loading="lazy" />
          <div class="card-content">
            <div class="artist">${artist}</div>
            <h2 class="song">${songTitle}</h2>
            <div class="meta">
              <div>${location}</div>
              <div>${date}</div>
            </div>
            <a class="watch" href="${item.youtubeUrl}" target="_blank" rel="noopener noreferrer">
              Watch on YouTube
            </a>
          </div>
        </article>
      `;
    })
    .join("");
}

function searchVideos() {
  const keyword = searchInput.value.trim().toLowerCase();

  const filtered = videos.filter((item) => {
    return (
      item.artist?.toLowerCase().includes(keyword) ||
      item.songTitle?.toLowerCase().includes(keyword) ||
      item.location?.toLowerCase().includes(keyword) ||
      item.performanceDate?.toLowerCase().includes(keyword)
    );
  });

  renderVideos(filtered);
}

searchInput.addEventListener("input", searchVideos);

loadData();
