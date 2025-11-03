# Quick Redis Setup

## For Windows Users

### Option 1: WSL2 (Recommended)

```bash
# Install WSL2 if not already installed
wsl --install

# Start WSL
wsl

# Install Redis
sudo apt update
sudo apt install redis-server -y

# Start Redis
sudo service redis-server start

# Test connection
redis-cli ping
# Should return: PONG
```

### Option 2: Native Windows Redis

1. Download from: https://github.com/tporadowski/redis/releases
2. Extract to `C:\Redis`
3. Run `redis-server.exe`
4. Test: `redis-cli.exe ping`

## For macOS Users

```bash
# Install Redis
brew install redis

# Start Redis
brew services start redis

# Test connection
redis-cli ping
```

## For Linux Users

```bash
# Install Redis
sudo apt update
sudo apt install redis-server -y

# Start Redis
sudo systemctl start redis
sudo systemctl enable redis

# Test connection
redis-cli ping
```

## Verify EasyCart Integration

```bash
cd backend
python manage.py test_redis
```

## Next Steps

1. ✅ Redis installed and running
2. ✅ Test connection successful
3. 🚀 Start Django server: `python manage.py runserver`
4. 📊 Check performance improvement in browser DevTools

Your homepage should now load 10x faster!
