# Auto-Update Feature Guide

The OpenClaw Easy Installer includes automatic update checking and installation capabilities.

## How Updates Work

### Automatic Checking

- **On startup**: App checks GitHub for newer versions
- **Every 24 hours**: Continues checking in background
- **Silent download**: New versions download automatically without interrupting you
- **Notification**: Once ready, a notification appears in the top-right corner

### Workflow

```
1. App starts
   ↓
2. Checks GitHub for newer version
   ↓
3. If found, downloads in background
   ↓
4. Shows notification when ready
   ↓
5. User clicks "Install & Restart"
   ↓
6. App installs and relaunches with new version
```

## Notification

When an update is ready:

```
┌─────────────────────────────┐
│ 📥 Update Available          │
│ Version X.X.X is ready       │
│ Release notes preview...     │
│                              │
│ [Download] [Dismiss] [✕]    │
└─────────────────────────────┘
```

### Actions

- **Download** - Begin downloading the update
- **Dismiss** - Hide notification (will reappear later)
- **✕** - Close notification temporarily

## Download Progress

While downloading, a progress modal shows:

```
┌──────────────────────────────┐
│ Downloading Update           │
│ Progress: 45%                │
│ ████████░░░░░░░░░░░░░░░░░░  │
│ Downloading update files...  │
└──────────────────────────────┘
```

The notification stays at top-right during download. You can continue using the installer.

## Installation & Restart

Once download completes:

```
┌──────────────────────────────┐
│ Update Ready                 │
│ Version X.X.X ready to       │
│ install. Restart required.   │
│                              │
│ [Install & Restart] [Later]  │
└──────────────────────────────┘
```

Click **Install & Restart** to:
1. Install the new version
2. Save current state
3. Restart the application
4. Resume with new version

## Error Handling

If an update fails:

```
┌──────────────────────────────┐
│ ⚠️  Update Failed             │
│ Error: [error message]       │
│                              │
│ [Try Again] [Dismiss]        │
└──────────────────────────────┘
```

The app will:
- Show error details
- Offer to retry
- Continue working on current version
- Allow manual update check later

## Manual Update Check

To manually check for updates:

1. Look at app version in title bar or menu
2. If update available, notification appears
3. Or use menu option (if available) to check

**Current version**: Shown in notification when update is ready

## Preferences

Updates are enabled by default. You can:

- **Accept automatic checking**: Default behavior
- **Defer updates**: Click "Dismiss" to postpone notification
- **Check later**: Use manual check option

## FAQ

### Do I need internet for updates?

Yes, updates check and download from GitHub which requires internet connection. If offline, the app continues to work and checks again when online.

### Can I skip a version?

Yes, clicking "Dismiss" will:
- Hide the notification
- Continue checking for newer versions
- Allow that version to be re-offered later

### What if I'm using the app during an update?

Updates download in background without interrupting. Once ready, the notification allows you to choose when to install.

### Is it safe to update while installing OpenClaw?

**Recommendation**: Avoid clicking "Install & Restart" while in the middle of a wizard flow. Wait until:
- Wizard is complete
- Installation is finished
- App is idle

The notification won't interfere with wizard steps, but restarting during installation would cancel it.

### What data is saved during update?

The installer persists:
- All form inputs and selections
- Configuration preferences
- Language and theme choices
- Installation history

After restart, you can resume exactly where you left off.

### How do I downgrade if update has issues?

If an update causes problems:

1. Reinstall the previous version from [GitHub releases](https://github.com/Jon-human-in-the-loop/openclaw-easy-installer-electron/releases)
2. Run the installer to restore previous version
3. Report the issue on GitHub

### Can I disable automatic updates?

Updates are designed to keep the app secure and bug-free. To disable:

1. Look for preferences/settings (if implemented)
2. Or manage through app configuration files
3. Note: Updates will no longer be checked automatically

### What if download is interrupted?

- App detects incomplete download
- Retries automatically with exponential backoff
- Shows error if retries fail
- Allows manual retry from notification

### Is my data sent to GitHub?

No. Update checks only:
- Check version metadata
- Download installer files
- Verify file integrity

No personal data, configurations, or credentials are sent.

## Troubleshooting

### Update button is disabled

This happens when:
- Update is already downloading
- Network connection lost
- Update server unavailable

Wait a moment and try again, or check internet connection.

### "Download failed" error

Try:
1. Check internet connection
2. Click "Try Again"
3. Wait a few minutes (server might be temporarily busy)
4. Reinstall manually from GitHub releases

### App restarts but old version still shown

This can happen if:
- Installation file is corrupted
- Permissions prevent file replacement
- Disk space issue during install

Try:
1. Reinstall the older version
2. Free up disk space
3. Redownload from GitHub manually

### Update notification stuck

If notification doesn't disappear after installing:

1. Restart the app manually (close and reopen)
2. Check version in title bar - you may already have new version
3. Check app logs in `~/.config/openclaw-installer/` for errors

## See Also

- [Release Notes](./RELEASE.md) - How new versions are created
- [Architecture](./ARCHITECTURE.md) - Technical details about update system
