const Movimiento = require('../models/movimientoModel');
const Producto = require('../models/productoModel');
const Usuario = require('../models/usuarioModel');  // Asegúrate de la ruta correcta

// Crear un movimiento
const registrarMovimiento = async (req, res) => {
    try {
        const { productoId, tipo, cantidad, comentario, usuarioId } = req.body;

        // Validar el producto
        const producto = await Producto.findById(productoId);
        if (!producto || producto.rubro !== 'hotel') {
            return res.status(404).json({ message: 'Producto no encontrado o no pertenece al rubro hotel' });
        }

        // Validar la cantidad en caso de salida
        if (tipo === 'salida' && producto.stock < cantidad) {
            return res.status(400).json({ message: 'Stock insuficiente para realizar la salida' });
        }

        // Crear el movimiento
        const nuevoMovimiento = new Movimiento({
            productoId,
            rubro: 'hotel',
            tipo,
            cantidad,
            usuario: usuarioId,
            comentario,
        });
        await nuevoMovimiento.save();

        // Actualizar el stock del producto
        producto.stock = (parseInt(producto.stock) || 0) + (tipo === 'entrada' ? parseInt(cantidad) : -parseInt(cantidad));
        await producto.save();

        res.status(201).json({ message: 'Movimiento registrado exitosamente', movimiento: nuevoMovimiento });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al registrar el movimiento' });
    }
};

// Obtener el historial de movimientos
const obtenerMovimientos = async (req, res) => {
    try {
        const { productoId, tipo, fechaInicio, fechaFin } = req.query;
        const filtro = { rubro: 'hotel' };

        if (productoId) filtro.productoId = productoId;
        if (tipo) filtro.tipo = tipo;
        if (fechaInicio && fechaFin) {
            filtro.fecha = { $gte: new Date(fechaInicio), $lte: new Date(fechaFin) };
        }

        const movimientos = await Movimiento.find(filtro)
            .populate('productoId', 'nombre')  // Poblar el nombre del producto
            .populate('usuario', 'nombre');    // Poblar el nombre del usuario
        // Agregar log para inspeccionar los datos antes de enviarlos
        console.log("Movimientos poblados: ", movimientos);
        res.json(movimientos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener los movimientos' });
    }
};

module.exports = {
    registrarMovimiento,
    obtenerMovimientos,
};
