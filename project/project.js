const sectionWrapper = document.getElementById('sectionWrapper');
const scrollContainer = document.getElementById('scrollContainer'); /* Updated to use scrollContainer */
const floor = document.querySelector('.floor');
const hills = document.querySelector('.hills');
const characterImg = document.getElementById('characterImg');
const body = document.body;
const castleImg = document.getElementById('castleImg');
const backgroundSound = document.getElementById('backgroundSound');
const sectionAppearSound = document.getElementById('sectionAppearSound');
const characterDisappearSound = document.getElementById('characterDisappearSound');

// Play background music
backgroundSound.play();

let scrollTimeout;
let isScrolling = false;

// Handle horizontal scrolling
scrollContainer.addEventListener('wheel', function(e) { /* Updated to use scrollContainer */
    e.preventDefault();
    const scrollAmount = e.deltaY;
    scrollContainer.scrollLeft += scrollAmount;
    updateBackgrounds();
    handleScroll();
});

// Update background positions based on scroll
function updateBackgrounds() {
    const scrollX = scrollContainer.scrollLeft; /* Updated to use scrollContainer */
    body.style.backgroundPositionX = `${-scrollX / 2}px`; // Move background slower for parallax effect
    hills.style.backgroundPositionX = `${-scrollX / 3}px`; // Move hills slower
    floor.style.backgroundPositionX = `${-scrollX / 4}px`; // Move floor slower
}

// Handle scroll events to toggle character animation
function handleScroll() {
    if (scrollTimeout) {
        clearTimeout(scrollTimeout);
    }
    if (!isScrolling) {
        isScrolling = true;
        characterImg.src = 'project/mariorunning.gif';
    }

    scrollTimeout = setTimeout(() => {
        isScrolling = false;
        characterImg.src = 'project/mario.png';
    }, 150); // Adjust delay as needed

    // Check if the scroll is at the end
    const maxScrollLeft = scrollContainer.scrollWidth - scrollContainer.clientWidth; /* Updated to use scrollContainer */
    if (scrollContainer.scrollLeft >= maxScrollLeft) { /* Updated to use scrollContainer */
        characterImg.style.display = 'none';
        backgroundSound.pause();
        characterDisappearSound.play(); 
    } else {
        // Show the character when not at the end
        characterImg.style.display = 'block';
        backgroundSound.play();
        characterDisappearSound.pause();
    }
}

// Play section appear sound when new section comes into view
scrollContainer.addEventListener('scroll', function() { /* Updated to use scrollContainer */
    const visibleSections = document.querySelectorAll('.section');
    visibleSections.forEach(section => {
        const rect = section.getBoundingClientRect();
        if (rect.left >= 0 && rect.right <= window.innerWidth && section !== visibleSections[0] && section !== visibleSections[visibleSections.length - 1]) {
            sectionAppearSound.play();
        }
    });
});

// Handle keyboard inputs for scrolling
document.addEventListener('keydown', function(e) {
    switch (e.key) {
        case ' ':
        case 'ArrowRight':
        case 'PageDown':
            e.preventDefault();
            scrollContainer.scrollLeft += window.innerWidth; /* Updated to use scrollContainer */
            break;
        case 'ArrowLeft':
        case 'PageUp':
            e.preventDefault();
            scrollContainer.scrollLeft -= window.innerWidth; /* Updated to use scrollContainer */
            break;
    }
    updateBackgrounds();
    handleScroll();
});

updateBackgrounds();