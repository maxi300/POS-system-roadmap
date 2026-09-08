import uuid
from django.db import models
from datetime import timedelta
from django.utils import timezone

class License(models.Model):
    """Modelo para gestionar licencias del POS"""
    
    STATUS_CHOICES = [
        ('active', 'Activo'),
        ('suspended', 'Suspendido'),
        ('expired', 'Expirado'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    store = models.OneToOneField('stores.Store', on_delete=models.CASCADE, related_name='license')
    
    # Licencia
    license_key = models.CharField(max_length=255, unique=True)
    machine_id = models.CharField(max_length=255, help_text="Hash del procesador/placa base")
    
    # Validez
    valid_from = models.DateTimeField(default=timezone.now)
    valid_until = models.DateTimeField()
    
    # Módulos incluidos (JSON)
    features = models.JSONField(default=dict, help_text="Módulos disponibles en la licencia")
    
    # Estado
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    last_validation = models.DateTimeField(null=True, blank=True, help_text="Última validación online")
    
    # Para On-Premise
    offline_grace_days = models.IntegerField(default=30, help_text="Días de gracia sin validación online")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['license_key']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"Licencia {self.store.name}"
    
    @property
    def is_valid(self):
        """Verifica si la licencia es válida"""
        return self.status == 'active' and self.valid_until > timezone.now()
    
    @property
    def days_remaining(self):
        """Días restantes de la licencia"""
        if self.is_valid:
            delta = self.valid_until - timezone.now()
            return delta.days
        return 0
