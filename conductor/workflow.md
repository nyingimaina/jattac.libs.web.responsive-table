# Conductor Project Workflow

This project follows a strict feature-development and bug-fixing workflow managed through **Conductor**.

## Core Development Cycle

For every new feature or bug fix:

1.  **Specification:** Document the feature/fix in a specification file (`spec.md`) within a dedicated track directory (`conductor/tracks/<track_id>/spec.md`).
2.  **Track Registration:** Add the track to `conductor/tracks.md`.
3.  **Atomic Implementation Plan:** Create an implementation plan (`plan.md`) that outlines the work in small, independent, and verifiable "atoms" (steps).
4.  **Atom-by-Atom Implementation:**
    *   Implement one atom at a time.
    *   **Verify:** After each atom, run tests and verify functionality (including `npm run build`).
    *   **Commit:** Perform a git commit for each completed and verified atom.
    *   Repeat until all atoms in the plan are complete.
## Resilience & Recovery (Unreliable Environment Mandate)

As this project is developed on an unreliable system prone to crashes or session terminations, **seamless recovery is imperative**.

1.  **Checkpointing (Plan Updates):** After completing an atom, immediately update the `plan.md` to mark it as `[DONE]`. This serves as the primary state checkpoint.
2.  **Granular Commits:** Every atom MUST be committed immediately upon verification. Never batch multiple atoms into a single commit.
3.  **Session Resumption:** At the start of every session, the agent MUST inspect `conductor/tracks.md` and any active `plan.md` files to identify the exact state of progress and the next pending atom.
4.  **Externalized State:** All critical architectural decisions, context, and "thoughts" that would be lost in a crash must be documented in the track's `spec.md` or `plan.md` rather than kept only in the LLM's short-term memory.

## Finalization

5.  **Finalize:** Once the plan is complete, perform a final project build and mark the track as completed in `conductor/tracks.md`.
