import React, { useState } from 'react';
import { Container, Table, Button, Modal, Form, InputGroup, Row, Col, Card } from 'react-bootstrap';
import { FaSpinner, FaCheck, FaSearch, FaEdit, FaTrash, FaPlus, FaBuilding, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useProveedores, useCreateProveedor, useUpdateProveedor, useDeleteProveedor } from '../hooks/useProveedor';
import { consultarRUC } from '../services/rucService';
import styles from '../styles/ProveedoresPage.module.css';

const ProveedoresPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [isRucValidating, setIsRucValidating] = useState(false);
  const [isRucValidated, setIsRucValidated] = useState(false);
  const [editingProveedor, setEditingProveedor] = useState(null);
  const [formData, setFormData] = useState({
    ruc: '',
    raz_soc: '',
    dir_pro: '',
    tel_pro: '',
    correo: ''
  });
  const [fieldErrors, setFieldErrors] = useState({});

  // Usar los hooks de React Query
  const { data: proveedores, isLoading } = useProveedores();
  const createProveedorMutation = useCreateProveedor();
  const updateProveedorMutation = useUpdateProveedor();
  const deleteProveedorMutation = useDeleteProveedor();

  // Validar RUC
  const validateRUC = async (ruc) => {
    if (!ruc || ruc.length !== 11) {
      toast.error('El RUC debe tener 11 dígitos');
      return;
    }

    setIsRucValidating(true);
    try {
      const datosRuc = await consultarRUC(ruc);
      setFormData({
        ...formData,
        ruc: datosRuc.ruc,
        raz_soc: datosRuc.raz_soc,
        dir_pro: datosRuc.dir_pro
      });
      setIsRucValidated(true);
      toast.success('RUC validado correctamente');
    } catch (error) {
      toast.error(error.message);
      setIsRucValidated(false);
    } finally {
      setIsRucValidating(false);
    }
  };

  // Validaciones
  const validateForm = () => {
    const errors = {};
    
    if (!editingProveedor && (!formData.ruc || !isRucValidated)) {
      errors.ruc = 'RUC debe estar validado';
    }
    
    if (!formData.tel_pro) {
      errors.tel_pro = 'Teléfono es requerido';
    } else if (!/^9\d{8}$/.test(formData.tel_pro)) {
      errors.tel_pro = 'Teléfono debe empezar con 9 y tener 9 dígitos';
    }
    
    if (!formData.correo) {
      errors.correo = 'Email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) {
      errors.correo = 'Email no válido';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Manejadores
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (editingProveedor) {
        await updateProveedorMutation.mutateAsync({ 
          id: editingProveedor.id_proveedor, 
          ...formData 
        });
        toast.success('Proveedor actualizado exitosamente');
      } else {
        await createProveedorMutation.mutateAsync(formData);
        toast.success('Proveedor creado exitosamente');
      }
      handleCloseModal();
    } catch (error) {
      toast.error(`Error: ${error.message || 'Error al procesar la solicitud'}`);
    }
  };

  const handleEdit = (proveedor) => {
    setEditingProveedor(proveedor);
    setFormData(proveedor);
    setIsRucValidated(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este proveedor?')) {
      try {
        await deleteProveedorMutation.mutateAsync(id);
        toast.success('Proveedor eliminado exitosamente');
      } catch (error) {
        toast.error('Error al eliminar proveedor');
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProveedor(null);
    setIsRucValidated(false);
    setFormData({
      ruc: '',
      raz_soc: '',
      dir_pro: '',
      tel_pro: '',
      correo: ''
    });
    setFieldErrors({});
  };

  return (
    <Container fluid className={styles.pageContainer}>
      <Card className={styles.card}>
        <Card.Header className={styles.cardHeader}>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h3 className={styles.pageTitle}>
                <FaBuilding className="me-2" />
                Gestión de Proveedores
              </h3>
              <p className={styles.pageSubtitle}>
                Administra la información de tus proveedores
              </p>
            </div>
            <Button 
              variant="success" 
              onClick={() => setShowModal(true)}
              className="d-flex align-items-center"
            >
              <FaPlus className="me-2" /> Nuevo Proveedor
            </Button>
          </div>
        </Card.Header>
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className={styles.table}>
              <thead>
                <tr className={styles.tableHeader}>
                  <th className="border-0">RUC</th>
                  <th className="border-0">Razón Social</th>
                  <th className="border-0">Dirección</th>
                  <th className="border-0">Teléfono</th>
                  <th className="border-0">Email</th>
                  <th className="border-0 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4">
                      <FaSpinner className="spinner-icon me-2" />
                      <span className="text-muted">Cargando proveedores...</span>
                    </td>
                  </tr>
                ) : proveedores?.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4">
                      <p className="text-muted mb-0">No hay proveedores registrados</p>
                    </td>
                  </tr>
                ) : proveedores?.map(proveedor => (
                  <tr key={proveedor.id_proveedor}>
                    <td className="fw-semibold">{proveedor.ruc}</td>
                    <td>{proveedor.raz_soc}</td>
                    <td>
                      <div className="d-flex align-items-center">
                        <FaMapMarkerAlt className="text-muted me-2" />
                        {proveedor.dir_pro}
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <FaPhone className="text-muted me-2" />
                        {proveedor.tel_pro}
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <FaEnvelope className="text-muted me-2" />
                        {proveedor.correo}
                      </div>
                    </td>
                    <td>
                      <div className="d-flex justify-content-center gap-2">
                        <Button 
                          variant="outline-primary" 
                          size="sm" 
                          className={styles.actionBtn}
                          onClick={() => handleEdit(proveedor)}
                          title="Editar proveedor"
                        >
                          <FaEdit />
                        </Button>
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          className={styles.actionBtn}
                          onClick={() => handleDelete(proveedor.id_proveedor)}
                          title="Eliminar proveedor"
                        >
                          <FaTrash />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      <Modal 
        show={showModal} 
        onHide={handleCloseModal} 
        size="lg" 
        centered
        className={styles.modal}
      >
        <Modal.Header closeButton className="bg-light">
          <Modal.Title className="text-primary">
            {editingProveedor ? (
              <><FaEdit className="me-2" />Editar Proveedor</>
            ) : (
              <><FaPlus className="me-2" />Nuevo Proveedor</>
            )}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body className="p-4">
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold">
                    <FaBuilding className="me-2" />
                    RUC
                  </Form.Label>
                  <InputGroup>
                    <Form.Control
                      type="text"
                      value={formData.ruc}
                      onChange={(e) => {
                        const newValue = e.target.value.replace(/\D/g, '').slice(0, 11);
                        setFormData({ ...formData, ruc: newValue });
                        setIsRucValidated(false);
                      }}
                      isInvalid={!!fieldErrors.ruc}
                      isValid={isRucValidated}
                      readOnly={!!editingProveedor}
                      placeholder="Ingrese RUC"
                      required
                    />
                    {!editingProveedor && (
                      <Button
                        variant={isRucValidated ? "outline-success" : "outline-primary"}
                        onClick={() => validateRUC(formData.ruc)}
                        disabled={isRucValidating || !formData.ruc || formData.ruc.length !== 11}
                      >
                        {isRucValidating ? (
                          <><FaSpinner className="spinner-icon" /> Validando...</>
                        ) : isRucValidated ? (
                          <><FaCheck /> Validado</>
                        ) : (
                          <><FaSearch /> Validar</>
                        )}
                      </Button>
                    )}
                  </InputGroup>
                  {fieldErrors.ruc && (
                    <Form.Text className="text-danger">{fieldErrors.ruc}</Form.Text>
                  )}
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold">
                    <FaBuilding className="me-2" />
                    Razón Social
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.raz_soc}
                    onChange={(e) => setFormData({ ...formData, raz_soc: e.target.value })}
                    readOnly={!!editingProveedor}
                    required
                    placeholder="Razón Social"
                  />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label className="fw-semibold">
                    <FaMapMarkerAlt className="me-2" />
                    Dirección
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.dir_pro}
                    onChange={(e) => setFormData({ ...formData, dir_pro: e.target.value })}
                    required
                    placeholder="Dirección completa"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold">
                    <FaPhone className="me-2" />
                    Teléfono
                  </Form.Label>
                  <Form.Control
                    type="tel"
                    value={formData.tel_pro}
                    onChange={(e) => {
                      const newValue = e.target.value.replace(/\D/g, '').slice(0, 9);
                      setFormData({ ...formData, tel_pro: newValue });
                    }}
                    isInvalid={!!fieldErrors.tel_pro}
                    required
                    placeholder="9XXXXXXXX"
                  />
                  {fieldErrors.tel_pro && (
                    <Form.Text className="text-danger">{fieldErrors.tel_pro}</Form.Text>
                  )}
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold">
                    <FaEnvelope className="me-2" />
                    Email
                  </Form.Label>
                  <Form.Control
                    type="email"
                    value={formData.correo}
                    onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                    isInvalid={!!fieldErrors.correo}
                    required
                    placeholder="ejemplo@correo.com"
                  />
                  {fieldErrors.correo && (
                    <Form.Text className="text-danger">{fieldErrors.correo}</Form.Text>
                  )}
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer className="bg-light">
            <Button variant="outline-secondary" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button 
              variant="primary" 
              type="submit"
              disabled={isRucValidating}
            >
              {editingProveedor ? 'Actualizar' : 'Guardar'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default ProveedoresPage;
