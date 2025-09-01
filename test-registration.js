// Test registration endpoint
const axios = require('axios');

const testRegistration = async () => {
  try {
    const response = await axios.post('http://localhost:5000/api/auth/register', {
      username: 'testuser123',
      email: 'test123@example.com',
      password: 'password123',
      password_confirm: 'password123',
      phone: '0712345678',
      address: 'Test Address'
    });
    
    console.log('Registration successful:', response.data);
  } catch (error) {
    console.error('Registration failed:', error.response?.data || error.message);
  }
};

testRegistration();