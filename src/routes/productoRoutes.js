const express = require('express');
const router = express.Router();
const upload = require('../middlewares/cloudinaryConfig');
const { 
    crearProducto, 
    obtenerProductos, 
    obtenerProductoPorId, 
    actualizarProducto, 
    eliminarProducto,
    generarQrYAsociar,
} = require('../controllers/productoController');

// Buscar producto por código EAN
router.get('/buscar/:codigoEAN', async (req, res) => {
    try {
        const producto = await Producto.findOne({ codigo_ean: req.params.codigoEAN });
        if (!producto) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }
        res.json(producto);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Obtener todos los productos
router.get('/api/productos', async (req, res) => {
    try {
        const productos = await Producto.find(); // Suponiendo que usas mongoose
        res.json(productos);
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// Rutas CRUD
router.post('/', upload.single('imagen_producto'), crearProducto);
router.get('/', obtenerProductos);
router.get('/productos', obtenerProductos);
router.get('/:id', obtenerProductoPorId);
router.put('/:id', actualizarProducto);
router.delete('/:id', eliminarProducto);
router.post('/:id/generarQR', generarQrYAsociar);

module.exports = router;
