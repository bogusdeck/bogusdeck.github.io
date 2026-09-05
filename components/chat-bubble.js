class ChatBubble extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        const direction = this.getAttribute('direction') || 'left';
        const isHire = this.hasAttribute('hire');
        const text = this.innerHTML || this.getAttribute('text') || '';
        const href = this.getAttribute('href');
        
        // Use slot if content is provided inside tags, else use text attribute
        const content = this.innerHTML.trim() !== '' ? '<slot></slot>' : text;

        const baseElement = href ? 'a' : 'div';
        const hrefAttr = href ? `href="${href}"` : '';

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: inline-block;
                }
                
                @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
                
                .bubble {
                    position: relative;
                    display: inline-block;
                    margin: 20px 30px;
                    text-align: center;
                    font-family: 'Press Start 2P', cursive;
                    background-color: #fff;
                    color: #000;
                    padding: 10px;
                    box-shadow: 0 -4px #fff, 0 -8px #000, 4px 0 #fff, 4px -4px #000, 8px 0 #000, 0 4px #fff, 0 8px #000, -4px 0 #fff, -4px 4px #000, -8px 0 #000, -4px -4px #000, 4px 4px #000, 4px 12px rgba(0, 0, 0, 0.1), 12px 12px rgba(0, 0, 0, 0.1), 8px 8px rgba(0, 0, 0, 0.1);
                    box-sizing: border-box;
                    text-decoration: none;
                    min-width: fit-content;
                    font-size: var(--bubble-font-size, 14px);
                    height: var(--bubble-height, auto);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .bubble::after {
                    content: '';
                    display: block;
                    position: absolute;
                    box-sizing: border-box;
                }

                .bubble.left::after {
                    height: 4px;
                    width: 4px;
                    top: 50%;
                    transform: translateY(-50%);
                    left: -8px;
                    background: #fff;
                    box-shadow: -4px -4px #fff, -4px 0 #fff, -8px 0 #fff, 0 -8px #fff, -4px 4px #000, -8px 4px #000, -12px 4px #000, -16px 4px #000, -12px 0 #000, -8px -4px #000, -4px -8px #000, 0 -4px #fff;
                }

                .bubble.right::after {
                    height: 4px;
                    width: 4px;
                    top: 50%;
                    transform: translateY(-50%);
                    right: -8px;
                    background: #fff;
                    box-shadow: 4px -4px #fff, 4px 0 #fff, 8px 0 #fff, 0 -8px #fff, 4px 4px #000, 8px 4px #000, 12px 4px #000, 16px 4px #000, 12px 0 #000, 8px -4px #000, 4px -8px #000, 0 -4px #fff;
                }

                .bubble-hire {
                    background-color: #ffcc00 !important;
                    color: #000000 !important;
                    box-shadow: 0 -4px #ffcc00, 0 -8px #000, 4px 0 #ffcc00, 4px -4px #000, 8px 0 #000, 0 4px #ffcc00, 0 8px #000, -4px 0 #ffcc00, -4px 4px #000, -8px 0 #000, -4px -4px #000, 4px 4px #000, 4px 12px rgba(0, 0, 0, 0.2), 12px 12px rgba(0, 0, 0, 0.2), 8px 8px rgba(0, 0, 0, 0.2) !important;
                    cursor: pointer;
                    transition: all 0.15s ease-in-out;
                    font-weight: bold;
                }

                .bubble-hire:hover {
                    background-color: #ffe066 !important;
                    transform: scale(1.05);
                    box-shadow: 0 -4px #ffe066, 0 -8px #000, 4px 0 #ffe066, 4px -4px #000, 8px 0 #000, 0 4px #ffe066, 0 8px #000, -4px 0 #ffe066, -4px 4px #000, -8px 0 #000, -4px -4px #000, 4px 4px #000, 4px 16px rgba(0, 0, 0, 0.3), 16px 16px rgba(0, 0, 0, 0.3), 10px 10px rgba(0, 0, 0, 0.3) !important;
                }

                .bubble-hire.left::after {
                    background: #ffcc00 !important;
                    box-shadow: -4px -4px #ffcc00, -4px 0 #ffcc00, -8px 0 #ffcc00, 0 -8px #ffcc00, -4px 4px #000, -8px 4px #000, -12px 4px #000, -16px 4px #000, -12px 0 #000, -8px -4px #000, -4px -8px #000, 0 -4px #ffcc00 !important;
                }

                .bubble-hire:hover.left::after {
                    background: #ffe066 !important;
                    box-shadow: -4px -4px #ffe066, -4px 0 #ffe066, -8px 0 #ffe066, 0 -8px #ffe066, -4px 4px #000, -8px 4px #000, -12px 4px #000, -16px 4px #000, -12px 0 #000, -8px -4px #000, -4px -8px #000, 0 -4px #ffe066 !important;
                }
            </style>
            <${baseElement} ${hrefAttr} class="bubble shadow ${direction} ${isHire ? 'bubble-hire' : ''}">
                ${content}
            </${baseElement}>
        `;
    }
}

customElements.define('chat-bubble', ChatBubble);
