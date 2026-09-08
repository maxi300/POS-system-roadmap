import hashlib
import hmac
import json
from datetime import datetime, timedelta
from typing import Dict, Optional
import uuid
import os
from cryptography.fernet import Fernet

class LicenseKeyGenerator:
    """
    Genera y valida claves de licencia de forma segura
    """
    
    SECRET_KEY = os.environ.get('LICENSE_SECRET_KEY', 'your-secret-key-change-in-production')
    
    @staticmethod
    def get_machine_id() -> str:
        """
        Obtiene el ID único de la máquina (procesador + placa base)
        Para Electron: obtenido del SO
        """
        import platform
        import socket
        
        # Combinar información del sistema
        machine_info = f"{platform.processor()}-{platform.machine()}-{socket.gethostname()}"
        return hashlib.sha256(machine_info.encode()).hexdigest()[:32]
    
    @staticmethod
    def generate_license_key(store_id: str, validity_days: int = 365) -> Dict[str, str]:
        """
        Genera una clave de licencia profesional y segura
        
        Formato: POS-XXXXXXXX-XXXXXXXX-XXXXXXXX-XXXXXXXX
        """
        
        # Generar componentes
        timestamp = datetime.now().isoformat()
        expiry_date = (datetime.now() + timedelta(days=validity_days)).isoformat()
        
        # Crear payload
        payload = {
            'store_id': store_id,
            'issued_at': timestamp,
            'expires_at': expiry_date,
            'features': {
                'sales': True,
                'inventory': True,
                'reports': True,
                'users': True,
                'dte': True,
            }
        }
        
        # Serializar y firmar
        payload_json = json.dumps(payload, sort_keys=True)
        signature = hmac.new(
            LicenseKeyGenerator.SECRET_KEY.encode(),
            payload_json.encode(),
            hashlib.sha256
        ).hexdigest()[:16]
        
        # Formato final
        parts = [
            'POS',
            store_id[:8].upper(),
            signature,
            datetime.now().strftime('%Y%m%d'),
            str(uuid.uuid4())[:8].upper()
        ]
        
        license_key = '-'.join(parts)
        
        return {
            'license_key': license_key,
            'payload': payload_json,
            'signature': signature,
        }
    
    @staticmethod
    def validate_license_key(license_key: str, payload: str) -> bool:
        """
        Valida que la clave de licencia sea legítima
        """
        try:
            # Extraer y verificar firma
            parts = license_key.split('-')
            if len(parts) < 5 or parts[0] != 'POS':
                return False
            
            stored_signature = parts[2]
            
            # Recalcular firma
            calculated_signature = hmac.new(
                LicenseKeyGenerator.SECRET_KEY.encode(),
                payload.encode(),
                hashlib.sha256
            ).hexdigest()[:16]
            
            return hmac.compare_digest(stored_signature, calculated_signature)
        except Exception:
            return False
    
    @staticmethod
    def check_license_expiry(expires_at: str) -> bool:
        """
        Verifica si la licencia ha expirado
        """
        expiry = datetime.fromisoformat(expires_at)
        return expiry > datetime.now()


class OfflineLicenseValidator:
    """
    Valida licencias en modo offline (On-Premise)
    Funciona local y sincroniza cuando hay conexión
    """
    
    @staticmethod
    def validate_offline(
        license_key: str,
        machine_id: str,
        stored_license_data: Dict
    ) -> Dict[str, bool]:
        """
        Valida licencia guardada localmente
        """
        return {
            'valid': (
                license_key == stored_license_data.get('license_key') and
                machine_id == stored_license_data.get('machine_id') and
                LicenseKeyGenerator.check_license_expiry(stored_license_data.get('expires_at', ''))
            ),
            'features': stored_license_data.get('features', {}),
            'days_remaining': (
                (datetime.fromisoformat(stored_license_data.get('expires_at', '')) - datetime.now()).days
                if stored_license_data.get('expires_at')
                else 0
            ),
        }
    
    @staticmethod
    def get_grace_period_days(last_online_validation: Optional[str], grace_days: int = 30) -> int:
        """
        Calcula días restantes en período de gracia (modo offline)
        """
        if not last_online_validation:
            return grace_days
        
        last_validation = datetime.fromisoformat(last_online_validation)
        days_passed = (datetime.now() - last_validation).days
        remaining = grace_days - days_passed
        
        return max(0, remaining)
