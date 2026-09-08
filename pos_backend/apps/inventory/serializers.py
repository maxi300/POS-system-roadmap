from rest_framework import serializers
from apps.inventory.models import InventoryLog

class InventoryLogSerializer(serializers.ModelSerializer):
    """Serializer para Logs de Inventario"""
    product_name = serializers.CharField(source='product.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.email', read_only=True)
    
    class Meta:
        model = InventoryLog
        fields = ['id', 'product', 'product_name', 'type', 'quantity', 'reason', 'created_by', 'created_by_name', 'created_at']
        read_only_fields = ['id', 'created_at']
