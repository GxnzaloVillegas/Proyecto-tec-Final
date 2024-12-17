import React, { useState, useEffect } from 'react';
import styles from '../styles/Dashboard.module.css';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { FaChartBar, FaCalendarWeek, FaCalendarAlt, FaBoxes, FaExclamationTriangle, FaFilter, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useCategories } from '../hooks/useCategorias';
import { useBrands } from '../hooks/useMarcas';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const [topProducts, setTopProducts] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [salesSummary, setSalesSummary] = useState({});
  const [filters, setFilters] = useState({
    categoria: '',
    marca: '',
    startDate: '',
    endDate: ''
  });

  const { data: categories, isLoading: isCategoriesLoading } = useCategories();
  const { data: brands, isLoading: isBrandsLoading } = useBrands();

  useEffect(() => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);

    setFilters({
      ...filters,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    });

    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [topProductsRes, lowStockRes, salesSummaryRes] = await Promise.all([
        axios.post('http://localhost:5000/api/dashboard/top-selling-products', filters),
        axios.get('http://localhost:5000/api/dashboard/low-stock-products'),
        axios.get('http://localhost:5000/api/dashboard/sales-summary')
      ]);

      setTopProducts(topProductsRes.data);
      setLowStockProducts(lowStockRes.data);
      setSalesSummary(salesSummaryRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Error al cargar los datos del dashboard');
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const applyFilters = () => {
    fetchDashboardData();
  };

  const chartData = {
    labels: topProducts.map(product => product.nombre),
    datasets: [
      {
        label: 'Cantidad Vendida',
        data: topProducts.map(product => product.cantidad_total),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
      {
        label: 'Venta Total ($)',
        data: topProducts.map(product => parseFloat(product.venta_total)),
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
      }
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Productos Más Vendidos',
      },
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  return (
    <div className={styles.dashboardPage}>
      <div className={styles.dashboardWrapper}>
        {/* Header Section */}
        <div className={styles.dashboardHeader}>
          <div className={styles.headerContent}>
            <div className={styles.titleSection}>
              <h1 className={styles.title}>Panel de Control</h1>
              <p className={styles.subtitle}>Resumen general del negocio</p>
            </div>
            <div className={styles.dateSection}>
              {new Date().toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className={styles.statsGrid}>
          {/* Card Ventas Diarias */}
          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <div className={`${styles.statIcon} ${styles.dailyIcon}`}>
                <FaChartBar />
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statPeriod}>Hoy</span>
                <span className={styles.statLabel}>Ventas del Día</span>
              </div>
            </div>
            <div className={styles.statContent}>
              <h3 className={styles.statValue}>
                ${salesSummary.today?.toFixed(2) || '0.00'}
              </h3>
            </div>
          </div>

          {/* Card Ventas Semanales */}
          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <div className={`${styles.statIcon} ${styles.weeklyIcon}`}>
                <FaCalendarWeek />
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statPeriod}>Esta Semana</span>
                <span className={styles.statLabel}>Ventas Semanales</span>
              </div>
            </div>
            <div className={styles.statContent}>
              <h3 className={styles.statValue}>
                ${salesSummary.week?.toFixed(2) || '0.00'}
              </h3>
            </div>
          </div>

          {/* Card Ventas Mensuales */}
          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <div className={`${styles.statIcon} ${styles.monthlyIcon}`}>
                <FaCalendarAlt />
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statPeriod}>Este Mes</span>
                <span className={styles.statLabel}>Ventas Mensuales</span>
              </div>
            </div>
            <div className={styles.statContent}>
              <h3 className={styles.statValue}>
                ${salesSummary.month?.toFixed(2) || '0.00'}
              </h3>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className={styles.mainContent}>
          {/* Chart Section */}
          <div className={styles.contentCard}>
            <div className={styles.cardHeader}>
              <div className={styles.headerTitle}>
                <FaBoxes className={styles.headerIcon} />
                <h2 className={styles.headerText}>Productos Más Vendidos</h2>
              </div>
            </div>
            <div className={styles.filterSection}>
              <div className={styles.filterHeader}>
                <h3 className={styles.filterTitle}>
                  <FaFilter className={styles.filterIcon} />
                  Filtros
                </h3>
              </div>
              
              <div className={styles.filterGrid}>
                <div className={styles.filterGroup}>
                  <label className={styles.filterLabel}>Categoría</label>
                  <select
                    className={styles.filterSelect}
                    name="categoria"
                    value={filters.categoria}
                    onChange={handleFilterChange}
                    disabled={isCategoriesLoading}
                  >
                    <option value="">Todas las Categorías</option>
                    {categories?.map(cat => (
                      <option key={cat.id_categoria} value={cat.id_categoria}>
                        {cat.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.filterGroup}>
                  <label className={styles.filterLabel}>Marca</label>
                  <select
                    className={styles.filterSelect}
                    name="marca"
                    value={filters.marca}
                    onChange={handleFilterChange}
                    disabled={isBrandsLoading}
                  >
                    <option value="">Todas las Marcas</option>
                    {brands?.map(brand => (
                      <option key={brand.id_marca} value={brand.id_marca}>
                        {brand.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.filterGroup}>
                  <label className={styles.filterLabel}>Fecha Inicio</label>
                  <input
                    type="date"
                    className={styles.filterInput}
                    name="startDate"
                    value={filters.startDate}
                    onChange={handleFilterChange}
                  />
                </div>

                <div className={styles.filterGroup}>
                  <label className={styles.filterLabel}>Fecha Fin</label>
                  <input
                    type="date"
                    className={styles.filterInput}
                    name="endDate"
                    value={filters.endDate}
                    onChange={handleFilterChange}
                  />
                </div>
              </div>
              
              <div className={styles.filterActions}>
                <button className={styles.filterButton} onClick={applyFilters}>
                  <FaFilter className={styles.buttonIcon} />
                  <span>Aplicar Filtros</span>
                </button>
              </div>
            </div>
            <div className={styles.chartContainer}>
              {topProducts.length > 0 ? (
                <Bar data={chartData} options={chartOptions} />
              ) : (
                <div className={styles.noData}>
                  <p>No hay datos disponibles para mostrar</p>
                </div>
              )}
            </div>
          </div>

          {/* Low Stock Section */}
          <div className={styles.contentCard}>
            <div className={styles.cardHeader}>
              <div className={styles.headerTitle}>
                <FaExclamationTriangle className={styles.headerIcon} />
                <h2 className={styles.headerText}>Productos con Bajo Stock</h2>
              </div>
            </div>
            <div className={styles.tableContainer}>
              {lowStockProducts.length > 0 ? (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Stock Actual</th>
                      <th>Stock Mínimo</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowStockProducts.map(product => (
                      <tr key={product.id_producto}>
                        <td>{product.nombre}</td>
                        <td>{product.cantidad_total}</td>
                        <td>{product.stock_min}</td>
                        <td>
                          <span className={`${styles.badge} ${
                            product.cantidad_total <= product.stock_min 
                              ? styles.badgeDanger 
                              : styles.badgeWarning
                          }`}>
                            {product.cantidad_total <= product.stock_min ? "Crítico" : "Bajo"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className={styles.noData}>
                  <p>No hay productos con bajo stock</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
