"""
Audit logging middleware for tracking sensitive operations.
"""

import logging
import json
from django.utils.deprecation import MiddlewareMixin
from django.contrib.auth import get_user_model

logger = logging.getLogger('security_audit')

User = get_user_model()


class AuditLoggingMiddleware(MiddlewareMixin):
    """
    Middleware to log sensitive operations for security auditing.
    """
    
    # Sensitive endpoints that should be audited
    AUDIT_PATHS = {
        '/api/auth/register/': 'USER_REGISTRATION',
        '/api/auth/login/': 'USER_LOGIN',
        '/api/auth/change-password/': 'PASSWORD_CHANGE',
        '/api/auth/reset-password/': 'PASSWORD_RESET',
        '/api/auth/profile/': 'PROFILE_UPDATE',
        '/api/orders/checkout/': 'ORDER_CHECKOUT',
        '/api/orders/': 'ORDER_CREATION',
    }
    
    def process_request(self, request):
        """Log request details for audit trail"""
        path = request.path
        
        # Check if this is a sensitive endpoint
        for audit_path, action in self.AUDIT_PATHS.items():
            if path.startswith(audit_path) and request.method in ['POST', 'PUT', 'PATCH', 'DELETE']:
                # Store audit info in request for later use
                request.audit_action = action
                request.audit_user_id = None
                request.audit_username = None
                
                if hasattr(request, 'user') and request.user.is_authenticated:
                    request.audit_user_id = request.user.id
                    request.audit_username = request.user.username
                
                break
        
        return None
    
    def process_response(self, request, response):
        """Log response for sensitive operations"""
        if hasattr(request, 'audit_action'):
            # Get user info (now that authentication middleware has run)
            user_id = None
            username = None
            if hasattr(request, 'user') and request.user.is_authenticated:
                user_id = request.user.id
                username = request.user.username
            
            # Get client IP
            x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
            if x_forwarded_for:
                ip_address = x_forwarded_for.split(',')[0]
            else:
                ip_address = request.META.get('REMOTE_ADDR')
            
            # Log the audit event
            audit_data = {
                'action': request.audit_action,
                'user_id': user_id,
                'username': username,
                'ip_address': ip_address,
                'path': request.path,
                'method': request.method,
                'status_code': response.status_code,
                'user_agent': request.META.get('HTTP_USER_AGENT', '')[:200],
            }
            
            # Log based on status code
            if response.status_code >= 400:
                logger.warning(
                    f"AUDIT: {request.audit_action} FAILED - "
                    f"User: {username or 'Anonymous'}, "
                    f"IP: {ip_address}, "
                    f"Status: {response.status_code}"
                )
            else:
                logger.info(
                    f"AUDIT: {request.audit_action} SUCCESS - "
                    f"User: {username or 'Anonymous'}, "
                    f"IP: {ip_address}"
                )
        
        return response
