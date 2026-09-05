class NavbarMenu extends HTMLElement {
    constructor() {
        super();
        // Using light DOM so global CSS applies easily
    }

    connectedCallback() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        
        // Helper to check if a link is the active page (optional styling)
        const isActive = (page) => currentPage === page ? 'text-yellow-400 font-bold' : 'text-white';

        this.innerHTML = `
            <header class="w-full">
                <nav class="navbar">
                    <div class="navbar-desktop items-center justify-between w-full">
                        <div class="flex items-center space-x-4">
                            <a class="nav-item ${isActive('blog.html')}" href="blog.html">Blog</a>
                            <a class="nav-item ${isActive('project.html')}" href="project.html">Projects</a>
                        </div>
                        <a href="index.html" class="flex items-center justify-center">
                            <img src="assets/index/images/logo.png" alt="logo" class="h-8 img">
                        </a>
                        <div class="flex items-center space-x-4">
                            <a class="nav-item ${isActive('about.html')}" href="about.html">About</a>
                            <a class="nav-item ${isActive('contact.html')}" href="contact.html">Contact</a>
                        </div>
                    </div>
                    <!-- Hamburger menu -->
                    <div class="md:hidden flex items-center justify-between w-full">
                        <a href="index.html" class="flex items-center justify-start">
                            <img src="assets/index/images/logo.png" alt="logo" class="h-8 img">
                        </a>
                        <button id="menu-toggle" class="flex items-center justify-end">
                            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M4 6h16M4 12h16m-7 6h7">
                                </path>
                            </svg>
                        </button>
                    </div>
                    <div id="mobile-menu" class="hidden absolute top-0 right-0 bg-black w-full mt-14 z-50 text-right border-b-2 border-white">
                        <a class="block py-3 px-4 text-white hover:bg-gray-800" href="index.html">Home</a>
                        <a class="block py-3 px-4 text-white hover:bg-gray-800" href="project.html">Projects</a>
                        <a class="block py-3 px-4 text-white hover:bg-gray-800" href="blog.html">Blog</a>
                        <a class="block py-3 px-4 text-white hover:bg-gray-800" href="about.html">About</a>
                        <a class="block py-3 px-4 text-white hover:bg-gray-800" href="contact.html">Contact</a>
                    </div>
                </nav>
            </header>
        `;

        // Add the menu toggle logic right inside the component!
        const menuToggle = this.querySelector('#menu-toggle');
        const mobileMenu = this.querySelector('#mobile-menu');

        if (menuToggle && mobileMenu) {
            menuToggle.addEventListener('click', (event) => {
                event.stopPropagation();
                mobileMenu.classList.toggle('hidden');
            });
        }

        // Close menu when clicking outside
        document.addEventListener('click', (event) => {
            if (!mobileMenu.classList.contains('hidden')) {
                if (!menuToggle.contains(event.target) && !mobileMenu.contains(event.target)) {
                    mobileMenu.classList.add('hidden');
                }
            }
        });
    }
}

customElements.define('navbar-menu', NavbarMenu);
