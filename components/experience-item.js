class ExperienceItem extends HTMLElement {
    constructor() {
        super();
        // Light DOM to easily inherit global tailwind and fonts
    }

    connectedCallback() {
        const title = this.getAttribute('title') || 'Role';
        const date = this.getAttribute('date') || 'Date';
        const company = this.getAttribute('company') || 'Company';

        this.innerHTML = `
            <div class="border-l-4 border-white pl-4 md:pl-6 mb-10">
                <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-1">
                    <h3 class="headingfont text-[11px] sm:text-[13px] md:text-[16px] lg:text-[18px] text-white">${title}</h3>
                    <span class="headingfont text-[9px] sm:text-[10px] md:text-[12px] lg:text-[13px] text-gray-400">${date}</span>
                </div>
                <p class="headingfont text-[10px] sm:text-[12px] md:text-[14px] lg:text-[15px] text-blue-400 mb-3">${company}</p>
                <ul class="list-disc list-inside text-[9px] sm:text-[11px] md:text-[13px] lg:text-[14px] text-gray-300 space-y-2 headingfont leading-relaxed">
                    ${this.innerHTML}
                </ul>
            </div>
        `;
    }
}

customElements.define('experience-item', ExperienceItem);
