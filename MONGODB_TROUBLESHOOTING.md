# MongoDB Connection Troubleshooting Guide

## Common Error: querySrv ENOTFOUND _mongodb._tcp.cluster0.mongodb.net

This error indicates that the DNS resolution for MongoDB Atlas SRV records is failing. Here's how to fix it:

### 1. Correct MongoDB URI Format

**Use this format** (note the additional parameters):
```
MONGODB_URI=mongodb+srv://easycart:EasyCart2024@cluster0.mongodb.net/easycart?retryWrites=true&w=majority&family=4
```

**Key components:**
- `mongodb+srv://` - Uses SRV DNS records
- `family=4` - Forces IPv4 (helps with DNS resolution)
- `retryWrites=true` - Enables retry for write operations
- `w=majority` - Write concern for data consistency

### 2. Alternative Connection String

If SRV continues to fail, use a direct connection string:
```
MONGODB_URI=mongodb://cluster0-shard-00-00.mongodb.net:27017,cluster0-shard-00-01.mongodb.net:27017,cluster0-shard-00-02.mongodb.net:27017/easycart?ssl=true&replicaSet=atlas-cluster-shard-0&authSource=admin&retryWrites=true&w=majority
```

You can also set this as a fallback URI:
```
MONGODB_FALLBACK_URI=mongodb://cluster0-shard-00-00.mongodb.net:27017,cluster0-shard-00-01.mongodb.net:27017,cluster0-shard-00-02.mongodb.net:27017/easycart?ssl=true&replicaSet=atlas-cluster-shard-0&authSource=admin&retryWrites=true&w=majority
```

The application will automatically try the fallback URI if the primary SRV connection fails.

### 3. Testing Your Connection

Run the diagnostic script to test your MongoDB connection:
```bash
cd backend
npm run test:mongodb
```

### 4. MongoDB Atlas Configuration Checklist

1. **Cluster Status**: Ensure your MongoDB Atlas cluster is running
2. **Network Access**: Add `0.0.0.0/0` to IP whitelist for cloud deployments
3. **Database User**: Verify username/password are correct
4. **Connection String**: Get the latest connection string from Atlas dashboard

### 5. Environment-Specific Solutions

#### Vercel Deployment
- Set environment variables in Vercel dashboard
- Use the SRV format with `family=4` parameter
- Ensure serverless functions have network access

#### Render/Railway Deployment
- Add environment variables in platform dashboard
- Test connection after each deployment
- Monitor logs for connection errors

#### Local Development
- Use local MongoDB: `mongodb://localhost:27017/easycart`
- Or use Atlas connection for development testing

### 6. Debugging Steps

1. **Check URI Format**:
   ```bash
   echo $MONGODB_URI
   ```

2. **Test DNS Resolution**:
   ```bash
   nslookup _mongodb._tcp.cluster0.mongodb.net
   ```

3. **Verify Network Access**:
   - Check if deployment platform can access external services
   - Verify no firewall blocking MongoDB ports

4. **Monitor Connection Logs**:
   - Look for detailed error messages in application logs
   - Check for timeout vs DNS resolution errors

### 7. Quick Fixes

If you're still having issues, try these quick fixes:

1. **Regenerate Connection String**: Get a fresh connection string from MongoDB Atlas
2. **Update Cluster**: Ensure your Atlas cluster is on the latest version
3. **Change Region**: Try deploying to a different geographic region
4. **Contact Support**: Reach out to your deployment platform support

### 8. Environment Variables

Make sure you're using the correct environment variable names:
- Primary: `MONGODB_URI`
- Alternative: `MONGO_URI` (for compatibility)

Both are supported by the application.

---

**Need help?** Run `npm run test:mongodb` for detailed diagnostics.