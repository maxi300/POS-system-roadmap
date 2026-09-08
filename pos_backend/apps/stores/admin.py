from django.contrib import admin
from apps.stores.models import Store

@admin.register(Store)
class StoreAdmin(admin.ModelAdmin):
    list_display = ['name', 'nrc', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'nrc']
