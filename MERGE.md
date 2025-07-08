# Merging the Flewian Analysis Feature Branch

This project uses **branch-based development**. Follow one of the methods below to merge the `feature/flewian-analysis` branch back into `main` after all code reviews are complete.

---

## 🛠️ 1. GitHub Pull Request (recommended)

1. Push your local branch:
   ```bash
   git push -u origin feature/flewian-analysis
   ```
2. Open the repository on GitHub. You will see a prompt to create a **Pull Request**.
3. Click **“Compare & pull request”**.
4. Fill in the PR title and description. Common checklist:
   - [ ] Code builds & tests pass
   - [ ] No linting errors
   - [ ] Documentation updated (README / comments)
5. Request reviews from teammates.
6. Once approved, press **“Merge pull request”** → **“Confirm merge”**.
7. Delete the branch on GitHub when prompted.

---

## 🛠️ 2. GitHub CLI

1. Ensure you have the GitHub CLI installed:
   ```bash
   gh --version
   ```
2. From the feature branch, run:
   ```bash
   gh pr create --base main --head feature/flewian-analysis --title "Flewian analysis feature" --body "Implements philosophy-focused RAG prompts and UI updates."
   ```
3. After approvals:
   ```bash
   gh pr merge --merge --delete-branch
   ```

---

## ℹ️ Notes
* Always **pull latest `main`** before starting a new feature branch.
* Resolve merge conflicts locally if prompted during the merge process.
* After merging, pull `main` again to update your local copy:
  ```bash
  git checkout main
  git pull origin main
  ``` 