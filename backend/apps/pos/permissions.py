from rest_framework import permissions


class IsPOSStaff(permissions.BasePermission):
    """
    Permission to check if user is staff with POS access.
    Staff users and superusers have POS access by default.
    """

    def has_permission(self, request, view):
        user = request.user
        # Only allow users who are authenticated
        if not user or not user.is_authenticated:
            return False
        # Superusers have full access
        if user.is_superuser:
            return True
        # Staff users have POS access
        if getattr(user, "is_staff", False):
            return True
        # Check for explicit POS Staff group membership
        return user.groups.filter(name__iexact="POS Staff").exists()


class HasPOSPermission(permissions.BasePermission):
    """
    Check if staff has specific POS permission.
    """

    permission_map = {
        "create_session": "can_open_session",
        "close_session": "can_close_session",
        "apply_discount": "can_apply_discount",
        "void_transaction": "can_void_transaction",
        "refund": "can_refund",
        "view_reports": "can_view_reports",
        "manage_cash": "can_manage_cash",
        "override_price": "can_override_price",
    }

    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False

        # Superusers have all permissions
        if request.user.is_superuser:
            return True

        # Check specific permission
        action = getattr(view, "pos_permission_required", None)
        if action:
            permission_code = self.permission_map.get(action)
            if permission_code:
                return request.user.pos_permissions.filter(
                    permission=permission_code
                ).exists()

        return True  # Default allow if no specific permission required


class CanOpenSession(permissions.BasePermission):
    """Check if user can open POS session."""

    def has_permission(self, request, view):
        return (
            request.user.is_superuser
            or request.user.pos_permissions.filter(
                permission="can_open_session"
            ).exists()
        )


class CanCloseSession(permissions.BasePermission):
    """Check if user can close POS session."""

    def has_permission(self, request, view):
        return (
            request.user.is_superuser
            or request.user.pos_permissions.filter(
                permission="can_close_session"
            ).exists()
        )


class CanApplyDiscount(permissions.BasePermission):
    """Check if user can apply discounts."""

    def has_permission(self, request, view):
        return (
            request.user.is_superuser
            or request.user.pos_permissions.filter(
                permission="can_apply_discount"
            ).exists()
        )


class CanVoidTransaction(permissions.BasePermission):
    """Check if user can void transactions."""

    def has_permission(self, request, view):
        return (
            request.user.is_superuser
            or request.user.pos_permissions.filter(
                permission="can_void_transaction"
            ).exists()
        )


class CanProcessRefund(permissions.BasePermission):
    """Check if user can process refunds."""

    def has_permission(self, request, view):
        return (
            request.user.is_superuser
            or request.user.pos_permissions.filter(permission="can_refund").exists()
        )


class CanViewReports(permissions.BasePermission):
    """Check if user can view POS reports."""

    def has_permission(self, request, view):
        return (
            request.user.is_superuser
            or request.user.pos_permissions.filter(
                permission="can_view_reports"
            ).exists()
        )
