const errorHandler = (err, req, res, next) => {
    res.status(err.status || 500).json({
        message: err.message || 'Error interno del servidor',
    });
};

module.exports = errorHandler;
