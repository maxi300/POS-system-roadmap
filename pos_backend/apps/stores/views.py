from rest_framework import viewsets, permissions
from apps.stores.models import Store
from apps.stores.serializers import StoreSerializer

class StoreViewSet(viewsets.ModelViewSet):
    """ViewSet para gestionar tiendas"""
    queryset = Store.objects.all()
    serializer_class = StoreSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Usuarios solo ven su tienda
        if self.request.user.is_staff:
            return Store.objects.all()
        return Store.objects.filter(id=self.request.user.store.id)
