// src/controllers/ventaController.js
const Venta = require('../models/ventaModel');
const Producto = require('../models/productoModel');

// Registrar una venta
const registrarVenta = async (req, res) => {
  try {
    const { productos, modalidad_pago, monto_efectivo = 0, monto_tarjeta = 0, sucursal } = req.body;

    if (!productos || productos.length === 0) {
      throw new Error('La lista de productos está vacía.');
    }

    // Procesar productos y actualizar stock
    const productosProcesados = await Promise.all(
      productos.map(async ({ productoId, cantidad }) => {
        const producto = await Producto.findById(productoId);
        if (!producto) throw new Error(`Producto con ID ${productoId} no encontrado.`);
        if (producto.stock < cantidad) throw new Error(`Stock insuficiente para el producto ${producto.nombre}.`);

        producto.stock -= cantidad;
        await producto.save();

        return {
          productoId: producto._id.toString(),
          cantidad,
          precio: producto.precio_venta,
          subtotal: producto.precio_venta * cantidad,
        };
      })
    );

    console.log('Productos procesados:', productosProcesados);

    // Calcular el total de la venta
    const total = productosProcesados.reduce((sum, item) => sum + item.subtotal, 0);

    // Validar montos según modalidad de pago
    let efectivo = 0;
    let tarjeta = 0;

    if (modalidad_pago === 'efectivo') {
      efectivo = total;
    } else if (modalidad_pago === 'tarjeta') {
      tarjeta = total;
    } else if (modalidad_pago === 'doble') {
      if (Math.abs(monto_efectivo + monto_tarjeta - total) > 0.01) {
        throw new Error('El monto total no coincide con el pago registrado.');
      }
      efectivo = monto_efectivo;
      tarjeta = monto_tarjeta;
    } else {
      throw new Error('Modalidad de pago no válida.');
    }

    // Crear y guardar la venta
    const nuevaVenta = new Venta({
      productos: productosProcesados,
      modalidad_pago,
      monto_efectivo: efectivo,
      monto_tarjeta: tarjeta,
      total,
      sucursal,
    });

    const ventaGuardada = await nuevaVenta.save();

    return res.status(201).json({
      message: 'Venta registrada exitosamente',
      venta: ventaGuardada,
    });
  } catch (error) {
    console.error('Error al registrar venta:', error.message);
    res.status(400).json({ message: error.message });
  }
};

// Obtener historial de ventas
const obtenerVentas = async (req, res) => {
  try {
    const ventas = await Venta.find().populate('productos.productoId');
    res.status(200).json(ventas);
  } catch (error) {
    console.error('Error al obtener ventas:', error.message);
    res.status(400).json({ message: error.message });
  }
};

module.exports = { registrarVenta, obtenerVentas };
