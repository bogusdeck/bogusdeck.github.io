// Scroll Event Listener
window.addEventListener("scroll", function () {
  var nav = document.querySelector("nav");
  var logoText = document.querySelector(".logo-text");
  var scrollToTopBtn = document.getElementById("scrollToTop");
  if (window.scrollY > 0) {
    if (nav) nav.classList.add("shrink");
    if (logoText) logoText.classList.add("hidden");
    if (scrollToTopBtn) scrollToTopBtn.classList.add("visible");
  } else {
    if (nav) nav.classList.remove("shrink");
    if (logoText) logoText.classList.remove("hidden");
    if (scrollToTopBtn) scrollToTopBtn.classList.remove("visible");
  }
});

// Scroll to top function
var scrollToTopBtn = document.getElementById("scrollToTop");
if (scrollToTopBtn) {
  scrollToTopBtn.addEventListener("click", function () {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });
}

// Typewriter Effect
const lines = TERMINAL_LINES;

const terminal = document.getElementById("terminal");
const typingSound = document.getElementById("typing-sound");
let currentIndex = 0;
let charIndex = 0;

const typeWriter = () => {
  if (currentIndex >= lines.length) {
    setTimeout(() => {
      currentIndex = 0;
      terminal.innerHTML = "";
     
      setTimeout(typeWriter, 0); 
    }, 5000); 
    return; 
  }

  const line = lines[currentIndex];

  if (charIndex < line.length) {
    terminal.innerHTML += line.charAt(charIndex);
    charIndex++;
  } else {
    terminal.innerHTML += "<br>";
    currentIndex++;
    charIndex = 0;
  }

  setTimeout(typeWriter, 75); 
};

if (terminal) {
  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        typeWriter();
        observer.unobserve(entry.target);
      }
    });
  });
  observer.observe(terminal);
}

// Modal Functionality
document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', (event) => {
      event.stopPropagation();
      mobileMenu.classList.toggle('hidden');
    });
  }

  document.addEventListener('click', (event) => {
    if (!mobileMenu || mobileMenu.classList.contains('hidden')) {
      return;
    }

    if (menuToggle && menuToggle.contains(event.target)) {
      return;
    }

    if (!mobileMenu.contains(event.target)) {
      mobileMenu.classList.add('hidden');
    }
  });

  if (mobileMenu) {
    mobileMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
      });
    });
  }
});

// Mouse Move Effect
(function () {
  "use strict";

  var image = document.getElementById('image'),
    width = window.innerWidth,
    height = window.innerHeight;

  function bindMouse() {
    if (image && window.matchMedia('(pointer: fine) and (min-width: 768px)').matches) {
      document.addEventListener('mousemove', (event) => {
        let x = (event.clientX / width - 0.5) * 2;
        let y = (event.clientY / height - 0.5) * 2;

        tilt(x, y);
      });
    }
  }

  function tilt(x, y) {
    let force = 20; 
    let rx = y * force;
    let ry = -x * force;

    if (image) {
      image.style.transform = 'rotateY(' + ry + 'deg) rotateX(' + rx + 'deg)';
    }
  }

  bindMouse();
})();

// Parallax Effect
function updateBackgrounds() {
  const scrollY = window.scrollY;
  
  const astronautImage = document.getElementById('astronautImage');
  if (astronautImage) {
    astronautImage.style.transform = `translateY(${scrollY * 0.6}px)`;
  }
  
  const leftImage = document.querySelector('.left-image');
  if (leftImage) {
    leftImage.style.transform = `translateY(${scrollY * 0.3}px)`;
  }
  
  const rightImage = document.querySelector('.right-image');
  if (rightImage) {
    rightImage.style.transform = `translateY(${scrollY * 0.4}px)`;
  }
  
  const leftCenterImage = document.querySelector('.left-center-image');
  if (leftCenterImage) {
    leftCenterImage.style.transform = `translateY(${scrollY * 0.3}px)`;
  }
  
  const bottomRightImage = document.querySelector('.bottom-right-image');
  if (bottomRightImage) {
    bottomRightImage.style.transform = `translateY(${scrollY * 0.3}px)`;
  }
}

