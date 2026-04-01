# Game Design Document: PixelSync (Collaborative Pixel Art)

PixelSync is a realtime, multiplayer canvas where users can draw together on a shared grid. It leverages Supabase Realtime for instant synchronization and persistence.

## 1. Concept
A 64x64 grid of pixels. Any user can select a color and paint a pixel. The canvas is persistent (saved in the database) and highly social (you see everyone else's cursors).

## 2. Core Features

### Realtime Synchronization
- **Presence**: Show active users' cursors moving across the grid in real-time.
- **Broadcast**: Send "hover" states to show which pixel a user is targeting.
- **Database Changes**: Synchronize pixel color changes across all clients instantly using Supabase Realtime.

### Canvas Interaction
- **Canvas Rendering**: Use HTML5 Canvas for high performance.
- **Color Palette**: A curated set of colors for users to choose from.
- **Zoom/Pan**: Ability to navigate a larger canvas (optional for MVP).

## 3. Technical Architecture

### Database Schema (Supabase)
We will need a new table to store the canvas state:
- `pixels` table:
  - `x`: integer (Primary Key 1/2)
  - `y`: integer (Primary Key 2/2)
  - `color`: string (hex code)
  - `user_id`: uuid (references auth.users)
  - `updated_at`: timestamp (handles per-pixel history)

### Angular Components
- `GamePageComponent`: The main page for the game.
- `PixelCanvasComponent`: The HTML5 Canvas rendering engine.
- `LatencyDisplayComponent`: Shows real-time connection latency.
- `GameService`: Handles Supabase Realtime (Presence, Broadcast, DB).

## 4. Proposed Implementation Steps

### Phase 1: Database Setup
- Create the `pixels` table.
- Enable Realtime for the `pixels` table.
- Set up RLS (Row Level Security) to allow authenticated/guest users to update pixels.

### Phase 2: Core Engine
- Create `GameService` using `@supabase/supabase-js`.
- Implement `PixelCanvasComponent` using HTML5 Canvas API.
- Initial fetch of all pixels from the database.

### Phase 3: Realtime Polishing
- Implement **Presence** to track cursor locations.
- Implement **Broadcast** for immediate visual feedback on clicks before the DB roundtrip.
- Add smooth transitions and animations for "painting" events.

## 5. User Review Required

> [!IMPORTANT]
> - [x] (Confirmed) **Login required**: Consistent with the current app.
- [x] (Confirmed) **Grid Size**: 64x64 (4,096 pixels).
- [x] (Confirmed) **Cooldown**: Small (~500ms - 1s).
- [x] (Confirmed) **Latency**: Visible to the user in-game.
- [x] (Confirmed) **History**: No historical tracking for now.

## 6. Open Questions
1. Do you want a "cooldown" timer between paints (like Reddit's r/place) to prevent spam, or should it be free-painting?
2. Should we save the **history** of who painted what, or just the current state?

## 7. Verification Plan
- **Latency Test**: Connect two browser windows and verify that painting in one appears in the other with <100ms latency.
- **Persistence Test**: Refresh the browser and ensure the canvas state is restored from the database.
- **Concurrency Test**: Have multiple users paint the same area and verify that the database handles the conflict gracefully.
