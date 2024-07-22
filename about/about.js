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
                buttons.left.textContent = 'Left';
                buttons.right.textContent = 'Resume';
                buttons.top.textContent = 'Top';
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
    const artworkFolder = 'artwork/';
    const totalImages = 87;
    const imagesPerPage = 12;
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


