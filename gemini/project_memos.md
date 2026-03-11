# Project Memos

- It is of utmost importance to clean up any temporary files created during a task. Always delete temporary files, such as commit_message.txt, after they have served their purpose.
- **Session 2026-03-11 Summary:**
    - Completed initial Conductor project setup and refined product definitions/guidelines.
    - Implemented a robust, race-condition-proof fix for row click event bubbling using a two-phase strategy: `onClickCapture` for detection and `nativeEvent` flagging for state stability during re-renders.
    - Added an explicit contract for interactive elements via the `data-rt-ignore-row-click` attribute.
    - Created exhaustive documentation: `README.md` updates, a new `docs/handling-interactive-elements.md` guide, and enhanced JSDoc for IDE support.
    - Formalized a meta-directive in `conductor/avoidance.md` strictly prohibiting `any` types and mandating pre-commit lint/type checks.
    - Fixed ESLint `no-explicit-any` errors in `TableBodyRow.tsx`.
    - Verified all changes with comprehensive regression tests, including async and "disappearing target" scenarios.