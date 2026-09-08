import uuid
from django.db import models
from django.core.validators import MinValueValidator

class InventoryLog(models.Model):
    """Registro de movimientos de inventario"""
    
    TYPE_CHOICES = [
        ('entrada', 'Entrada'),
        ('salida', 'Salida'),
        ('ajuste', 'Ajuste'),
        ('devolucion', 'Devolución'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product = models.ForeignKey('products.Product', on_delete=models.CASCADE, related_name='inventory_logs')
    store = models.ForeignKey('stores.Store', on_delete=models.CASCADE)
    
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    quantity = models.IntegerField(validators=[MinValueValidator(1)])
    reason = models.TextField(help_text="Motivo del movimiento")
    
    created_by = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['product', 'store']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.product.name} - {self.type} ({self.quantity})"
