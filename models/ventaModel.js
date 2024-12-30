// src/models/ventaModel.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const productoSchema = new Schema({
  productoId: { type: Schema.Types.ObjectId, ref: 'Producto', required: true },
  cantidad: { type: Number, required: true },
  precio: { type: Number, required: true },
  subtotal: { type: Number, required: true },
});

const ventaSchema = new Schema({
  productos: [productoSchema],
  modalidad_pago: { type: String, required: true },
  monto_efectivo: { type: Number, default: 0 },
  monto_tarjeta: { type: Number, default: 0 },
  total: { type: Number, required: true },
  sucursal: { type: String, required: true },
  fecha: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Venta', ventaSchema, 'ventas');
