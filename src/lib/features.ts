export const masterFeatureList = `
# Dyslexia-Optimized Desktop Workspace (DDW) - Master Feature List

## 1. Core Architecture & Layout Grid
*   **Strict Proportional Grid (1/4 • 1/2 • 1/4):** The workspace enforces a mathematically fixed layout. It allocates exactly 25% of the screen width to the Left Pillar, 50% to the Center Workspace, and 25% to the Right Pillar.
*   **Fixed Tile Stack:** The interface is constrained to 4 stacked perimeter tiles on the left and 3 stacked perimeter tiles on the right, maintaining organization without a fragmented bottom row.
*   **Center Canvas (The 50% Focus Zone):** Styled with a glare-free "Paper Cream" background (\`#F8F9FA\`), this is the primary area for active work, designed to minimize visual strain.

## 2. Window Management & Navigation
*   **Seat Swapping System (Center Promotion):** All perimeter tiles represent live-scaled applications. Clicking any perimeter tile instantly swaps it with the current central application (defaulting to Goose AI), creating a seamless, window-less multitasking experience.
*   **1-Minute Quick Peek Modal (\`⚡ Peek\`):** A button located on every perimeter tile header. Clicking it triggers a temporary 60-second lightbox overlay of that application, allowing for fast checks or approvals without disrupting the spatial layout of the main grid.
*   **Compact Tile Headers (\`h-[26px]\`):** Outer perimeter headers utilize a highly compact, dark (\`#121212\`) aesthetic with uppercase titles for maximum legibility and spatial efficiency.

## 3. Cognitive & Accessibility Features
*   **Digital Sticky Notes (Trigger Words):** Right-clicking any perimeter tile opens a high-contrast tag editor. Custom user-defined trigger words (e.g., "bananas," "markets") render prominently in yellow on the face of the card.
*   **Smart Recall Search Bar:** Located in the top header (\`"RECALL:"\`), this unified search indexes the custom sticky note tags. Typing a trigger word bypasses the need to remember complex file paths or names.
*   **Central Voice Hub:** Built directly into the bottom of the Center Canvas. It features a static, non-flickering microphone icon to prevent visual distraction (no animated equalizers). 
*   **Global Voice Trigger:** The Voice Hub is bound to a Double-Ctrl keyboard hook, allowing for instant, eyes-free toggling of the listening state.

## 4. Top Header Bar Navigation
*   **Workspace Branding:** Features a prominent "DYSLEXIA WORKSPACE" tag.
*   **Voice & Layout Controls:** Dropdown menus for "Voice: Concise", "Layout", "Audio: Task-Only", and "Profiles".
*   **Developer/Execution Tools:** Dedicated "Code / CLI" and "Manual & Shortcuts" buttons mapped to correct visual states for rapid access to deployment scripts and help menus.

## 5. Built-in Application Modules (Mock/Live)
*   **Architecture / Documentation App:** The default center application, detailing system specifications.
*   **Goose AI Co-Pilot:** Conversational assistant interface.
*   **Hermes Terminal & Docker:** Live log viewer for background containers.
*   **Chrome Browser:** Live ticker and web view preview.
*   **Gemini Research:** Analysis and study compilation viewer.
*   **Quick Notes:** Persistent local scratchpad.
*   **Live Desktop Mirror:** Direct visual window into \`C:\\Users\\richa\\Desktop\`.
*   **OpenRouter & Models:** Status monitor for active API endpoints and VRAM footprint.
`;
