# Furniro — Furniture E-Commerce Website

A pixel-perfect furniture e-commerce UI built with **Angular 21** and **Tailwind CSS v3**. Replicates 9 Figma design screens with fully functional cart, wishlist, product comparison, and checkout flows.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Angular 21.2 (standalone components) |
| Styling | Tailwind CSS v3 |
| Language | TypeScript 5.9 |
| State | RxJS BehaviorSubject + localStorage |
| Build | Angular CLI + @angular/build (esbuild) |
| Package Manager | npm 10 |

---

## Pages

| Route | Page |
|---|---|
| `/` | Home |
| `/shop` | Shop (filter, sort, pagination) |
| `/shop/:id` | Single Product (gallery, size, color, tabs) |
| `/cart` | Cart |
| `/checkout` | Checkout |
| `/compare` | Product Comparison |
| `/contact` | Contact |
| `/blog` | Blog (search, categories, recent posts) |

---

## Prerequisites

Make sure you have these installed before you begin:

- **Node.js** v18 or higher — [nodejs.org](https://nodejs.org)
- **npm** v10 or higher (comes bundled with Node.js)

Check your versions:

```bash
node -v
npm -v
```

---

## Installation & Setup

### 1. Extract or clone the project

If you received a ZIP file, extract it first. Then open a terminal inside the project folder:

```bash
cd furniro
```

### 2. Install dependencies

```bash
npm install
```

This downloads all packages into `node_modules/` — takes about 1–2 minutes on first run.

### 3. Start the development server

```bash
npm start
```

Open your browser at **http://localhost:4200**

The server hot-reloads automatically — any file you save reflects instantly in the browser without a manual refresh.

---

## Build for Production

To generate an optimized production build:

```bash
npm run build
```

Output is placed in `dist/furniro/browser/`. You can host those static files on Netlify, Vercel, GitHub Pages, or any Nginx/Apache server.

---

## Available Scripts

| Command | What it does |
|---|---|
| `npm start` | Start dev server at localhost:4200 |
| `npm run build` | Production build into `dist/` |
| `npm run watch` | Build in watch mode (development) |
| `npm test` | Run unit tests via Karma |

---

## Project Structure

```
furniro/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── navbar/             # Sticky navbar with cart & wishlist badges
│   │   │   ├── footer/             # Site footer
│   │   │   ├── cart-sidebar/       # Floating cart panel (slides in from right)
│   │   │   ├── wishlist-sidebar/   # Floating wishlist panel
│   │   │   ├── product-card/       # Product grid card (add to cart, wishlist, compare)
│   │   │   ├── breadcrumb/         # Reusable breadcrumb bar
│   │   │   └── service-features/   # 4-icon "why choose us" bar
│   │   ├── pages/
│   │   │   ├── home/               # Landing page with hero, categories, inspiration slider
│   │   │   ├── shop/               # Product listing with filter, sort, and pagination
│   │   │   ├── product-detail/     # Single product page with gallery and tabs
│   │   │   ├── cart/               # Cart page
│   │   │   ├── checkout/           # Checkout with billing form and order summary
│   │   │   ├── product-comparison/ # Side-by-side product comparison table
│   │   │   ├── contact/            # Contact form and info cards
│   │   │   └── blog/               # Blog listing with sidebar
│   │   ├── services/
│   │   │   ├── product.ts          # All product data + formatPrice + getSpecs
│   │   │   ├── cart.ts             # Cart state, localStorage, sidebar open/close
│   │   │   ├── wishlist.ts         # Wishlist state, localStorage, sidebar open/close
│   │   │   └── comparison.ts       # Comparison state, localStorage, max 4 products
│   │   ├── app.ts                  # Root component
│   │   ├── app.html                # Root template (navbar + router-outlet + sidebars)
│   │   └── app.routes.ts           # All route definitions
│   ├── assets/                     # Static images (logo.png, Home.jpg, Shop .jpg, etc.)
│   ├── styles.scss                 # Global styles + Tailwind directives
│   └── main.ts                     # Angular bootstrap entry point
├── tailwind.config.js              # Custom color tokens (primary, bg-cream, etc.)
├── angular.json                    # Angular CLI configuration
├── tsconfig.json                   # TypeScript configuration
└── package.json                    # Dependencies and scripts
```

---

## Key Architecture Notes

- **All data is mock** — 16 products defined in `ProductService`, no backend needed
- **State persists in localStorage** — cart, wishlist, and comparison survive page refresh
  - Cart: `furniro_cart`
  - Wishlist: `furniro_wishlist`
  - Comparison: `furniro_compare`
- **Lazy-loaded routes** — every page except Home is lazy-loaded for fast initial load
- **Standalone components** — no NgModules; each component declares its own imports

---

## Sending the Project to a Friend (ZIP)

> `node_modules` is 300–500 MB. Always delete it before zipping — your friend runs `npm install` to restore it.

### Step 1 — Stop the dev server

Press `Ctrl + C` in the terminal where `npm start` is running.

### Step 2 — Delete `node_modules`

**Windows (Command Prompt or PowerShell):**
```bash
rmdir /s /q node_modules
```

**Mac / Linux:**
```bash
rm -rf node_modules
```

### Step 3 — Delete `dist` (optional but saves space)

**Windows:**
```bash
rmdir /s /q dist
```

**Mac / Linux:**
```bash
rm -rf dist
```

### Step 4 — Zip the project folder

**Windows:**
- Right-click the `furniro` folder
- Choose **"Send to" → "Compressed (zipped) folder"**
- Or use 7-Zip / WinRAR for a smaller archive

**Mac:**
- Right-click the `furniro` folder
- Choose **"Compress 'furniro'"**

The resulting ZIP should be around **3–10 MB**.

### Step 5 — Send the ZIP

Share via email, Google Drive, WhatsApp, WeTransfer, or any file-sharing service.

---

## Your Friend's Setup (After Receiving the ZIP)

1. Extract the ZIP file
2. Open a terminal inside the extracted `furniro/` folder
3. Run:
   ```bash
   npm install
   npm start
   ```
4. Open **http://localhost:4200** in the browser — done!

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `npm install` fails with permission error | Run terminal as Administrator (Windows) or prefix with `sudo` (Mac/Linux) |
| Port 4200 already in use | Run `npm start -- --port 4201` |
| Blank page after `npm start` | Wait a few seconds, then hard-refresh (`Ctrl + Shift + R`) |
| Images not loading | Make sure `src/assets/` contains `logo.png`, `Home.jpg`, and `Shop .jpg` |
| `node` or `npm` not found | Install Node.js from [nodejs.org](https://nodejs.org) and restart your terminal |
| `ng: command not found` | Use `npm start` instead of `ng serve` — no global CLI install needed |

---

## License

This project is for learning and portfolio purposes.
