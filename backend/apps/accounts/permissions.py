from rest_framework import permissions
from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAdminUser(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_staff)


class IsAdminOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_authenticated and request.user.is_staff)


class IsSuperAdmin(permissions.BasePermission):
    """
    Allows access only to users with role 'superadmin'.
    """

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and getattr(request.user, "role", None) == "superadmin"


class IsManager(permissions.BasePermission):
    """
    Allows access only to users with role 'manager' or higher.
    """

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and getattr(request.user, "role", None) in ["superadmin", "manager"]
        )


class IsEditor(permissions.BasePermission):
    """
    Allows access only to users with role 'editor' or higher.
    """

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and getattr(request.user, "role", None) in ["superadmin", "manager", "editor"]
        )


class IsViewer(permissions.BasePermission):
    """
    Allows access to any authenticated user (viewer or higher).
    """

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and getattr(request.user, "role", None) in ["superadmin", "manager", "editor", "viewer"]
        )


class IsRoleOrReadOnly(permissions.BasePermission):
    """
    Allows read-only access to everyone, but write access only to users with a minimum role.
    Usage: set 'required_role' attribute on the view (superadmin, manager, editor, viewer).
    """

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        required_role = getattr(view, "required_role", "editor")
        role_hierarchy = ["viewer", "editor", "manager", "superadmin"]
        user_role = getattr(request.user, "role", None)
        if user_role not in role_hierarchy:
            return False
        return role_hierarchy.index(user_role) >= role_hierarchy.index(required_role)


class IsAdminUser(permissions.BasePermission):
    """
    Custom permission to only allow admin users to access admin endpoints.
    """

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and (request.user.is_superuser or request.user.is_staff or getattr(request.user, "is_admin", False))
        )


class IsSuperAdminUser(permissions.BasePermission):
    """
    Custom permission to only allow superadmin users to access Django admin.
    """

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and (request.user.is_superuser or request.user.is_staff)


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
        return obj.user == request.user or request.user.is_staff or getattr(request.user, "is_admin", False)


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
            request.user
            and request.user.is_authenticated
            and (request.user.is_staff or getattr(request.user, "is_admin", False))
        )
