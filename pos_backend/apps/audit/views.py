from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from apps.audit.models import AuditLog
from apps.audit.serializers import AuditLogSerializer

class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet para ver logs de auditoría"""
    serializer_class = AuditLogSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['table_name', 'action']
    ordering_fields = ['created_at']
    
    def get_queryset(self):
        # Solo admin ve todos los logs
        if self.request.user.is_staff:
            return AuditLog.objects.all().order_by('-created_at')
        return AuditLog.objects.filter(store=self.request.user.store).order_by('-created_at')
