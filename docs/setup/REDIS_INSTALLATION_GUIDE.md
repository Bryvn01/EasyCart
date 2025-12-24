# Redis Installation Guide for Windows

## Quick Installation (Recommended Method)

### Option 1: Using Chocolatey (Easiest)

If you have Chocolatey installed:
```powershell
choco install redis-64 -y
```

If you don't have Chocolatey, install it first:
```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
```

### Option 2: Using WSL (Windows Subsystem for Linux)

```powershell
# Install WSL if not already installed
wsl --install

# After WSL is installed, open Ubuntu and run:
sudo apt update
sudo apt install redis-server -y

# Start Redis
sudo service redis-server start

# Test Redis
redis-cli ping
# Should return: PONG
```

### Option 3: Manual Installation

1. Download Redis from: https://github.com/tporadowski/redis/releases
2. Download the latest `.msi` or `.zip` file
3. Install or extract to a folder (e.g., `C:\Redis`)
4. Add to PATH: `C:\Redis` (or extraction folder)

---

## Starting Redis

### If installed via Chocolatey:
```powershell
# Start as Windows Service
redis-server --service-start

# Or run in current window
redis-server
```

### If installed via WSL:
```bash
sudo service redis-server start
```

### If manually installed:
```powershell
cd C:\Redis
redis-server.exe redis.windows.conf
```

---

## Verification

After starting Redis, test the connection:

```powershell
# Test Redis is running
redis-cli ping
# Expected output: PONG

# Check if port 6379 is listening
netstat -ano | findstr ":6379"
```

---

## Configure for Django

After Redis is running, update your `.env` file:

```env
# Redis Configuration
REDIS_URL=redis://localhost:6379/1
```

Then restart your Django server to use Redis caching!

---

## Auto-start Redis (Optional)

### Chocolatey Installation:
```powershell
# Install as Windows Service (auto-starts on boot)
redis-server --service-install redis.windows.conf
redis-server --service-start
```

### WSL Installation:
Add to `~/.bashrc`:
```bash
sudo service redis-server start
```

---

## Troubleshooting

### Port Already in Use:
```powershell
# Find process using port 6379
netstat -ano | findstr ":6379"

# Kill the process (replace PID)
taskkill /PID <PID> /F
```

### Redis Not Found:
```powershell
# Verify installation
where redis-server
where redis-cli
```

---

## Expected Performance Improvement

After Redis is running:
- ✅ No connection timeouts
- ✅ API response times: **150-300ms** (from 2.4 seconds)
- ✅ Faster session handling
- ✅ Better scalability

---

*Ready to proceed with installation!*
