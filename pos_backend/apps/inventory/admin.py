from django.contrib import admin
from apps.inventory.models import InventoryLog

@admin.register(InventoryLog)
class InventoryLogAdmin(admin.ModelAdmin):
    list_display = ['product', 'type', 'quantity', 'created_by', 'created_at']
    list_filter = ['type', 'created_at']
    search_fields = ['product__name']
    readonly_fields = ['created_at']
