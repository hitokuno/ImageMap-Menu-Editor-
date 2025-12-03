# ImageMap Menu Editor

This repository contains a complete system for creating HTML image-map–based
popup menus using a fixed HTML/JS runtime and a JSON configuration file.

It includes:

- **Runtime** (HTML/JS/CSS) — Fixed, does not change  
- **GUI Editor** (React + Vite + TypeScript) — Creates `config.json` visually  
- **JSON Schema** — Validates `config.json`

The goal is to allow non-developers to maintain clickable image maps with
hierarchical popup menus simply by editing JSON using a GUI, while keeping
runtime HTML and JS fully static.

---

## 📁 Repository Structure

imagemap-menu-editor/
├── README.md
├── schema/
│ └── config.schema.json
├── editor/ ← GUI Editor (React)
│ ├── index.html
│ ├── package.json
│ ├── tsconfig.json
│ ├── vite.config.ts
│ └── src/
│ ├── main.tsx
│ ├── App.tsx
│ ├── components/
│ │ ├── CanvasEditor.tsx
│ │ ├── SpotList.tsx
│ │ ├── SpotProperties.tsx
│ │ ├── MenuEditor.tsx
│ │ └── MenuTree.tsx
│ ├── hooks/
│ │ └── useEditorState.ts
│ └── types.ts
└── runtime/ ← Final embeddable HTML/JS
├── index.html
├── style.css
├── menu.js
├── floor.png
└── config.json

---

## 🧾 config.json spec

`config.json` defines:

- Canvas (image, width, height)
- List of hotspots (rectangles)
- For each hotspot, a tree-structured menu
- Menus can be:
  - Parent (title + children)
  - Child (title + url)
  - Single (title + url, no children)

---

## 🧰 GUI Editor (React)

Located in `/editor/`

Features:

- Load background image  
- Draw rectangular hotspots  
- Edit spot ID and coordinates  
- Create menu trees (parent, child, single)  
- Validate JSON using AJV and schema  
- Export config.json  

Start development server:

cd editor
npm install
npm run dev

---

## 🚀 Runtime

Located in `/runtime/`.

This is the actual HTML/JS that you deploy.  
It reads `config.json` and displays popup menus on image hotspots.

No framework required. No build step.  

To use:

index.html
menu.js
style.css
floor.png
config.json

Place them on any web server.

---

## 📄 License

MIT (or change as needed)
