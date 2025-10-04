PUSH INSTRUCTIONS

This repository includes the branch `final/submission` bundled as `final-submission.bundle` in case you cannot push to the remote from this machine.

Options to publish the branch to GitHub from your machine (PowerShell instructions)

1) Preferred: push directly (if you have credentials configured)

```powershell
cd "c:\Users\pedro\OneDrive\Desktop\Proyectos_Santiago\Impuestos\listados"
# Push branch to origin
git push -u origin final/submission
```

2) If GitHub asks for credentials and you prefer to use a Personal Access Token (PAT)

- Create a PAT on GitHub with `repo` scope (Settings > Developer settings > Personal access tokens).
- Use the token locally (temporary; do not share the token):

```powershell
cd "c:\Users\pedro\OneDrive\Desktop\Proyectos_Santiago\Impuestos\listados"
# Replace <USERNAME> and <TOKEN> accordingly (do not paste token in public chat)
git push https://<USERNAME>:<TOKEN>@github.com/jguevarav6/Frontend.git final/submission
# After success, restore normal remote URL if needed
git remote set-url origin https://github.com/jguevarav6/Frontend.git
```

3) Recommended long-term: configure SSH and push

```powershell
# Generate key (if none exist)
ssh-keygen -t ed25519 -C "your-email@example.com"
# Display public key and copy it to GitHub > Settings > SSH and GPG keys
type $env:USERPROFILE\.ssh\id_ed25519.pub
# Set remote to SSH
git remote set-url origin git@github.com:jguevarav6/Frontend.git
# Push branch
git push -u origin final/submission
```

4) If you cannot push from this machine, import the bundle on your machine and push

- Transfer the file `final-submission.bundle` to your working machine (USB, OneDrive, email, etc.). Then:

```powershell
# On your machine where you want to publish the branch
cd path\to\repo
# Verify bundle contains the branch
git bundle verify path\to\final-submission.bundle
# Fetch the branch into your local repo
git fetch path\to\final-submission.bundle final/submission:refs/heads/final/submission
# Push to origin
git push -u origin final/submission
```

Notes and troubleshooting
- If push is rejected because the remote has new commits, first fetch and rebase or merge:

```powershell
git fetch origin
git rebase origin/master
# Resolve conflicts if any
git push -u origin final/submission
```

- If you see HTTP 403 permission errors, it means your GitHub credentials on this machine lack permission to push to that repo. Use PAT or SSH as explained above.

If you prefer, copy the exact error you receive when running `git push -u origin final/submission` and paste it here; I will guide you step-by-step to resolve it.