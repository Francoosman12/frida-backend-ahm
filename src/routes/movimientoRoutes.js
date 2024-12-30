const express = require('express');
const router = express.Router();
const { registrarMovimiento, obtenerMovimientos } = require('../controllers/movimientoController');

// Ruta para registrar un movimiento
router.post('/', registrarMovimiento);

// Ruta para obtener el historial de movimientos
router.get('/', obtenerMovimientos);

module.exports = router;
