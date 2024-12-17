import React, { useState } from 'react';
import { useSales } from '../hooks/useVentas'; // Hook para obtener las ventas
import { Table, Modal, Button, Pagination, Container, Row, Col, Card, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { 
  FaEye, 
  FaPlus, 
  FaShoppingCart, 
  FaChartLine, 
  FaReceipt, 
  FaCalculator, 
  FaCalendar, 
  FaSortAmountDown, 
  FaSortAmountUp, 
  FaTimes, 
  FaBoxes 
} from 'react-icons/fa';
import { Collapse, Form } from 'react-bootstrap';

const VentaListPage = () => {
  const [selectedSale, setSelectedSale] = useState(null); // Estado para la venta seleccionada
  const [currentPage, setCurrentPage] = useState(1); // Página actual para la paginación
  const salesPerPage = 10; // Número de ventas por página
  const { data: sales, isLoading, isError } = useSales(); // Hook para obtener las ventas
  const [sortDirection, setSortDirection] = useState('desc');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [showDateFilter, setShowDateFilter] = useState(false);

  // Función para formatear fecha a zona horaria de Perú
  const formatDateToPeru = (date) => {
    return new Date(date).toLocaleString('es-PE', {
      timeZone: 'America/Lima',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  // Función para obtener la fecha actual en Perú
  const getCurrentPeruDate = () => {
    return new Date().toLocaleString('es-PE', {
      timeZone: 'America/Lima'
    });
  };

  // Función para calcular estadísticas incluyendo ventas de hoy y productos del mes
  const calculateStats = () => {
    if (!sales || sales.length === 0) return {
      totalVentas: 0,
      promedioVenta: 0,
      totalProductos: 0,
      ventasHoy: 0,
      ventasAyer: 0,
      productosDelMes: 0
    };

    // Obtener fecha actual en Perú y ajustar por el día de diferencia
    const today = new Date();
    today.setDate(today.getDate() - 1); // Ajuste por la diferencia de un día
    today.setHours(0, 0, 0, 0);

    // Obtener fecha de ayer
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Obtener primer día del mes actual
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const stats = sales.reduce((acc, sale) => {
      // Sumar al total de ventas
      acc.totalVentas += parseFloat(sale.total);
      
      // Convertir la fecha de la venta a objeto Date
      const saleDate = new Date(sale.fecha);
      saleDate.setHours(0, 0, 0, 0);

      // Verificar si la venta es de hoy (ajustado)
      if (saleDate.getTime() === today.getTime()) {
        acc.ventasHoy += parseFloat(sale.total);
      }
      
      // Verificar si la venta es de ayer (ajustado)
      if (saleDate.getTime() === yesterday.getTime()) {
        acc.ventasAyer += parseFloat(sale.total);
      }

      // Verificar si la venta es del mes actual
      if (saleDate >= firstDayOfMonth && saleDate <= today) {
        acc.productosDelMes += sale.detalles.reduce((sum, detalle) => sum + detalle.cantidad, 0);
      }

      // Contar productos vendidos totales
      acc.totalProductos += sale.detalles.reduce((sum, detalle) => sum + detalle.cantidad, 0);

      return acc;
    }, {
      totalVentas: 0,
      totalProductos: 0,
      ventasHoy: 0,
      ventasAyer: 0,
      productosDelMes: 0
    });

    // Calcular promedio
    stats.promedioVenta = stats.totalVentas / sales.length;

    return stats;
  };

  const stats = calculateStats();

  // Calcular índices para la paginación
  const indexOfLastSale = currentPage * salesPerPage;
  const indexOfFirstSale = indexOfLastSale - salesPerPage;

  // Función para cambiar de página
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Función para manejar el clic en una fila
  const handleRowClick = (sale) => {
    setSelectedSale(sale);
  };

  // Función para cerrar el modal
  const handleClose = () => setSelectedSale(null);

  // Función para manejar el cambio de dirección del ordenamiento
  const handleSortDirectionChange = () => {
    setSortDirection(current => current === 'desc' ? 'asc' : 'desc');
  };

  // Función para manejar el cambio en el rango de fechas
  const handleDateRangeChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Función para limpiar el filtro de fechas
  const clearDateFilter = () => {
    setDateRange({
      startDate: '',
      endDate: ''
    });
  };

  // Función para obtener el badge de estado
  const getStatusBadge = (status) => {
    switch(status) {
      case '1': return <Badge bg="success">Confirmada</Badge>;
      case '2': return <Badge bg="warning">Pendiente</Badge>;
      case '3': return <Badge bg="danger">Cancelada</Badge>;
      default: return <Badge bg="secondary">Desconocido</Badge>;
    }
  };

  // Función para filtrar y ordenar las ventas
  const getFilteredSales = () => {
    if (!sales) return [];
    
    let filtered = sales.filter(sale => {
      if (dateRange.startDate && dateRange.endDate) {
        const saleDate = new Date(sale.fecha);
        const start = new Date(dateRange.startDate);
        const end = new Date(dateRange.endDate);
        end.setHours(23, 59, 59);
        
        if (saleDate < start || saleDate > end) {
          return false;
        }
      }
      return true;
    });

    // Ordenar por fecha
    filtered.sort((a, b) => {
      // Convertir strings de fecha a objetos Date para comparación correcta
      const dateA = new Date(a.fecha).getTime();
      const dateB = new Date(b.fecha).getTime();
      
      // Si es descendente (más reciente primero), B - A
      // Si es ascendente (más antiguo primero), A - B
      return sortDirection === 'desc' ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  };

  const filteredSales = getFilteredSales();
  const currentSales = filteredSales.slice(indexOfFirstSale, indexOfLastSale);

  if (isLoading) {
    return <p>Cargando ventas...</p>;
  }

  if (isError) {
    return <p>Error al cargar las ventas</p>;
  }

  return (
    <div className="page-container">
      <Container className="py-4">
        {/* Header Section */}
        <div className="page-header">
          <div className="header-content">
            <div className="title-section">
              <h1 className="page-title">
                <FaShoppingCart className="title-icon" />
                Ventas
              </h1>
              <p className="text-muted">Registro y seguimiento de ventas</p>
            </div>
            <div className="action-section">
              <Link to="/crear-venta" className="btn-create">
                <FaPlus className="btn-icon" /> 
                Nueva Venta
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-container">
          <div className="stat-card">
            <div className="stat-icon total">
              <FaChartLine />
            </div>
            <div className="stat-info">
              <h6>Total Ventas</h6>
              <h3>${stats.totalVentas.toFixed(2)}</h3>
              <p className="text-muted">Ingresos totales</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon month">
              <FaBoxes />
            </div>
            <div className="stat-info">
              <h6>Productos Vendidos (Mes)</h6>
              <h3>{stats.productosDelMes}</h3>
              <p className="text-muted">Unidades este mes</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon today">
              <FaShoppingCart />
            </div>
            <div className="stat-info">
              <h6>Ventas de Hoy</h6>
              <h3>${stats.ventasHoy.toFixed(2)}</h3>
              <p className="text-muted">
                {stats.ventasHoy > stats.ventasAyer ? (
                  <span className="text-success">↑ Mayor que ayer</span>
                ) : stats.ventasHoy < stats.ventasAyer ? (
                  <span className="text-danger">↓ Menor que ayer</span>
                ) : (
                  <span>Igual que ayer</span>
                )}
              </p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon yesterday">
              <FaReceipt />
            </div>
            <div className="stat-info">
              <h6>Ventas de Ayer</h6>
              <h3>${stats.ventasAyer.toFixed(2)}</h3>
              <p className="text-muted">Día anterior</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="content-section">
          <Card className="table-card">
            <Card.Body>
              <div className="table-header">
                <div className="table-title">
                  <h5 className="mb-0">Historial de Ventas</h5>
                </div>

                <div className="filter-actions">
                  <Button 
                    variant="outline-secondary" 
                    className="filter-btn"
                    onClick={() => setShowDateFilter(!showDateFilter)}
                  >
                    <FaCalendar className="btn-icon" />
                    Filtrar por Fecha
                  </Button>
                  
                  <Button 
                    variant="outline-secondary" 
                    className="sort-btn"
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
                          <FaTimes /> Limpiar
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
                    
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentSales?.map((sale) => (
                      <tr key={sale.id_venta}>
                        <td>
                          <span className="order-id">#{sale.id_venta}</span>
                        </td>
                        <td>
                          <div className="date-cell">
                            <span className="date">
                              {formatDateToPeru(sale.fecha)}
                            </span>
                          </div>
                        </td>
                        <td className="text-start">
                          <span className="amount">${parseFloat(sale.total).toFixed(2)}</span>
                        </td>
                       
                        <td>
                          <Button 
                            variant="link" 
                            className="action-btn"
                            onClick={() => handleRowClick(sale)}
                          >
                            <FaEye /> Ver Detalles
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
            {Array.from({ length: Math.ceil(sales?.length / salesPerPage) }).map((_, idx) => (
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
        <Modal show={!!selectedSale} onHide={handleClose} size="lg" className="custom-modal">
          <Modal.Header closeButton>
            <Modal.Title>
              <FaShoppingCart className="me-2" />
              Venta #{selectedSale?.id_venta}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedSale && (
              <>
                <div className="order-details">
                  <div className="detail-card">
                    <h6>Información General</h6>
                    <div className="details-grid">
                      <div className="detail-item">
                        <span className="label">Fecha:</span>
                        <span className="value">{formatDateToPeru(selectedSale.fecha)}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Estado:</span>
                        <span>{getStatusBadge(selectedSale.estado)}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Total:</span>
                        <span className="value amount">${parseFloat(selectedSale.total).toFixed(2)}</span>
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
                          {selectedSale.detalles.map((detalle) => (
                            <tr key={detalle.id_detventa}>
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
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={handleClose}>
              Cerrar
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
};

export default VentaListPage;
