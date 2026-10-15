const tracks = [
  {
    title: "Da De Kumi Pyali Bang Di",
    artist: "Nashenas",
    album: "My Playlist",
    duration: "0:00",
    audio: "Songs/Da de Kumi Pyali Bang Di(M4A_128K).m4a",
    colors: ["#342737", "#a96574", "#eea874"],
  },
  {
    title: "Ta Tash Pa Pola Rata",
    artist: "Javeed Amirkhel",
    album: "My Playlist",
    duration: "0:00",
    audio: "Songs/javeed Amir khile  ta tash pa pola rata kena yara(M4A_128K).m4a",
    colors: ["#183b46", "#347a78", "#e0bc79"],
  },
  {
    title: "Maikada - Bya Hagha Makhaam",
    artist: "Karan Khan",
    album: "My Playlist",
    duration: "0:00",
    audio: "Songs/Karan Khan - Maikada (Official) - Bya Hagha Makhaam Dy Part III (Video)(M4A_128K).m4a",
    colors: ["#3a304f", "#a5699b", "#edb28b"],
  },
  {
    title: "Pa Taa Pase Me Lewane Khyaalona",
    artist: "Pashto Song",
    album: "My Playlist",
    duration: "0:00",
    audio: "Songs/Pa taa pase me lewane khyaalona(M4A_128K).m4a",
    colors: ["#1f354d", "#657c9b", "#cad1d3"],
  },
  {
    title: "Tum Nazar Mein Raho",
    artist: "Atif Aslam",
    album: "My Playlist",
    duration: "0:00",
    audio: "Songs/Tum Nazar Mein Raho _ Tripti Dimri _ Avinash Tiwary _ Laila Majnu _ Niladri K _ Lyrical(M4A_128K).m4a",
    colors: ["#2e1a2f", "#8e4a5a", "#f2a365"],
  },
];

const audio = document.querySelector("#audioPlayer");
const title = document.querySelector("#songTitle");
const artist = document.querySelector("#artistName");
const progress = document.querySelector("#progressBar");
const playButton = document.querySelector("#playButton");
const playIcon = document.querySelector("#playIcon");
const status = document.querySelector("#statusMessage");
const trackList = document.querySelector("#trackList");
const durationLabel = document.querySelector("#duration");
const currentLabel = document.querySelector("#currentTime");
let currentTrack = 0;
let shuffle = false;
let repeat = false;
let autoplay = true;

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  return `${mins}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
}

function renderPlaylist() {
  trackList.innerHTML = tracks
    .map(
      (track, index) => `
    <div class="track-item${index === currentTrack ? " selected" : ""}" role="listitem" tabindex="0" data-index="${index}" aria-current="${index === currentTrack ? "true" : "false"}">
      <span class="track-number">${index === currentTrack && !audio.paused ? "♫" : String(index + 1).padStart(2, "0")}</span>
      <span class="track-info"><strong>${track.title}</strong><span>${track.artist} · ${track.album}</span></span>
      <span class="track-length">${track.duration}</span>
    </div>`,
    )
    .join("");
}

function loadTrack(index, shouldPlay = false) {
  currentTrack = (index + tracks.length) % tracks.length;
  const track = tracks[currentTrack];
  title.textContent = track.title;
  artist.innerHTML = `${track.artist} <span class="meta-divider">·</span> ${track.album}`;
  audio.src = track.audio;
  progress.value = 0;
  setRangeFill(progress, 0);
  currentLabel.textContent = "0:00";
  durationLabel.textContent = track.duration;
  document.querySelector("#coverArt").style.background =
    `linear-gradient(140deg, ${track.colors.join(", ")})`;
  status.textContent = "Choose a track and press play";
  renderPlaylist();
  if (shouldPlay) playTrack();
}

function setRangeFill(input, percent) {
  input.style.background = `linear-gradient(to right, var(--accent) 0%, var(--accent) ${percent}%, #393942 ${percent}%, #393942 100%)`;
}

async function playTrack() {
  try {
    await audio.play();
    status.textContent = "Now playing";
    playButton.classList.add("is-playing");
    playButton.setAttribute("aria-label", "Pause");
    playIcon.textContent = "Ⅱ";
    document.body.classList.remove("paused");
    renderPlaylist();
  } catch (error) {
    status.textContent =
      "Could not load this track. Check your connection and try again.";
  }
}

