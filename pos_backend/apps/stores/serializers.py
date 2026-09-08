from rest_framework import serializers
from apps.stores.models import Store

class StoreSerializer(serializers.ModelSerializer):
    """Serializer para Tiendas"""
    class Meta:
        model = Store
        fields = ['id', 'name', 'description', 'address', 'phone', 'email', 'nrc', 'nit', 'giro', 'is_active', 'currency', 'created_at']
        read_only_fields = ['id', 'created_at']
