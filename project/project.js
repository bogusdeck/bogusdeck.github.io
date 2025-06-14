const sectionWrapper = document.getElementById("sectionWrapper");
const scrollContainer = document.getElementById("scrollContainer");
const floor = document.querySelector(".floor");
const hills = document.querySelector(".hills");
const characterImg = document.getElementById("characterImg");
const body = document.body;
const castleImg = document.getElementById("castleImg");
const backgroundSound = document.getElementById("backgroundSound");
const sectionAppearSound = document.getElementById("sectionAppearSound");
const characterDisappearSound = document.getElementById(
  "characterDisappearSound",
);
const muteButton = document.getElementById("muteButton");

let isMuted = true;
backgroundSound.volume = 0;

backgroundSound.play();

characterDisappearSound.addEventListener("play", function () {
  showModal();
});

let scrollTimeout;
let isScrolling = false;

muteButton.addEventListener("click", function () {
  if (isMuted) {
    isMuted = false;
    muteButton.classList.remove("muted");
    muteButton.classList.add("unmuted");
    backgroundSound.volume = 1;
    sectionAppearSound.volume = 1;
    characterDisappearSound.volume = 1;
  } else {
    isMuted = true;
    muteButton.classList.remove("unmuted");
    muteButton.classList.add("muted");
    backgroundSound.volume = 0;
    sectionAppearSound.volume = 0;
    characterDisappearSound.volume = 0;
  }
});

scrollContainer.addEventListener("wheel", function (e) {
  e.preventDefault();
  const scrollAmount = e.deltaY;
  scrollContainer.scrollLeft += scrollAmount;
  updateBackgrounds();
  handleScroll();
});

let touchStartX = 0;

scrollContainer.addEventListener("touchstart", function (e) {
  touchStartX = e.touches[0].clientX;
});

scrollContainer.addEventListener("touchmove", function (e) {
  e.preventDefault();
  const touchMoveX = e.touches[0].clientX;
  const scrollAmount = touchStartX - touchMoveX;
  scrollContainer.scrollLeft += scrollAmount;
  touchStartX = touchMoveX;
  updateBackgrounds();
  handleScroll();
});

function updateBackgrounds() {
  const scrollX = scrollContainer.scrollLeft;
  body.style.backgroundPositionX = `${-scrollX / 2}px`;
  hills.style.backgroundPositionX = `${-scrollX / 3}px`;
  floor.style.backgroundPositionX = `${-scrollX / 4}px`;
}

function handleScroll() {
  if (scrollTimeout) {
    clearTimeout(scrollTimeout);
  }
  if (!isScrolling) {
    isScrolling = true;
    characterImg.src = "project/mariorunning.gif";
  }

  scrollTimeout = setTimeout(() => {
    isScrolling = false;
    characterImg.src = "project/mario.png";
  }, 150);

  const maxScrollLeft =
    scrollContainer.scrollWidth - scrollContainer.clientWidth;
  if (scrollContainer.scrollLeft >= maxScrollLeft) {
    characterImg.style.display = "none";
    backgroundSound.pause();
    characterDisappearSound.play();
  } else {
    characterImg.style.display = "block";
    backgroundSound.play();
    characterDisappearSound.pause();
  }
}

scrollContainer.addEventListener("scroll", function () {
  const visibleSections = document.querySelectorAll(".section");
  visibleSections.forEach((section) => {
    const rect = section.getBoundingClientRect();
    if (
      rect.left >= 0 &&
      rect.right <= window.innerWidth &&
      section !== visibleSections[0] &&
      section !== visibleSections[visibleSections.length - 1]
    ) {
      sectionAppearSound.play();
    }
  });
});

document.addEventListener("keydown", function (e) {
  switch (e.key) {
    case " ":
    case "ArrowRight":
    case "PageDown":
      e.preventDefault();
      scrollContainer.scrollLeft += window.innerWidth;
      break;
    case "ArrowLeft":
    case "PageUp":
      e.preventDefault();
      scrollContainer.scrollLeft -= window.innerWidth;
      break;
  }
  updateBackgrounds();
  handleScroll();
});

updateBackgrounds();

function showModal() {
  const modalBg = document.getElementById("modal-bg");
  modalBg.classList.remove("hidden");
}

document.getElementById('menu-toggle').addEventListener('click', function () {
  const menu = document.getElementById('mobile-menu');
  menu.classList.toggle('hidden');
});