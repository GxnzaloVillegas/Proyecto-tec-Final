import React, { useState } from 'react';
import { useClientes } from '../hooks/useClientes';
import { useProductsByInventory } from '../hooks/useProducts';
import { useUbicaciones } from '../hooks/useUbicaciones';
import { useCreateVenta } from '../hooks/useVentas';
import { Table, Button, Form, Row, Col, Card, Container, InputGroup } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { FaPlus, FaTrash, FaEdit, FaSave, FaShoppingCart, FaUser, FaWarehouse, FaBox } from 'react-icons/fa';
import { Badge } from 'react-bootstrap';
import '../styles/CrearVentaPage.css';

const CrearVentaPage = () => {
  const [selectedCliente, setSelectedCliente] = useState('');
  const [selectedUbicacion, setSelectedUbicacion] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [editingProductId, setEditingProductId] = useState(null);
  const [editingQuantity, setEditingQuantity] = useState(0);
  const [isLocationLocked, setIsLocationLocked] = useState(false);
  const [isClientLocked, setIsClientLocked] = useState(false);

  const { data: clientes, isLoading: loadingClientes } = useClientes();
  const { data: ubicaciones, isLoading: loadingUbicaciones } = useUbicaciones();
  const { data: productosPorUbicacion, isLoading: loadingProductosPorUbicacion } = useProductsByInventory(selectedUbicacion);

  const { mutate: createVenta } = useCreateVenta();

  const handleAddProduct = () => {
    if (!selectedCliente) {
      toast.error('Debes seleccionar un cliente antes de agregar productos');
      return;
    }

    if (!selectedUbicacion) {
      toast.error('Debes seleccionar una ubicación antes de agregar productos');
      return;
    }

    if (!selectedProduct || !cantidad || cantidad < 1) {
      toast.error('Debes seleccionar un producto y una cantidad válida');
      return;
    }

    const product = productosPorUbicacion.find((prod) => prod.producto.id_producto === selectedProduct);

    if (product.cantidad < cantidad) {
      toast.error('No hay suficiente cantidad disponible para este producto');
      return;
    }

    const alreadyAdded = selectedProducts.find((item) => item.id_producto === selectedProduct);

    if (alreadyAdded) {
      toast.error('Este producto ya está en la lista');
    } else {
      setSelectedProducts((prevProducts) => [
        ...prevProducts,
        {
          id_producto: product.producto.id_producto,
          nombre: product.producto.nombre,
          cantidad: cantidad,
          pre_unitario: parseFloat(product.producto.precio),
          subtotal: cantidad * parseFloat(product.producto.precio),
        },
      ]);
      setIsLocationLocked(true);
      setIsClientLocked(true);
    }

    setSelectedProduct('');
    setCantidad(1);
  };

  const handleRemoveProduct = (id_producto) => {
    setSelectedProducts(prevProducts => {
      const updatedProducts = prevProducts.filter(product => product.id_producto !== id_producto);
      if (updatedProducts.length === 0) {
        setIsLocationLocked(false);
        setIsClientLocked(false);
      }
      return updatedProducts;
    });
  };

  const handleEditProduct = (id_producto) => {
    const product = selectedProducts.find(p => p.id_producto === id_producto);
    setEditingProductId(id_producto);
    setEditingQuantity(product.cantidad);
  };

  const handleSaveEdit = (id_producto) => {
    setSelectedProducts(prevProducts =>
      prevProducts.map(product => {
        if (product.id_producto === id_producto) {
          const newSubtotal = editingQuantity * product.pre_unitario;
          return {
            ...product,
            cantidad: editingQuantity,
            subtotal: newSubtotal
          };
        }
        return product;
      })
    );
    setEditingProductId(null);
  };

  const handleCreateVenta = () => {
    if (!selectedCliente || !selectedUbicacion || selectedProducts.length === 0) {
      toast.error('Debes seleccionar un cliente, una ubicación y agregar productos');
      return;
    }

    const ventaData = {
      id_cliente: selectedCliente,
      id_ubicacion: selectedUbicacion,
      fecha: new Date().toISOString().split('T')[0],
      detalles: selectedProducts.map((prod) => ({
        id_producto: prod.id_producto,
        cantidad: prod.cantidad,
        pre_unitario: prod.pre_unitario,
      })),
      total: selectedProducts.reduce((acc, curr) => acc + curr.subtotal, 0),
    };

    createVenta(ventaData, {
      onSuccess: () => {
        toast.success('Venta registrada exitosamente');
        setSelectedCliente('');
        setSelectedUbicacion('');
        setSelectedProducts([]);
        setSelectedProduct('');
        setCantidad(1);
        setIsLocationLocked(false);
        setIsClientLocked(false);
      },
      onError: (error) => {
        console.error('Error al crear la venta:', error);
        toast.error('Error al registrar la venta');
      },
    });
  };

  if (loadingClientes || loadingUbicaciones || loadingProductosPorUbicacion) {
    return <p>Cargando datos...</p>;
  }

  return (
    <div className="crear-venta-container">
      <Container>
        <Row className="justify-content-center">
          <Col lg={10}>
            <Card className="venta-card">
              <Card.Header className="bg-gradient">
                <div className="d-flex justify-content-between align-items-center">
                  <h2><FaShoppingCart className="me-2" /> Nueva Venta</h2>
                  <Badge bg="light" text="dark" className="fecha-badge">
                    {new Date().toLocaleDateString()}
                  </Badge>
                </div>
              </Card.Header>
              <Card.Body>
                {/* Sección de información general */}
                <section className="info-section">
                  <h4 className="section-title">
                    <FaUser className="me-2" />
                    Información General
                  </h4>
                  <Row>
                    <Col md={6}>
                      <Card className="mb-3 border-0 shadow-sm">
                        <Card.Body>
                          <Form.Group className="mb-3">
                            <Form.Label className="fw-bold text-primary">Cliente</Form.Label>
                            <Form.Control
                              as="select"
                              value={selectedCliente}
                              onChange={(e) => setSelectedCliente(e.target.value)}
                              className={`form-select-custom ${isClientLocked ? 'locked' : ''}`}
                              disabled={isClientLocked}
                            >
                              <option value="">Seleccionar Cliente</option>
                              {clientes.map((cliente) => (
                                <option key={cliente.id_cliente} value={cliente.id_cliente}>
                                  {`${cliente.nombre} ${cliente.apepaterno} ${cliente.apematerno}`}
                                </option>
                              ))}
                            </Form.Control>
                            {isClientLocked && (
                              <small className="text-muted d-block mt-2">
                                <i className="fas fa-lock me-1"></i>
                                Cliente bloqueado mientras haya productos
                              </small>
                            )}
                          </Form.Group>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col md={6}>
                      <Card className="mb-3 border-0 shadow-sm">
                        <Card.Body>
                          <Form.Group className="mb-3">
                            <Form.Label className="fw-bold text-primary">
                              <FaWarehouse className="me-2" />
                              Ubicación
                            </Form.Label>
                            <Form.Control
                              as="select"
                              value={selectedUbicacion}
                              onChange={(e) => {
                                setSelectedUbicacion(e.target.value);
                                setSelectedProducts([]);
                                setSelectedProduct('');
                              }}
                              disabled={isLocationLocked}
                              className={`form-select-custom ${isLocationLocked ? 'locked' : ''}`}
                            >
                              <option value="">Seleccionar Ubicación</option>
                              {ubicaciones.map((ubicacion) => (
                                <option key={ubicacion.id_ubicacion} value={ubicacion.id_ubicacion}>
                                  {ubicacion.nombre}
                                </option>
                              ))}
                            </Form.Control>
                            {isLocationLocked && (
                              <small className="text-muted">
                                La ubicación no puede ser modificada mientras haya productos en la lista
                              </small>
                            )}
                          </Form.Group>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                </section>

                {/* Sección de productos */}
                <section className="productos-section mt-4">
                  <Card className="border-0 shadow-sm">
                    <Card.Header className="bg-light">
                      <h4 className="mb-0">
                        <FaBox className="me-2" />
                        Agregar Productos
                      </h4>
                    </Card.Header>
                    <Card.Body>
                      <Row className="align-items-end">
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label className="fw-bold text-primary">Producto</Form.Label>
                            <Form.Control
                              as="select"
                              value={selectedProduct}
                              onChange={(e) => setSelectedProduct(e.target.value)}
                              className="select-custom"
                            >
                              <option value="">Seleccionar Producto</option>
                              {productosPorUbicacion?.map((producto) => (
                                <option 
                                  key={producto.producto.id_producto} 
                                  value={producto.producto.id_producto}
                                  className={producto.cantidad < 5 ? 'text-warning' : ''}
                                >
                                  {`${producto.producto.nombre} (Stock: ${producto.cantidad})`}
                                </option>
                              ))}
                            </Form.Control>
                          </Form.Group>
                        </Col>
                        <Col md={3}>
                          <Form.Group>
                            <Form.Label className="fw-bold text-primary">Cantidad</Form.Label>
                            <Form.Control
                              type="number"
                              value={cantidad}
                              onChange={(e) => setCantidad(Number(e.target.value))}
                              min="1"
                              className="cantidad-input"
                            />
                          </Form.Group>
                        </Col>
                        <Col md={3}>
                          <Button 
                            variant="success" 
                            onClick={handleAddProduct} 
                            className="w-100 btn-agregar"
                          >
                            <FaPlus className="me-2" /> Agregar
                          </Button>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                </section>

                {selectedProducts.length > 0 && (
                  <Table responsive striped bordered hover className="mt-4">
                    <thead className="bg-light">
                      <tr>
                        <th>Producto</th>
                        <th>Cantidad</th>
                        <th>Precio Unitario</th>
                        <th>Subtotal</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedProducts.map((prod) => (
                        <tr key={prod.id_producto}>
                          <td>{prod.nombre}</td>
                          <td>
                            {editingProductId === prod.id_producto ? (
                              <InputGroup>
                                <Form.Control
                                  type="number"
                                  value={editingQuantity}
                                  onChange={(e) => setEditingQuantity(Number(e.target.value))}
                                  min="1"
                                />
                                <Button variant="outline-success" onClick={() => handleSaveEdit(prod.id_producto)}>
                                  <FaSave className="icon" />
                                </Button>
                              </InputGroup>
                            ) : (
                              prod.cantidad
                            )}
                          </td>
                          <td>${prod.pre_unitario.toFixed(2)}</td>
                          <td>${prod.subtotal.toFixed(2)}</td>
                          <td>
                            {editingProductId === prod.id_producto ? (
                              <Button variant="outline-secondary" size="sm" onClick={() => setEditingProductId(null)}>
                                Cancelar
                              </Button>
                            ) : (
                              <>
                                <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleEditProduct(prod.id_producto)}>
                                  <FaEdit className="icon" />
                                </Button>
                                <Button variant="outline-danger" size="sm" onClick={() => handleRemoveProduct(prod.id_producto)}>
                                  <FaTrash className="icon" />
                                </Button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan="3"><strong>Total</strong></td>
                        <td colSpan="2">
                          <strong>${selectedProducts.reduce((acc, curr) => acc + curr.subtotal, 0).toFixed(2)}</strong>
                        </td>
                      </tr>
                    </tfoot>
                  </Table>
                )}

                <div className="d-grid gap-2 col-6 mx-auto mt-4">
                  <Button  disabled={selectedProducts.length === 0} className='boton-registrar' variant="primary" size="lg" onClick={handleCreateVenta}>
                    Registrar Venta
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default CrearVentaPage;