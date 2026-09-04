# Design System — TANV Portfolio

This document mirrors the live `design.html` visual reference. Retro 1-bit / NES pixel-art aesthetic.

---

## 1. Colors

### Brand & Accent
| Name | Hex | Usage |
|---|---|---|
| Retro Gold | `#ffcc00` | CTA buttons (Hire Me bubble), highlights, headings |
| Lighter Hover | `#ffe066` | Hover state for gold CTAs |

### Backgrounds
| Name | Hex | Usage |
|---|---|---|
| Pure Black | `#000000` | Terminal window, footer, navbar, dark sections |
| Dark Overlay | `rgba(0,0,0,0.5)` | Card backgrounds, overlays |
| Yellow Section | `#ffcc00` | About (main) section background |
| Yellow | `#facc15` | Rating stars, accents |
| Green Light | `#a3e635` | Highlight text, paragraph labels |
| Blue Light | `#93c5fd` | Sub text, body copy |
| Indigo Light | `#c7d2fe` | Section labels, TOC links |
| White | `#ffffff` | Primary text, borders, NES buttons |
| Sky Blue | `#63adff` | Contact page game canvas, chat bubble demo background |

### Accent / Status
| Name | Hex | Usage |
|---|---|---|
| Blue (link) | `#5f5fec` | About Me box, chat demo background |
| Terminal Green | `#33FF33` | Terminal text |
| Terminal Body | `#282828` | Terminal body background |
| Rating | `#facc15` | Star ratings |
| Error Red | `#e76e55` | Modal close button (nes-btn is-error) |

### PFP Sprite Palette
Used in `testimony_sprites.jpg` (custom 1-bit avatars):
`#f8fafc`, `#c7d2fe`, `#93c5fd`, `#a3e635`, `#facc15`

---

## 2. Typography

### Font Families

| CSS Name | Source File | Helper Class | Usage |
|---|---|---|---|
| Joystick | `assets/fonts/joystix_monospace.otf` | `.headingfont`, `.desctext` (default body) | Primary body text |
| Gumball | `assets/fonts/title.TTF` | `.title` | Section titles, page headers |
| mariofont | `assets/fonts/Super Plumber Brothers.ttf` | `.fonty` | Arcade-themed titles |
| Proggy | `assets/fonts/ProggyMonoRegular.ttf` | `.codefont` | Code/monospace blocks (CSS snippets) |
| Rainy | `assets/fonts/dogicapixel.ttf` | `.textfont` | Soft pixel body text |
| Press Start 2P | Google Fonts CDN | inline / nes.css | 8-bit arcade headings, NES buttons, chat bubbles |
| Minecraftia | `assets/fonts/Minecraftia.ttf` | (not assigned) | Reserved/optional |

### Font Scale
- Hero / section titles: `text-xl` to `text-4xl` (responsive)
- Body text: `text-[10px]` to `text-[18px]`
- Micro labels: `text-[5px]` to `text-[8px]`

### Typewriter Animation
`@keyframes typing-demo` cycles 13.5s through "Developer" → "Designer" → "Artist" → "Human" using CSS `content` property. Caret blinks at 0.5s via `@keyframes blink-demo`. Caret color: `#ffcc00` (gold). Respects `prefers-reduced-motion` fallback.

---

## 3. Layout & Spacing

### Breakpoints (Tailwind defaults)
- `sm`: 640px
- `md`: 768px (primary — switches mobile/tablet/desktop)
- `lg`: 1024px (design.html sidebar appears)
- `xl`: 1280px (wider sidebar)

### Z-Index Scale
| Layer | z-index |
|---|---|
| Decorative elements (planets) | `0` |
| Background content | `1` |
| Active section | `2` |
| Navigation buttons | `4` |
| Pagination / mobile menu | `50` |
| Modals | `100` |
| Modals (close btn) | `101` |
| Navbar (fixed) | `1000` |

### Box Shadow Patterns (Pixel-art depth)

| Class | Used on | Description |
|---|---|---|
| `.boxxy` | testimonials, modals, terminals, navbar | Black bg + white pixel-shadow ring |
| `.boxxyw` | light backgrounds | White bg + black pixel-shadow ring |
| `.bubble.shadow` | chat bubbles | Standard bubble + extra rgba depth shadows |
| `.boxxy-green` | highlight cards | Lime (`#a3e635`) bg + green (`#8cd600`) ring |
| Simple drop | cards, modals | `4px solid #000` border + `8px 8px 0 #000` drop |

