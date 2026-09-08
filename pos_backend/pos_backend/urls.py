from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.users.views import UserViewSet
from apps.stores.views import StoreViewSet
from apps.products.views import ProductViewSet, CategoryViewSet
from apps.sales.views import SaleViewSet, ReturnViewSet
from apps.inventory.views import InventoryViewSet
from apps.licenses.views import LicenseViewSet
from apps.audit.views import AuditLogViewSet

# Crear router y registrar viewsets
router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'stores', StoreViewSet, basename='store')
router.register(r'products', ProductViewSet, basename='product')
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'sales', SaleViewSet, basename='sale')
router.register(r'returns', ReturnViewSet, basename='return')
router.register(r'inventory', InventoryViewSet, basename='inventory')
router.register(r'licenses', LicenseViewSet, basename='license')
router.register(r'audit-logs', AuditLogViewSet, basename='audit-log')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
]
