from django.utils import timezone
from datetime import timedelta
from rest_framework.exceptions import ValidationError
from apps.licenses.models import License
from apps.licenses.utils import LicenseKeyGenerator, OfflineLicenseValidator
import json

class LicenseManager:
    """
    Gestiona el ciclo completo de licencias
    """
    
    @staticmethod
    def create_license_for_store(store, validity_days=365, features=None):
        """
        Crea una nueva licencia para una tienda
        """
        if features is None:
            features = {
                'sales': True,
                'inventory': True,
                'reports': True,
                'users': True,
                'dte': True,
            }
        
        # Generar clave
        key_data = LicenseKeyGenerator.generate_license_key(str(store.id), validity_days)
        
        # Crear licencia en BD
        license_obj = License.objects.create(
            store=store,
            license_key=key_data['license_key'],
            machine_id='',  # Se establece en el cliente
            valid_until=timezone.now() + timedelta(days=validity_days),
            features=features,
            status='active'
        )
        
        return license_obj
    
    @staticmethod
    def validate_and_activate_license(license_key: str, machine_id: str) -> Dict:
        """
        Valida y activa una licencia con machine_id
        """
        try:
            license_obj = License.objects.get(license_key=license_key)
        except License.DoesNotExist:
            raise ValidationError({'error': 'Licencia no encontrada'})
        
        # Validar que no esté vencida
        if license_obj.valid_until < timezone.now():
            raise ValidationError({'error': 'Licencia expirada'})
        
        # Validar o establecer machine_id (primera vez)
        if not license_obj.machine_id:
            license_obj.machine_id = machine_id
            license_obj.save()
        elif license_obj.machine_id != machine_id:
            raise ValidationError({'error': 'Esta licencia está asignada a otra máquina'})
        
        # Actualizar última validación
        license_obj.last_validation = timezone.now()
        license_obj.status = 'active'
        license_obj.save()
        
        return {
            'valid': True,
            'license_key': license_obj.license_key,
            'store_id': str(license_obj.store.id),
            'features': license_obj.features,
            'days_remaining': license_obj.days_remaining,
            'expires_at': license_obj.valid_until.isoformat(),
        }
    
    @staticmethod
    def check_offline_validity(license_key: str, local_data: Dict) -> Dict:
        """
        Verifica si una licencia es válida en modo offline
        """
        try:
            license_obj = License.objects.get(license_key=license_key)
        except License.DoesNotExist:
            # En modo offline, retornar lo que está guardado localmente
            return {
                'valid': False,
                'offline_grace_remaining': 0,
                'message': 'Licencia no encontrada. Necesitas conectarte para validar.'
            }
        
        # Verificar período de gracia offline
        grace_remaining = OfflineLicenseValidator.get_grace_period_days(
            license_obj.last_validation.isoformat() if license_obj.last_validation else None,
            license_obj.offline_grace_days
        )
        
        if grace_remaining <= 0:
            return {
                'valid': False,
                'offline_grace_remaining': 0,
                'message': 'Período de gracia offline expirado. Conecta con internet para validar.',
                'features': {}
            }
        
        return {
            'valid': True,
            'offline_grace_remaining': grace_remaining,
            'features': license_obj.features,
            'days_remaining': license_obj.days_remaining,
        }
    
    @staticmethod
    def suspend_license(license_key: str, reason: str = '') -> Dict:
        """
        Suspende una licencia (por falta de pago, etc)
        """
        license_obj = License.objects.get(license_key=license_key)
        license_obj.status = 'suspended'
        license_obj.save()
        
        return {
            'message': f'Licencia suspendida. Motivo: {reason}',
            'license_key': license_key,
            'status': 'suspended'
        }
    
    @staticmethod
    def renew_license(license_key: str, additional_days: int = 365) -> Dict:
        """
        Renueva una licencia existente
        """
        license_obj = License.objects.get(license_key=license_key)
        license_obj.valid_until = timezone.now() + timedelta(days=additional_days)
        license_obj.status = 'active'
        license_obj.save()
        
        return {
            'message': 'Licencia renovada',
            'license_key': license_key,
            'valid_until': license_obj.valid_until.isoformat(),
            'days_remaining': license_obj.days_remaining,
        }
