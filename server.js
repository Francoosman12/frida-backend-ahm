// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

require('dotenv').config();

const productoRoutes = require('./routes/productoRoutes');
const ventaRoutes = require('./routes/ventaRoutes');
const movimientoRoutes = require('./routes/movimientoRoutes');

// Inicializar Express
const app = express();

// Middleware para habilitar CORS
app.use(cors());

// Middleware para analizar JSON y formularios
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Conexión a la base de datos MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Conexión a MongoDB exitosa');
    } catch (error) {
        console.error('Error al conectar a MongoDB:', error);
        process.exit(1); // Finaliza el proceso si la conexión falla
    }
};

connectDB();

// Rutas
app.use('/api/productos', productoRoutes);
app.use('/api/movimientos', movimientoRoutes);
app.use('/api/ventas', ventaRoutes);

// Middleware para manejar errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({
        message: 'Error interno del servidor',
        error: err.message,
    });
});

// Iniciar el servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
