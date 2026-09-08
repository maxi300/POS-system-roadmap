from django.db.models.signals import post_save
from django.dispatch import receiver
from apps.sales.models import Sale
from apps.sales.dte_manager import DTEManager

@receiver(post_save, sender=Sale)
def generate_dte_on_sale_creation(sender, instance: Sale, created, **kwargs):
    """
    Genera automáticamente un DTE cuando se crea una venta
    """
    if created and instance.dte_status == 'pendiente':
        try:
            print(f"[v0] Generando DTE para venta {instance.id}...")
            dte_manager = DTEManager(instance.store)
            result = dte_manager.generate_dte_invoice(instance)
            
            if result.get('success'):
                instance.dte_number = result.get('dte_number')
                instance.dte_status = 'enviado' if not result.get('contingency') else 'pendiente'
                instance.dte_response = result
                instance.save(update_fields=['dte_number', 'dte_status', 'dte_response'])
                print(f"[v0] DTE generado: {result.get('dte_number')}")
        except Exception as e:
            print(f"[v0] Error al generar DTE: {str(e)}")
            instance.dte_status = 'rechazado'
            instance.dte_response = {'error': str(e)}
            instance.save(update_fields=['dte_status', 'dte_response'])
