from django.core.management.base import BaseCommand
from apps.licenses.license_manager import LicenseManager
from apps.stores.models import Store

class Command(BaseCommand):
    """
    Comando para generar licencias manualmente
    Uso: python manage.py generate_license <store_id> <dias_validez>
    """
    
    help = "Genera una clave de licencia para una tienda"
    
    def add_arguments(self, parser):
        parser.add_argument('store_id', type=str)
        parser.add_argument('--days', type=int, default=365)
    
    def handle(self, *args, **options):
        try:
            store = Store.objects.get(id=options['store_id'])
            license_obj = LicenseManager.create_license_for_store(
                store,
                validity_days=options['days']
            )
            
            self.stdout.write(
                self.style.SUCCESS(
                    f"\n✓ Licencia generada exitosamente:\n"
                    f"  Clave: {license_obj.license_key}\n"
                    f"  Tienda: {store.name}\n"
                    f"  Válida hasta: {license_obj.valid_until}\n"
                    f"  Características: {list(license_obj.features.keys())}\n"
                )
            )
        except Store.DoesNotExist:
            self.stdout.write(self.style.ERROR(f"Tienda no encontrada: {options['store_id']}"))
