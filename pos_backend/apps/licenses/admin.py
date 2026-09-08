from django.contrib import admin
from apps.licenses.models import License

@admin.register(License)
class LicenseAdmin(admin.ModelAdmin):
    list_display = ['store', 'license_key', 'status', 'valid_until', 'is_valid']
    list_filter = ['status', 'valid_until']
    search_fields = ['license_key', 'store__name']
    readonly_fields = ['created_at', 'updated_at']
