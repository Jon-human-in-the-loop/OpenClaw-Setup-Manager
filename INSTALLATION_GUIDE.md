# Installation Guide

How to install OpenClaw Easy Installer on Windows, macOS, and Linux.

## Table of Contents

1. [Windows Installation](#windows-installation)
2. [macOS Installation](#macos-installation)
3. [Linux Installation](#linux-installation)
4. [Troubleshooting](#troubleshooting)
5. [Uninstallation](#uninstallation)

---

## Windows Installation

### System Requirements

- **OS**: Windows 10 or later (64-bit or 32-bit)
- **RAM**: 4 GB minimum
- **Disk Space**: 1 GB free space
- **Node.js**: 22+ (installed automatically if missing)

### Installation Steps

1. **Download the Installer**
   - Go to: https://github.com/Jon-human-in-the-loop/openclaw-easy-installer-electron/releases
   - Download: `OpenClaw.Easy.Installer.Setup.exe` (latest version)

2. **Run the Installer**
   - Double-click `OpenClaw.Easy.Installer.Setup.exe`
   - Click **Yes** when asked "Do you want to allow this app to make changes?"
   - Choose installation directory (default: `C:\Users\[YourName]\AppData\Local\Programs\OpenClaw Easy Installer`)
   - Click **Install**

3. **Launch the Application**
   - The installer will automatically create:
     - Desktop shortcut
     - Start Menu entry
   - Double-click the **OpenClaw Easy Installer** icon to start

### First Time Setup

1. System will check: Node.js, Git, port availability, disk space
2. Choose setup type (Quick, Cloud, or Full)
3. Configure your agent and channels
4. Click **Install** and wait for completion (5-30 minutes)

### What Gets Installed

```
C:\Users\[YourName]\AppData\Local\Programs\
├── OpenClaw Easy Installer\
│   ├── resources\
│   ├── app.asar
│   └── electron.exe
```

### Auto-Updates

Once installed, the app will:
- Check for updates on startup
- Download new versions silently
- Notify you when ready to install
- Install without requiring Administrator again

---

## macOS Installation

### System Requirements

- **OS**: macOS 10.15 or later
- **Processor**: Intel or Apple Silicon (M1/M2/M3)
- **RAM**: 4 GB minimum
- **Disk Space**: 1 GB free space
- **Node.js**: 22+ (installed automatically if missing)

### Installation Steps

1. **Download the Installer**
   - Go to: https://github.com/Jon-human-in-the-loop/openclaw-easy-installer-electron/releases
   - Download: `OpenClaw.Easy.Installer.dmg` (latest version)
   - Auto-detects Intel vs Apple Silicon architecture

2. **Install from DMG**
   - Double-click `OpenClaw.Easy.Installer.dmg`
   - Drag **OpenClaw Easy Installer** icon to **Applications** folder
   - Wait for copy to complete (usually 10-15 seconds)
   - Eject the DMG (drag to Trash)

3. **Launch the Application**
   - Open **Applications** folder
   - Double-click **OpenClaw Easy Installer**
   - **First run**: Click **Open** when prompted "Are you sure?"
   - Click **Allow** for system permissions

### First Time Setup

1. System will check: Node.js, Git, port availability, disk space
2. Choose setup type (Quick, Cloud, or Full)
3. Configure your agent and channels
4. Click **Install** and wait for completion (5-30 minutes)

### What Gets Installed

```
/Applications/
├── OpenClaw Easy Installer.app/
│   ├── Contents/
│   │   ├── MacOS/
│   │   ├── Resources/
│   │   └── Info.plist
```

### Permissions

You may be prompted to allow:
- **Network Access**: For downloading Node.js and OpenClaw
- **File Access**: For system checks and installation
- Click **Allow** to continue

### Uninstalling

Simply drag **OpenClaw Easy Installer** from Applications to Trash.

---

## Linux Installation

### System Requirements

- **OS**: Ubuntu 20.04+, Debian 10+, Fedora 32+, or equivalent
- **RAM**: 4 GB minimum
- **Disk Space**: 1 GB free space
- **Node.js**: 22+ (installed automatically if missing)

### Installation Options

#### Option 1: AppImage (Universal, Recommended)

1. **Download**
   - Go to: https://github.com/Jon-human-in-the-loop/openclaw-easy-installer-electron/releases
   - Download: `OpenClaw.Easy.Installer_1.x.x.AppImage`

2. **Make Executable**
   ```bash
   chmod +x OpenClaw.Easy.Installer_*.AppImage
   ```

3. **Run**
   ```bash
   ./OpenClaw.Easy.Installer_*.AppImage
   ```

4. **Create Desktop Shortcut** (Optional)
   ```bash
   # Copy to Applications
   mkdir -p ~/.local/bin
   mv OpenClaw.Easy.Installer_*.AppImage ~/.local/bin/openclaw-installer

   # Create desktop entry
   cat > ~/.local/share/applications/openclaw-installer.desktop << EOF
   [Desktop Entry]
   Name=OpenClaw Easy Installer
   Exec=~/.local/bin/openclaw-installer
   Type=Application
   Categories=Utility;
   EOF
   ```

#### Option 2: Debian Package (.deb)

For Ubuntu/Debian-based systems:

1. **Download**
   - Go to: https://github.com/Jon-human-in-the-loop/openclaw-easy-installer-electron/releases
   - Download: `openclaw-easy-installer_1.x.x_amd64.deb`

2. **Install**
   ```bash
   # Using GUI (double-click)
   # Or via terminal:
   sudo apt install ./openclaw-easy-installer_1.x.x_amd64.deb
   ```

3. **Launch**
   ```bash
   openclaw-installer
   # Or search for "OpenClaw" in Applications menu
   ```

4. **Uninstall**
   ```bash
   sudo apt remove openclaw-easy-installer
   ```

#### Option 3: Manual Installation (Advanced)

For other Linux distributions:

1. Download AppImage
2. Install dependencies:
   ```bash
   # Ubuntu/Debian
   sudo apt install libfuse2 libxss1

   # Fedora
   sudo dnf install fuse libxss

   # Arch
   sudo pacman -S fuse libxss
   ```

3. Run AppImage:
   ```bash
   chmod +x OpenClaw.Easy.Installer_*.AppImage
   ./OpenClaw.Easy.Installer_*.AppImage
   ```

### First Time Setup

1. System will check: Node.js, Git, port availability, disk space
2. Choose setup type (Quick, Cloud, or Full)
3. Configure your agent and channels
4. Click **Install** and wait for completion (5-30 minutes)

### Uninstalling

**AppImage**: Simply delete the file
```bash
rm OpenClaw.Easy.Installer_*.AppImage
```

**DEB Package**:
```bash
sudo apt remove openclaw-easy-installer
```

---

## Troubleshooting

### "Port 18789 is already in use"

**Solution**:
- Close other OpenClaw instances
- Or kill the process using that port:
  ```bash
  # Windows (PowerShell as Admin)
  netstat -ano | findstr :18789
  taskkill /PID [PID] /F

  # macOS/Linux
  lsof -i :18789
  kill -9 [PID]
  ```

### "Node.js not found"

**Solution**:
- App should auto-install Node.js 22+
- If not, download manually: https://nodejs.org/
- Ensure Node.js is in PATH:
  ```bash
  node --version
  ```

### "Git is not installed"

**Solution**:
- Download Git: https://git-scm.com/downloads
- Install and ensure it's in PATH:
  ```bash
  git --version
  ```

### "Permission denied" (Linux)

**Solution**:
```bash
chmod +x OpenClaw.Easy.Installer_*.AppImage
./OpenClaw.Easy.Installer_*.AppImage
```

### "The app won't start"

**Solution**:
1. Try removing config and trying again:
   ```bash
   # Windows
   rmdir %APPDATA%\OpenClaw /s

   # macOS
   rm -rf ~/Library/Application\ Support/OpenClaw

   # Linux
   rm -rf ~/.config/openclaw-installer
   ```

2. Reinstall the app
3. If still failing, check logs in:
   - Windows: `%APPDATA%\OpenClaw\logs`
   - macOS: `~/Library/Logs/OpenClaw Easy Installer`
   - Linux: `~/.config/openclaw-installer/logs`

### "Update failed"

**Solution**:
- Click **Retry** in the update notification
- Or manually download latest from GitHub releases
- Check internet connection

---

## Uninstallation

### Windows

1. Go to **Settings** → **Apps** → **Apps & features**
2. Search for **OpenClaw Easy Installer**
3. Click **Uninstall**
4. Follow prompts
5. All app data and configs will be removed

### macOS

1. Open **Applications** folder
2. Drag **OpenClaw Easy Installer** to **Trash**
3. Empty Trash
4. Optional: Remove config files:
   ```bash
   rm -rf ~/Library/Application\ Support/OpenClaw
   rm -rf ~/Library/Preferences/com.openclaw.easy-installer.plist
   ```

### Linux

**AppImage**:
```bash
rm OpenClaw.Easy.Installer_*.AppImage
rm -rf ~/.config/openclaw-installer
```

**DEB Package**:
```bash
sudo apt remove openclaw-easy-installer
rm -rf ~/.config/openclaw-installer
```

---

## System Specifications

### Minimum Requirements

| OS | Version | Architecture | RAM | Disk | Node.js |
|----|---------|--------------|-----|------|---------|
| Windows | 10+ | x64, x86 | 4GB | 1GB | 22+ |
| macOS | 10.15+ | Intel, Apple Silicon | 4GB | 1GB | 22+ |
| Linux | Ubuntu 20.04+ | x64 | 4GB | 1GB | 22+ |

### Recommended Requirements

| OS | Version | Architecture | RAM | Disk | Node.js |
|----|---------|--------------|-----|------|---------|
| Windows | 11 | x64 | 8GB | 5GB | 22+ |
| macOS | 13+ | Apple Silicon | 8GB | 5GB | 22+ |
| Linux | Ubuntu 22.04 | x64 | 8GB | 5GB | 22+ |

---

## Getting Help

- **Documentation**: https://github.com/Jon-human-in-the-loop/openclaw-easy-installer-electron
- **Issues**: https://github.com/Jon-human-in-the-loop/openclaw-easy-installer-electron/issues
- **Releases**: https://github.com/Jon-human-in-the-loop/openclaw-easy-installer-electron/releases

---

**Version**: 1.0.0
**Last Updated**: March 2025
