const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
    nombre: String,
    categoria: String,
    subcategoria: String,
    rubro: String,
    sucursal: String,
    stock: Number,
    stock_minimo: Number,
    unidad_medida: String,
    precio_compra: Number,
    precio_venta: Number,
    fecha_ingreso: String,
    fecha_ultima_actualizacion: String,
    observaciones: String,
    estado: String,
    imagen_producto: String,
    qr_code: String,
    codigo_ean: String,  // Añadimos el campo para el código EAN
});

module.exports = mongoose.model('Producto', productoSchema);
