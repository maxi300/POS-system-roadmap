from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from apps.inventory.models import InventoryLog
from apps.inventory.serializers import InventoryLogSerializer
from apps.products.models import Product

class InventoryViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet para ver logs de inventario"""
    serializer_class = InventoryLogSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['product__name', 'reason']
    ordering_fields = ['created_at']
    
    def get_queryset(self):
        return InventoryLog.objects.filter(store=self.request.user.store).order_by('-created_at')
    
    @action(detail=False, methods=['post'])
    def adjust(self, request):
        """Ajuste manual de inventario"""
        product_id = request.data.get('product_id')
        quantity = request.data.get('quantity')
        reason = request.data.get('reason', 'Ajuste manual')
        
        product = Product.objects.get(id=product_id, store=request.user.store)
        old_stock = product.stock
        product.stock += int(quantity)
        product.save()
        
        InventoryLog.objects.create(
            product=product,
            store=request.user.store,
            type='ajuste',
            quantity=abs(int(quantity)),
            reason=reason,
            created_by=request.user,
        )
        
        return Response({
            'product': product.name,
            'old_stock': old_stock,
            'new_stock': product.stock,
            'adjustment': quantity,
        })
