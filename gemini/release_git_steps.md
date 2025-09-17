## Release Git Steps

This document outlines the sequence of Git commands to perform at the end of every release cycle to ensure the `master` branch is up-to-date, tagged, and all changes are pushed to the remote repository.

**Prerequisites:**
- Ensure all development work for the release is complete and committed to the `develop` branch.
- Ensure you are on the `develop` branch (`git checkout develop`).

**Steps:**

1.  **Stage all changes (if any uncommitted changes exist on `develop`):**
    ```bash
    git add .
    ```

2.  **Commit changes on `develop` (if not already done):**
    ```bash
    git commit -m "feat(release): Release vX.Y.Z

Summarize the key changes, new features, bug fixes, and any breaking changes
introduced in this release. This message should provide a high-level overview
of what's new since the last release.

Example:
- Introduced extensible plugin system with Filter and Infinite Scroll plugins.
- Refactored animation props into a dedicated object.
- Added virtualized scrolling for large datasets.
- Updated dependencies."
    # Or, if you have a multi-line message, use a temporary file:
    # echo "Your detailed commit message" > commit_message.txt
    # git commit -F commit_message.txt
    ```
    *(Note: We assume the main feature/bugfix commits are already on `develop`.)*

3.  **Switch to the `master` branch:**
    ```bash
    git checkout master
    ```

4.  **Merge `develop` into `master`:**
    ```bash
    git merge develop
    ```
    *This will bring all the latest changes from `develop` into `master`.*

5.  **Get the current version from `package.json`:**
    ```bash
    # Manually read the "version" field from package.json
    # Example: "version": "1.0.0"
    # Let's assume the version is X.Y.Z
    ```

6.  **Create a new Git tag for the release:**
    ```bash
    git tag vX.Y.Z
    ```
    *Replace `X.Y.Z` with the actual version number obtained from `package.json`.*

7.  **Push the `master` branch and all tags to the remote repository:**
    ```bash
    git push origin master --tags
    ```

8.  **Switch back to the `develop` branch:**
    ```bash
    git checkout develop
    ```

9.  **Push the `develop` branch to the remote repository (to ensure it's up-to-date after the merge):**
    ```bash
    git push origin develop
    ```

This sequence ensures a clean release process, updating `master`, creating a version tag, and synchronizing both branches with the remote.

10. **Delete temporary files:**
    ```bash
    del commit_message.txt
    ```
    *Ensure to delete any temporary files created during the release process.*
	
11. **Store Accumulated Context**
	* To ensure that for future sessions we remember all information we've Accumulated and are tracking this session, write in incrementing numbers
	to ./gemini/context/{number}.md