window.addEventListener('scroll', updateBackgrounds);
updateBackgrounds();

// GitHub Stats
(function () {
  const starsCountElement = document.getElementById('stars-count');
  const totalContributionsElement = document.getElementById('total-contributions');

  // Immediately display cached values from localStorage if they exist, otherwise use config defaults
  const defaultStars = localStorage.getItem('github_stars') || window.defaultStars || '16';
  const defaultContributions = localStorage.getItem('github_commits') || window.defaultContributions || '690';

  if (starsCountElement) starsCountElement.textContent = defaultStars;
  if (totalContributionsElement) totalContributionsElement.textContent = defaultContributions;

  // Helper function to handle API rate limits and errors
  function fetchWithRetry(url, retries = 3, delay = 1000) {
    return new Promise((resolve, reject) => {
      function attempt(attemptsLeft) {
        fetch(url)
          .then(response => {
            if (response.status === 403 && response.headers.get('X-RateLimit-Remaining') === '0') {
              throw new Error('Rate limit exceeded');
            }
            if (response.status === 202) {
              // GitHub is still computing stats, retry after delay
              if (attemptsLeft > 0) {
                setTimeout(() => attempt(attemptsLeft - 1), delay);
              } else {
                throw new Error('GitHub still computing stats');
              }
            } else if (!response.ok) {
              throw new Error(`GitHub API error: ${response.status}`);
            } else {
              return response.json();
            }
          })
          .then(resolve)
          .catch(error => {
            if (attemptsLeft > 0 && error.message !== 'Rate limit exceeded') {
              setTimeout(() => attempt(attemptsLeft - 1), delay);
            } else {
              reject(error);
            }
          });
      }
      attempt(retries);
    });
  }

  function fetchLiveGitHubStats(username) {
    if (!username) return;

    // Fetch Stars Count by summation across public repos
    fetchWithRetry(`https://api.github.com/users/${username}/repos?per_page=100`)
      .then(repos => {
        if (Array.isArray(repos)) {
          const totalStars = repos.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0);
          if (starsCountElement) {
            starsCountElement.textContent = totalStars;
          }
          // Save to local storage for subsequent offline/rate-limit use
          localStorage.setItem('github_stars', totalStars.toString());
        }
      })
      .catch(error => {
        console.error('Error fetching live GitHub stars:', error);
        // Fallback value is already displayed, no action needed
      });

    // Fetch Total Commits Count using GitHub search API
    if (totalContributionsElement) {
      totalContributionsElement.textContent = 'Loading...';
    }

    fetchWithRetry(`https://api.github.com/search/commits?q=author:${username}`)
      .then(data => {
        if (data && data.total_count !== undefined && totalContributionsElement) {
          totalContributionsElement.textContent = data.total_count;
          // Save to local storage for subsequent offline/rate-limit use
          localStorage.setItem('github_commits', data.total_count.toString());
        }
      })
      .catch(error => {
        console.error('Error fetching live GitHub commits:', error);
        // Fallback to cached/default contributions if API fails or is rate-limited
        if (totalContributionsElement) {
          totalContributionsElement.textContent = defaultContributions;
        }
      });
  }

  // Handle initialization
  function init() {
    const username = window.githubUsername || 'bogusdeck';
    fetchLiveGitHubStats(username);
  }

  // Wait for config to load or run immediately if already loaded
  if (window.githubUsername) {
    init();
  } else {
    document.addEventListener('configLoaded', function (event) {
      const config = event.detail;
      const username = config.githubStats ? config.githubStats.username : 'bogusdeck';
      fetchLiveGitHubStats(username);
    });
  }
})();
