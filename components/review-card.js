class ReviewCard extends HTMLElement {
    constructor() {
        super();
        // Here we aren't using Shadow DOM so it inherits Tailwind classes from the global CSS
    }

    connectedCallback() {
        const name = this.getAttribute('name') || 'Name';
        const role = this.getAttribute('role') || '';
        const spriteIndex = this.getAttribute('sprite') || '0';
        const starsCount = parseInt(this.getAttribute('stars')) || 5;
        
        let stars = '';
        for (let i = 0; i < 5; i++) {
            if (i < starsCount) stars += '★';
            else stars += '☆';
        }

        // We embed the specific CSS logic needed for this component
        // combined with HTML and JS in one file!
        this.innerHTML = `
            <style>
                .review-card-wrapper {
                    width: 280px;
                    flex-shrink: 0;
                    margin-right: 1.5rem;
                    padding: 1rem;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    height: 100%;
                }
                
                @media (min-width: 768px) {
                    .review-card-wrapper {
                        width: 300px;
                    }
                }
                
                .pfp-sprite-comp {
                    width: 64px;
                    height: 64px;
                    background-image: url('assets/index/images/testimony_sprites.jpg');
                    background-size: 256px 256px;
                    image-rendering: pixelated;
                    image-rendering: crisp-edges;
                    background-repeat: no-repeat;
                    border-radius: 50%;
                    border: 2px solid #fff;
                    box-shadow: 0 4px 0 rgba(0, 0, 0, 0.4);
                    display: inline-block;
                }
                
                .pfp-sprite-comp.s-0 { background-position: 0px 0px; }
                .pfp-sprite-comp.s-1 { background-position: -64px 0px; }
                .pfp-sprite-comp.s-2 { background-position: -128px 0px; }
                .pfp-sprite-comp.s-3 { background-position: -192px 0px; }
                .pfp-sprite-comp.s-4 { background-position: 0px -64px; }
                .pfp-sprite-comp.s-5 { background-position: -64px -64px; }
                .pfp-sprite-comp.s-6 { background-position: -128px -64px; }
                .pfp-sprite-comp.s-7 { background-position: -192px -64px; }
                .pfp-sprite-comp.s-8 { background-position: 0px -128px; }
                .pfp-sprite-comp.s-9 { background-position: -64px -128px; }
                .pfp-sprite-comp.s-10 { background-position: -128px -128px; }
            </style>
            
            <div class="review-card-wrapper boxxy border-2 border-white">
                <div class="flex flex-col items-center mb-4">
                    <div class="pfp-sprite-comp s-${spriteIndex} mb-2"></div>
                    <h3 class="text-lg font-bold">${name}</h3>
                    ${role ? \`<p class="text-[10px] text-gray-400">\${role}</p>\` : ''}
                </div>
                <div class="flex justify-center mb-2">
                    <span class="text-yellow-400">${stars}</span>
                </div>
                <div class="flex-grow flex items-center justify-center">
                    <p class="text-center text-xs">
                        "<slot></slot>"
                    </p>
                </div>
            </div>
        `;
    }
}

customElements.define('review-card', ReviewCard);
