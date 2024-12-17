import React, { useState } from 'react';
import { useClientes, useCreateCliente, useUpdateCliente, useDeleteCliente } from '../hooks/useClientes';
import { Container, Row, Col, Card, Table, Button, Modal, Form, InputGroup, Badge} from 'react-bootstrap';
import { FaSearch, FaSpinner, FaCheck, FaPlus, FaEdit, FaTrash, FaUser, FaMapMarkerAlt,FaUserTie, FaPhone, FaEnvelope, FaBuilding } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { consultarDNI } from '../services/dniService';
import styles from '../styles/ProveedoresPage.module.css';


const ClientesPage = () => {
  // Estados
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [editingCliente, setEditingCliente] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isDniValidated, setIsDniValidated] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Queries y Mutations
  const { data: clientes, isLoading } = useClientes();
  const createClienteMutation = useCreateCliente();
  const updateClienteMutation = useUpdateCliente();
  const deleteClienteMutation = useDeleteCliente();

  // Handlers
  const handleShowModal = (cliente = null) => {
    setEditingCliente(cliente);
    setFormData(cliente || {});
    setShowModal(true);
    setIsDniValidated(false);
    setFieldErrors({});
  };

  const handleCloseModal = () => {
    if (!isSubmitting) {
      setShowModal(false);
      setEditingCliente(null);
      setFormData({});
      setIsDniValidated(false);
      setFieldErrors({});
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Limpiar error del campo
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateDNI = async (dni) => {
    if (!dni || dni.length !== 8) {
      setFieldErrors(prev => ({
        ...prev,
        dni: 'El DNI debe tener 8 dígitos'
      }));
      setIsDniValidated(false);
      return false;
    }

    setIsValidating(true);
    try {
      const datosPersona = await consultarDNI(dni);
      
      // Actualizar formulario con datos de la API
      setFormData(prev => ({
        ...prev,
        nombre: datosPersona.nombres,
        apepaterno: datosPersona.apellido_paterno,
        apematerno: datosPersona.apellido_materno
      }));
      
      setFieldErrors(prev => ({ ...prev, dni: '' }));
      setIsDniValidated(true);
      toast.success('DNI validado correctamente');
      return true;
    } catch (error) {
      setFieldErrors(prev => ({
        ...prev,
        dni: error.message
      }));
      setIsDniValidated(false);
      toast.error(error.message);
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  // Agregar estas funciones de validación
  const isValidPhone = (phone) => {
    const phoneRegex = /^9\d{8}$/;
    return phoneRegex.test(phone);
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (data) => {
    const errors = {};
    
    if (!editingCliente) {
      if (!data.dni || !isDniValidated) {
        errors.dni = 'DNI debe estar validado';
      }
    }
    
    if (!data.dir_cli) {
      errors.dir_cli = 'Dirección es requerida';
    }
    
    if (!data.tel_cli) {
      errors.tel_cli = 'Teléfono es requerido';
    } else if (!isValidPhone(data.tel_cli)) {
      errors.tel_cli = 'Teléfono debe empezar con 9 y tener 9 dígitos';
    }
    
    if (!data.correo) {
      errors.correo = 'Email es requerido';
    } else if (!isValidEmail(data.correo)) {
      errors.correo = 'Email no válido';
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!validateForm(formData)) {
        setIsSubmitting(false);
        return;
      }

      if (editingCliente) {
        await updateClienteMutation.mutateAsync({
          id: editingCliente.id_cliente,
          ...formData
        });
        toast.success('Cliente actualizado exitosamente');
      } else {
        await createClienteMutation.mutateAsync(formData);
        toast.success('Cliente creado exitosamente');
      }
      handleCloseModal();
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este cliente?')) {
      try {
        await deleteClienteMutation.mutateAsync(id);
        toast.success('Cliente eliminado exitosamente');
      } catch (error) {
        toast.error(`Error al eliminar: ${error.message}`);
      }
    }
  };

  // Renderizado del formulario modal
  const renderModal = () => (
    <Modal 
    show={showModal} 
    onHide={handleCloseModal} 
    size="lg" backdrop="static" 
    centered 
    className={styles.modal}>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton={!isSubmitting}>
          <Modal.Title>
            <FaUser className="me-2" />
            {editingCliente ? 'Editar Cliente' : 'Nuevo Cliente'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col md={6}>
              <Form.Group className="validation-wrapper mb-3">
                <Form.Label>DNI</Form.Label>
                <InputGroup>
                  <Form.Control
                    type="text"
                    value={formData.dni || ''}
                    onChange={(e) => {
                      const newValue = e.target.value.replace(/\D/g, '').slice(0, 8);
                      handleInputChange('dni', newValue);
                      
                      setIsDniValidated(false);
                    }}
                    isInvalid={!!fieldErrors.dni}
                    isValid={isDniValidated}
                    placeholder="12345678"
                    required
                    readOnly={!!editingCliente}
                  />
                  {!editingCliente && (
                    <Button 
                      variant={isDniValidated ? "outline-success" : "outline-primary"}
                      onClick={() => validateDNI(formData.dni)}
                      disabled={isValidating || !formData.dni || formData.dni.length !== 8}
                    >
                      {isValidating ? (
                        <><FaSpinner className="spinner-icon" /> Validando...</>
                      ) : isDniValidated ? (
                        <><FaCheck /> Validado</>
                      ) : (
                        <><FaSearch /> Validar</>
                      )}
                    </Button>
                  )}
                </InputGroup>
                {fieldErrors.dni && !editingCliente && (
                  <div className="error-message">{fieldErrors.dni}</div>
                )}
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Nombres</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.nombre || ''}
                  onChange={(e) => handleInputChange('nombre', e.target.value)}
                  readOnly
                  placeholder="Se autocompletará"
                  isInvalid={!!fieldErrors.nombre}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Apellido Paterno</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.apepaterno || ''}
                  onChange={(e) => handleInputChange('apepaterno', e.target.value)}
                  readOnly
                  placeholder="Se autocompletará"
                  isInvalid={!!fieldErrors.apepaterno}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Apellido Materno</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.apematerno || ''}
                  onChange={(e) => handleInputChange('apematerno', e.target.value)}
                  readOnly
                  placeholder="Se autocompletará"
                  isInvalid={!!fieldErrors.apematerno}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label>Dirección</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.dir_cli || ''}
                  onChange={(e) => handleInputChange('dir_cli', e.target.value)}
                  placeholder="Ingrese la dirección"
                  required
                  isInvalid={!!fieldErrors.dir_cli}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Teléfono</Form.Label>
                <Form.Control
                  type="tel"
                  value={formData.tel_cli || ''}
                  onChange={(e) => {
                    const newValue = e.target.value.replace(/\D/g, '').slice(0, 9);
                    handleInputChange('tel_cli', newValue);
                  }}
                  placeholder="9XXXXXXXX"
                  required
                  isInvalid={!!fieldErrors.tel_cli}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  value={formData.correo || ''}
                  onChange={(e) => handleInputChange('correo', e.target.value)}
                  placeholder="ejemplo@correo.com"
                  required
                  isInvalid={!!fieldErrors.correo}
                />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={handleCloseModal}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button 
            variant="primary" 
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <><FaSpinner className="spinner" /> Guardando...</>
            ) : (
              editingCliente ? 'Actualizar' : 'Guardar'
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );

  // Renderizado principal
  return (
    <Container fluid className={styles.pageContainer}>
      <Card  className={styles.card}>
      <Card.Header className={styles.cardHeader}>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h3 className={styles.pageTitle}>
                <FaUserTie className="me-2" />
                Gestión de Clientes
              </h3>
              <p className={styles.pageSubtitle}>
                Administra la información de tus clientes
              </p>
            </div>
            <Button variant="success" onClick={() => handleShowModal()}>
                <FaPlus className="me-2" />
                Nuevo Cliente
              </Button>
          </div>
        </Card.Header>
        <Card.Body>
        

          {isLoading ? (
            <div className="text-center py-4">
              <FaSpinner className="spinner" size={40} />
              <p className="mt-2">Cargando clientes...</p>
            </div>
          ) : (
            <Table responsive hover className="align-middle">
              <thead className="bg-light">
                <tr>
                  <th>DNI</th>
                  <th>Nombre Completo</th>
                  <th>Teléfono</th>
                  <th>Email</th>
                  <th>Dirección</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {clientes?.map(cliente => (
                  <tr key={cliente.id_cliente}>
                    <td className='fw-semibold'>{cliente.dni}</td>
                    <td>
                      {`${cliente.apepaterno} ${cliente.apematerno}, ${cliente.nombre}`}
                    </td>
                    
                    <td>
                      <div className="d-flex align-items-center">
                        <FaPhone className="text-muted me-2" />
                        {cliente.tel_cli}
                      </div>
                    </td>
                    
                    <td>
                      <div className="d-flex align-items-center">
                        <FaEnvelope className="text-muted me-2" />
                        {cliente.correo}
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <FaMapMarkerAlt className="text-muted me-2" />
                        {cliente.dir_cli}
                      </div>
                    </td>
                   
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() => handleShowModal(cliente)}
                      >
                        <FaEdit />
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDelete(cliente.id_cliente)}
                      >
                        <FaTrash />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {renderModal()}
    </Container>
  );
};

export default ClientesPage;
