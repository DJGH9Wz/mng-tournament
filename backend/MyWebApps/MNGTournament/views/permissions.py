from rest_framework import permissions
from rest_framework.permissions import SAFE_METHODS


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Permiso personalizado:
    - Cualquier usuario (logueado o no) puede leer (GET).
    - Solo administradores (is_staff=True) pueden escribir (POST, PUT, DELETE).
    """
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return request.user and request.user.is_staff