**Standard `.boxxy` shadow:**
```css
box-shadow: 0 -4px #000, 0 -8px #fff, 4px 0 #000, 4px -4px #fff, 8px 0 #fff,
            0 4px #000, 0 8px #fff, -4px 0 #000, -4px 4px #fff, -8px 0 #fff,
            -4px -4px #fff, 4px 4px #fff;
```

**`.boxxyw` shadow (inverse):**
```css
box-shadow: 0 -4px #fff, 0 -8px #000, 4px 0 #fff, 4px -4px #000, 8px 0 #000,
            0 4px #fff, 0 8px #000, -4px 0 #fff, -4px 4px #000, -8px 0 #000,
            -4px -4px #000, 4px 4px #000;
```

---

## 4. Components

### 4.1 Navigation Bar
- `position: fixed; top: 15px; left: 20px; right: 20px; height: 30px; z-index: 1000`
- `.boxxy` pixel-shadow, `background-color: #000`, `color: #fff`
- `padding: 0 10px`, flex with `justify-content: space-between`
- **Desktop** (`.navbar-desktop`, `md+`): 3-column layout — Blog/Projects left, TANV logo center, About/Contact right
- **Mobile** (`<md`): logo left + hamburger right
- **Nav items**: `font-family: 'Press Start 2P'`, `font-size: 10px`, `margin: 0 10px`
- **Hover**: `color: #ffcc00`

### 4.2 Chat Bubble
- `position: relative; display: inline-block; margin: 20px 30px`
- `font-family: 'Press Start 2P', cursive; background-color: #fff; color: #000; padding: 10px`
- `width: 200px; box-sizing: border-box`
- Standard box-shadow (`.boxxyw` inverse)

#### Variants
| Variant | Description |
|---|---|
| `.bubble` | Base (white, default width 200px) |
| `.bubble.shadow` | + extra rgba depth shadows |
| `.bubble.left` | Tail on left side (`::after` pixel shadow) |
| `.bubble.right` | Tail on right side |
| `.bubble.top` | Tail on top |
| `.bubble.bottom` | Tail on bottom |
| `.bubble.mini` | `width: 110px; font-size: 16px; padding: 16px; font-family: monospace` |
| `.bubble.medium` | `width: 350px` |
| `.bubble.large` | `width: 560px; font-size: 24px; text-transform: uppercase` |
| `.bubble.grow` | `width: auto` (initial) |
| `.bubble.hire` | Gold (`#ffcc00`) CTA, bold, used for "Hire Me!" |

### 4.3 Terminal Window
- 4px white border, dark header with macOS-style dots
- Header: red `#ff5f56` / yellow `#ffbd2e` / green `#27c93f` circles
- Background: `#282828`, text: `#33FF33` (green CRT)
- Content driven by `TERMINAL_LINES` constant in `assets/js/constants.js`
- IntersectionObserver triggered, 75ms/char typing speed
- Title bar shows path (e.g., `/home/mypc`)

### 4.4 Testimonial Card
- 1-bit sprite PFPs from `testimony_sprites.jpg` (256x256, 11 cells of 64x64)
- Star ratings: `<span class="text-yellow-400">★★★★★</span>`
- `.boxxy` class for pixel-art box-shadow

**Mobile (md<):**
- 2-column grid: `2.5rem minmax(0, 1fr)`
- Avatar column: 2.5rem (PFP 2.25rem / 36px circular)
- Quote text: `width: 100%; overflow-wrap: anywhere; word-break: break-word`
- Background-position scaled to rem for sprite alignment

**Desktop:**
- Marquee animation: `marquee 50s linear infinite`, 12 cards × 2 sets
- Cards: 280–300px wide, 280px tall
- Pauses on hover

### 4.5 Work Experience
- Dark semi-transparent background (`bg-gray-950/70`)
- 4px white border
- Left-bordered timeline items (`border-l-4 border-white`)
- Job title (white), company (blue link), date range (gray)
- Bulleted achievements

### 4.6 Pagination Component

**Blog style** (inline):
```html
<div id="pagination" class="flex items-center justify-evenly md:justify-center my-6">
  <button class="px-2 py-1 bg-gray-700 text-white boxxy h-[30px] text-[12px] md:text-[16px]" disabled>Previous</button>
  <span id="page-info" class="mx-4 md:mx-10 text-[16px]">1</span>
  <button class="px-2 py-1 bg-gray-700 text-white boxxy h-[30px] text-[12px] md:text-[16px]">Next</button>
</div>
```

