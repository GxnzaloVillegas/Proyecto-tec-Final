// src/App.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
//import Home from './pages/Home';
//import OrderPage from './pages/OrderPage';
//import SalePage from './pages/SalePage';
import ProductListPage from './pages/ProductsListPage';
import OrdenComprapage from './pages/OrdenCompraPage';
import CrearOrdenCompra from './pages/CrearOrdenCompra';
import CrearVentaPage from './pages/CrearVentaPage';
import ClientesPage from './pages/ClientesPage';
//import SaleListPage from './pages/SaleListPage';
import Header from './components/Header';
import VentasPage from './pages/VentasPage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
//import OrdenCompraDetail from './pages/OrdenCompraDetail';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ProveedoresPage from './pages/ProveedoresPage';
import UbicacionesPage from './pages/UbicacionesPage';
import Dashboard from './pages/Dashboard';
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false, // Puedes ajustar las opciones predeterminadas según tu caso
    },
    mutations: {
      retry: false,
      onError: (error) => {
        console.error("Error in mutation:", error);
      },
    },
  },
});


function App() {
  return (
    // Envolver toda la aplicación dentro del QueryClientProvider
    <QueryClientProvider client={queryClient}>
      <ToastContainer />
      <Header />
      <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/proveedores" element={<ProveedoresPage />} />
      <Route path="/ubicaciones" element={<UbicacionesPage />} />
      <Route path="/clientes" element={<ClientesPage />} />
        <Route path="/crear-orden-compra" element={<CrearOrdenCompra />} />
        <Route path="/sales" element={<VentasPage />} />
        <Route path="/crear-venta" element={<CrearVentaPage />} />
        <Route path="/ordenes-compra/:id" element={<OrdenComprapage />} />
        <Route path="/products" element={<ProductListPage />} />
        <Route path="/orders" element={<OrdenComprapage />} />
      </Routes>
    </QueryClientProvider>
  );
}


export default App;
