# Engine Insights & Best Practices

This document summarizes the experience of building multiple simulation modules (`space-mission`, `neon-detective`, `time-loop`, `corp-espionage`, `haunted-mansion`) using the low-code engine. It highlights key features, discovered patterns, and recommendations for future development.

## General Impressions

The engine is highly versatile. While initially appearing to be a slide-based presentation tool, it supports complex game logic, state management, and non-linear storytelling. By leveraging variables and conditional visibility, we successfully created genres ranging from **Interactive Fiction** to **Point-and-Click Adventures** and **Puzzle Games**.

## Key Features & Learnings

### 1. Visibility & IDs
*   **Constraint**: The `visible_if` property is powerful but strict. **Every element using `visible_if` MUST have a unique `id`.**
*   **Best Practice**: Avoid using `action: - show` or `action: - hide` for state management. These create ephemeral states that can be lost or desynced. Instead, rely on **Variables** + **`visible_if`**.
    *   *Bad*: Click button -> Hide "Door".
    *   *Good*: Click button -> Set `door_open = true`. "Door" element has `visible_if: !door_open`.

### 2. Navigation: `goto_scene` vs `goto_id`
*   **`goto_scene`**: Best for large modules where separating content into multiple YAML files keeps things organized (e.g., `neon-detective`, `corp-espionage`).
*   **`goto_id`**: Best for smaller, tighter experiences or "single-file" architectures (e.g., `haunted-mansion`). It allows instant jumping between "slides" within the same file, acting like rooms in a house.

### 3. State Management
*   **`custom_set`**: Good for temporary state within a session.
*   **`custom_set_persistent`**: Crucial for "save games" or mechanics that need to survive a page reload or scene change (like the `time-loop` mechanics).
*   **Inventory Systems**: Easily implemented using boolean variables (e.g., `has_flashlight`, `has_key`).

### 4. Styling & Animations
*   **Custom CSS**: The `skin` property in `manifest.yaml` allows for complete visual transformations. We created distinct identities:
    *   *Cyberpunk* (`neon.css`): Monospace fonts, neon colors.
    *   *Corporate* (`corp.css`): Glassmorphism, clean sans-serifs.
    *   *Horror* (`haunted.css`): Gothic fonts, dark palettes.
*   **Animations**: The engine supports a rich set of animations (`pop`, `shake`, `pulse`, `float`). Combining these with `delay` creates cinematic entrances.

## Architectural Patterns

### The "Hub & Spoke"
Used in `neon-detective` and `org_chart`. A central scene (Office/Hub) connects to various "spokes" (Street, Club, Profiles). The player returns to the Hub after each interaction.
*   *Benefit*: Clear navigation structure, easy to expand.

### The "Single-File Adventure"
Used in `haunted-mansion`. All rooms (slides) are in one `haunted.yaml` file.
*   *Benefit*: Easier to manage variables and logic in one place. No context switching between files.
*   *Trade-off*: The file can become large. Good for mini-games.

### The "Gated Progression"
Used in `time-loop` and `haunted-mansion`. Paths are visible but locked until a specific variable condition is met.
*   *Implementation*:
    *   Show "Locked Door" message if `has_key == false`.
    *   Show "Enter" button if `has_key == true`.

## Recommendations

1.  **Always Plan Variables First**: Define what you need to track (inventory, progress, score) before writing scenes.
2.  **Use `goto_id` for Prototyping**: It's faster to iterate in a single file. Split into multiple files only when complexity grows.
3.  **Theme Early**: A good CSS file sets the mood immediately and inspires the content.
4.  **Debug with Text**: Temporarily display variable values on screen (e.g., `{{ custom.debug_var }}`) to verify logic during development.
