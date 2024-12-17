import React, { useState } from 'react';
import GenericListPage from '../components/GenericListPage';
import { useUbicaciones, useCreateUbicacion, useUpdateUbicacion, useDeleteUbicacion, useUbicacionesConProductos } from '../hooks/useUbicaciones';
import { Container, Card, Table, Button, Modal, Form, Row, Col, Badge, Spinner, ProgressBar } from 'react-bootstrap';
import { FaMapMarkerAlt, FaPlus, FaEdit, FaTrash, FaSearch, FaBoxes, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import '../styles/UbicacionesPage.css';

const UbicacionesPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedUbicacion, setSelectedUbicacion] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDetallesModal, setShowDetallesModal] = useState(false);
  const [detallesUbicacion, setDetallesUbicacion] = useState(null);
  
  const { data: ubicacionesConProductos, isLoading: isLoadingProductos } = useUbicacionesConProductos();
  const { isLoading } = useUbicaciones();
  const createUbicacionMutation = useCreateUbicacion();
  const updateUbicacionMutation = useUpdateUbicacion();
  const deleteUbicacionMutation = useDeleteUbicacion();

  // Filtrar ubicaciones
  const filteredUbicaciones = ubicacionesConProductos?.filter(ubicacion => 
    ubicacion.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ubicacion.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleShowModal = (ubicacion = null) => {
    setSelectedUbicacion(ubicacion);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedUbicacion(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const ubicacionData = {
      nombre: formData.get('nombre'),
      descripcion: formData.get('descripcion'),
    };

    try {
      if (selectedUbicacion) {
        await updateUbicacionMutation.mutateAsync({
          id: selectedUbicacion.id_ubicacion,
          ...ubicacionData
        });
        toast.success('Ubicación actualizada exitosamente');
      } else {
        await createUbicacionMutation.mutateAsync(ubicacionData);
        toast.success('Ubicación creada exitosamente');
      }
      handleCloseModal();
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteUbicacionMutation.mutateAsync(id);
      toast.success('Ubicación eliminada exitosamente');
      setShowDeleteConfirm(false);
    } catch (error) {
      toast.error(`Error al eliminar: ${error.message}`);
    }
  };

  const handleShowDetalles = async (ubicacion) => {
    try {
      setDetallesUbicacion(ubicacionesConProductos?.find(u => u.id_ubicacion === ubicacion.id_ubicacion));
      setShowDetallesModal(true);
    } catch (error) {
      toast.error('Error al cargar detalles de la ubicación');
    }
  };

  const renderTablaUbicaciones = () => (
    <Table responsive hover className="ubicaciones-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Nombre</th>
          <th>Descripción</th>
          <th>Productos</th>
          <th>Ocupación</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {filteredUbicaciones?.map((ubicacion) => (
          <tr key={ubicacion.id_ubicacion}>
            <td>{ubicacion.id_ubicacion}</td>
            <td>{ubicacion.nombre}</td>
            <td>{ubicacion.descripcion || '-'}</td>
            <td>
              <div className="productos-info">
                <Badge bg="info" className="me-2">
                  <FaBoxes className="me-1" />
                  {ubicacion.estadisticas?.total_productos || 0} productos
                </Badge>
                <Badge bg="secondary">
                  {ubicacion.estadisticas?.total_items || 0} items
                </Badge>
              </div>
            </td>
            <td>
              <div className="ocupacion-wrapper">
                <ProgressBar
                  now={ubicacion.estadisticas?.porcentaje_ocupacion || 0}
                  variant={getVariantePorcentaje(ubicacion.estadisticas?.porcentaje_ocupacion)}
                  label={`${ubicacion.estadisticas?.porcentaje_ocupacion || 0}%`}
                />
              </div>
            </td>
            <td>
              <div className="action-buttons">
                <Button
                  variant="outline-info"
                  size="sm"
                  onClick={() => handleShowDetalles(ubicacion)}
                  className="me-2"
                >
                  <FaInfoCircle /> Detalles
                </Button>
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => handleShowModal(ubicacion)}
                  className="me-2"
                >
                  <FaEdit /> Editar
                </Button>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => {
                    setSelectedUbicacion(ubicacion);
                    setShowDeleteConfirm(true);
                  }}
                  disabled={ubicacion.productos?.length > 0}
                >
                  <FaTrash /> Eliminar
                </Button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );

  const renderDetallesModal = () => (
    <Modal 
      show={showDetallesModal} 
      onHide={() => setShowDetallesModal(false)}
      size="lg"
    >
      <Modal.Header closeButton>
        <Modal.Title>
          Detalles de Ubicación: {detallesUbicacion?.nombre}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row className="mb-4">
          <Col md={4}>
            <div className="stat-card">
              <h6>Total Productos</h6>
              <div className="stat-value">
                <FaBoxes className="me-2" />
                {detallesUbicacion?.estadisticas?.total_productos || 0}
              </div>
            </div>
          </Col>
          <Col md={4}>
            <div className="stat-card">
              <h6>Total Items</h6>
              <div className="stat-value">
                {detallesUbicacion?.estadisticas?.total_items || 0}
              </div>
            </div>
          </Col>
          <Col md={4}>
            <div className="stat-card">
              <h6>Ocupación</h6>
              <div className="stat-value">
                {detallesUbicacion?.estadisticas?.porcentaje_ocupacion || 0}%
              </div>
            </div>
          </Col>
        </Row>

        <h6>Productos en esta ubicación</h6>
        <Table responsive hover size="sm">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Categoría</th>
              <th>Marca</th>
              <th>Cantidad</th>
            </tr>
          </thead>
          <tbody>
            {detallesUbicacion?.productos?.map((producto) => (
              <tr key={producto.id_producto}>
                <td>{producto.nombre}</td>
                <td>{producto.categoria?.nombre || '-'}</td>
                <td>{producto.marca?.nombre || '-'}</td>
                <td>{producto.InventarioUbicacion?.cantidad || 0}</td>
              </tr>
            ))}
            {(!detallesUbicacion?.productos || detallesUbicacion.productos.length === 0) && (
              <tr>
                <td colSpan="4" className="text-center">
                  No hay productos en esta ubicación
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Modal.Body>
    </Modal>
  );

  const getVariantePorcentaje = (porcentaje) => {
    if (porcentaje >= 80) return 'danger';
    if (porcentaje >= 60) return 'warning';
    return 'success';
  };

  if (isLoading || isLoadingProductos) {
    return (
      <Container className="py-4">
        <div className="loading-container">
          <Spinner animation="border" variant="primary" />
          <p>Cargando ubicaciones...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      {/* Header mejorado */}
      <Card className="mb-4 header-card">
        <Card.Body className="py-4">
          <Row className="align-items-center">
            <Col xs={12} md={6}>
              <div className="d-flex align-items-center">
                <div className="icon-wrapper">
                  <FaMapMarkerAlt className="text-primary" size={28} />
                </div>
                <div>
                  <h4 className="mb-0 fw-bold">Gestión de Ubicaciones</h4>
                  <p className="text-muted mb-0 mt-1">
                    Administra las ubicaciones del inventario
                  </p>
                </div>
              </div>
            </Col>
            <Col xs={12} md={6}>
              <div className="d-flex gap-3 justify-content-md-end mt-3 mt-md-0">
                <div className="search-input-wrapper flex-grow-1 flex-md-grow-0">
                  <Form.Control
                    type="text"
                    placeholder="Buscar ubicaciones..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                  <FaSearch className="search-icon" />
                </div>
                <Button 
                  variant="primary" 
                  onClick={() => handleShowModal()}
                  className="btn-nueva-ubicacion"
                >
                  <FaPlus className="me-2" /> Nueva Ubicación
                </Button>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Tabla mejorada */}
      <Card className="shadow-sm table-card">
        <Card.Body className="p-0">
          {renderTablaUbicaciones()}
        </Card.Body>
      </Card>

      {/* Modal de Crear/Editar */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Form onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>
              {selectedUbicacion ? 'Editar Ubicación' : 'Nueva Ubicación'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                type="text"
                name="nombre"
                defaultValue={selectedUbicacion?.nombre || ''}
                required
                placeholder="Ingrese el nombre de la ubicación"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                as="textarea"
                name="descripcion"
                defaultValue={selectedUbicacion?.descripcion || ''}
                placeholder="Ingrese una descripción (opcional)"
                rows={3}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              {selectedUbicacion ? 'Guardar Cambios' : 'Crear Ubicación'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal de Confirmación de Eliminación */}
      <Modal show={showDeleteConfirm} onHide={() => setShowDeleteConfirm(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Está seguro que desea eliminar la ubicación "{selectedUbicacion?.nombre}"?
          {selectedUbicacion?.productos?.length > 0 && (
            <div className="alert alert-warning mt-2">
              <FaExclamationTriangle className="me-2" />
              Esta ubicación contiene {selectedUbicacion.productos.length} productos.
              Al eliminarla, los productos deberán ser reubicados.
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={() => handleDelete(selectedUbicacion.id_ubicacion)}
          >
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>

      {renderDetallesModal()}
    </Container>
  );
};

// Estilos CSS
const styles = `
.stat-card {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #0d6efd;
}

.ocupacion-wrapper {
  width: 150px;
}

.productos-info {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}
`;

// Agregar los estilos al documento
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default UbicacionesPage;
