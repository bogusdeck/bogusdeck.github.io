/* ==========================================================================
   GLOBAL CONSTANTS (constants.js)
   Centralized static configuration and asset references across JavaScript files.
   ========================================================================== */

// --------------------------------------------------------------------------
// 1. TYPEWRITER TERMINAL CONSTANTS (script.js)
// --------------------------------------------------------------------------
const TERMINAL_LINES = [
  "bash-3.2$ who am i",
  "Tanish Vashisth",
  "bash-3.2$ ls",
  "Artwork Desktop Downloads Music Documents Homework",
  "bash-3.2$ uname -a",
  "Linux archlinux 6.5.8-arch1-1 #1 SMP PREEMPT_DYNAMIC Thu, 19 Oct 2022 22:52:14 +0000 x86_64 GNU/Linux",
];

// --------------------------------------------------------------------------
// 2. ABOUT PAGE GALLERY CONSTANTS (about.js)
// --------------------------------------------------------------------------
const ARTWORK_TOTAL_IMAGES = 87;
const ARTWORK_IMAGES_PER_PAGE = 12;
const ARTWORK_FOLDER = '/assets/images/artwork/';

// --------------------------------------------------------------------------
// 3. PROJECTS PAGE MARIO CONSTANTS (project.js)
// --------------------------------------------------------------------------
const MARIO_RUNNING_GIF = "/assets/images/project/mariorunning.gif";
const MARIO_IDLE_PNG = "/assets/images/project/mario.png";
const MARIO_VOLUME_LEVEL = 0.3;

// --------------------------------------------------------------------------
// 4. CONTACT PAGE DUCK HUNT GAME CONSTANTS (contact.html / contact.js)
// --------------------------------------------------------------------------
const DUCKHUNT_BIRDS_NEEDED = 6;
const DUCKHUNT_TOTAL_BIRDS = 10;
const DUCKHUNT_VOLUME_LEVEL = 0.3;
const DUCKHUNT_BIRD_SPEED_MULTIPLIER = 1;

// Sound Effects Path definitions
const DUCKHUNT_SOUNDS = {
  wingFlap: '/assets/audio/contact/wingFlap20sec.mp3',
  shot: '/assets/audio/contact/shot.mp3',
  fall: '/assets/audio/contact/duckFalling.mp3',
  duckinit: '/assets/audio/contact/duckinit.mp3',
  dogLaughing: '/assets/audio/contact/dog-laughing.mp3',
  highScore: '/assets/audio/contact/high-score.mp3',
  pause: '/assets/audio/contact/pause.mp3'
};

// Character Image Path definitions
const DUCKHUNT_IMAGES = {
  defaultBird: '/assets/images/contact/flyduck.gif',
  shotBird: '/assets/images/contact/shotduck.png',
  deadBird: '/assets/images/contact/deadduck.gif',
  perfectDog: '/assets/images/contact/perfect_dog.gif',
  laughingDog: '/assets/images/contact/laughingdog.gif'
};
