// Vercel Serverless Function: Get User Profile
// Endpoint: /api/auth/profile

const { connectToDatabase } = require('../_utils/mongodb');
const { setCorsHeaders } = require('../_utils/cors');
const { authenticateUser } = require('../_utils/auth');

module.exports = async (req, res) => {
  // Handle CORS
  if (setCorsHeaders(req, res)) return;

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Connect to database
    await connectToDatabase();

    // Authenticate user
    const user = await authenticateUser(req);

    return res.json({
      user: { 
        id: user._id, 
        email: user.email, 
        name: user.name, 
        role: user.role 
      }
    });
  } catch (error) {
    console.error('Profile error:', error);
    return res.status(401).json({ message: error.message });
  }
};
