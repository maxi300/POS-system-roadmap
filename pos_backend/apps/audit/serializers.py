from rest_framework import serializers
from apps.audit.models import AuditLog

class AuditLogSerializer(serializers.ModelSerializer):
    """Serializer para Logs de Auditoría"""
    user_email = serializers.CharField(source='user.email', read_only=True)
    
    class Meta:
        model = AuditLog
        fields = ['id', 'user', 'user_email', 'action', 'table_name', 'record_id', 'changes', 'user_ip', 'created_at']
        read_only_fields = ['id', 'created_at']
