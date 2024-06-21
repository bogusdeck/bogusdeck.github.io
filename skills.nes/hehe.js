document.addEventListener('DOMContentLoaded', () => {
    const bird = document.querySelector('.bird');
    const duckhuntBg = document.querySelector('.duckhunt-bg');
    const gameEndBg = document.querySelector('.gameend-bg');
    const gameContainer = document.querySelector('.game-container');
    const wordBox = document.querySelector('.word-box');
    const wordBox2 = document.querySelector('.word-box-2');
    const startButton = document.getElementById('start-button');
    const loopSound = document.getElementById('loop-sound');
    const clickSound = document.getElementById('click-sound');
    const duckInit = document.getElementById('duckinit-sound');
    const flySound = document.getElementById('fly-sound');
    const shotSound = document.getElementById('shot-sound');
    const fallSound = document.getElementById('fall-sound');
    const gameEndSound = document.getElementById('game-end-sound'); // New end game sound
    let moveInterval;
    let wordIndex = 0;
    const words1 = ['python', 'html', 'css', 'js', 'sql', 'mongoDB', 'Lua'];
    const words2 = ['react', 'node', 'express', 'typescript', 'graphql'];
    const defaultBirdImage = 'skills.nes/flyduck.gif'; // Default bird image
    const shotBirdImage = 'skills.nes/shotduck.png'; // Image when the bird is shot
    const deadBirdImage = 'skills.nes/deadduck.gif'; // Image when the bird is falling

    function getRandomYPosition() {
        const bgRect = duckhuntBg.getBoundingClientRect();
        const birdRect = bird.getBoundingClientRect();
        const skyHeight = bgRect.height * 0.6; // 60% of the image height
        const maxY = skyHeight - birdRect.height;
        const y = Math.random() * maxY;
        return y;
    }

    function startBirdMovement() {
        // Play the sound effect
        flySound.play();
        
        // Get the dimensions of the game container and the bird
        const gameContainerRect = gameContainer.getBoundingClientRect();
        const birdRect = bird.getBoundingClientRect();
        
        // Calculate the maximum position for the bird to spawn inside the container
        const maxX = gameContainerRect.width - birdRect.width;
        const maxY = gameContainerRect.height / 2;
        
        // Set the initial position of the bird to the left side of the container
        const birdX = 0;
        const birdY = Math.random() * maxY;
        
        // Set the initial position of the bird
        bird.style.left = `${birdX}px`;
        bird.style.top = `${birdY}px`;
        
        // Make the bird visible
        bird.classList.remove('hidden');
        
        // Move the bird within the container
        moveInterval = setInterval(() => {
            // Move the bird to the right
            const currentX = parseFloat(bird.style.left) || 0;
            bird.style.left = `${currentX + 5}px`;
            
            // If the bird reaches the right edge, reset its position to the left edge
            if (parseFloat(bird.style.left) > maxX) {
                bird.style.left = `-${birdRect.width}px`;
                bird.style.top = `${Math.random() * maxY}px`;
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
        if (wordIndex < words1.length + words2.length) {
            const wordBoxElement = document.createElement('div');
            wordBoxElement.classList.add('word-container', 'bulbula', 'medium', 'word');
            if (wordIndex < words1.length) {
                wordBoxElement.textContent = words1[wordIndex++];
                wordBox.appendChild(wordBoxElement);
            } else {
                wordBoxElement.textContent = words2[wordIndex++ - words1.length];
                wordBox2.appendChild(wordBoxElement);
            }
        } else {
            // All words are displayed, show game end background
            resetBird();
            duckhuntBg.classList.add('hidden');
            gameEndBg.classList.remove('hidden');
            gameEndSound.play(); // Play the end game sound
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
            const gameContainerRect = gameContainer.getBoundingClientRect();
            const birdRect = bird.getBoundingClientRect();
            const distanceToBottom = gameContainerRect.bottom - birdRect.bottom;
            bird.style.transform = `translateY(${distanceToBottom}px)`;
            fallSound.play();

            // Reset the bird after falling animation
            setTimeout(() => {
                bird.classList.remove('fall');
                bird.style.transform = 'none';
                bird.src = defaultBirdImage; // Reset to default bird image
                displayNextWord(); // Display the next word or end the game
                if (wordIndex < words1.length + words2.length) {
                    startBirdMovement(); // Start bird movement again if needed
                }
            }, 1400); // Duration should match the CSS transition
        }, 1000); // Show shot image for 1 second
    }

    bird.addEventListener('click', () => {
        birdShot();
    });

    duckhuntBg.addEventListener('click', () => {
        clickSound.play();
    });

    startButton.addEventListener('click', () => {
        loopSound.pause();
        loopSound.currentTime = 0;
        startButton.classList.add('hidden');
        startBirdMovement();
    });

    // Play the loop sound when the game container is in view
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                loopSound.play();
            } else {
                loopSound.pause();
                loopSound.currentTime = 0;
            }
        });
    });

    observer.observe(gameContainer);
});
