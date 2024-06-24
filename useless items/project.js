document.addEventListener('DOMContentLoaded', function () {
    const locoScroll = new LocomotiveScroll({
        el: document.querySelector('#game-level'),
        smooth: true,
        direction: 'horizontal',
        smartphone: {
            smooth: true,
        },
        tablet: {
            smooth: true,
        },
    });

    const characterImg = document.querySelector('#character img');

    // Update character image based on scroll position
    function updateCharacterImage() {
        const scrollPosition = locoScroll.scroll.x; // Get horizontal scroll position

        if (scrollPosition !== 0) {
            characterImg.src = 'mariorest.png'; // Set running animation when scrolling
        } else {
            characterImg.src = 'mario.gif'; // Set stop image when not scrolling
        }
    }

    // Update character image on scroll
    locoScroll.on('scroll', function () {
        updateCharacterImage();
    });
});
