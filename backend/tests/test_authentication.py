from django.test import TestCase, Client
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
import json

User = get_user_model()


class AuthenticationTestCase(TestCase):
    """Test cases for authentication features"""

    def setUp(self):
        """Set up test client and test data"""
        self.client = APIClient()
        self.register_url = '/api/auth/register/'
        self.login_url = '/api/auth/login/'
        self.profile_url = '/api/auth/profile/'
        self.forgot_password_url = '/api/auth/forgot-password/'
        self.reset_password_url = '/api/auth/reset-password/'
        self.change_password_url = '/api/auth/change-password/'
        self.send_verification_url = '/api/auth/send-verification-email/'
        self.verify_email_url = '/api/auth/verify-email/'

        # Test user credentials
        self.test_user_data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'testpass123',
            'password_confirm': 'testpass123'
        }

    def test_user_registration_success(self):
        """Test successful user registration"""
        response = self.client.post(
            self.register_url,
            self.test_user_data,
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('user', response.data)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertEqual(response.data['user']['email'], self.test_user_data['email'])
        self.assertEqual(response.data['user']['email_verified'], False)

    def test_user_registration_password_mismatch(self):
        """Test registration fails with password mismatch"""
        data = self.test_user_data.copy()
        data['password_confirm'] = 'differentpassword'
        
        response = self.client.post(
            self.register_url,
            data,
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_user_registration_duplicate_email(self):
        """Test registration fails with duplicate email"""
        # Create first user
        User.objects.create_user(
            username='existinguser',
            email=self.test_user_data['email'],
            password='password123'
        )
        
        # Try to create user with same email
        response = self.client.post(
            self.register_url,
            self.test_user_data,
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_user_login_success(self):
        """Test successful user login"""
        # Create user
        user = User.objects.create_user(
            username=self.test_user_data['username'],
            email=self.test_user_data['email'],
            password=self.test_user_data['password']
        )
        
        # Login
        response = self.client.post(
            self.login_url,
            {
                'email': self.test_user_data['email'],
                'password': self.test_user_data['password']
            },
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertIn('user', response.data)

    def test_user_login_invalid_credentials(self):
        """Test login fails with invalid credentials"""
        # Create user
        User.objects.create_user(
            username=self.test_user_data['username'],
            email=self.test_user_data['email'],
            password=self.test_user_data['password']
        )
        
        # Try login with wrong password
        response = self.client.post(
            self.login_url,
            {
                'email': self.test_user_data['email'],
                'password': 'wrongpassword'
            },
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_get_profile_authenticated(self):
        """Test getting profile when authenticated"""
        # Create and authenticate user
        user = User.objects.create_user(
            username=self.test_user_data['username'],
            email=self.test_user_data['email'],
            password=self.test_user_data['password']
        )
        
        # Login to get token
        login_response = self.client.post(
            self.login_url,
            {
                'email': self.test_user_data['email'],
                'password': self.test_user_data['password']
            },
            format='json'
        )
        
        token = login_response.data['access']
        
        # Get profile
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.get(self.profile_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], self.test_user_data['email'])

    def test_get_profile_unauthenticated(self):
        """Test getting profile fails when not authenticated"""
        response = self.client.get(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_update_profile(self):
        """Test updating user profile"""
        # Create and authenticate user
        user = User.objects.create_user(
            username=self.test_user_data['username'],
            email=self.test_user_data['email'],
            password=self.test_user_data['password']
        )
        
        # Login
        login_response = self.client.post(
            self.login_url,
            {
                'email': self.test_user_data['email'],
                'password': self.test_user_data['password']
            },
            format='json'
        )
        
        token = login_response.data['access']
        
        # Update profile
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.put(
            self.profile_url,
            {
                'username': 'updatedusername',
                'phone': '1234567890',
                'address': '123 Test St'
            },
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'updatedusername')
        self.assertEqual(response.data['phone'], '1234567890')

    def test_forgot_password_existing_email(self):
        """Test forgot password for existing email"""
        # Create user
        user = User.objects.create_user(
            username=self.test_user_data['username'],
            email=self.test_user_data['email'],
            password=self.test_user_data['password']
        )
        
        response = self.client.post(
            self.forgot_password_url,
            {'email': self.test_user_data['email']},
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('message', response.data)

    def test_forgot_password_nonexistent_email(self):
        """Test forgot password returns same response for non-existent email (security)"""
        response = self.client.post(
            self.forgot_password_url,
            {'email': 'nonexistent@example.com'},
            format='json'
        )
        
        # Should return 200 to prevent email enumeration
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_change_password_success(self):
        """Test changing password successfully"""
        # Create user
        user = User.objects.create_user(
            username=self.test_user_data['username'],
            email=self.test_user_data['email'],
            password=self.test_user_data['password']
        )
        
        # Login
        login_response = self.client.post(
            self.login_url,
            {
                'email': self.test_user_data['email'],
                'password': self.test_user_data['password']
            },
            format='json'
        )
        
        token = login_response.data['access']
        
        # Change password
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.post(
            self.change_password_url,
            {
                'old_password': self.test_user_data['password'],
                'new_password': 'newpassword123'
            },
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify old password no longer works
        login_response = self.client.post(
            self.login_url,
            {
                'email': self.test_user_data['email'],
                'password': self.test_user_data['password']
            },
            format='json'
        )
        self.assertEqual(login_response.status_code, status.HTTP_400_BAD_REQUEST)
        
        # Verify new password works
        login_response = self.client.post(
            self.login_url,
            {
                'email': self.test_user_data['email'],
                'password': 'newpassword123'
            },
            format='json'
        )
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)

    def test_change_password_wrong_old_password(self):
        """Test changing password fails with wrong old password"""
        # Create and authenticate user
        user = User.objects.create_user(
            username=self.test_user_data['username'],
            email=self.test_user_data['email'],
            password=self.test_user_data['password']
        )
        
        # Login
        login_response = self.client.post(
            self.login_url,
            {
                'email': self.test_user_data['email'],
                'password': self.test_user_data['password']
            },
            format='json'
        )
        
        token = login_response.data['access']
        
        # Try to change password with wrong old password
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.post(
            self.change_password_url,
            {
                'old_password': 'wrongpassword',
                'new_password': 'newpassword123'
            },
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_send_verification_email(self):
        """Test sending verification email"""
        # Create user
        user = User.objects.create_user(
            username=self.test_user_data['username'],
            email=self.test_user_data['email'],
            password=self.test_user_data['password']
        )
        
        response = self.client.post(
            self.send_verification_url,
            {'email': self.test_user_data['email']},
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('message', response.data)

    def test_send_verification_email_already_verified(self):
        """Test sending verification email for already verified user"""
        # Create verified user
        user = User.objects.create_user(
            username=self.test_user_data['username'],
            email=self.test_user_data['email'],
            password=self.test_user_data['password']
        )
        user.email_verified = True
        user.save()
        
        response = self.client.post(
            self.send_verification_url,
            {'email': self.test_user_data['email']},
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('already verified', response.data['message'].lower())

    def test_password_security_features(self):
        """Test password security features"""
        # Test that password is hashed
        user = User.objects.create_user(
            username=self.test_user_data['username'],
            email=self.test_user_data['email'],
            password=self.test_user_data['password']
        )
        
        # Password should not be stored in plain text
        self.assertNotEqual(user.password, self.test_user_data['password'])
        
        # Password should be hashed
        self.assertTrue(user.password.startswith('pbkdf2_sha256'))
        
        # User should be able to check password
        self.assertTrue(user.check_password(self.test_user_data['password']))

    def test_email_field_uniqueness(self):
        """Test that email field is unique"""
        # Create first user
        User.objects.create_user(
            username='user1',
            email='test@example.com',
            password='password123'
        )
        
        # Try to create second user with same email
        with self.assertRaises(Exception):
            User.objects.create_user(
                username='user2',
                email='test@example.com',
                password='password456'
            )


class AuthorizationTestCase(TestCase):
    """Test cases for authorization and permissions"""

    def setUp(self):
        """Set up test data"""
        self.client = APIClient()
        
        # Create regular user
        self.user = User.objects.create_user(
            username='regularuser',
            email='user@example.com',
            password='userpass123'
        )
        
        # Create admin user
        self.admin = User.objects.create_user(
            username='adminuser',
            email='admin@example.com',
            password='adminpass123',
            is_staff=True,
            is_admin=True
        )

    def test_regular_user_cannot_access_admin_endpoints(self):
        """Test that regular users cannot access admin endpoints"""
        # Login as regular user
        login_response = self.client.post(
            '/api/auth/login/',
            {
                'email': 'user@example.com',
                'password': 'userpass123'
            },
            format='json'
        )
        
        token = login_response.data['access']
        
        # Try to access admin dashboard
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.get('/api/admin/dashboard/')
        
        # Should be forbidden or unauthorized
        self.assertIn(response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])

    def test_admin_user_can_access_admin_endpoints(self):
        """Test that admin users can access admin endpoints"""
        # Login as admin
        login_response = self.client.post(
            '/api/auth/login/',
            {
                'email': 'admin@example.com',
                'password': 'adminpass123'
            },
            format='json'
        )
        
        token = login_response.data['access']
        
        # Try to access admin dashboard
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.get('/api/admin/dashboard/')
        
        # Should be successful
        self.assertEqual(response.status_code, status.HTTP_200_OK)
