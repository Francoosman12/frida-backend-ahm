const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI); // Opciones eliminadas
        console.log('Conexión a MongoDB exitosa');
    } catch (error) {
        console.error('Error al conectar a MongoDB:', error);
        process.exit(1); // Finaliza el proceso si la conexión falla
    }
};
