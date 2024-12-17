import React, { useState, useEffect } from 'react';
import { useProducts, useProductsByInventory, useDeleteProduct } from '../hooks/useProducts';
import { useUbicaciones } from '../hooks/useUbicaciones';
import { Form, Button, Modal, Container, Row, Col, Card } from 'react-bootstrap';
import { useUpdateProduct, useCreateProduct } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategorias';
import { useBrands } from '../hooks/useMarcas';
import { FaEdit, FaPlus, FaTrash, FaSearch, FaMapMarkerAlt, FaTags, FaTrademark, FaShoppingCart, FaUndo, FaBox, FaBoxes, FaDollarSign, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import '../styles/ProductListPage.css';

const ProductListPage = () => {
  const [ubicacionId, setUbicacionId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSold, setFilterSold] = useState('all'); // Filtro de vendidos
  const [selectedCategory, setSelectedCategory] = useState(''); // Filtro de categoría
  const [selectedBrand, setSelectedBrand] = useState(''); // Filtro de marca
  const [showResetButton, setShowResetButton] = useState(false);

  const { data: ubicaciones } = useUbicaciones();
  const { data: allProducts } = useProducts();
  const { data: productsByInventory } = useProductsByInventory(ubicacionId);
  const { data: categories } = useCategories();
  const { data: brands } = useBrands();

  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();
  const deleteProductMutation = useDeleteProduct();

  // Función para resetear todos los filtros
  const handleResetFilters = () => {
    setSearchTerm('');
    setUbicacionId('');
    setSelectedCategory('');
    setSelectedBrand('');
    setFilterSold('all');
  };

  // Actualizar useEffect para mostrar/ocultar el botón de reset
  useEffect(() => {
    const hasActiveFilters = 
      searchTerm !== '' || 
      ubicacionId !== null || 
      selectedCategory !== '' || 
      selectedBrand !== '' || 
      filterSold !== 'all';
    
    setShowResetButton(hasActiveFilters);
  }, [searchTerm, ubicacionId, selectedCategory, selectedBrand, filterSold]);

  // Función para filtrar productos por ubicación, nombre/ID, estado de venta, categoría y marca
  const getFilteredProducts = () => {
    const products = ubicacionId ? productsByInventory : allProducts;
    
    console.log('productos disponibles:', JSON.stringify(products, null, 2));
    console.log('filtro marca: ', selectedBrand, ' filtro categoria: ', selectedCategory )
    if (!products || products.length === 0) {
      return [];
    }

    const filtered = products.filter(item => {
      const isSold = ubicacionId ? item.producto.vendido : item.vendido;

      const matchesSearchTerm = ubicacionId
        ? item.producto &&
          (item.producto.nombre && item.producto.nombre.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (item.id_producto && item.id_producto.toString().includes(searchTerm))
        : (item.nombre && item.nombre.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (item.id_producto && item.id_producto.toString().includes(searchTerm));

      // Filtrar según el estado de venta
      if (filterSold === 'sold' && !isSold) return false;
      if (filterSold === 'not-sold' && isSold) return false;

      // Filtrar por categoría
      const matchesCategory = selectedCategory ? (ubicacionId ? item.producto.id_categoria === Number(selectedCategory) : item.id_categoria === Number(selectedCategory)) : true;

      // Filtrar por marca
      const matchesBrand = selectedBrand ? (ubicacionId ? item.producto.id_marca === Number(selectedBrand) : item.id_marca === Number(selectedBrand)) : true;

      return matchesSearchTerm && matchesCategory && matchesBrand;
    });

    return filtered;
  };

  const filteredProducts = getFilteredProducts();

  console.log('Productos filtrados:', JSON.stringify(filteredProducts, null, 2));

  const handleUbicacionChange = (e) => {
    setUbicacionId(e.target.value || null);
  };

  const handleShowModal = (product = null) => {
    setIsEditing(!!product);
    setSelectedProduct(product);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedProduct(null);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const productData = {
      id_categoria: parseInt(formData.get('id_categoria'), 10) || (selectedProduct ? selectedProduct.id_categoria : null),
      id_marca: parseInt(formData.get('id_marca'), 10) || (selectedProduct ? selectedProduct.id_marca : null),
      nombre: formData.get('nombre') || (selectedProduct ? selectedProduct.nombre : ''),
      descripcion: formData.get('descripcion') || (selectedProduct ? selectedProduct.descripcion : ''),
      precio: parseFloat(formData.get('precio')) || 0,
      cantidad_total: isEditing ? selectedProduct.cantidad_total : 0,
      stock_min: parseInt(formData.get('stock_min'), 10) || 0,
      img: formData.get('img') || (selectedProduct ? selectedProduct.img : ''),
      estado: true,
    };

    if (productData.stock_min < 0) {
      toast.error('El stock mínimo no puede ser negativo');
      return;
    }

    const confirmMessage = isEditing
      ? '¿Estás seguro de que quieres actualizar este producto?'
      : '¿Estás seguro de que quieres crear este producto?';

    if (window.confirm(confirmMessage)) {
      if (isEditing && selectedProduct) {
        updateProductMutation.mutate({
          id: selectedProduct.id_producto,
          productData: productData
        }, {
          onSuccess: () => {
            toast.success('Producto actualizado exitosamente');
            handleCloseModal();
          },
          onError: (error) => {
            console.error('Error updating product:', error);
            toast.error('Error al actualizar el producto');
          }
        });
      } else {
        createProductMutation.mutate(productData, {
          onSuccess: () => {
            toast.success('Producto creado exitosamente');
            handleCloseModal();
          },
          onError: (error) => {
            console.error('Error creating product:', error);
            toast.error('Error al crear el producto');
          }
        });
      }
    }
  };

  const handleDeleteProduct = (product) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      deleteProductMutation.mutate(product.id_producto);
    }
  };

  const isProductSold = selectedProduct?.vendido;

  console.log('Valores de filtro:', {
    filterSold,
    selectedCategory,
    selectedBrand,
  });

  // Función para calcular estadísticas de productos
  const calculateStats = () => {
    // Usar los productos filtrados por ubicación o todos los productos
    const products = ubicacionId ? productsByInventory : allProducts;

    if (!products) return {
      totalProducts: 0,
      totalValue: 0,
      lowStock: 0,
      soldProducts: 0
    };

    return products.reduce((stats, item) => {
      // Determinar si estamos trabajando con un producto directo o uno dentro de ubicación
      const product = ubicacionId ? item.producto : item;
      const cantidad = ubicacionId ? item.cantidad : item.cantidad_total;

      // Total de productos
      stats.totalProducts++;
      
      // Valor del inventario (precio * cantidad en la ubicación)
      stats.totalValue += parseFloat(product.precio) * cantidad;

      // Productos con stock bajo
      if (cantidad <= product.stock_min) {
        stats.lowStock++;
      }

      // Productos vendidos
      if (product.vendido) {
        stats.soldProducts++;
      }

      return stats;
    }, {
      totalProducts: 0,
      totalValue: 0,
      lowStock: 0,
      soldProducts: 0
    });
  };

  // Calcular estadísticas
  const stats = calculateStats();

  return (
    <Container className="py-4 px-3 contenedor" fluid>
         <div className="page-header">
      <div className="header-content">
        <div className="title-section">
          <h1 className="page-title">
            <FaBoxes className="title-icon" />
            Productos
          </h1>
          <p className="text-muted">Gestión de inventario y productos</p>
        </div>
        <div className="action-section">
          <Button 
            className="btn-create"
            onClick={() => handleShowModal(null)}
          >
            <FaPlus className="btn-icon" /> 
            Nuevo Producto
          </Button>
        </div>
      </div>
    </div>

      {/* Stats Cards */}
      <div className="stats-container mb-4">
        <div className="stat-card">
          <div className="stat-icon total">
            <FaBoxes />
          </div>
          <div className="stat-info">
            <h6>Total Productos</h6>
            <h3>{stats.totalProducts}</h3>
            <p className="text-muted">
              {ubicacionId ? 'En esta ubicación' : 'En inventario'}
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon value">
            <FaDollarSign />
          </div>
          <div className="stat-info">
            <h6>Valor del Inventario</h6>
            <h3>${stats.totalValue.toFixed(2)}</h3>
            <p className="text-muted">
              {ubicacionId ? 'Valor en ubicación' : 'Valor total'}
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon warning">
            <FaExclamationTriangle />
          </div>
          <div className="stat-info">
            <h6>Stock Bajo</h6>
            <h3>{stats.lowStock}</h3>
            <p className="text-muted">
              {ubicacionId ? 'En esta ubicación' : 'Necesitan reposición'}
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon success">
            <FaCheckCircle />
          </div>
          <div className="stat-info">
            <h6>Productos Vendidos</h6>
            <h3>{stats.soldProducts}</h3>
            <p className="text-muted">
              {ubicacionId ? 'Vendidos aquí' : 'Total vendidos'}
            </p>
          </div>
        </div>
      </div>

      <Row>
        <Col xxl={3} xl={4} lg={3} md={12} xs={12} className="mb-4">
          <div className="filter-card">
            <div className="filter-header">
              <h5>Filtros</h5>
              {showResetButton && (
                <Button 
                  variant="outline-secondary" 
                  size="sm" 
                  onClick={handleResetFilters}
                  className="reset-filters-btn"
                >
                  <FaUndo className="me-1" /> Resetear filtros
                </Button>
              )}
            </div>

            {/* Filtros por búsqueda nombre o ID de un producto */}
            <Form.Group className="filter-group">
              <Form.Label>
                <FaSearch className="me-2" />
                Buscar producto
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Nombre o ID"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`filter-input ${searchTerm ? 'active-filter' : ''}`}
              />
            </Form.Group>

            {/* Filtro de ubicación */}
            <Form.Group className="filter-group">
              <Form.Label>
                <FaMapMarkerAlt className="me-2" />
                Ubicación
              </Form.Label>
              <Form.Control 
                as="select" 
                onChange={handleUbicacionChange} 
                value={ubicacionId || ''}
                className={`filter-select ${ubicacionId ? 'active-filter' : ''}`}
              >
                <option value="">Selecciona una ubicación</option>
                {ubicaciones?.map((ubicacion) => (
                  <option key={ubicacion.id_ubicacion} value={ubicacion.id_ubicacion}>
                    {ubicacion.nombre}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>

            {/* Filtro de categoría */}
            <Form.Group className="filter-group">
              <Form.Label>
                <FaTags className="me-2" />
                Categoría
              </Form.Label>
              <Form.Control
                as="select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={`filter-select ${selectedCategory ? 'active-filter' : ''}`}
              >
                <option value="">Selecciona una categoría</option>
                {categories?.map((category) => (
                  <option key={category.id_categoria} value={category.id_categoria}>
                    {category.nombre}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>

            {/* Filtro de marca */}
            <Form.Group className="filter-group">
              <Form.Label>
                <FaTrademark className="me-2" />
                Marca
              </Form.Label>
              <Form.Control
                as="select"
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className={`filter-select ${selectedBrand ? 'active-filter' : ''}`}
              >
                <option value="">Selecciona una marca</option>
                {brands?.map((brand) => (
                  <option key={brand.id_marca} value={brand.id_marca}>
                    {brand.nombre}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>

            {/* Filtro de estado de venta */}
            <div className="filter-group">
              <h6>
                <FaShoppingCart className="me-2" />
                Estado de Venta
              </h6>
              <div className="radio-group">
                <Form.Check
                  type="radio"
                  label="Todos"
                  name="filterSold"
                  value="all"
                  checked={filterSold === 'all'}
                  onChange={() => setFilterSold('all')}
                  className="filter-radio"
                />
                <Form.Check
                  type="radio"
                  label="Vendidos"
                  name="filterSold"
                  value="sold"
                  checked={filterSold === 'sold'}
                  onChange={() => setFilterSold('sold')}
                  className="filter-radio"
                />
                <Form.Check
                  type="radio"
                  label="No Vendidos"
                  name="filterSold"
                  value="not-sold"
                  checked={filterSold === 'not-sold'}
                  onChange={() => setFilterSold('not-sold')}
                  className="filter-radio"
                />
              </div>
            </div>
          </div>
        </Col>

        <Col lg={0} md={0} xs={0}>
          {/* Productos */}
          <div className='prueba2'>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((item) => {
                const product = ubicacionId ? item.producto : item; // Acceder al producto anidado o directamente

                return (
                  <div>
                    <Card className="product-card">
                      <Card.Img variant="top" src={product.img || 'https://via.placeholder.com/150'} alt={product.nombre} className="product-img" />
                      <Card.Body className="p-1 p-md-1">
                        <Card.Title className="text-truncate font-weight-bold text-dark" style={{ fontSize: '1.2rem', lineHeight: '1.5' }}>
                          {product.nombre}
                        </Card.Title>
                        
                        <div className="mb-12">
                          <strong style={{ fontSize: '0.9rem' }}>Detalles del Producto:</strong>
                          <div className="border2 p-2 p-md-3 rounded">
                            <div className="row">
                              <div className="col-6 mb-2">
                                <span className="font-weight-bold">Precio:</span> 
                                <span className="text-muted"> ${parseFloat(product.precio).toFixed(2)}</span>
                              </div>
                              <div className="col-6 mb-2">
                                <span className="font-weight-bold">Categoría:</span> 
                                <span className="text-muted"> {product.id_categoria}</span>
                              </div>
                              <div className="col-6 mb-2">
                                <span className="font-weight-bold">Marca:</span> 
                                <span className="text-muted"> {product.id_marca}</span>
                              </div>
                              <div className="col-6 mb-2">
                                <span className="font-weight-bold">Cantidad Total:</span> 
                                <span className="text-muted"> {ubicacionId ? item.cantidad : item.cantidad_total}</span>
                              </div>
                              <div className="col-6 mb-2">
                                <span className="font-weight-bold">Stock Mínimo:</span> 
                                <span className="text-muted"> {ubicacionId ? product.stock_min : item.stock_min}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="d-flex justify-content-between mt-3">
                          <Button 
                            variant="outline-secondary" 
                            onClick={() => handleShowModal(product)} 
                            className="shadow-sm"
                          >
                            <FaEdit className="me-1" /> Editar
                          </Button>
                          
                          {!product.vendido && (
                            <Button
                              variant="outline-danger"
                              onClick={() => handleDeleteProduct(product)}
                              className="shadow-sm"
                            >
                              <FaTrash className="me-1" /> Eliminar
                            </Button>
                          )}
                        </div>
                      </Card.Body>
                    </Card>
                  </div>
                );
              })
            ) : (
              <Col md={12}>
                <p>No se encontraron productos que coincidan con la búsqueda.</p>
              </Col>
            )}
          </div>
        </Col>
      </Row>

      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton className="bg-light">
          <Modal.Title>{isEditing ? 'Editar Producto' : 'Registrar Producto'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleFormSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group controlId="id_categoria" className="mb-3">
                  <Form.Label>Categoría</Form.Label>
                  <Form.Control
                    as="select"
                    name="id_categoria"
                    defaultValue={selectedProduct?.id_categoria || ''}
                    required
                    disabled={isProductSold}
                  >
                    <option value="">Selecciona una categoría</option>
                    {categories?.map((category) => (
                      <option key={category.id_categoria} value={category.id_categoria}>
                        {category.nombre}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="id_marca" className="mb-3">
                  <Form.Label>Marca</Form.Label>
                  <Form.Control
                    as="select"
                    name="id_marca"
                    defaultValue={selectedProduct?.id_marca || ''}
                    required
                    disabled={isProductSold}
                  >
                    <option value="">Selecciona una marca</option>
                    {brands?.map((brand) => (
                      <option key={brand.id_marca} value={brand.id_marca}>
                        {brand.nombre}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>
              </Col>
            </Row>
            <Form.Group controlId="nombre" className="mb-3">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                type="text"
                name="nombre"
                defaultValue={selectedProduct?.nombre || ''}
                required
                disabled={isProductSold}
              />
            </Form.Group>
            <Form.Group controlId="descripcion" className="mb-3">
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                as="textarea"
                name="descripcion"
                defaultValue={selectedProduct?.descripcion || ''}
                disabled={isProductSold}
              />
            </Form.Group>

            <Row>
              <Col md={4}>
                <Form.Group controlId="precio" className="mb-3">
                  <Form.Label>Precio</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    name="precio"
                    defaultValue={selectedProduct?.precio || ''}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="cantidad_total" className="mb-3">
                  <Form.Label>Cantidad Total</Form.Label>
                  <Form.Control
                    type="number"
                    name="cantidad_total"
                    defaultValue={isEditing ? selectedProduct?.cantidad_total || 0 : 0}
                    required
                    min="0"
                    disabled={true}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="stock_min" className="mb-3">
                  <Form.Label>Stock Mínimo</Form.Label>
                  <Form.Control
                    type="number"
                    name="stock_min"
                    defaultValue={selectedProduct?.stock_min || ''}
                    required
                    min="0"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group controlId="img" className="mb-3">
              <Form.Label>URL de la Imagen</Form.Label>
              <Form.Control
                type="text"
                name="img"
                defaultValue={selectedProduct?.img || ''}
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="mt-3" disabled={isProductSold && !isEditing}>
              {isEditing ? 'Actualizar Producto' : 'Registrar Producto'}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default ProductListPage;
