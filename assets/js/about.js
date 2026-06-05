document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.getElementById('menu-toggle');
    const modalBg = document.getElementById('modal-bg');
    const closeModal = document.getElementById('close-modal');

    menuToggle.addEventListener('click', () => {
        modalBg.classList.remove('hidden');
    });

    closeModal.addEventListener('click', () => {
        modalBg.classList.add('hidden');
    });

    modalBg.addEventListener('click', (e) => {
        if (e.target === modalBg) {
            modalBg.classList.add('hidden');
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('.section');
    const palette = ['#f8fafc', '#c7d2fe', '#93c5fd', '#a3e635', '#facc15'];
    const pixelSize = 8;
    const maxPixels = 140;

    sections.forEach((section) => {
        const canvas = document.createElement('canvas');
        canvas.className = 'pixel-trail-canvas';
        canvas.setAttribute('aria-hidden', 'true');
        section.prepend(canvas);

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const pixels = [];
        let animationFrame = null;
        let dpr = Math.min(window.devicePixelRatio || 1, 2);
        let lastSpawnAt = 0;

        function resizeCanvas() {
            const bounds = section.getBoundingClientRect();
            dpr = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = Math.floor(bounds.width * dpr);
            canvas.height = Math.floor(bounds.height * dpr);
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.scale(dpr, dpr);
        }

        function spawnPixel(clientX, clientY) {
            const bounds = section.getBoundingClientRect();
            const x = clientX - bounds.left;
            const y = clientY - bounds.top;

            for (let i = 0; i < 3; i++) {
                pixels.push({
                    x: x + (Math.random() - 0.5) * 18,
                    y: y + (Math.random() - 0.5) * 18,
                    vx: (Math.random() - 0.5) * 1.4,
                    vy: (Math.random() - 0.5) * 1.4 - 0.3,
                    life: 1,
                    fade: 0.018 + Math.random() * 0.02,
                    size: pixelSize + Math.floor(Math.random() * 2) * 4,
                    color: palette[Math.floor(Math.random() * palette.length)]
                });
            }

            if (pixels.length > maxPixels) {
                pixels.splice(0, pixels.length - maxPixels);
            }

            if (!animationFrame) {
                animationFrame = requestAnimationFrame(renderPixels);
            }
        }

        function renderPixels() {
            const width = canvas.width / dpr;
            const height = canvas.height / dpr;
            ctx.clearRect(0, 0, width, height);

            for (let i = pixels.length - 1; i >= 0; i--) {
                const pixel = pixels[i];
                pixel.x += pixel.vx;
                pixel.y += pixel.vy;
                pixel.vy += 0.01;
                pixel.life -= pixel.fade;

                if (pixel.life <= 0) {
                    pixels.splice(i, 1);
                    continue;
                }

                ctx.globalAlpha = pixel.life;
                ctx.fillStyle = pixel.color;
                ctx.fillRect(
                    Math.round(pixel.x / pixelSize) * pixelSize,
                    Math.round(pixel.y / pixelSize) * pixelSize,
                    pixel.size,
                    pixel.size
                );
            }

            ctx.globalAlpha = 1;

            if (pixels.length > 0) {
                animationFrame = requestAnimationFrame(renderPixels);
            } else {
                animationFrame = null;
            }
        }

        function handlePointer(clientX, clientY) {
            const now = performance.now();
            if (now - lastSpawnAt < 22) return;
            lastSpawnAt = now;
            spawnPixel(clientX, clientY);
        }

        section.addEventListener('mousemove', (event) => {
            handlePointer(event.clientX, event.clientY);
        });

        section.addEventListener('touchmove', (event) => {
            const touch = event.touches[0];
            if (!touch) return;
            handlePointer(touch.clientX, touch.clientY);
        }, { passive: true });

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const mainSection = document.getElementById('main');
    if (!mainSection) return;

    const canvas = document.createElement('canvas');
    canvas.className = 'pixel-rain-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    mainSection.prepend(canvas);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drops = [];
    const dropCount = 52;
    const palette = ['#c7d2fe', '#93c5fd', '#f8fafc', '#a3e635'];
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;

    function resizeCanvas() {
        const bounds = mainSection.getBoundingClientRect();
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        width = bounds.width;
        height = bounds.height;
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);
    }

    function resetDrop(drop, initial = false) {
        const startBand = Math.max(width, height) * 0.35;
        drop.x = initial ? Math.random() * width : (Math.random() * (width + startBand)) - startBand;
        drop.y = initial ? Math.random() * height : -Math.random() * (height * 0.45 + 80);
        drop.vx = 0.9 + Math.random() * 1.4;
        drop.vy = 1.3 + Math.random() * 1.9;
        drop.length = 10 + Math.floor(Math.random() * 4) * 4;
        drop.size = 4 + Math.floor(Math.random() * 2) * 4;
        drop.alpha = 0.15 + Math.random() * 0.22;
        drop.color = palette[Math.floor(Math.random() * palette.length)];
    }

    function initDrops() {
        drops.length = 0;
        for (let i = 0; i < dropCount; i++) {
            const drop = {};
            resetDrop(drop, true);
            drops.push(drop);
        }
    }

    function renderRain() {
        ctx.clearRect(0, 0, width, height);

        for (const drop of drops) {
            drop.x += drop.vx;
            drop.y += drop.vy;

            if (drop.y - drop.length > height || drop.x - drop.length > width) {
                resetDrop(drop, false);
            }

            ctx.globalAlpha = drop.alpha;
            ctx.fillStyle = drop.color;

            for (let segment = 0; segment < 3; segment++) {
                const segX = Math.round((drop.x - segment * drop.length) / 8) * 8;
                const segY = Math.round((drop.y - segment * drop.length) / 8) * 8;
                const segAlpha = drop.alpha * (1 - segment * 0.28);
                ctx.globalAlpha = segAlpha;
                ctx.fillRect(segX, segY, drop.size, drop.size);
            }
        }

        ctx.globalAlpha = 1;
        requestAnimationFrame(renderRain);
    }

    window.addEventListener('resize', () => {
        resizeCanvas();
        initDrops();
    });

    resizeCanvas();
    initDrops();
    requestAnimationFrame(renderRain);
});

document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('.section');
    let currentSection = 'main';

    const buttons = {
        left: document.getElementById('navigate-left'),
        right: document.getElementById('navigate-right'),
        top: document.getElementById('navigate-top'),
        bottom: document.getElementById('navigate-bottom')
    };

    function updateButtons() {
        Object.values(buttons).forEach(button => button.classList.add('hidden'));
        switch (currentSection) {
            case 'main':
                buttons.left.classList.remove('hidden');
                buttons.right.classList.remove('hidden');
                buttons.top.classList.remove('hidden');
                buttons.bottom.classList.remove('hidden');
                buttons.left.textContent = 'Notes';
                buttons.right.textContent = 'CV';
                buttons.top.textContent = 'Config';
                buttons.bottom.textContent = 'Artwork';
                break;
            case 'left':
                buttons.right.classList.remove('hidden');
                buttons.right.textContent = 'MAIN';
                break;
            case 'right':
                buttons.left.classList.remove('hidden');
                buttons.left.textContent = 'MAIN';
                break;
            case 'top':
                buttons.bottom.classList.remove('hidden');
                buttons.bottom.textContent = 'MAIN';
                break;
            case 'bottom':
                buttons.top.classList.remove('hidden');
                buttons.top.textContent = 'MAIN';
                break;
        }
    }

    function navigateToSection(sectionId) {
        sections.forEach(section => {
            if (section.id === sectionId) {
                section.style.transform = 'translate(0, 0)';
                section.classList.add('z-2');
                section.classList.remove('z-1');
            } else if (section.id === 'main' && sectionId !== 'main') {
                switch (sectionId) {
                    case 'left':
                        section.style.transform = 'translateX(100vw)';
                        break;
                    case 'right':
                        section.style.transform = 'translateX(-100vw)';
                        break;
                    case 'top':
                        section.style.transform = 'translateY(100vh)';
                        break;
                    case 'bottom':
                        section.style.transform = 'translateY(-100vh)';
                        break;
                }
                section.classList.add('z-2');
            } else {
                section.classList.add('z-1');
                section.classList.remove('z-2');
                switch (section.id) {
                    case 'left':
                        section.style.transform = 'translateX(-100vw)';
                        break;
                    case 'right':
                        section.style.transform = 'translateX(100vw)';
                        break;
                    case 'top':
                        section.style.transform = 'translateY(-100vh)';
                        break;
                    case 'bottom':
                        section.style.transform = 'translateY(100vh)';
                        break;
                }
            }
        });
        currentSection = sectionId;
        updateButtons();
    }

    buttons.left.addEventListener('click', () => {
        if (currentSection === 'main') {
            navigateToSection('left');
        } else if (currentSection === 'right') {
            navigateToSection('main');
        }
    });

    buttons.right.addEventListener('click', () => {
        if (currentSection === 'main') {
            navigateToSection('right');
        } else if (currentSection === 'left') {
            navigateToSection('main');
        }
    });

    buttons.top.addEventListener('click', () => {
        if (currentSection === 'main') {
            navigateToSection('top');
        } else if (currentSection === 'bottom') {
            navigateToSection('main');
        }
    });

    buttons.bottom.addEventListener('click', () => {
        if (currentSection === 'main') {
            navigateToSection('bottom');
        } else if (currentSection === 'top') {
            navigateToSection('main');
        }
    });

    const menuToggle = document.getElementById('menu-toggle');
    const modalBg = document.getElementById('modal-bg');
    const closeModal = document.getElementById('close-modal');

    menuToggle.addEventListener('click', () => {
        modalBg.classList.toggle('hidden');
    });

    closeModal.addEventListener('click', () => {
        modalBg.classList.add('hidden');
    });

    const artworkContainer = document.querySelector('.artwork-container');
    const artworkFolder = ARTWORK_FOLDER;
    const totalImages = ARTWORK_TOTAL_IMAGES;
    const imagesPerPage = ARTWORK_IMAGES_PER_PAGE;
    let currentPage = 1;

    function loadArtworkPage(page) {
        artworkContainer.innerHTML = '';
        const startIndex = totalImages - ((page - 1) * imagesPerPage);
        const endIndex = Math.max(startIndex - imagesPerPage, 0);

        for (let i = startIndex; i > endIndex; i--) {
            const img = document.createElement('img');
            img.src = `${artworkFolder}${i}.jpg`;
            img.alt = 'Artwork';
            artworkContainer.appendChild(img);
        }

        document.getElementById('page-info').textContent = `${currentPage}`;

        document.getElementById('prev-page').disabled = currentPage === 1;
        document.getElementById('next-page').disabled = currentPage === Math.ceil(totalImages / imagesPerPage);
    }

    document.getElementById('prev-page').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            loadArtworkPage(currentPage);
        }
    });

    document.getElementById('next-page').addEventListener('click', () => {
        if (currentPage < Math.ceil(totalImages / imagesPerPage)) {
            currentPage++;
            loadArtworkPage(currentPage);
        }
    });

    loadArtworkPage(currentPage);
    updateButtons();
});

document.getElementById('menu-toggle').addEventListener('click', function () {
    const menu = document.getElementById('mobile-menu');
    menu.classList.toggle('hidden');
});
