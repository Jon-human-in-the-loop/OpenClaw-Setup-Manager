# Release Process

This document describes how to release new versions of the OpenClaw Easy Installer with auto-update support.

## Version Numbering

Uses [Semantic Versioning](https://semver.org/):
- **MAJOR.MINOR.PATCH** (e.g., 1.2.3)
- MAJOR: Breaking changes
- MINOR: New features (backwards compatible)
- PATCH: Bug fixes

## Pre-Release Checklist

1. **Update version in package.json**
   ```bash
   npm version minor
   # or
   npm version patch
   ```

2. **Update CHANGELOG.md** (if it exists) with:
   - Version number
   - Release date
   - New features
   - Bug fixes
   - Breaking changes

3. **Test builds on all platforms:**
   ```bash
   pnpm build            # Compile TypeScript
   pnpm test             # Run unit tests
   pnpm test:e2e         # Run E2E tests
   ```

4. **Build installers:**
   ```bash
   pnpm package          # Build for current platform
   pnpm package:win      # Windows
   pnpm package:mac      # macOS
   pnpm package:linux    # Linux
   ```

5. **Verify installers work** by installing and testing on each platform

## Creating a GitHub Release

### Automatic (Recommended with GitHub Actions)

1. Push your commit with updated version:
   ```bash
   git add package.json CHANGELOG.md
   git commit -m "chore: bump version to 1.2.3"
   git push
   ```

2. Create a git tag:
   ```bash
   git tag v1.2.3
   git push origin v1.2.3
   ```

3. GitHub Actions automatically:
   - Builds installers for all platforms
   - Creates GitHub release
   - Uploads binaries and metadata
   - Triggers update availability

### Manual Process

1. Build all platform installers:
   ```bash
   pnpm build
   pnpm package:win
   pnpm package:mac
   pnpm package:linux
   ```

2. Go to GitHub repository → Releases → New Release

3. Fill in release details:
   - **Tag**: v1.2.3
   - **Title**: OpenClaw Easy Installer v1.2.3
   - **Description**: (from CHANGELOG.md)
   - **Assets**: Upload all `.exe`, `.dmg`, `.AppImage`, `.deb` files

4. Also upload the `latest-*.yml` files from `dist/` folder:
   - `latest.yml` (for macOS)
   - `latest-linux.yml`
   - `latest-linux-arm64.yml` (if building ARM versions)

5. Click "Publish release"

## Auto-Update Files

After running `electron-builder`, the following files are automatically generated in `dist/`:

```
dist/
├── latest.yml                    # macOS update metadata
├── latest-linux.yml              # Linux update metadata
├── latest-linux-arm64.yml        # Linux ARM64 metadata
├── OpenClaw_Easy_Installer.exe   # Windows installer
├── OpenClaw Easy Installer.dmg   # macOS installer
├── OpenClaw.Easy.Installer_1.2.3.AppImage  # Linux AppImage
└── openclaw-easy-installer_1.2.3_amd64.deb # Linux DEB package
```

**Important**: Upload `latest-*.yml` files to GitHub release - these tell the app what version is available and where to download it.

## Electron-Builder Configuration

Configured in `electron-builder.yml` with GitHub publish provider:

```yaml
publish:
  provider: github
  owner: Jon-human-in-the-loop
  repo: openclaw-easy-installer-electron
```

This setup automatically:
- Creates releases on GitHub
- Generates update metadata
- Enables auto-update functionality

## Auto-Update Flow

1. **User starts app** → UpdateContext checks for updates
2. **Server check** → Queries GitHub API for latest release
3. **Version comparison** → Compares with current version
4. **Download** → If newer, auto-downloads (user sees notification)
5. **Install** → When download complete, shows install prompt
6. **Restart** → User clicks "Install & Restart", app relaunches with new version

## Testing Auto-Updates

### Manual Testing

1. Build current version:
   ```bash
   pnpm build
   pnpm package
   ```

2. Note the version (e.g., 1.0.0)

3. Increment version in `package.json` to test version (e.g., 1.0.1)

4. Create a test release on GitHub with test files

5. Revert to original version, start app

6. App should detect new version and offer update

### CI/CD Testing

E2E tests mock update checks:

```bash
pnpm test:e2e       # Runs E2E tests including update scenarios
```

## Rollback Process

If a release has critical issues:

1. **Immediate action**: Delete the buggy release from GitHub
2. **Update users**: Create a new patch release with fixes
3. **Or revert**: Revert to previous version tag and re-release

Users on buggy version will see the new version in next update check.

## Release Branches

For team collaboration:

```bash
# Feature branch
git checkout -b release/v1.2.3

# Make final updates
npm version minor
git push

# Create PR for review

# After approval, merge to main and tag
git tag v1.2.3
git push origin v1.2.3
```

## Changelog Format

Use [Keep a Changelog](https://keepachangelog.com/) format:

```markdown
## [1.2.3] - 2024-03-16

### Added
- New feature description

### Fixed
- Bug fix description

### Breaking Changes
- Any breaking changes

### Platform Notes
- **Windows**: If Windows-specific changes
- **macOS**: If macOS-specific changes
- **Linux**: If Linux-specific changes
```

## Troubleshooting

### Release not appearing in app update check
- Verify `latest-*.yml` files are uploaded to GitHub release
- Check file contains correct version number
- Check GitHub release is marked "latest" (not pre-release)

### Users stuck on old version
- GitHub API may cache for up to 1 hour
- Users can manually delete app and reinstall from latest release

### Update fails to download
- Check GitHub release assets are properly uploaded
- Verify checksums in `latest-*.yml` match uploaded files
- Check network connectivity in release environment

## References

- [electron-updater docs](https://www.electron.build/auto-update)
- [GitHub Releases API](https://docs.github.com/en/rest/reference/releases)
- [Semantic Versioning](https://semver.org/)
