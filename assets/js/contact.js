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
    const shotFlash = document.getElementById('shot-flash');
    const dogLaughingSound = document.getElementById('dog-laughing-sound') || new Audio(DUCKHUNT_SOUNDS.dogLaughing);
    const highScoreSound = document.getElementById('high-score-sound') || new Audio(DUCKHUNT_SOUNDS.highScore);

    // Lower volume for all sounds to DUCKHUNT_VOLUME_LEVEL
    if (loopSound) loopSound.volume = DUCKHUNT_VOLUME_LEVEL;
    if (clickSound) clickSound.volume = DUCKHUNT_VOLUME_LEVEL;
    if (duckInit) duckInit.volume = DUCKHUNT_VOLUME_LEVEL;
    if (flySound) flySound.volume = DUCKHUNT_VOLUME_LEVEL;
    if (shotSound) shotSound.volume = DUCKHUNT_VOLUME_LEVEL;
    if (fallSound) fallSound.volume = DUCKHUNT_VOLUME_LEVEL;
    if (gameEndSound) gameEndSound.volume = DUCKHUNT_VOLUME_LEVEL;
    if (dogLaughingSound) dogLaughingSound.volume = DUCKHUNT_VOLUME_LEVEL;
    if (highScoreSound) highScoreSound.volume = DUCKHUNT_VOLUME_LEVEL;
    const gameForeground = document.querySelector('.game-foreground');
    const dog = document.querySelector('.dog');

    let moveInterval;
    let wordIndex = 0;
    const words1 = ['Python', 'Html/CSS', 'Javascript', 'TypeScript', 'SQL', 'mongoDB', 'Lua', 'C++'];
    const words2 = ['React.js', 'Node.js', 'Flask', 'Django', 'Scikit', 'Pandas', 'Matplotlib', 'FastAPI', 'Angular', 'Next.js'];

    // Game state
    let bullets = 3;
    let score = 0;
    let hits = 0;
    let currentBirdColor = 'black';
    let birdX = 0;
    let birdY = 0;
    let vx = 0;
    let vy = 0;
    let isShot = false;
    let isEscaping = false;
    let misses = 0;

    const bulletContainer = document.getElementById('bullet-container');
    const hitContainer = document.getElementById('hit-container');
    const scoreDisplay = document.getElementById('score-display');

    function updateHUD() {
        // Update bullets
        if (bulletContainer) {
            bulletContainer.innerHTML = '';
            for (let i = 0; i < 3; i++) {
                const b = document.createElement('div');
                b.classList.add('bullet');
                if (i >= bullets) b.classList.add('spent');
                bulletContainer.appendChild(b);
            }
        }

        // Update score
        if (scoreDisplay) {
            scoreDisplay.textContent = score.toString().padStart(6, '0');
        }

        // Update hits
        if (hitContainer) {
            const hitIcons = hitContainer.querySelectorAll('.hit-icon');
            hitIcons.forEach((icon, index) => {
                const activeIndex = hits % 10;
                if (index < (activeIndex === 0 && hits > 0 ? 10 : activeIndex)) {
                    icon.classList.add('active');
                } else {
                    icon.classList.remove('active');
                }
            });
        }
    }

    function flashScreen() {
        if (shotFlash) {
            shotFlash.classList.remove('hidden');
            setTimeout(() => shotFlash.classList.add('hidden'), 80);
        }
    }

    function showDogAnimation(isPerfect, callback) {
        if (!dog) {
            if (callback) callback();
            return;
        }
        dog.src = isPerfect ? DUCKHUNT_IMAGES.perfectDog : DUCKHUNT_IMAGES.laughingDog;
        if (isPerfect) {
            dog.style.width = '14rem';
            dog.style.height = '14rem';
            dog.style.left = '35%';
            if (highScoreSound) {
                highScoreSound.currentTime = 0;
                highScoreSound.play();
            }
        } else {
            dog.style.width = '';
            dog.style.height = '';
            dog.style.left = '40%';
            if (dogLaughingSound) {
                dogLaughingSound.currentTime = 0;
                dogLaughingSound.play();
            }
        }
        const curH = gameContainer.offsetHeight;
        let dogY = curH * 0.75;
        const targetY = isPerfect ? curH * 0.49 : curH * 0.50;
        dog.style.top = `${dogY}px`;
        dog.classList.remove('hidden');
        const slideUp = setInterval(() => {
            dogY -= 4;
            dog.style.top = `${dogY}px`;
            if (dogY <= targetY) {
                clearInterval(slideUp);
                const delay = isPerfect ? 2000 : 1300;
                setTimeout(() => {
                    const slideDown = setInterval(() => {
                        dogY += 4;
                        dog.style.top = `${dogY}px`;
                        if (dogY >= curH * 0.75) {
                            clearInterval(slideDown);
                            dog.classList.add('hidden');
                            dog.style.width = '';
                            dog.style.height = '';
                            dog.style.left = '';
                            if (callback) callback();
                        }
                    }, 15);
                }, delay);
            }
        }, 15);
    }

    function startBirdMovement() {
        if (wordIndex >= words1.length + words2.length) {
            resetBird();
            duckhuntBg.classList.add('hidden');
            if (gameForeground) gameForeground.classList.add('hidden');
            gameEndBg.classList.remove('hidden');
            gameEndSound.play();
            return;
        }

        if (gameForeground) gameForeground.classList.remove('hidden');

        flySound.play();

        bullets = 3;
        isShot = false;
        isEscaping = false;
        bird.style.pointerEvents = 'auto';

        const containerRect = gameContainer.getBoundingClientRect();
        const birdW = bird.offsetWidth || 112;
        const birdH = bird.offsetHeight || 112;

        const maxX = containerRect.width - birdW;

        // Choose random color
        const colors = ['black', 'red', 'blue'];
        currentBirdColor = colors[Math.floor(Math.random() * colors.length)];

        // Start near grass line at bottom of sky
        birdX = Math.random() * maxX;
        birdY = containerRect.height * 0.65;

        bird.style.left = `${birdX}px`;
        bird.style.top = `${birdY}px`;
        bird.style.transform = 'none';

        // Velocities: get progressively faster as they shoot more birds (5% per hit)
        const speedMultiplier = 1 + (hits * 0.05);
        vx = (Math.random() > 0.5 ? 1 : -1) * (4 + Math.random() * 3) * speedMultiplier;
        vy = -(3 + Math.random() * 3) * speedMultiplier; // fly up diagonally!

        bird.src = `../images/contact/duck_${currentBirdColor}_fly_diag.gif`;
        bird.style.transform = vx < 0 ? 'scaleX(-1)' : 'none';
        bird.classList.remove('hidden');

        updateHUD();

        clearInterval(moveInterval);
        moveInterval = setInterval(() => {
            birdX += vx;
            birdY += vy;

            const curW = gameContainer.offsetWidth;
            const curH = gameContainer.offsetHeight;
            const bw = bird.offsetWidth || 112;
            const bh = bird.offsetHeight || 112;

            // Bounce horizontal walls
            if (birdX <= 0) {
                birdX = 0;
                vx = -vx;
                bird.style.transform = vx < 0 ? 'scaleX(-1)' : 'none';
            } else if (birdX >= curW - bw) {
                birdX = curW - bw;
                vx = -vx;
                bird.style.transform = vx < 0 ? 'scaleX(-1)' : 'none';
            }

            // Bounce vertical walls (top limit 100px to clear title header/navbar, bottom limit 0.70 of height)
            const minY = 100;
            const maxY = curH * 0.70 - bh;
            if (birdY <= minY) {
                birdY = minY;
                vy = -vy;
            } else if (birdY >= maxY) {
                birdY = maxY;
                vy = -vy;
            }

            bird.style.left = `${birdX}px`;
            bird.style.top = `${birdY}px`;

            // Change image depending on vertical movement
            if (Math.abs(vy) > 0.5) {
                if (!bird.src.includes('diag')) {
                    bird.src = `../images/contact/duck_${currentBirdColor}_fly_diag.gif`;
                }
            } else {
                if (!bird.src.includes('horiz')) {
                    bird.src = `../images/contact/duck_${currentBirdColor}_fly_horiz.gif`;
                }
            }

            // 1.5% chance to randomly change direction during flight
            if (Math.random() < 0.015) {
                vx = (vx > 0 ? 1 : -1) * (4 + Math.random() * 3) * speedMultiplier;
                if (Math.random() < 0.3) {
                    vy = 0;
                } else {
                    vy = (Math.random() > 0.5 ? 1 : -1) * (3 + Math.random() * 3) * speedMultiplier;
                }
                bird.style.transform = vx < 0 ? 'scaleX(-1)' : 'none';
            }
        }, 30);
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
            if (skipButton) skipButton.classList.add("hidden");
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
            if (gameForeground) gameForeground.classList.add('hidden');
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
        if (gameForeground) gameForeground.classList.add('hidden');
        if (startButton) startButton.classList.add('hidden');
        gameEndBg.classList.remove('hidden');
        gameEndSound.play();
    }

    function birdShot() {
        if (isShot || isEscaping || bullets <= 0) return;
        isShot = true;
        clearInterval(moveInterval);
        flySound.pause();
        bird.style.pointerEvents = 'none';

        bullets--;
        hits++;
        score += 10000;
        updateHUD();

        flashScreen();
        bird.src = `../images/contact/duck_${currentBirdColor}_shot.png`;
        shotSound.currentTime = 0;
        shotSound.play();

        setTimeout(() => {
            bird.src = `../images/contact/duck_${currentBirdColor}_dead.gif`;
            fallSound.currentTime = 0;
            fallSound.play();

            const curH = gameContainer.offsetHeight;
            const targetY = curH * 0.75;
            let fallY = birdY;

            const fallInterval = setInterval(() => {
                fallY += 6;
                bird.style.top = `${fallY}px`;
                if (fallY >= targetY) {
                    clearInterval(fallInterval);
                    bird.classList.add('hidden');
                    if (hits === 10) {
                        showDogAnimation(true, () => {
                            displayNextWord();
                            if (wordIndex < words1.length + words2.length) {
                                setTimeout(() => {
                                    startBirdMovement();
                                }, 600);
                            }
                        });
                    } else {
                        displayNextWord();
                        if (wordIndex < words1.length + words2.length) {
                            setTimeout(() => {
                                startBirdMovement();
                            }, 600);
                        }
                    }
                }
            }, 20);
        }, 800);
    }

    // Handles misses (clicking game container but not the bird)
    gameContainer.addEventListener('click', (e) => {
        // If startButton is visible, the game has not started yet
        if (!startButton.classList.contains('hidden')) return;
        // If game is ended, ignore clicks
        if (!gameEndBg.classList.contains('hidden')) return;

        if (e.target === startButton || e.target === skipButton) return;
        if (isShot || isEscaping) return;

        if (e.target !== bird) {
            if (bullets > 0) {
                bullets--;
                misses++;
                updateHUD();
                clickSound.currentTime = 0;
                clickSound.play();
                flashScreen();

                if (bullets === 0) {
                    // Duck escapes!
                    isEscaping = true;
                    clearInterval(moveInterval);
                    flySound.pause();
                    bird.style.pointerEvents = 'none';
                    bird.src = `../images/contact/duck_${currentBirdColor}_fly_horiz.gif`;

                    let escapeY = birdY;
                    const escapeInterval = setInterval(() => {
                        escapeY -= 8;
                        bird.style.top = `${escapeY}px`;
                        if (escapeY < -120) {
                            clearInterval(escapeInterval);
                            bird.classList.add('hidden');
                            // Show the laughing dog, then retry spawning a bird
                            showDogAnimation(false, () => {
                                startBirdMovement();
                            });
                        }
                    }, 30);
                }
            }
        }
    });

    bird.addEventListener('click', (e) => {
        e.stopPropagation();
        birdShot();
    });

    startButton.addEventListener('click', () => {
        loopSound.pause();
        loopSound.currentTime = 0;
        startButton.classList.add('hidden');
        hits = 0;
        misses = 0;
        score = 0;
        updateHUD();
        startBirdMovement();
    });

    if (skipButton) {
        skipButton.addEventListener('click', () => {
            displayAllWords();
        });
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Only play loop sound if game hasn't started yet
                if (!startButton.classList.contains('hidden')) {
                    loopSound.play();
                }
            } else {
                loopSound.pause();
                loopSound.currentTime = 0;
            }
        });
    });

    observer.observe(gameContainer);
});
