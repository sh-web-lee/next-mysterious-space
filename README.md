<div align="center">
  <h1>🔮 Mysterious Space</h1>
  <p>An immersive 3D brand experience powered by <b>Three.js</b> + <b>Next.js</b>.</p>
</div>

---

## ✨ Overview

**Mysterious Space** is an interactive 3D web experience that transports visitors into a surreal digital realm. Explore a grand temple, floating skyscrapers, drifting clouds, and four interactive monuments — each tied to a unique narrative world. With cinematic camera animation, custom GLSL shaders, and HDR environmental lighting, every detail is crafted to create an atmosphere of mystery and discovery.

### 🏛️ The Four Worlds

| World | Description |
|-------|-------------|
| **ZGOODorDIE** | The grand temple — a hall of real-world curated items that transcend space, featuring global top-brand goods marked with the ZGOODorDIE seal. |
| **Z attitude** | A realm of 54 divine keys scattered across the mortal world, each bearing a unique pattern and spiritual code waiting to be reassembled. |
| **Z soul** | The mirror of the soul — a space to voice your struggles, dilemmas, and life choices; every word echoes back with meaning. |
| **Z wish** | A mysterious gift-shaped monument where visitors confide their wishes and stories, awaiting the one whose tale moves all. |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | [Next.js 14](https://nextjs.org) (App Router) |
| **3D Rendering** | [Three.js](https://threejs.org) (WebGL) |
| **Animation** | [GSAP](https://gsap.com) |
| **Audio** | [Howler.js](https://howlerjs.com) |
| **Styling** | SCSS Modules |
| **Language** | TypeScript |

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

```bash
# Production build
npm run build

# Start production server (port 8080)
npm start
```

---

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router entry
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # SSR shell → CSR bridge
│   └── *.scss              # Global styles
├── components/             # React UI components
│   ├── App.tsx             # Main app orchestrator
│   ├── ThreeCanvas.tsx     # WebGL canvas wrapper
│   ├── LoadingCanvas.tsx   # Portal-loading animation
│   ├── WorldButtons.tsx    # 3D world-space interactive buttons
│   ├── OverlayModal.tsx    # Narrative content modals
│   ├── ButtomControl.tsx   # Camera/scroll controls
│   ├── AppHeader.tsx       # Top navigation bar
│   ├── Cursor.tsx          # Custom cursor (desktop)
│   ├── VolumeIcon.tsx      # Audio volume toggle
│   └── DebugPanel.tsx      # Dev-only debug overlay
├── three/                  # Three.js engine layer
│   ├── core/               # Renderer, camera, controls, lights, scene
│   ├── loading/            # Portal-loading canvas logic
│   └── objects/            # 3D scene objects
│       ├── house/          # Temple (ZGOODorDIE)
│       ├── attitude/       # Attitude character model
│       ├── soul/           # Soul realm model
│       ├── wish/           # Wish monument model
│       ├── skyscraper/     # Floating skyscrapers
│       ├── floor/          # Custom GLSL floor shader
│       ├── sky/            # HDR sky + IBL environment
│       ├── skyClouds/      # Layered cloud system
│       ├── groundFog/      # Ground-level fog
│       └── paths/          # Scene paths
├── hooks/                  # Custom React hooks
│   ├── useAudio.ts         # BGM audio control
│   └── useIsTouch.ts       # Touch device detection
├── data/
│   └── modalContent.ts     # Narrative content for each world
├── utils/                  # Utility modules (sizes, loaders)
├── sources.ts              # Asset manifest (models, textures, HDR)
├── assets/                 # Static assets (icons, images, styles)
└── three/shaders/          # Custom GLSL shaders
```

---

## 🎨 Features

- **Cinematic Camera Journey** — Opens with a dramatic aerial view and smoothly descends into the scene.
- **Portal Loading Sequence** — A custom portal-themed loading animation on its own canvas, crossfading into the 3D world.
- **HDR Environment Lighting** — Equirectangular HDR sky with PMREMGenerator for physically-based image-based lighting.
- **Custom GLSL Floor Shader** — Large-scale reflective floor with distance-based fog fading.
- **Layered Atmosphere** — Drifting cloud textures and ground fog create depth and ambiance.
- **World-Space Interaction** — Clickable labels positioned in 3D space at each monument.
- **Immersive Audio** — Background music with volume control (Howler.js).
- **Custom Cursor** — Themed cursor replacement on desktop with drag/scroll state icons.
- **Touch-Friendly** — Adapts UI for mobile/tablet with no custom cursor and touch-optimized controls.
- **Responsive Design** — Adapts to all viewport sizes via the Sizes utility.

---

## 📄 License

Private project — all rights reserved.

