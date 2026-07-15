# Git integration and synchronization workflow

This repository uses local `main` as the integration branch and mirrors the same validated commit to two remotes:

- `origin`: GitHub, updated by pushing `main` directly.
- `gitlab`: BioMap GitLab, updated only through a merge request.

## Required order

Every integration and synchronization must follow this sequence:

1. Inspect the worktree and fetch both remotes.
2. Ensure local `main` contains the latest commits from both `origin/main` and `gitlab/main`. Resolve any divergence locally before continuing.
3. Merge or commit the intended changes on local `main`.
4. Run the relevant tests, lint, and build checks.
5. Push local `main` directly to GitHub with `git push origin main`.
6. Create a temporary branch from the exact local `main` commit and push that branch to GitLab. Agent-created branches use `codex/sync-main-<YYYYMMDD>-<short-sha>`.
7. Open a GitLab merge request from the temporary branch into `main`, wait for required checks, and merge it.
8. Fetch both remotes and verify `origin/main` and `gitlab/main` have identical code trees with no diff.

GitHub must be updated before the GitLab merge request is created. Do not push directly to GitLab `main`, and do not force-push either remote.

## Reference commands

```bash
git status --short --branch
git fetch origin main
git fetch gitlab main
git switch main

# Integrate the intended work and validate it before publishing.
npm test
npm run lint
npm run build

git push origin main

branch="codex/sync-main-$(date +%Y%m%d)-$(git rev-parse --short HEAD)"
git push gitlab "HEAD:refs/heads/$branch"
glab mr create \
  --repo zhengjun/life-science-agent \
  --source-branch "$branch" \
  --target-branch main \
  --title "Sync GitHub main $(git rev-parse --short HEAD)"
```

Merge the GitLab merge request only after its required checks pass. The GitLab project may create a merge commit, so commit IDs can differ even when synchronization is complete. After merging, fetch both remotes and use `git diff --exit-code origin/main gitlab/main` to verify the code trees are identical.

## Handling divergence

- If either remote contains commits missing from local `main`, integrate those commits locally first and rerun validation.
- If GitHub and GitLab have diverged, do not overwrite either side. Reconcile the histories on local `main`, then restart the required order from the GitHub push.
- Keep unrelated worktree changes out of the integration commit. Stage explicit files and review the staged diff before committing.
- A synchronization is complete only when the worktree is understood and `origin/main` and `gitlab/main` contain identical code. Matching commit IDs are preferred but are not required when GitLab creates a merge commit.
