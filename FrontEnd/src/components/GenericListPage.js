import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Container, Row, Col, Card } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';

const GenericListPage = ({ 
  title, 
  items, 
  fields, 
  onAdd, 
  onEdit, 
  onDelete,
  isLoading,
  error,
  formRef,
  fieldErrors = {},
  isSubmitting = false
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const handleFormDataUpdate = (event) => {
      const { fieldName, value } = event.detail;
      console.log('Actualizando formData:', fieldName, value);
      setFormData(prev => ({
        ...prev,
        [fieldName]: value
      }));
    };

    if (formRef?.current) {
      formRef.current.addEventListener('formDataUpdate', handleFormDataUpdate);
    }

    return () => {
      if (formRef?.current) {
        formRef.current.removeEventListener('formDataUpdate', handleFormDataUpdate);
      }
    };
  }, [formRef]);

  const handleShowModal = (item = null) => {
    setEditingItem(item);
    setFormData(item || {});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    if (!isSubmitting) {
      setShowModal(false);
      setEditingItem(null);
      setFormData({});
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingItem) {
        await onEdit({ ...editingItem, ...formData });
        handleCloseModal();
      } else {
        // Pasamos la función de cierre del modal al onAdd
        await onAdd(formData, handleCloseModal);
      }
    } catch (error) {
      console.error('Error en submit:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      };
      console.log('Actualizando formData:', field, value, newData); // Para debugging
      return newData;
    });
  };

  if (isLoading) return <p>Cargando...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h1 className="text-primary">{title}</h1>
        </Col>
        <Col xs="auto">
          <Button variant="success" onClick={() => handleShowModal()}>
            <FaPlus /> Agregar {title.slice(0, -1)}
          </Button>
        </Col>
      </Row>

      <Card className="shadow">
        <Card.Body>
          <Table responsive striped hover>
            <thead className="bg-light">
              <tr>
                {fields.map((field) => (
                  <th key={field.key}>{field.label}</th>
                ))}
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items?.map((item) => (
                <tr key={item.id_proveedor || item.id_cliente || item.id_ubicacion}>
                  {fields.map((field) => (
                    <td key={field.key}>{item[field.key]}</td>
                  ))}
                  <td>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="me-2"
                      onClick={() => handleShowModal(item)}
                    >
                      <FaEdit /> Editar
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => {
                        const itemId = item.id_proveedor || item.id_cliente || item.id_ubicacion;
                        if (itemId && window.confirm('¿Estás seguro de que quieres eliminar este elemento?')) {
                          onDelete(itemId);
                        } else if (!itemId) {
                          console.error('ID no encontrado', item);
                          toast.error('No se puede eliminar el elemento: ID no encontrado');
                        }
                      }}
                    >
                      <FaTrash /> Eliminar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={handleCloseModal} backdrop="static">
        <Form onSubmit={handleSubmit} ref={formRef}>
          <Modal.Header closeButton={!isSubmitting}>
            <Modal.Title>
              {editingItem ? `Editar ${title.slice(0, -1)}` : `Agregar ${title.slice(0, -1)}`}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {fields.map((field) => {
              // Si es el campo ID y estamos creando, no lo mostramos
              if ((field.key === 'id_cliente' || field.key === 'id_proveedor' || field.key === 'id_ubicacion') && !editingItem) {
                return null;
              }
              
              return (
                <Form.Group key={field.key} className="mb-3">
                  <Form.Label>{field.label}</Form.Label>
                  {field.customInput ? (
                    field.customInput(
                      formData[field.key] || '',
                      (e) => {
                        const value = e.target?.value ?? e;
                        handleInputChange(field.key, value);
                      },
                      field,
                      formRef?.current
                    )
                  ) : (
                    <Form.Control
                      type={field.type || 'text'}
                      name={field.key}
                      value={formData[field.key] || ''}
                      onChange={(e) => handleInputChange(field.key, e.target.value)}
                      required={field.required}
                      readOnly={field.readOnly}
                      pattern={field.pattern}
                      maxLength={field.maxLength}
                      isInvalid={!!fieldErrors[field.key]}
                    />
                  )}
                  {fieldErrors[field.key] && (
                    <Form.Text className="text-danger">
                      {fieldErrors[field.key]}
                    </Form.Text>
                  )}
                </Form.Group>
              );
            })}
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
                <><FaSpinner className="spinner-icon" /> Guardando...</>
              ) : (
                editingItem ? 'Actualizar' : 'Agregar'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default GenericListPage;
