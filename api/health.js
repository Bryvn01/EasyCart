// Vercel Serverless Function: Health Check
// Endpoint: /api/health

const mongoose = require('mongoose');
const { connectToDatabase } = require('./_utils/mongodb');
const { setCorsHeaders } = require('./_utils/cors');

module.exports = async (req, res) => {
  // Handle CORS
  if (setCorsHeaders(req, res)) return;

  const startTime = Date.now();

  try {
    // Connect to database
    await connectToDatabase();

    // Check MongoDB connection status
    const dbHealth = await checkDatabaseHealth();
    
    // Get memory usage
    const memoryUsage = process.memoryUsage();
    
    // Calculate uptime (for serverless, this is the function instance uptime)
    const uptime = process.uptime();
    
    // Overall status determination
    const isHealthy = dbHealth.status === 'UP';
    const httpStatus = isHealthy ? 200 : 503;
    
    const healthResponse = {
      status: isHealthy ? 'UP' : 'DOWN',
      service: 'easycart-nodejs-backend',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      uptime: {
        seconds: Math.floor(uptime),
        readable: formatUptime(uptime)
      },
      components: {
        database: dbHealth,
        memory: {
          status: memoryUsage.heapUsed / memoryUsage.heapTotal < 0.9 ? 'UP' : 'WARNING',
          details: {
            heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
            heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
            external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`,
            usage: `${Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100)}%`
          }
        }
      },
      responseTime: `${Date.now() - startTime}ms`
    };
    
    return res.status(httpStatus).json(healthResponse);
  } catch (error) {
    console.error('Health check error:', error);
    // If health check itself fails, return error status
    return res.status(503).json({
      status: 'DOWN',
      service: 'easycart-nodejs-backend',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      error: error.message,
      responseTime: `${Date.now() - startTime}ms`
    });
  }
};

/**
 * Check MongoDB database health
 */
async function checkDatabaseHealth() {
  try {
    const state = mongoose.connection.readyState;
    const stateNames = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    
    if (state === 1) {
      // Connection is active, perform a ping
      await mongoose.connection.db.admin().ping();
      
      // Get database stats
      const stats = await mongoose.connection.db.stats();
      
      return {
        status: 'UP',
        details: {
          state: stateNames[state],
          database: mongoose.connection.name,
          collections: stats.collections || 0,
          dataSize: `${Math.round(stats.dataSize / 1024 / 1024)}MB`
        }
      };
    } else {
      return {
        status: 'DOWN',
        details: {
          state: stateNames[state],
          message: 'Database connection is not active'
        }
      };
    }
  } catch (error) {
    return {
      status: 'DOWN',
      details: {
        error: error.message
      }
    };
  }
}

/**
 * Format uptime in human-readable format
 */
function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  parts.push(`${secs}s`);
  
  return parts.join(' ');
}
