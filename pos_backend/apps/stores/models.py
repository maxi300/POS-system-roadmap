import uuid
from django.db import models
from django.core.validators import RegexValidator

class Store(models.Model):
    """Modelo para tiendas/sucursales"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    address = models.CharField(max_length=500)
    phone = models.CharField(max_length=20)
    email = models.EmailField(blank=True)
    
    # Datos fiscales (El Salvador)
    nrc = models.CharField(
        max_length=15,
        validators=[RegexValidator(r'^\d{1,14}-\d$', 'NRC inválido')],
        help_text="Formato: 12345678-9"
    )
    nit = models.CharField(
        max_length=14,
        validators=[RegexValidator(r'^\d{1,14}$', 'NIT inválido')],
        blank=True
    )
    giro = models.CharField(max_length=200, help_text="Actividad económica/giro comercial")
    
    # Información de la tienda
    is_active = models.BooleanField(default=True)
    timezone = models.CharField(max_length=50, default='America/El_Salvador')
    currency = models.CharField(max_length=3, default='USD')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['nrc']),
            models.Index(fields=['is_active']),
        ]
    
    def __str__(self):
        return self.name
