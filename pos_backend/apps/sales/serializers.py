from rest_framework import serializers
from apps.sales.models import Sale, SaleItem, Return

class SaleItemSerializer(serializers.ModelSerializer):
    """Serializer para items de venta"""
    product_name = serializers.CharField(source='product.name', read_only=True)
    
    class Meta:
        model = SaleItem
        fields = ['id', 'product', 'product_name', 'quantity', 'unit_price', 'subtotal', 'tax']
        read_only_fields = ['id', 'subtotal', 'tax']


class SaleSerializer(serializers.ModelSerializer):
    """Serializer para Ventas"""
    items = SaleItemSerializer(many=True, read_only=True)
    cashier_name = serializers.CharField(source='cashier.email', read_only=True)
    
    class Meta:
        model = Sale
        fields = ['id', 'cashier', 'cashier_name', 'date', 'total_items', 'subtotal', 'tax', 'total', 'customer_name', 'customer_phone', 'customer_nrc', 'payment_method', 'reference', 'dte_number', 'dte_status', 'notes', 'items', 'created_at']
        read_only_fields = ['id', 'date', 'created_at', 'dte_number', 'dte_status']


class ReturnSerializer(serializers.ModelSerializer):
    """Serializer para Devoluciones"""
    sale_id = serializers.CharField(source='sale.id', read_only=True)
    
    class Meta:
        model = Return
        fields = ['id', 'sale_id', 'reason', 'total_refunded', 'dte_number_credit', 'created_at']
        read_only_fields = ['id', 'created_at', 'dte_number_credit']