**Artwork style** (fixed bottom):
- `position: fixed; bottom: 0; z-index: 50`
- Mobile: `left: 50%; transform: translateX(-50%)` (bottom-center)
- Desktop (`md+`): `left: auto; right: 8px; transform: none` (bottom-right)
- Background: `rgba(0,0,0,0.7)`, 2px white border
- Buttons: `nes-btn` (white, pixel-shadow, `text-[5px]`)
- Hidden by default, shown only on artwork section
- Custom pixelboyhead cursor on all buttons (including disabled)

---

## 5. Responsive Strategy

### Typography Scale
| Size | Use case |
|---|---|
| 6px | micro labels |
| 8px | small captions, demo tags |
| 10px | body text, nav items, page info |
| 14px | section heads, score |
| 18px | hero text |

### Layout Differences
| Component | Mobile | Desktop |
|---|---|---|
| Testimonials | horizontal scroll-snap | marquee animation |
| Artwork grid | 2 columns | 4 columns (`lg+`) |
| Navigation | hamburger menu | horizontal bar |
| Pagination (artwork) | bottom-center | bottom-right |
| Chat bubbles | single column | conversation layout |

### Design.html Sidebar
- Mobile (`<lg`): hidden, toggled via `☰ TOC` button (top-left)
- Desktop (`lg+`): always visible right sidebar (220px → 260px on `xl+`)
- Backdrop overlay on mobile when open, `Escape` to close

---

## 6. Assets Organization

```
assets/
├── audio/
│   ├── contact/    # Duck hunt SFX
│   └── project/    # Mario BGM + sound effects
├── css/            # Stylesheets
├── fonts/          # Custom pixel/arcade fonts
├── images/
│   ├── about/      # About page images
│   ├── artwork/    # 87 artwork JPGs
│   ├── asprites/   # Tool/brand sprites
│   ├── contact/    # Duck hunt sprites
│   ├── indexbg/    # Home page backgrounds
│   └── logo/       # Brand assets
├── js/
│   ├── about.js    # Section nav + canvas effects
│   ├── config.js   # config.json loader
│   ├── constants.js # Centralized paths
│   ├── contact.js  # Duck hunt game logic
│   ├── handTracking.js # MediaPipe
│   ├── project.js  # Mario animation
│   └── script.js   # Home page logic
```

---

## 7. Configuration

`config.json` (loaded at runtime via `assets/js/config.js`):
- `social`: github, linkedin, replit, devto, notion
- `projects`: reviewReward, tamely, taskTreasury, rune, mcpPhabricator, rashtriyaTv, reviewAuthenticityChecker, discordWelcomeBot
- `tools`: vscode, neovim, myConfig, photoshop, aseprite, discord
- `githubStats`: { username, defaultStars, defaultContributions }
- `notionNotes`: python, mongodb, javascript, dsa, sql, cpp, cppStl, flask

Links are bound via `data-*` attributes (e.g., `data-social="github"`) and applied by `applySocialLinks()`, `applyProjectLinks()`, etc.

---

## 8. Interactions & State

### Home Page
- Scroll → nav shrinks, parallax moves, scrollToTop appears
- Hero image → 3D tilt on mouse move (desktop, fine pointer only)
- Terminal → types on viewport intersection
- GitHub stats → live API with localStorage cache + retry logic
- Testimonials → marquee (desktop) / horizontal scroll-snap (mobile)

### About Page
- Click nav button → slide to target section (`transform: translate(X/Y)`)
- Mouse move on section → pixel trail particles (max 140, 22ms throttle)
- Click artwork image → modal opens (4px white border, 8×8 black shadow)
- Click pagination → load next/prev page (12 per page, 87 total)
- `Escape` or click backdrop → close modal

### Blog Page
- Inline pagination: `flex items-center justify-evenly md:justify-center`
- Dark `.boxxy` buttons (`bg-gray-700 text-white`)
- Page count: 1/2/3...

### Contact Page (Duck Hunt)
- Click bird → shot animation, score+10000, falls, reveals skill word
- 10 hits → perfect dog + high-score sound
- 0 bullets + miss → bird escapes, laughing dog
- Hand tracking (MediaPipe) → alternative cursor control

### Project Page
- Mario running GIF animation
- Sound effects on project interactions

---

## 9. Design.html Reference Pages

| Page | Purpose |
|---|---|
| `index.html` | Home page (hero, chat, terminal, work, testimonials) |
| `about.html` | 5-section system, artwork gallery, modal |
| `contact.html` | Duck hunt game |
| `project.html` | Projects showcase |
| `blog.html` | Blog list with inline pagination |
| `font.html` | Font preview (Joystick, Gumball, mariofont, Proggy, Rainy, Minecraftia, Press Start 2P) |
| `design.html` | This design system (visual reference) |
