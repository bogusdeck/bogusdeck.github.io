document.addEventListener('DOMContentLoaded', () => {
    const bird = document.querySelector('.bird');
    const duckhuntBg = document.querySelector('.duckhunt-bg');
    const gameContainer = document.querySelector('.game-container');
    const wordBox = document.querySelector('.word-box');
    const clickSound = document.getElementById('click-sound');
    const flySound = document.getElementById('fly-sound');
    const shotSound = document.getElementById('shot-sound');
    const fallSound = document.getElementById('fall-sound');
    let moveInterval;
    let wordIndex = 0;
    const words = ["Nextjs", "Flask", "C++"];
    const defaultBirdImage = 'flyduck.gif'; // Default bird image
    const shotBirdImage = 'shotduck.png'; // Image when the bird is shot
    const deadBirdImage = 'deadduck.gif'; // Image when the bird is falling
    const centerImage = 'laughingdog.gif'; // Image to show after all words

    function getRandomYPosition() {
        const bgRect = duckhuntBg.getBoundingClientRect();
        const birdRect = bird.getBoundingClientRect();
        const skyHeight = bgRect.height * 0.6; // 60% of the image height
        const maxY = skyHeight - birdRect.height;
        const y = Math.random() * maxY;
        return y;
    }

    function startBirdMovement() {
        if (wordIndex >= words.length) {
            // All words are displayed, stop bird spawning
            clearInterval(moveInterval);
            return;
        }

        const bgRect = duckhuntBg.getBoundingClientRect();
        let birdX = -bird.getBoundingClientRect().width; // Start from the left outside the container
        const birdY = getRandomYPosition();

        bird.style.left = `${birdX}px`;
        bird.style.top = `${birdY}px`;
        bird.src = defaultBirdImage; // Set the default bird image
        bird.classList.remove('hidden');
        flySound.play();

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
        flySound.pause();
        flySound.currentTime = 0; // Reset the fly sound
    }

    function displayNextWord() {
        if (wordIndex < words.length) {
            const wordBox = document.createElement('div');
            wordBox.classList.add('word-container');
            wordBox.textContent = words[wordIndex++];
            document.querySelector('.word-box').appendChild(wordBox);
        } else {
            // All words are displayed, clear the game container except for the word container
            const bgImg = document.querySelector('.duckhunt-bg');
            gameContainer.innerHTML = ''; // Clear all elements in the game container

            // Append the background image and the laughing dog
            gameContainer.appendChild(bgImg);

            const centerImg = document.createElement('img');
            centerImg.src = centerImage;
            centerImg.classList.add('center-image');
            gameContainer.appendChild(centerImg);

            resetBird();

            // Apply the sliding effect after a short delay
            setTimeout(() => {
                centerImg.classList.add('show');
            }, 100); // Adjust the delay as needed
        }
    }

    function birdShot() {
        // Stop the bird's movement
        clearInterval(moveInterval);
        flySound.pause();

        // Change to shot image
        bird.src = shotBirdImage;
        shotSound.play();

        setTimeout(() => {
            // Change to falling image and start falling animation
            bird.src = deadBirdImage;
            bird.classList.add('fall');
            bird.style.transform = `translateY(${window.innerHeight - bird.getBoundingClientRect().bottom}px)`;
            fallSound.play();

            // Reset the bird after falling animation
            setTimeout(() => {
                bird.classList.remove('fall');
                bird.style.transform = 'none';
                bird.src = defaultBirdImage; // Reset to default bird image
                displayNextWord(); // Display the next word or center image
                startBirdMovement(); // Start bird movement again if needed
            }, 2000); // Duration should match the CSS transition
        }, 1000); // Show shot image for 1 second
    }

    bird.addEventListener('click', () => {
        birdShot();
    });

    duckhuntBg.addEventListener('click', () => {
        clickSound.play();
    });

    startBirdMovement();
});
