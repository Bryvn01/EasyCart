from rest_framework import permissions

class IsAdminUser(permissions.BasePermission):
    """
    Custom permission to only allow admin users to access admin endpoints.
    """
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            (request.user.is_staff or getattr(request.user, 'is_admin', False))
        )

class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object or admin users to edit it.
    """
    
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions are only allowed to the owner of the object or admin users.
        return (
            obj.user == request.user or 
            request.user.is_staff or 
            getattr(request.user, 'is_admin', False)
        )

class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Custom permission to allow read-only access to everyone,
    but write access only to admin users.
    """
    
    def has_permission(self, request, view):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions are only allowed to admin users.
        return (
            request.user and 
            request.user.is_authenticated and 
            (request.user.is_staff or getattr(request.user, 'is_admin', False))
        )