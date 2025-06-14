document.addEventListener('DOMContentLoaded', () => {
    const bird = document.querySelector('.bird');
    const duckhuntBg = document.querySelector('.duckhunt-bg');
    const gameEndBg = document.querySelector('.gameend-bg');
    const gameContainer = document.querySelector('.game-container');
    const wordBox = document.querySelector('.word-box');
    const wordBox2 = document.querySelector('.word-box-2');
    const startButton = document.getElementById('start-button');
    const skipButton = document.getElementById('skip-button');
    const loopSound = document.getElementById('loop-sound');
    const clickSound = document.getElementById('click-sound');
    const duckInit = document.getElementById('duckinit-sound');
    const flySound = document.getElementById('fly-sound');
    const shotSound = document.getElementById('shot-sound');
    const fallSound = document.getElementById('fall-sound');
    const gameEndSound = document.getElementById('game-end-sound');
    let moveInterval;
    let wordIndex = 0;
    const words1 = ['Python', 'Html/CSS', 'Javascript', 'TypeScript', 'SQL', 'mongoDB', 'Lua', 'C++'];
    const words2 = ['React.js', 'Node.js', 'Flask', 'Django', 'Scikit', 'Pandas', 'Matplotlib', 'FastAPI', 'Angular', 'Next.js'];
    const defaultBirdImage = 'skills.nes/flyduck.gif';
    const shotBirdImage = 'skills.nes/shotduck.png';
    const deadBirdImage = 'skills.nes/deadduck.gif';

    function getRandomYPosition() {
        const bgRect = duckhuntBg.getBoundingClientRect();
        const birdRect = bird.getBoundingClientRect();
        const skyHeight = bgRect.height * 0.6;
        const maxY = skyHeight - birdRect.height;
        const y = Math.random() * maxY;
        return y;
    }

    function startBirdMovement() {
        flySound.play();

        const gameContainerRect = gameContainer.getBoundingClientRect();
        const birdRect = bird.getBoundingClientRect();

        const maxX = gameContainerRect.width - birdRect.width;
        const maxY = gameContainerRect.height / 2;

        const birdX = 0;
        const birdY = Math.random() * maxY;

        bird.style.left = `${birdX}px`;
        bird.style.top = `${birdY}px`;

        bird.classList.remove('hidden');

        moveInterval = setInterval(() => {
            const currentX = parseFloat(bird.style.left) || 0;
            bird.style.left = `${currentX + 5}px`;


            if (parseFloat(bird.style.left) > maxX) {
                bird.style.left = `-${birdRect.width}px`;
                bird.style.top = `${Math.random() * maxY}px`;
            }
        }, 50);
    }

    function resetBird() {
        clearInterval(moveInterval);
        bird.classList.add('hidden');
        flySound.pause();
        flySound.currentTime = 0;
    }

    function displayNextWord() {
        if (wordIndex < words1.length + words2.length) {
            const wordBoxElement = document.createElement('div');
            skipButton.classList.add("hidden")
            wordBoxElement.classList.add('word-container', 'bulbula', 'medium', 'word');
            if (wordIndex < words1.length) {
                wordBoxElement.textContent = words1[wordIndex++];
                wordBox.appendChild(wordBoxElement);
            } else {
                wordBoxElement.textContent = words2[wordIndex++ - words1.length];
                wordBox2.appendChild(wordBoxElement);
            }
        } else {
            resetBird();
            duckhuntBg.classList.add('hidden');
            gameEndBg.classList.remove('hidden');
            gameEndSound.play();
        }
    }

    function displayAllWords() {
        wordBox.innerHTML = '';
        wordBox2.innerHTML = '';

        words1.forEach(word => {
            const wordBoxElement = document.createElement('div');
            wordBoxElement.classList.add('word-container', 'bulbula', 'medium', 'word');
            wordBoxElement.textContent = word;
            wordBox.appendChild(wordBoxElement);
        });

        words2.forEach(word => {
            const wordBoxElement = document.createElement('div');
            wordBoxElement.classList.add('word-container', 'bulbula', 'medium', 'word');
            wordBoxElement.textContent = word;
            wordBox2.appendChild(wordBoxElement);
        });

        resetBird();
        duckhuntBg.classList.add('hidden');
        startButton.classList.add('hidden');
        gameEndBg.classList.remove('hidden');
        gameEndSound.play();
    }


    function birdShot() {
        clearInterval(moveInterval);
        flySound.pause();

        bird.src = shotBirdImage;
        shotSound.play();

        setTimeout(() => {
            bird.src = deadBirdImage;
            bird.classList.add('fall');
            const gameContainerRect = gameContainer.getBoundingClientRect();
            const birdRect = bird.getBoundingClientRect();
            const distanceToBottom = gameContainerRect.bottom - birdRect.bottom;
            bird.style.transform = `translateY(${distanceToBottom}px)`;
            fallSound.play();

            setTimeout(() => {
                bird.classList.remove('fall');
                bird.style.transform = 'none';
                bird.src = defaultBirdImage;
                displayNextWord();
                if (wordIndex < words1.length + words2.length) {
                    startBirdMovement();
                }
            }, 1400);
        }, 1000);
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

    skipButton.addEventListener('click', () => {
        displayAllWords();
    });

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
