// src/components/Header.js
import React from 'react';
import { Navbar, Nav, NavDropdown, Container } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { FaBox, FaShoppingCart, FaChartLine, FaCog, FaUsers, FaTruck, FaMapMarkerAlt } from 'react-icons/fa';
import '../styles/Header.css';

const Header = () => {
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path ? 'nav-link-active' : '';
  };

  return (
    <Navbar expand="lg" className="custom-navbar">
      <Container fluid>
        <Navbar.Brand as={Link} to="/" className="brand-logo">
          <FaBox className="brand-icon" />
          <span className="brand-text">Inventory System</span>
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto nav-links">
            <Nav.Link 
              as={Link} 
              to="/products" 
              className={`nav-link-custom ${isActive('/products')}`}
            >
              <FaBox className="nav-icon" /> 
              <span>Productos</span>
            </Nav.Link>
            
            <Nav.Link 
              as={Link} 
              to="/orders" 
              className={`nav-link-custom ${isActive('/orders')}`}
            >
              <FaShoppingCart className="nav-icon" /> 
              <span>Órdenes de Compra</span>
            </Nav.Link>
            
            <Nav.Link 
              as={Link} 
              to="/sales" 
              className={`nav-link-custom ${isActive('/sales')}`}
            >
              <FaChartLine className="nav-icon" /> 
              <span>Ventas</span>
            </Nav.Link>
            
            <NavDropdown 
              title={
                <span className="dropdown-title">
                  <FaCog className="nav-icon" />
                  <span>Gestión</span>
                </span>
              } 
              id="basic-nav-dropdown" 
              className="nav-dropdown-custom"
            >
              <NavDropdown.Item as={Link} to="/clientes" className="dropdown-item-custom">
                <FaUsers className="dropdown-icon" />
                <span>Clientes</span>
              </NavDropdown.Item>
              
              <NavDropdown.Item as={Link} to="/proveedores" className="dropdown-item-custom">
                <FaTruck className="dropdown-icon" />
                <span>Proveedores</span>
              </NavDropdown.Item>
              
              <NavDropdown.Item as={Link} to="/ubicaciones" className="dropdown-item-custom">
                <FaMapMarkerAlt className="dropdown-icon" />
                <span>Ubicaciones</span>
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
