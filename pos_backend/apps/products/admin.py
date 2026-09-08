from django.contrib import admin
from apps.products.models import Product, Category

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'store', 'is_active']
    list_filter = ['is_active', 'store']
    search_fields = ['name']

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'store', 'price', 'stock', 'is_active']
    list_filter = ['is_active', 'store', 'category']
    search_fields = ['name', 'code', 'sku']
    readonly_fields = ['created_at', 'updated_at']
