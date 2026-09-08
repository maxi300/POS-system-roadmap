from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Q
from django.utils import timezone
from datetime import timedelta
from apps.sales.models import Sale, SaleItem, Return
from apps.sales.serializers import SaleSerializer, SaleItemSerializer, ReturnSerializer
from apps.products.models import Product
from apps.inventory.models import InventoryLog

class SaleViewSet(viewsets.ModelViewSet):
    """ViewSet para gestionar ventas"""
    serializer_class = SaleSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Sale.objects.filter(store=self.request.user.store).order_by('-date')
    
    def create(self, request, *args, **kwargs):
        """Crear una venta con sus items"""
        store = request.user.store
        cashier = request.user
        
        items_data = request.data.pop('items', [])
        
        # Calcular totales
        subtotal = sum(float(item['quantity']) * float(item['unit_price']) for item in items_data)
        tax = subtotal * 0.13  # IVA 13% El Salvador
        total = subtotal + tax
        
        sale = Sale.objects.create(
            store=store,
            cashier=cashier,
            total_items=len(items_data),
            subtotal=subtotal,
            tax=tax,
            total=total,
            payment_method=request.data.get('payment_method'),
            customer_name=request.data.get('customer_name', ''),
            customer_phone=request.data.get('customer_phone', ''),
            customer_nrc=request.data.get('customer_nrc', ''),
        )
        
        # Crear items y actualizar inventario
        for item_data in items_data:
            product = Product.objects.get(id=item_data['product_id'])
            
            SaleItem.objects.create(
                sale=sale,
                product=product,
                quantity=item_data['quantity'],
                unit_price=item_data['unit_price'],
                subtotal=float(item_data['quantity']) * float(item_data['unit_price']),
                tax=float(item_data['quantity']) * float(item_data['unit_price']) * 0.13,
            )
            
            # Restar del inventario
            product.stock -= int(item_data['quantity'])
            product.save()
            
            # Registrar en log
            InventoryLog.objects.create(
                product=product,
                store=store,
                type='salida',
                quantity=item_data['quantity'],
                reason=f'Venta {sale.id}',
                created_by=cashier,
            )
        
        serializer = self.get_serializer(sale)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get'])
    def daily_report(self, request):
        """Reporte de ventas del día"""
        today = timezone.now().date()
        sales = Sale.objects.filter(
            store=request.user.store,
            date__date=today
        )
        
        total_sales = sales.count()
        total_revenue = sum(s.total for s in sales) if sales.exists() else 0
        total_tax = sum(s.tax for s in sales) if sales.exists() else 0
        
        return Response({
            'date': today,
            'total_sales': total_sales,
            'total_revenue': float(total_revenue),
            'total_tax': float(total_tax),
            'average_sale': float(total_revenue / total_sales) if total_sales > 0 else 0,
        })
    
    @action(detail=False, methods=['get'])
    def monthly_report(self, request):
        """Reporte de ventas del mes"""
        today = timezone.now().date()
        first_day = today.replace(day=1)
        sales = Sale.objects.filter(
            store=request.user.store,
            date__date__gte=first_day
        )
        
        total_revenue = sum(s.total for s in sales) if sales.exists() else 0
        total_cost = sum(
            sum(si.product.cost * si.quantity for si in s.items.all())
            for s in sales
        )
        
        return Response({
            'month': today.strftime('%B %Y'),
            'total_sales': sales.count(),
            'total_revenue': float(total_revenue),
            'total_cost': float(total_cost),
            'total_profit': float(total_revenue - total_cost),
        })


class ReturnViewSet(viewsets.ModelViewSet):
    """ViewSet para gestionar devoluciones"""
    serializer_class = ReturnSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Return.objects.filter(store=request.user.store)
    
    def perform_create(self, serializer):
        serializer.save(
            store=self.request.user.store,
            created_by=self.request.user
        )
