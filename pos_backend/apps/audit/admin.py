from django.contrib import admin
from apps.audit.models import AuditLog

@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ['user', 'action', 'table_name', 'created_at']
    list_filter = ['action', 'table_name', 'created_at']
    search_fields = ['user__email']
    readonly_fields = ['created_at']
