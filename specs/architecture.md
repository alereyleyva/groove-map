# GrooveMap Architecture Spec

## Frontend

- React + TypeScript + Vite.
- Tailwind CSS for styling.
- TanStack Table for the Library grid.
- Zustand for local UI/application state.
- React Hook Form + Zod for forms.
- Feature-oriented folders under `src/features/`.
- IPC calls isolated in `src/lib/tauri.ts`.

## Backend

- Tauri v2 command adapters expose local operations to the frontend.
- Rust owns scanning, database writes, matching, exports, and analysis orchestration.
- SQLite is accessed through `rusqlite`.
- Migrations are embedded and applied on startup.
- Audio probing uses Symphonia where practical; unsupported metrics remain nullable.
- The MVP must not require a Python or C++ sidecar.

## Clean Architecture Boundaries

- UI depends on typed IPC contracts, not database details.
- Tauri commands depend on domain modules, not frontend state.
- Domain modules should be testable without Tauri runtime.
- Database persistence is isolated behind `db.rs` functions.

## Tauri Rules

- `main.rs` remains a thin passthrough.
- Commands are registered in `generate_handler![]`.
- Plugin capabilities are explicit in `src-tauri/capabilities/default.json`.
- Long-running work must not block the main thread.
