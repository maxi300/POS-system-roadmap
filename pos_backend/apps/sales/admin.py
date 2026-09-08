from django.contrib import admin
from apps.sales.models import Sale, SaleItem, Return

class SaleItemInline(admin.TabularInline):
    model = SaleItem
    extra = 0
    readonly_fields = ['created_at']

@admin.register(Sale)
class SaleAdmin(admin.ModelAdmin):
    list_display = ['id', 'store', 'cashier', 'total', 'dte_status', 'date']
    list_filter = ['dte_status', 'date', 'store']
    search_fields = ['id', 'customer_name']
    inlines = [SaleItemInline]
    readonly_fields = ['id', 'date', 'created_at']

@admin.register(Return)
class ReturnAdmin(admin.ModelAdmin):
    list_display = ['id', 'sale', 'total_refunded', 'created_at']
    list_filter = ['created_at']
    readonly_fields = ['created_at']
