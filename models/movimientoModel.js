const mongoose = require('mongoose');

const movimientoSchema = new mongoose.Schema({
    productoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto', required: true },
    rubro: { type: String, required: true },
    tipo: { type: String, enum: ['entrada', 'salida'], required: true },
    cantidad: { type: Number, required: true },
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    comentario: { type: String },
    fecha: { type: Date, default: Date.now },
});

const Movimiento = mongoose.model('Movimiento', movimientoSchema);
module.exports = Movimiento;
