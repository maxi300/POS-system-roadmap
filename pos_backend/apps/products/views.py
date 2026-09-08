from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from apps.products.models import Product, Category
from apps.products.serializers import ProductSerializer, CategorySerializer
from apps.inventory.models import InventoryLog

class CategoryViewSet(viewsets.ModelViewSet):
    """ViewSet para Categorías"""
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name']
    ordering_fields = ['name', 'created_at']
    
    def get_queryset(self):
        return Category.objects.filter(store=self.request.user.store)
    
    def perform_create(self, serializer):
        serializer.save(store=self.request.user.store)


class ProductViewSet(viewsets.ModelViewSet):
    """ViewSet para Productos"""
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'is_active']
    search_fields = ['code', 'name', 'sku']
    ordering_fields = ['name', 'price', 'stock', 'created_at']
    
    def get_queryset(self):
        return Product.objects.filter(store=self.request.user.store)
    
    def perform_create(self, serializer):
        serializer.save(store=self.request.user.store)
    
    @action(detail=False, methods=['get'])
    def low_stock(self, request):
        """Productos con stock bajo"""
        products = Product.objects.filter(
            store=request.user.store,
            stock__lte=models.F('min_stock')
        )
        serializer = self.get_serializer(products, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def bulk_import(self, request):
        """Importar productos desde CSV"""
        # Este endpoint recibe datos CSV y crea múltiples productos
        import csv
        from io import StringIO
        
        csv_data = request.data.get('csv_content', '')
        try:
            reader = csv.DictReader(StringIO(csv_data))
            products_created = 0
            
            for row in reader:
                Product.objects.create(
                    store=request.user.store,
                    code=row.get('code'),
                    name=row.get('name'),
                    description=row.get('description', ''),
                    cost=float(row.get('cost', 0)),
                    price=float(row.get('price', 0)),
                    stock=int(row.get('stock', 0)),
                )
                products_created += 1
            
            return Response({
                'message': f'{products_created} productos importados',
                'count': products_created
            }, status=status.HTTP_201_CREATED)
        
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
