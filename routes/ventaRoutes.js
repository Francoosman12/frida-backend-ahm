// src/routes/ventaRoutes.js

const express = require('express');
const { registrarVenta, obtenerVentas } = require('../controllers/ventaController');  // Asegúrate de que estas funciones existan en el controlador
const router = express.Router();

// Registrar una venta
router.post('/', registrarVenta);

// Obtener historial de ventas
router.get('/', obtenerVentas);

module.exports = router;
