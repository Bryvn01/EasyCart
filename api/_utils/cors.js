// CORS utility for Vercel serverless functions

function setCorsHeaders(req, res) {
  const allowedOrigins = (process.env.FRONTEND_URL || 
    "http://localhost:3000,http://localhost:3001,https://easycart-1-752r.onrender.com,https://easycart-admin.onrender.com"
  ).split(',');

  const origin = req.headers.origin;
  
  // Allow requests with no origin (mobile apps, curl, etc.)
  if (!origin) {
    res.setHeader('Access-Control-Allow-Origin', '*');
  } else if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    console.log(`CORS: Allowed origin: ${origin}`);
  } else {
    // In development/permissive mode, allow all origins
    console.warn(`CORS: Allowing unlisted origin: ${origin}`);
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With');
  res.setHeader('Access-Control-Max-Age', '86400');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true; // Signal that preflight was handled
  }

  return false; // Continue with normal request handling
}

module.exports = { setCorsHeaders };
