import uuid
from django.db import models
from django.contrib.contenttypes.models import ContentType

class AuditLog(models.Model):
    """Registro de auditoría para cumplimiento fiscal"""
    
    ACTION_CHOICES = [
        ('create', 'Crear'),
        ('update', 'Actualizar'),
        ('delete', 'Eliminar'),
        ('view', 'Ver'),
        ('export', 'Exportar'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, related_name='audit_logs')
    store = models.ForeignKey('stores.Store', on_delete=models.CASCADE, related_name='audit_logs')
    
    # Acción
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    table_name = models.CharField(max_length=100)
    record_id = models.CharField(max_length=255)
    
    # Cambios
    changes = models.JSONField(help_text="JSON con los cambios realizados")
    
    # Información del usuario
    user_ip = models.GenericIPAddressField(blank=True, null=True)
    user_agent = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['store', 'created_at']),
            models.Index(fields=['user', 'created_at']),
            models.Index(fields=['table_name', 'record_id']),
        ]
    
    def __str__(self):
        return f"{self.get_action_display()} - {self.table_name} ({self.created_at})"
