from rest_framework import serializers
from apps.products.models import Product, Category

class CategorySerializer(serializers.ModelSerializer):
    """Serializer para Categorías"""
    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']

class ProductSerializer(serializers.ModelSerializer):
    """Serializer para Productos"""
    category_name = serializers.CharField(source='category.name', read_only=True)
    profit_margin = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = ['id', 'category', 'category_name', 'code', 'sku', 'name', 'description', 'image_url', 'cost', 'price', 'stock', 'min_stock', 'profit_margin', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at', 'profit_margin']
    
    def get_profit_margin(self, obj):
        return obj.profit_margin
