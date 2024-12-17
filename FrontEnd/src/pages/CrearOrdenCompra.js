import React, { useState } from 'react';
import { useProveedores } from '../hooks/useProveedor'; // Hook para obtener proveedores
import { useProducts } from '../hooks/useProducts'; // Hook para obtener productos
import { useUbicaciones } from '../hooks/useUbicaciones'; // Hook para obtener ubicaciones
import { useCreatePurchaseOrder } from '../hooks/useOrdenCompras'; // Hook para crear una orden de compra
import { Table, Button, Form, Row, Col, Card, Container, InputGroup, Badge } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { 
  FaPlus, FaTrash, FaEdit, FaSave, FaShoppingBag, 
  FaWarehouse, FaBox, FaUser 
} from 'react-icons/fa';
import '../styles/CrearOrdenCompra.css';
const OrdenCompraPage = () => {
  const [selectedProveedor, setSelectedProveedor] = useState(''); // Proveedor seleccionado
  const [selectedUbicacion, setSelectedUbicacion] = useState(''); // Ubicación seleccionada
  const [selectedProduct, setSelectedProduct] = useState(''); // Producto seleccionado
  const [cantidad, setCantidad] = useState(1); // Cantidad de producto
  const [selectedProducts, setSelectedProducts] = useState([]); // Lista de productos seleccionados
  const [editingProductId, setEditingProductId] = useState(null);
  const [editingQuantity, setEditingQuantity] = useState(0);

  const { data: proveedores, isLoading: loadingProveedores } = useProveedores(); // Cargar proveedores
  const { data: productos, isLoading: loadingProductos } = useProducts(); // Cargar productos
  const { data: ubicaciones, isLoading: loadingUbicaciones } = useUbicaciones(); // Cargar ubicaciones

  const { mutate: createPurchaseOrder } = useCreatePurchaseOrder();

  // Nuevo estado para controlar si la ubicación puede ser modificada
  const [isLocationLocked, setIsLocationLocked] = useState(false);
  const [isProviderLocked, setIsProviderLocked] = useState(false);
  // Función para agregar productos a la lista
  const handleAddProduct = () => {
    if (!selectedProveedor) {
      toast.error('Debes seleccionar un proveedor antes de agregar productos');
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

    const product = productos.find((prod) => prod.id_producto === selectedProduct);
    const alreadyAdded = selectedProducts.find((item) => item.id_producto === selectedProduct);

    if (alreadyAdded) {
      toast.error('Este producto ya está en la lista');
    } else {
      setSelectedProducts((prevProducts) => [
        ...prevProducts,
        {
          id_producto: product.id_producto,
          nombre: product.nombre,
          cantidad: cantidad,
          pre_unitario: product.precio,
          subtotal: cantidad * product.precio,
        },
      ]);
      setIsLocationLocked(true);
      setIsProviderLocked(true);
    }

    setSelectedProduct('');
    setCantidad(1);
  };

  // Función para eliminar productos de la lista
  const handleRemoveProduct = (id_producto) => {
    setSelectedProducts(prevProducts => {
      const updatedProducts = prevProducts.filter(product => product.id_producto !== id_producto);
      if (updatedProducts.length === 0) {
        setIsLocationLocked(false);
        setIsProviderLocked(false);
      }
      return updatedProducts;
    });
  };

  // Función para registrar la orden de compra
  const handleCreateOrder = () => {
    if (!selectedProveedor || !selectedUbicacion || selectedProducts.length === 0) {
      toast.error('Debes seleccionar un proveedor, una ubicación y agregar productos');
      return;
    }

    const orderData = {
      id_proveedor: selectedProveedor,
      id_ubicacion: selectedUbicacion,
      fecha: new Date().toISOString().split('T')[0],
      detalles: selectedProducts.map((prod) => ({
        id_producto: prod.id_producto,
        cantidad: prod.cantidad,
        pre_unitario: prod.pre_unitario,
      })),
      total: selectedProducts.reduce((acc, curr) => acc + curr.subtotal, 0),
    };

    createPurchaseOrder(orderData, {
      onSuccess: () => {
        toast.success('Orden de compra creada exitosamente');
        // Reiniciar todos los estados
        setSelectedProveedor('');
        setSelectedUbicacion('');
        setSelectedProduct('');
        setCantidad(1);
        setSelectedProducts([]);
        setEditingProductId(null);
        setEditingQuantity(0);
        // Desbloquear los campos
        setIsLocationLocked(false);
        setIsProviderLocked(false);
      },
      onError: (error) => {
        console.error('Error creating purchase order:', error);
        toast.error('Error al crear la orden de compra');
      },
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
          const newSubtotal = editingQuantity * parseFloat(product.pre_unitario);
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

  if (loadingProveedores || loadingProductos || loadingUbicaciones) {
    return <p>Cargando datos...</p>;
  }

  return (
    <div className="crear-orden-container">
      <Container>
        <Row className="justify-content-center">
          <Col lg={10}>
            <Card className="orden-card">
              <Card.Header className="bg-gradient">
                <div className="d-flex justify-content-between align-items-center">
                  <h2><FaShoppingBag className="me-2" /> Nueva Orden de Compra</h2>
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
                            <Form.Label className="fw-bold text-primary">Proveedor</Form.Label>
                            <Form.Control
                              as="select"
                              value={selectedProveedor}
                              onChange={(e) => setSelectedProveedor(e.target.value)}
                              className={`form-select-custom ${isProviderLocked ? 'locked' : ''}`}
                              disabled={isProviderLocked}
                            >
                              <option value="">Seleccionar Proveedor</option>
                              {proveedores.map((proveedor) => (
                                <option key={proveedor.id_proveedor} value={proveedor.id_proveedor}>
                                  {proveedor.raz_soc}
                                </option>
                              ))}
                            </Form.Control>
                            {isProviderLocked && (
                              <small className="text-muted d-block mt-2">
                                <i className="fas fa-lock me-1"></i>
                                Proveedor bloqueado mientras haya productos
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
                              onChange={(e) => setSelectedUbicacion(e.target.value)}
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
                              <small className="text-muted d-block mt-2">
                                <i className="fas fa-lock me-1"></i>
                                Ubicación bloqueado mientras haya productos
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
                        <Col md={5}>
                          <Form.Group>
                            <Form.Label className="fw-bold">Producto</Form.Label>
                            <Form.Control
                              as="select"
                              value={selectedProduct}
                              onChange={(e) => setSelectedProduct(e.target.value)}
                            >
                              <option value="">Seleccionar Producto</option>
                              {productos.map((producto) => (
                                <option key={producto.id_producto} value={producto.id_producto}>
                                  {producto.nombre}
                                </option>
                              ))}
                            </Form.Control>
                          </Form.Group>
                        </Col>
                        <Col md={3}>
                          <Form.Group>
                            <Form.Label className="fw-bold">Cantidad</Form.Label>
                            <Form.Control
                              type="number"
                              value={cantidad}
                              onChange={(e) => setCantidad(Number(e.target.value))}
                              min="1"
                            />
                          </Form.Group>
                        </Col>
                        <Col md={4}>
                          <Button 
                            variant="success" 
                            onClick={handleAddProduct} 
                            className="w-100 d-flex align-items-center justify-content-center"
                          >
                            <FaPlus className="me-2" /> Agregar Producto
                          </Button>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                </section>

                {/* Tabla de productos mejorada */}
                {selectedProducts.length > 0 && (
                  <section className="productos-section mt-4">
                    <Card className="border-0 shadow-sm">
                      <Card.Body>
                        <Table responsive hover className="align-middle">
                          <thead className="bg-light">
                            <tr>
                              <th className="text-start">Producto</th>
                              <th className="text-center">Cantidad</th>
                              <th className="text-end">Precio Unit.</th>
                              <th className="text-end">Subtotal</th>
                              <th className="text-center">Acciones</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedProducts.map((prod) => (
                              <tr key={prod.id_producto}>
                                <td className="text-start">{prod.nombre}</td>
                                <td className="text-center">
                                  {editingProductId === prod.id_producto ? (
                                    <InputGroup className="justify-content-center">
                                      <Form.Control
                                        type="number"
                                        value={editingQuantity}
                                        onChange={(e) => setEditingQuantity(Number(e.target.value))}
                                        min="1"
                                        className="text-center"
                                        style={{ maxWidth: '100px' }}
                                      />
                                      <Button variant="outline-success" onClick={() => handleSaveEdit(prod.id_producto)}>
                                        <FaSave />
                                      </Button>
                                    </InputGroup>
                                  ) : (
                                    prod.cantidad
                                  )}
                                </td>
                                <td className="text-end">${parseFloat(prod.pre_unitario).toFixed(2)}</td>
                                <td className="text-end">${prod.subtotal.toFixed(2)}</td>
                                <td className="text-center">
                                  {editingProductId === prod.id_producto ? (
                                    <Button variant="outline-secondary" size="sm" onClick={() => setEditingProductId(null)}>
                                      Cancelar
                                    </Button>
                                  ) : (
                                    <div className="d-flex justify-content-center gap-2">
                                      <Button variant="outline-primary" size="sm" onClick={() => handleEditProduct(prod.id_producto)}>
                                        <FaEdit />
                                      </Button>
                                      <Button variant="outline-danger" size="sm" onClick={() => handleRemoveProduct(prod.id_producto)}>
                                        <FaTrash />
                                      </Button>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot className="border-top">
                            <tr className="fw-bold">
                              <td colSpan="4" className="text-end">Total:</td>
                              <td className="text-end">
                                ${selectedProducts.reduce((acc, curr) => acc + curr.subtotal, 0).toFixed(2)}
                              </td>
                              <td></td>
                            </tr>
                          </tfoot>
                        </Table>
                      </Card.Body>
                    </Card>
                  </section>
                )}

                {/* Botón de registro mejorado */}
                <div className="d-grid gap-2 col-6 mx-auto mt-4">
                  <Button 
                    variant="primary" 
                    size="lg" 
                    onClick={handleCreateOrder}
                    className="boton-registrar"
                    disabled={selectedProducts.length === 0}
                  >
                    <FaSave className="me-2" />
                    Finalizar Orden
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

export default OrdenCompraPage;