function pauseTrack() {
  audio.pause();
  playButton.classList.remove("is-playing");
  playButton.setAttribute("aria-label", "Play");
  playIcon.textContent = "▶";
  document.body.classList.add("paused");
  status.textContent = "Playback paused";
  renderPlaylist();
}

function nextTrack() {
  const next = shuffle
    ? Math.floor(Math.random() * tracks.length)
    : currentTrack + 1;
  loadTrack(next, true);
}

playButton.addEventListener("click", () =>
  audio.paused ? playTrack() : pauseTrack(),
);
document.querySelector("#nextButton").addEventListener("click", nextTrack);
document.querySelector("#previousButton").addEventListener("click", () => {
  if (audio.currentTime > 3) audio.currentTime = 0;
  else loadTrack(currentTrack - 1, true);
});
trackList.addEventListener("click", (event) => {
  const item = event.target.closest(".track-item");
  if (item) loadTrack(Number(item.dataset.index), true);
});
trackList.addEventListener("keydown", (event) => {
  const item = event.target.closest(".track-item");
  if (item && (event.key === "Enter" || event.key === " ")) {
    event.preventDefault();
    loadTrack(Number(item.dataset.index), true);
  }
});

audio.addEventListener("timeupdate", () => {
  if (!Number.isFinite(audio.duration)) return;
  const percent = (audio.currentTime / audio.duration) * 100;
  progress.value = Math.round(percent * 10);
  setRangeFill(progress, percent);
  currentLabel.textContent = formatTime(audio.currentTime);
});
audio.addEventListener("loadedmetadata", () => {
  durationLabel.textContent = formatTime(audio.duration);
});
audio.addEventListener("ended", () => {
  if (repeat) {
    audio.currentTime = 0;
    playTrack();
  } else if (autoplay) nextTrack();
  else pauseTrack();
});
audio.addEventListener("error", () => {
  if (audio.src)
    status.textContent =
      "Audio unavailable. Try another track or check your connection.";
});

progress.addEventListener("input", () => {
  if (!Number.isFinite(audio.duration)) return;
  const percent = Number(progress.value) / 10;
  audio.currentTime = (percent / 100) * audio.duration;
  setRangeFill(progress, percent);
  currentLabel.textContent = formatTime(audio.currentTime);
});

const volume = document.querySelector("#volumeBar");
function updateVolume() {
  audio.volume = Number(volume.value) / 100;
  document.querySelector("#volumeValue").textContent = volume.value;
  setRangeFill(volume, Number(volume.value));
}
volume.addEventListener("input", updateVolume);
updateVolume();

document.querySelector("#shuffleButton").addEventListener("click", (event) => {
  shuffle = !shuffle;
  event.currentTarget.classList.toggle("active", shuffle);
  event.currentTarget.setAttribute("aria-pressed", String(shuffle));
  status.textContent = shuffle ? "Shuffle is on" : "Shuffle is off";
});
document.querySelector("#repeatButton").addEventListener("click", (event) => {
  repeat = !repeat;
  event.currentTarget.classList.toggle("active", repeat);
  event.currentTarget.classList.toggle("repeat-one", repeat);
  event.currentTarget.setAttribute("aria-pressed", String(repeat));
  event.currentTarget.setAttribute(
    "aria-label",
    repeat ? "Repeat track on" : "Repeat off",
  );
  status.textContent = repeat ? "Repeating this track" : "Repeat is off";
});
document.querySelector("#autoplayButton").addEventListener("click", (event) => {
  autoplay = !autoplay;
  event.currentTarget.setAttribute("aria-pressed", String(autoplay));
  status.textContent = autoplay ? "Autoplay is on" : "Autoplay is off";
});
document.querySelector("#likeButton").addEventListener("click", (event) => {
  const liked = event.currentTarget.getAttribute("aria-pressed") !== "true";
  event.currentTarget.setAttribute("aria-pressed", String(liked));
  event.currentTarget.classList.toggle("active", liked);
  event.currentTarget.textContent = liked ? "♥" : "♡";
});
document.querySelector("#queueToggle").addEventListener("click", (event) => {
  const panel = document.querySelector("#playlist");
  const expanded = event.currentTarget.getAttribute("aria-expanded") === "true";
  event.currentTarget.setAttribute("aria-expanded", String(!expanded));
  panel.classList.toggle("hidden", expanded);
});

document.querySelector("#queueCount").textContent = String(
  tracks.length,
).padStart(2, "0");
document.querySelector("#playlistTotal").textContent = String(
  tracks.length,
).padStart(2, "0");
loadTrack(currentTrack);
