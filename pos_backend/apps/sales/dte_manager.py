import xml.etree.ElementTree as ET
from datetime import datetime
from typing import Dict, Optional
import json
import hashlib
import base64
import requests
import os
from django.core.exceptions import ValidationError

class DTEManager:
    """
    Gestor de Documentos Tributarios Electrónicos para El Salvador
    Integración con API del Ministerio de Hacienda (MH)
    """
    
    # Ambiente (cambiar a PRODUCCION mediante variable de entorno cuando esté listo)
    AMBIENTE = os.environ.get('DTE_AMBIENTE', 'PRUEBAS')  # PRUEBAS o PRODUCCION
    
    # URLs de la API DTE
    DTE_API_URLS = {
        'PRUEBAS': 'https://dte.mh.gob.sv/prueba/srv',
        'PRODUCCION': 'https://dte.mh.gob.sv/srv',
    }
    
    # Códigos de tipo de documento
    DOCUMENT_TYPES = {
        'FACTURA': '01',
        'NOTA_CREDITO': '03',
        'NOTA_DEBITO': '05',
        'COMPROBANTE_RETENCION': '07',
    }
    
    # Códigos de contingencia
    CONTINGENCY_TYPES = {
        'TIMEOUT': '1',  # Problema de conectividad
        'CERTIFICADO_INVALIDO': '2',  # Certificado digital no válido
        'SERVICIO_DISPONIBILIDAD': '3',  # Servicio no disponible
    }
    
    def __init__(self, store):
        self.store = store
        self.api_url = self.DTE_API_URLS.get(self.AMBIENTE, self.DTE_API_URLS['PRUEBAS'])
        self.nrc = store.nrc
        self.nit = store.nit or ''
        self.giro = store.giro
        
        # Cargar credenciales (desde env variables o BD)
        self.api_user = os.environ.get('DTE_API_USER', '')
        self.api_password = os.environ.get('DTE_API_PASSWORD', '')
        self.cert_path = os.environ.get('DTE_CERT_PATH', '')
    
    def generate_dte_invoice(self, sale) -> Dict:
        """
        Genera un Documento Tributario Electrónico (DTE) de factura
        """
        # Validar que la tienda tenga los datos fiscales completos
        if not self.nrc or not self.giro:
            raise ValidationError("La tienda debe tener NRC y Giro configurados")
        
        # Construir XML del DTE
        dte_xml = self._build_invoice_xml(sale)
        
        # Si estamos explícitamente en pruebas locales o se requiere forzar contingencia
        if self.AMBIENTE == 'PRUEBAS' and os.environ.get('FORCE_LOCAL_CONTINGENCY', 'False').lower() == 'true':
            return self._handle_contingency(sale, 'PRUEBAS')
        
        try:
            # Enviar al servidor de MH
            response = self._send_to_dte_server(dte_xml)
            
            # Procesar respuesta
            if response.get('success'):
                return {
                    'success': True,
                    'dte_number': response.get('dte_number'),
                    'dte_qr': response.get('qr_code'),
                    'timestamp': response.get('timestamp'),
                    'control_number': response.get('control_number'),
                }
            else:
                # Si falla el servidor en ambiente de pruebas, manejamos contingencia o retornamos error descriptivo
                return self._handle_contingency(sale, 'TIMEOUT')
        
        except Exception as e:
            print(f"[v0] Error al enviar DTE: {str(e)}")
            return self._handle_contingency(sale, 'SERVICIO_DISPONIBILIDAD')
    
    def _build_invoice_xml(self, sale) -> str:
        """
        Construye el XML del DTE siguiendo estándar MH
        """
        # Crear raíz del documento
        root = ET.Element('dte:DTEs', {
            'xmlns:dte': 'http://www.mh.gob.sv/esf/dte',
            'xmlns:ds': 'http://www.w3.org/2000/09/xmldsig#',
            'xsi:schemaLocation': 'http://www.mh.gob.sv/esf/dte http://www.mh.gob.sv/esf/dte/DTE_Venta.xsd',
        })
        
        # Elemento DTE
        dte = ET.SubElement(root, 'dte:DTE')
        dte.set('ID', f"DTE-{sale.id}")
        
        # Encabezado
        header = ET.SubElement(dte, 'dte:Encabezado')
        header_data = ET.SubElement(header, 'dte:EncabezadoDeFactura')
        
        # Información del documento
        ET.SubElement(header_data, 'dte:TipoDeDocumento').text = self.DOCUMENT_TYPES['FACTURA']
        ET.SubElement(header_data, 'dte:NumeroDeControl').text = self._generate_control_number(sale)
        ET.SubElement(header_data, 'dte:NumeroDeRegNoAutorizado').text = self.nrc
        ET.SubElement(header_data, 'dte:FechaDeEmision').text = sale.date.strftime('%d/%m/%Y')
        ET.SubElement(header_data, 'dte:HoraDeEmision').text = sale.date.strftime('%H:%M:%S')
        # Ambiente: '01' para pruebas, '02' para producción
        ET.SubElement(header_data, 'dte:Ambiente').text = '01' if self.AMBIENTE == 'PRUEBAS' else '02'
        
        # Emisor (la tienda)
        sender = ET.SubElement(header_data, 'dte:Emisor')
        ET.SubElement(sender, 'dte:NombrioEmisor').text = self.store.name
        ET.SubElement(sender, 'dte:AfiliacionISS').text = 'No'
        ET.SubElement(sender, 'dte:RegistroIVA').text = self.nrc
        ET.SubElement(sender, 'dte:NIT').text = self.nit or ''
        
        # Establecimientos autorizados
        establishments = ET.SubElement(sender, 'dte:Establecimientos')
        establishment = ET.SubElement(establishments, 'dte:EstablecimientoAutorizado')
        ET.SubElement(establishment, 'dte:Codigo').text = '01'
        ET.SubElement(establishment, 'dte:Nombre').text = self.store.name
        ET.SubElement(establishment, 'dte:Direccion').text = getattr(self.store, 'address', 'San Salvador, El Salvador')
        ET.SubElement(establishment, 'dte:Telefono').text = getattr(self.store, 'phone', '2222-2222')
        
        # Receptor (cliente dinámico: Consumidor Final o Empresa)
        receiver = ET.SubElement(header_data, 'dte:Receptor')
        customer_name = getattr(sale, 'customer_name', None) or 'CONSUMIDOR FINAL'
        customer_doc = getattr(sale, 'customer_document', None) or '00000000-0'
        
        ET.SubElement(receiver, 'dte:NombreReceptor').text = customer_name
        
        # Si el documento es NIT (36) o DUI (13) según corresponda
        if customer_doc != '00000000-0' and len(customer_doc.replace('-', '')) == 14:
            ET.SubElement(receiver, 'dte:TipoDocumento').text = '36'  # NIT
        else:
            ET.SubElement(receiver, 'dte:TipoDocumento').text = '13'  # DUI o Genérico
            
        ET.SubElement(receiver, 'dte:NumeroDocumento').text = customer_doc
        
        # Items del DTE
        items = ET.SubElement(dte, 'dte:Detalle')
        for idx, item in enumerate(sale.items.all(), 1):
            detail_item = ET.SubElement(items, 'dte:Item')
            detail_item.set('numeroLinea', str(idx))
            
            product_name = getattr(item.product, 'name', None) or 'Producto sin descripción'
            product_code = getattr(item.product, 'code', f"PROD-{idx}")
            
            ET.SubElement(detail_item, 'dte:NumeroLinea').text = str(idx)
            ET.SubElement(detail_item, 'dte:Codigo').text = product_code
            ET.SubElement(detail_item, 'dte:Descripcion').text = product_name
            ET.SubElement(detail_item, 'dte:Cantidad').text = str(item.quantity)
            ET.SubElement(detail_item, 'dte:PrecioUnitario').text = f"{item.unit_price:.8f}"
            ET.SubElement(detail_item, 'dte:Descuento').text = '0.00'
            ET.SubElement(detail_item, 'dte:Monto').text = f"{item.subtotal:.2f}"
            
            # Tributación
            tributes = ET.SubElement(detail_item, 'dte:Tributos')
            tribute = ET.SubElement(tributes, 'dte:Tributo')
            ET.SubElement(tribute, 'dte:CodigoTributo').text = '10'  # IVA
            ET.SubElement(tribute, 'dte:Monto').text = f"{item.tax:.2f}"
        
        # Resumen
        summary = ET.SubElement(dte, 'dte:Resumen')
        ET.SubElement(summary, 'dte:TotalOperaciones').text = str(sale.items.count())
        ET.SubElement(summary, 'dte:TotalEnOperaciones').text = f"{sale.subtotal:.2f}"
        ET.SubElement(summary, 'dte:DflMonto').text = '0.00'
        ET.SubElement(summary, 'dte:TotalIVA').text = f"{sale.tax:.2f}"
        ET.SubElement(summary, 'dte:TotalAPercibir').text = f"{sale.total:.2f}"
        
        return ET.tostring(root, encoding='unicode')
    
    def _generate_control_number(self, sale) -> str:
        """
        Genera número de control único para DTE
        Formato requerido: RRRRRRRRRRRRSSNNNNNN
        """
        nrc_part = self.nrc.replace('-', '')[:14].ljust(14, '0')
        doc_part = f"01{self.DOCUMENT_TYPES['FACTURA']}"
        seq = str(sale.id)[-6:].rjust(6, '0') if str(sale.id).isdigit() else '000001'
        
        return f"{nrc_part}{doc_part}{seq}"
    
    def _send_to_dte_server(self, dte_xml: str) -> Dict:
        """
        Envía el DTE al servidor del MH
        """
        try:
            headers = {
                'Content-Type': 'application/json',
            }
            
            payload = {
                'usuario': self.api_user,
                'clave': self.api_password,
                'dteXml': base64.b64encode(dte_xml.encode()).decode(),
            }
            
            response = requests.post(
                f"{self.api_url}/enviarDTE",
                json=payload,
                headers=headers,
                timeout=10,
                verify=self.cert_path if self.cert_path else True
            )
            
            if response.status_code == 200:
                data = response.json()
                return {
                    'success': data.get('estado') == '1' or data.get('codigo') == '200',
                    'dte_number': data.get('saf'),
                    'qr_code': data.get('codigoGeneracion'),
                    'timestamp': data.get('fhProcesamiento'),
                    'control_number': data.get('numeroControl'),
                }
            else:
                print(f"[v0] Error HTTP {response.status_code}: {response.text}")
                return {'success': False, 'error': response.text}
        
        except requests.Timeout:
            print("[v0] Timeout al conectar con servidor DTE")
            return {'success': False, 'error': 'Timeout'}
        except Exception as e:
            print(f"[v0] Error en envío DTE: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def _handle_contingency(self, sale, contingency_type: str) -> Dict:
        """
        Genera factura en contingencia local para pruebas o caídas del servicio del MH
        """
        control_number = self._generate_control_number(sale)
        
        cod_generacion = hashlib.sha256(
            f"{control_number}{sale.date.isoformat()}".encode()
        ).hexdigest().upper()
        # Formatear como UUID estándar de MH
        cod_generacion = f"{cod_generacion[:8]}-{cod_generacion[8:12]}-{cod_generacion[12:16]}-{cod_generacion[16:20]}-{cod_generacion[20:32]}"
        
        return {
            'success': True,
            'contingency': True,
            'contingency_type': contingency_type,
            'dte_number': f"CONT-{control_number}",
            'control_number': control_number,
            'dte_qr': cod_generacion,
            'timestamp': datetime.now().isoformat(),
            'message': 'Factura procesada localmente para pruebas / contingencia.'
        }