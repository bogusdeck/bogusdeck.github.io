document.addEventListener('DOMContentLoaded', () => {
    const bird = document.querySelector('.bird');
    const duckhuntBg = document.querySelector('.duckhunt-bg');
    const wordContainer = document.querySelector('.word-container');
    let moveInterval;

    const words = ["Awesome!", "Great shot!", "Nice!", "Well done!", "Perfect!"];
    const defaultBirdImage = 'flyduck.gif'; // Default bird image
    const shotBirdImage = 'shotduck.png'; // Image when the bird is shot
    const deadBirdImage = 'deadduck.gif'; // Image when the bird is falling

    function getRandomYPosition() {
        const bgRect = duckhuntBg.getBoundingClientRect();
        const birdRect = bird.getBoundingClientRect();
        const skyHeight = bgRect.height * 0.7; // 70% of the image height
        const maxY = skyHeight - birdRect.height;
        const y = Math.random() * maxY;
        return y;
    }

    function startBirdMovement() {
        const bgRect = duckhuntBg.getBoundingClientRect();
        let birdX = -bird.getBoundingClientRect().width; // Start from the left outside the container
        const birdY = getRandomYPosition();

        bird.style.left = `${birdX}px`;
        bird.style.top = `${birdY}px`;
        bird.src = defaultBirdImage; // Set the default bird image
        bird.classList.remove('hidden');

        moveInterval = setInterval(() => {
            birdX += 5; // Move the bird to the right
            bird.style.left = `${birdX}px`;

            if (birdX > bgRect.width) {
                // If the bird goes out of bounds, reset it
                birdX = -bird.getBoundingClientRect().width;
                bird.style.top = `${getRandomYPosition()}px`;
            }
        }, 50); // Adjust the speed of the bird here
    }

    function resetBird() {
        clearInterval(moveInterval);
        bird.classList.add('hidden');
    }

    function displayRandomWord() {
        const randomIndex = Math.floor(Math.random() * words.length);
        const word = document.createElement('div');
        word.textContent = words[randomIndex];
        wordContainer.appendChild(word);
    }

    function birdShot() {
        // Stop the bird's movement
        clearInterval(moveInterval);

        // Change to shot image
        bird.src = shotBirdImage;
        setTimeout(() => {
            // Change to falling image and start falling animation
            bird.src = deadBirdImage;
            bird.classList.add('fall');
            bird.style.transform = `translateY(${window.innerHeight - bird.getBoundingClientRect().bottom}px)`;

            // Reset the bird after falling animation
            setTimeout(() => {
                bird.classList.remove('fall');
                bird.style.transform = 'none';
                bird.src = defaultBirdImage; // Reset to default bird image
                resetBird();
                setTimeout(startBirdMovement, 1000);
            }, 2000); // Duration should match the CSS transition
        }, 1000); // Show shot image for 1 second
    }

    bird.addEventListener('click', () => {
        displayRandomWord();
        birdShot();
    });

    startBirdMovement();
});
