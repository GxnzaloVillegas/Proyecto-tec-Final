import React, { useState } from 'react';
import { usePurchaseOrders, useUpdatePurchaseOrderStatus, usePurchaseOrderById } from '../hooks/useOrdenCompras';
import { Table, Modal, Button, Pagination, Card, Badge, Container, Row, Col, Collapse, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaEye, FaCheck, FaTimes, FaPlus, FaShoppingCart, FaCalendar, FaSortAmountDown, FaSortAmountUp, FaFileDownload, FaFilePdf } from 'react-icons/fa';
import { useUploadProveedorFile } from '../hooks/useFileUpload';
import '../styles/OrdenCompraPage.css';
import api from '../services/api';
import { useProveedores } from '../hooks/useProveedor';

const OrdenCompraListPage = () => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;
  const { data: orders, isLoading, isError, refetch } = usePurchaseOrders();
  const { updateStatus } = useUpdatePurchaseOrderStatus();
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortDirection, setSortDirection] = useState('desc');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [proveedorFile, setProveedorFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const { uploadFile } = useUploadProveedorFile();
  const [proveedorFilter, setProveedorFilter] = useState('');
  const { data: proveedores, isLoading: isLoadingProveedores } = useProveedores();
  const { data: orderData, refetch: refetchOrder } = usePurchaseOrderById(null);

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleRowClick = (order) => {
    setSelectedOrder(order);
  };

  const handleConfirmOrder = async () => {
    if (!selectedOrder) return;
    
    if (!proveedorFile) {
      setFileError('Debe adjuntar la ficha del proveedor para confirmar la orden');
      return;
    }

    const formData = new FormData();
    formData.append('file', proveedorFile);
    formData.append('id_ordcompra', selectedOrder.id_ordcompra);
    
    setIsUpdating(true);
    try {
      // Primero subir el archivo
      await uploadFile(formData);
      
      // Luego actualizar el estado
      await updateStatus(selectedOrder.id_ordcompra, '1');
      
      // Limpiar estados
      setProveedorFile(null);
      setFileError('');
      setSelectedOrder(null); // Cerrar el modal después de confirmar
      
      // Refrescar los datos
      await refetch();
      
      toast.success('Orden confirmada exitosamente');
    } catch (error) {
      console.error('Error al confirmar la orden:', error);
      toast.error(error.response?.data?.message || 'Error al confirmar la orden');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!selectedOrder) return;
    await updateOrderStatus('3', 'Cancelling');
  };

  const updateOrderStatus = async (status, action) => {
    setIsUpdating(true);
    try {
      await updateStatus(selectedOrder.id_ordcompra, status);
      setSelectedOrder((prev) => ({ ...prev, estado: status }));
      
      // Refrescar los datos después de la actualización
      await refetch();
      
      toast.success(`Orden ${action.toLowerCase()} exitosamente`);
    } catch (error) {
      console.error(`Error ${action.toLowerCase()} order:`, error);
      toast.error(`Error al ${action.toLowerCase()} la orden`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleClose = () => setSelectedOrder(null);

  const getFilteredOrders = () => {
    if (!orders) return [];
    
    let filtered = orders.filter(order => {
      if (statusFilter !== 'all' && order.estado !== statusFilter) {
        return false;
      }

      if (dateRange.startDate && dateRange.endDate) {
        const orderDate = new Date(order.fecha);
        const start = new Date(dateRange.startDate);
        const end = new Date(dateRange.endDate);
        end.setHours(23, 59, 59);
        
        if (orderDate < start || orderDate > end) {
          return false;
        }
      }

      if (proveedorFilter && order.id_proveedor !== proveedorFilter) {
        return false;
      }

      return true;
    });

    filtered.sort((a, b) => {
      const dateA = new Date(a.fecha);
      const dateB = new Date(b.fecha);
      return sortDirection === 'desc' ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  };

  const filteredOrders = getFilteredOrders();
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleSortDirectionChange = () => {
    setSortDirection(prev => prev === 'desc' ? 'asc' : 'desc');
  };

  const handleDateRangeChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clearDateFilter = () => {
    setDateRange({
      startDate: '',
      endDate: ''
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo de archivo
      if (!['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)) {
        setFileError('Solo se permiten archivos PDF, JPG o PNG');
        return;
      }
      // Validar tamaño (5MB máximo)
      if (file.size > 5 * 1024 * 1024) {
        setFileError('El archivo no debe superar los 5MB');
        return;
      }
      setProveedorFile(file);
      setFileError('');
    }
  };

  // Función para ver/descargar la ficha técnica
  const handleViewFichaTecnica = (id_ordcompra) => {
    const serverUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    window.open(`${serverUrl}/uploads/fichas-tecnicas/${id_ordcompra}.pdf`, '_blank');
  };

  const clearAllFilters = () => {
    setStatusFilter('all');
    setDateRange({ startDate: '', endDate: '' });
    setProveedorFilter('');
  };

  const renderProveedorFilter = () => (
    <div className="filter-actions">
      <Form.Group className="mb-0 me-2">
        <Form.Select
          value={proveedorFilter}
          onChange={(e) => setProveedorFilter(e.target.value)}
          className="proveedor-filter"
        >
          <option value="">Todos los proveedores</option>
          {proveedores?.map((proveedor) => (
            <option key={proveedor.id_proveedor} value={proveedor.id_proveedor}>
              {proveedor.raz_soc}
            </option>
          ))}
        </Form.Select>
      </Form.Group>
    </div>
  );

  if (isLoading) return <p>Loading orders...</p>;
  if (isError) return <p>Error loading orders</p>;

  const getStatusBadge = (status) => {
    switch(status) {
      case '1': return <Badge bg="success">Confirmado</Badge>;
      case '2': return <Badge bg="warning">Pendiente</Badge>;
      case '3': return <Badge bg="danger">Cancelado</Badge>;
      default: return <Badge bg="secondary">Desconocido</Badge>;
    }
  };

  const handlePrint = async (orderId) => {
    try {
      // Actualizar el ID y obtener los datos
      const response = await api.get(`/compras/${orderId}`);
      const order = response.data;

      if (!order) {
        toast.error('Error al cargar los datos de la orden');
        return;
      }

      // Crear una nueva ventana para la impresión
      const printWindow = window.open('', '_blank');
      
      // HTML para la orden de compra
      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Orden de Compra #${order.id_ordcompra}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              color: #333;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .order-info {
              margin-bottom: 20px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #f8f9fa;
            }
            .total {
              text-align: right;
              font-weight: bold;
              margin-top: 20px;
            }
            .footer {
              margin-top: 40px;
              font-size: 0.9em;
            }
            @media print {
              body {
                margin: 0;
                padding: 15px;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>ORDEN DE COMPRA</h1>
            <h2>#${order.id_ordcompra}</h2>
          </div>

          <div class="order-info">
            <p><strong>Fecha:</strong> ${new Date(order.fecha).toLocaleDateString()}</p>
            <p><strong>Estado:</strong> ${
              order.estado === '1' ? 'Confirmado' : 
              order.estado === '2' ? 'Pendiente' : 'Cancelado'
            }</p>
            <p><strong>Proveedor:</strong> ${order.proveedor?.raz_soc}</p>
            <p><strong>RUC:</strong> ${order.proveedor?.ruc}</p>
            <p><strong>Dirección:</strong> ${order.proveedor?.dir_pro}</p>
            <p><strong>Teléfono:</strong> ${order.proveedor?.tel_pro}</p>
            <p><strong>Correo:</strong> ${order.proveedor?.correo}</p>
          </div>

          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Precio Unit.</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${order.detalles.map(detalle => `
                <tr>
                  <td>${detalle.producto.nombre}</td>
                  <td>${detalle.cantidad}</td>
                  <td>S/ ${parseFloat(detalle.pre_unitario).toFixed(2)}</td>
                  <td>S/ ${parseFloat(detalle.subtotal).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="total">
            <p>Total: S/ ${parseFloat(order.total).toFixed(2)}</p>
          </div>

          <div class="footer">
            <p><strong>Observaciones:</strong></p>
            <ol>
              <li>La mercadería debe ser entregada con su respectiva guía de remisión y factura.</li>
              <li>La entrega debe realizarse en el horario establecido.</li>
              <li>Los productos deben cumplir con las especificaciones detalladas.</li>
            </ol>
          </div>
        </body>
        </html>
      `;

      // Escribir el contenido en la nueva ventana
      printWindow.document.write(printContent);
      printWindow.document.close();

      // Esperar a que los estilos y contenido se carguen
      printWindow.onload = function() {
        printWindow.print();
        // printWindow.close(); // Opcional: cerrar la ventana después de imprimir
      };
    } catch (error) {
      console.error('Error al obtener los datos de la orden:', error);
      toast.error('Error al cargar los datos de la orden');
    }
  };

  return (
    <div className="page-container">
      <Container className="py-4">
        {/* Header Section */}
        <div className="page-header">
          <div className="header-content">
            <div className="title-section">
              <h1 className="page-title">
                <FaShoppingCart className="title-icon" />
                Órdenes de Compra
              </h1>
              <p className="text-muted">Gestiona tus órdenes de compra y seguimiento de pedidos</p>
            </div>
            <div className="action-section">
              <Link to="/crear-orden-compra" className="btn-create">
                <FaPlus className="btn-icon" /> 
                Nueva Orden
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="stats-container">
          <div 
            className={`stat-card ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => handleStatusFilterChange('all')}
            role="button"
          >
            <div className="stat-icon all">
              <Badge bg="secondary">
                {orders?.length || 0}
              </Badge>
            </div>
            <div className="stat-info">
              <h6>Todas</h6>
              <p className="text-muted">Total de órdenes</p>
            </div>
          </div>

          <div 
            className={`stat-card ${statusFilter === '2' ? 'active' : ''}`}
            onClick={() => handleStatusFilterChange('2')}
            role="button"
          >
            <div className="stat-icon pending">
              <Badge bg="warning">
                {orders?.filter(order => order.estado === '2').length || 0}
              </Badge>
            </div>
            <div className="stat-info">
              <h6>Pendientes</h6>
              <p className="text-muted">Órdenes sin procesar</p>
            </div>
          </div>
          
          <div 
            className={`stat-card ${statusFilter === '1' ? 'active' : ''}`}
            onClick={() => handleStatusFilterChange('1')}
            role="button"
          >
            <div className="stat-icon confirmed">
              <Badge bg="success">
                {orders?.filter(order => order.estado === '1').length || 0}
              </Badge>
            </div>
            <div className="stat-info">
              <h6>Confirmadas</h6>
              <p className="text-muted">Órdenes procesadas</p>
            </div>
          </div>
          
          <div 
            className={`stat-card ${statusFilter === '3' ? 'active' : ''}`}
            onClick={() => handleStatusFilterChange('3')}
            role="button"
          >
            <div className="stat-icon cancelled">
              <Badge bg="danger">
                {orders?.filter(order => order.estado === '3').length || 0}
              </Badge>
            </div>
            <div className="stat-info">
              <h6>Canceladas</h6>
              <p className="text-muted">Órdenes canceladas</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="content-section">
          <Card className="table-card">
            <Card.Body>
              <div className="table-header">
                <div className="table-title">
                  <h5 className="mb-0">Lista de Órdenes</h5>
                  <div className="filter-indicators">
                    {statusFilter !== 'all' && (
                      <span className="active-filter-indicator">
                        Filtrando por: {
                          statusFilter === '1' ? 'Confirmadas' :
                          statusFilter === '2' ? 'Pendientes' :
                          'Canceladas'
                        }
                        <Button 
                          variant="link" 
                          className="clear-filter-btn"
                          onClick={() => handleStatusFilterChange('all')}
                        >
                          <FaTimes />
                        </Button>
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="filter-actions d-flex align-items-center">
                  {renderProveedorFilter()}
                  
                  <Button 
                    variant="outline-secondary" 
                    className="filter-btn ms-2"
                    onClick={() => setShowDateFilter(!showDateFilter)}
                  >
                    <FaCalendar className="btn-icon" />
                    Filtrar por Fecha
                  </Button>
                  
                  <Button 
                    variant="outline-secondary" 
                    className="sort-btn ms-2"
                    onClick={handleSortDirectionChange}
                  >
                    {sortDirection === 'desc' ? (
                      <>
                        <FaSortAmountDown className="btn-icon" />
                        Más recientes primero
                      </>
                    ) : (
                      <>
                        <FaSortAmountUp className="btn-icon" />
                        Más antiguos primero
                      </>
                    )}
                  </Button>

                  {(statusFilter !== 'all' || dateRange.startDate || dateRange.endDate || proveedorFilter) && (
                    <Button 
                      variant="link" 
                      className="clear-all-filters ms-2"
                      onClick={clearAllFilters}
                    >
                      <FaTimes className="btn-icon" />
                      Limpiar filtros
                    </Button>
                  )}
                </div>
              </div>

              <Collapse in={showDateFilter}>
                <div className="date-filter-container">
                  <Form className="date-filter-form">
                    <Row>
                      <Col md={5}>
                        <Form.Group>
                          <Form.Label>Fecha Inicio</Form.Label>
                          <Form.Control
                            type="date"
                            name="startDate"
                            value={dateRange.startDate}
                            onChange={handleDateRangeChange}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={5}>
                        <Form.Group>
                          <Form.Label>Fecha Fin</Form.Label>
                          <Form.Control
                            type="date"
                            name="endDate"
                            value={dateRange.endDate}
                            onChange={handleDateRangeChange}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={2} className="d-flex align-items-end">
                        <Button 
                          variant="link" 
                          className="clear-date-btn"
                          onClick={clearDateFilter}
                          disabled={!dateRange.startDate && !dateRange.endDate}
                        >
                        
                        </Button>
                      </Col>
                    </Row>
                  </Form>
                </div>
              </Collapse>

              <div className="table-responsive">
                <Table hover className="custom-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th className="sortable-header" onClick={handleSortDirectionChange}>
                        <div className="header-content">
                          Fecha
                          {sortDirection === 'desc' ? 
                            <FaSortAmountDown className="sort-icon active" /> : 
                            <FaSortAmountUp className="sort-icon active" />
                          }
                        </div>
                      </th>
                      <th>Total</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentOrders?.map((order) => (
                      <tr key={order.id_ordcompra}>
                        <td>
                          <span className="order-id">#{order.id_ordcompra}</span>
                        </td>
                        <td>
                          <div className="date-cell">
                            <span className="date">
                              {new Date(order.fecha).toLocaleDateString()}
                            </span>
                          
                          </div>
                        </td>
                        <td className="text-start">
                          <span className="amount">${parseFloat(order.total).toFixed(2)}</span>
                        </td>
                        <td>{getStatusBadge(order.estado)}</td>
                        <td>
                          <Button 
                            variant="link" 
                            className="action-btn"
                            onClick={() => handleRowClick(order)}
                          >
                            <FaEye /> Ver Detalles
                          </Button>
                          <Button 
                            variant="outline-primary" 
                            size="sm"
                            onClick={() => handlePrint(order.id_ordcompra)}
                            className="action-btn ms-2"
                            title="Imprimir/Guardar PDF"
                          >
                            <FaFilePdf className="me-1" /> Imprimir/PDF
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </div>

        {/* Pagination */}
        <div className="pagination-container">
          <Pagination>
            {Array.from({ length: Math.ceil(orders?.length / ordersPerPage) }).map((_, idx) => (
              <Pagination.Item 
                key={idx + 1} 
                active={idx + 1 === currentPage} 
                onClick={() => paginate(idx + 1)}
              >
                {idx + 1}
              </Pagination.Item>
            ))}
          </Pagination>
        </div>

        {/* Modal */}
        <Modal show={!!selectedOrder} onHide={handleClose} size="lg" className="custom-modal">
          <Modal.Header closeButton>
            <Modal.Title>
              <FaShoppingCart className="me-2" />
              Orden de Compra #{selectedOrder?.id_ordcompra}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedOrder && (
              <>
                <div className="order-details">
                  <div className="detail-card">
                    <h6>Información General</h6>
                    <div className="details-grid">
                      <div className="detail-item">
                        <span className="label">Fecha:</span>
                        <span className="value">{new Date(selectedOrder.fecha).toLocaleDateString()}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Estado:</span>
                        <span>{getStatusBadge(selectedOrder.estado)}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Total:</span>
                        <span className="value amount">${parseFloat(selectedOrder.total).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="products-section">
                    <h6>Productos</h6>
                    <div className="table-responsive">
                      <Table className="products-table">
                        <thead>
                          <tr>
                            <th>Producto</th>
                            <th>Cantidad</th>
                            <th>Precio Unit.</th>
                            <th>Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedOrder.detalles.map((detalle) => (
                            <tr key={detalle.id_detcompra}>
                              <td>{detalle.producto.nombre}</td>
                              <td className="text-center">{detalle.cantidad}</td>
                              <td className="text-end">${parseFloat(detalle.pre_unitario).toFixed(2)}</td>
                              <td className="text-end">${parseFloat(detalle.subtotal).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  </div>
                </div>
                <div className="detail-card mt-3">
                  <h6>Documentos</h6>
                  <div className="details-grid">
                    {selectedOrder.estado === '1' && (
                      <div className="detail-item">
                        <span className="label">Guía de Remisión:</span>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleViewFichaTecnica(selectedOrder.id_ordcompra)}
                          className="ms-2"
                        >
                          <FaFilePdf className="me-2" />
                          Ver Guía de Remisión
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            {selectedOrder?.estado === '2' && (
              <div className="action-buttons">
                <Form.Group className="mb-3 file-upload-section">
                  <Form.Label>Guia de Remisión</Form.Label>
                  <Form.Control
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.jpeg,.png"
                    className={fileError ? 'is-invalid' : ''}
                  />
                  {fileError && (
                    <Form.Text className="text-danger">
                      {fileError}
                    </Form.Text>
                  )}
                  {proveedorFile && (
                    <Form.Text className="text-success">
                      Archivo seleccionado: {proveedorFile.name}
                    </Form.Text>
                  )}
                </Form.Group>
                <Button
                  variant="success"
                  className="confirm-btn custom-btn-height"
                  onClick={handleConfirmOrder}
                  disabled={isUpdating || !proveedorFile}
                >
                  <FaCheck className="btn-icon" />
                  {isUpdating ? 'Confirmando...' : 'Confirmar Orden'}
                </Button>
                <Button
                  variant="danger"
                  className="cancel-btn custom-btn-height"
                  onClick={handleCancelOrder}
                  disabled={isUpdating}
                >
                  <FaTimes className="btn-icon" />
                  {isUpdating ? 'Cancelando...' : 'Cancelar Orden'}
                </Button>
              </div>
            )}
            <Button variant="outline-secondary" onClick={handleClose}>
              Cerrar
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
};

export default OrdenCompraListPage;
