from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.utils import timezone
from apps.licenses.models import License
from apps.licenses.serializers import LicenseSerializer
from apps.licenses.license_manager import LicenseManager

class LicenseViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet para gestionar licencias"""
    serializer_class = LicenseSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Solo admin ve todas las licencias
        if self.request.user.is_staff:
            return License.objects.all()
        return License.objects.filter(store=self.request.user.store)
    
    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def activate(self, request):
        """Activar licencia con machine_id (primeros uso)"""
        license_key = request.data.get('license_key')
        machine_id = request.data.get('machine_id')
        
        try:
            result = LicenseManager.validate_and_activate_license(license_key, machine_id)
            return Response(result, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def validate_offline(self, request):
        """Validar en modo offline"""
        license_key = request.data.get('license_key')
        local_data = request.data.get('local_data', {})
        
        result = LicenseManager.check_offline_validity(license_key, local_data)
        return Response(result)
    
    @action(detail=False, methods=['post'])
    def renew(self, request):
        """Renovar licencia"""
        license_key = request.data.get('license_key')
        additional_days = request.data.get('additional_days', 365)
        
        try:
            result = LicenseManager.renew_license(license_key, additional_days)
            return Response(result, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def validate_license(self, request):
        """Validar licencia (para On-Premise)"""
        license_key = request.data.get('license_key')
        machine_id = request.data.get('machine_id')
        
        try:
            license_obj = License.objects.get(license_key=license_key)
            
            # Verificar machine_id
            if license_obj.machine_id != machine_id:
                return Response({
                    'valid': False,
                    'error': 'Machine ID no coincide'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Actualizar última validación
            license_obj.last_validation = timezone.now()
            license_obj.save()
            
            return Response({
                'valid': license_obj.is_valid,
                'days_remaining': license_obj.days_remaining,
                'features': license_obj.features,
            })
        
        except License.DoesNotExist:
            return Response({
                'valid': False,
                'error': 'Licencia no encontrada'
            }, status=status.HTTP_404_NOT_FOUND)
