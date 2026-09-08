import uuid
from django.db import models
from django.core.validators import MinValueValidator
from decimal import Decimal

class Sale(models.Model):
    """Modelo para Ventas/Transacciones"""
    
    PAYMENT_CHOICES = [
        ('efectivo', 'Efectivo'),
        ('tarjeta', 'Tarjeta'),
        ('cheque', 'Cheque'),
        ('transferencia', 'Transferencia'),
        ('otro', 'Otro'),
    ]
    
    DTE_STATUS_CHOICES = [
        ('pendiente', 'Pendiente'),
        ('enviado', 'Enviado'),
        ('rechazado', 'Rechazado'),
        ('confirmado', 'Confirmado'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    store = models.ForeignKey('stores.Store', on_delete=models.CASCADE, related_name='sales')
    cashier = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, related_name='sales')
    
    # Información de la venta
    date = models.DateTimeField(auto_now_add=True)
    total_items = models.IntegerField(validators=[MinValueValidator(0)])
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(Decimal('0'))])
    tax = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(Decimal('0'))])
    total = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(Decimal('0'))])
    
    # Cliente
    customer_name = models.CharField(max_length=255, blank=True)
    customer_phone = models.CharField(max_length=20, blank=True)
    customer_nrc = models.CharField(max_length=15, blank=True)
    
    # Pago
    payment_method = models.CharField(max_length=20, choices=PAYMENT_CHOICES)
    reference = models.CharField(max_length=100, blank=True, help_text="Referencia de pago (cheque, transferencia, etc)")
    
    # DTE (Documento Tributario Electrónico)
    dte_number = models.CharField(max_length=50, blank=True, null=True, unique=True)
    dte_status = models.CharField(max_length=20, choices=DTE_STATUS_CHOICES, default='pendiente')
    dte_response = models.JSONField(blank=True, null=True, help_text="Respuesta del servidor de DTE")
    
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-date']
        indexes = [
            models.Index(fields=['store', 'date']),
            models.Index(fields=['cashier', 'date']),
            models.Index(fields=['dte_status']),
        ]
    
    def __str__(self):
        return f"Venta {self.id} - ${self.total}"


class SaleItem(models.Model):
    """Items dentro de una venta"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    sale = models.ForeignKey(Sale, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey('products.Product', on_delete=models.SET_NULL, null=True)
    
    quantity = models.IntegerField(validators=[MinValueValidator(1)])
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)
    tax = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0'))
    
    class Meta:
        indexes = [
            models.Index(fields=['sale']),
        ]
    
    def __str__(self):
        return f"{self.product.name} x {self.quantity}"


class Return(models.Model):
    """Devoluciones y Notas de Crédito"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    sale = models.ForeignKey(Sale, on_delete=models.CASCADE, related_name='returns')
    store = models.ForeignKey('stores.Store', on_delete=models.CASCADE)
    
    reason = models.TextField()
    total_refunded = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(Decimal('0'))])
    
    dte_number_credit = models.CharField(max_length=50, blank=True, null=True, help_text="Número de DTE de Nota de Crédito")
    
    created_by = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Devolución {self.id} - ${self.total_refunded}"
