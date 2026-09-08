from rest_framework import serializers
from apps.licenses.models import License

class LicenseSerializer(serializers.ModelSerializer):
    """Serializer para Licencias"""
    store_name = serializers.CharField(source='store.name', read_only=True)
    is_valid = serializers.SerializerMethodField()
    days_remaining = serializers.SerializerMethodField()
    
    class Meta:
        model = License
        fields = ['id', 'store', 'store_name', 'license_key', 'machine_id', 'valid_from', 'valid_until', 'features', 'status', 'is_valid', 'days_remaining', 'last_validation']
        read_only_fields = ['id', 'valid_from', 'last_validation']
    
    def get_is_valid(self, obj):
        return obj.is_valid
    
    def get_days_remaining(self, obj):
        return obj.days_remaining
