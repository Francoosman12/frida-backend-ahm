const Producto = require('../models/productoModel');
const cloudinary = require('cloudinary').v2;
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');

// Generar un código EAN único de 13 dígitos
const generarCodigoEAN = () => {
    let codigoEAN = Math.floor(Math.random() * 1000000000000);
    return codigoEAN.toString().padStart(13, '0');
};

// Crear un producto
const crearProducto = async (req, res) => {
    try {
        const {
            nombre, categoria, subcategoria, rubro, sucursal, stock, stock_minimo,
            unidad_medida, precio_compra, precio_venta, fecha_ingreso, fecha_ultima_actualizacion,
            observaciones, estado
        } = req.body;

        const codigoEAN = generarCodigoEAN(); // Genera un código EAN único
        let qr_image_url = '';

        // Generar QR si el rubro es "boutique"
        if (rubro === 'boutique') {
            const qr_image = await QRCode.toDataURL(codigoEAN, {
                color: { dark: '#000000', light: '#ffffff' },
            });

            // Subir QR a Cloudinary
            try {
                const qrUploadResult = await cloudinary.uploader.upload(qr_image, {
                    folder: 'productos_qr',
                    public_id: `qr_${codigoEAN}`,
                    overwrite: true,
                    resource_type: 'image',
                });
                qr_image_url = qrUploadResult.secure_url;
            } catch (error) {
                console.error('Error al subir el QR:', error);
                return res.status(500).json({ error: 'Error al subir el QR del producto' });
            }
        }

        // Subir imagen del producto si existe
        let imagen_producto_url = '';
        if (req.body.imagen_producto) {
            try {
                const result = await cloudinary.uploader.upload(req.body.imagen_producto, {
                    resource_type: 'image',
                });
                imagen_producto_url = result.secure_url;
            } catch (error) {
                console.error('Error al subir la imagen del producto:', error);
                return res.status(500).json({ error: 'Error al subir la imagen del producto' });
            }
        }

        // Crear producto en la base de datos
        const nuevoProducto = new Producto({
            nombre, categoria, subcategoria, rubro, sucursal, stock, stock_minimo,
            unidad_medida, precio_compra, precio_venta, fecha_ingreso, fecha_ultima_actualizacion,
            observaciones, estado,
            codigo_ean: codigoEAN,
            qr_code: qr_image_url,
            imagen_producto: imagen_producto_url,
        });

        await nuevoProducto.save();
        res.status(201).json({ message: 'Producto creado exitosamente', producto: nuevoProducto });
    } catch (error) {
        console.error('Error al crear el producto:', error);
        res.status(500).json({ error: 'Error al crear el producto' });
    }
};

// Generar y asociar QR al producto
const generarQrYAsociar = async (req, res) => {
    try {
        const productoId = req.params.id;
        const producto = await Producto.findById(productoId);

        if (!producto) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        const qr_image = await QRCode.toDataURL(producto.codigo_ean, {
            color: { dark: '#0000FF', light: '#ffffff' },
        });

        try {
            const result = await cloudinary.uploader.upload(qr_image, {
                folder: 'productos_qr',
                public_id: `qr_${productoId}`,
                overwrite: true,
                resource_type: 'image',
            });

            producto.qr_code = result.secure_url;
            await producto.save();

            res.status(200).json({ message: 'QR generado y asociado exitosamente', imagenQR: result.secure_url });
        } catch (error) {
            console.error('Error al subir el QR:', error);
            res.status(500).json({ message: 'Error al subir el QR', error: error.message });
        }
    } catch (error) {
        console.error('Error al generar QR:', error);
        res.status(500).json({ message: 'Error al generar el QR', error: error.message });
    }
};

// Obtener productos con paginación y búsqueda
const obtenerProductos = async (req, res) => {
    try {
        const { nombre, categoria, codigo_ean, pagina = 1, limite = 10 } = req.query;
        const query = {};

        // Construcción del query
        if (codigo_ean) query.codigo_ean = codigo_ean;
        if (nombre) query.nombre = { $regex: nombre, $options: 'i' };
        if (categoria) query.categoria = categoria;

        // Consulta a MongoDB
        const productos = await Producto.find(query)
            .skip((pagina - 1) * parseInt(limite))
            .limit(parseInt(limite));

        if (!productos || productos.length === 0) {
            return res.status(404).json({ message: 'No se encontraron productos' });
        }

        // Asegurar que cada producto tenga un _id válido
        const productosConId = productos.map(producto => {
            if (producto && producto._id) {
                return {
                    ...producto.toObject(),
                    id: producto._id.toString(), // Renombrar _id a id
                };
            }
            return null; // Manejo seguro de casos anómalos
        }).filter(producto => producto !== null); // Eliminar productos inválidos

        res.json(productosConId);
    } catch (error) {
        console.error('Error al obtener productos:', error); // Traza del error
        res.status(500).json({ message: 'Error al obtener productos', error: error.message });
    }
};

// Obtener producto por ID
const obtenerProductoPorId = async (req, res) => {
    try {
        const producto = await Producto.findById(req.params.id);

        if (!producto) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        const productoConId = {
            ...producto.toObject(),
            id: producto._id.toString(),
        };

        res.json(productoConId);
    } catch (error) {
        console.error('Error al obtener producto por ID:', error);
        res.status(500).json({ message: error.message });
    }
};

// Actualizar producto
const actualizarProducto = async (req, res) => {
    try {
        const productoActualizado = await Producto.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!productoActualizado) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        res.json(productoActualizado);
    } catch (error) {
        console.error('Error al actualizar producto:', error);
        res.status(400).json({ message: error.message });
    }
};

// Eliminar producto
const eliminarProducto = async (req, res) => {
    try {
        const productoEliminado = await Producto.findByIdAndDelete(req.params.id);

        if (!productoEliminado) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        res.json({ message: 'Producto eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar producto:', error);
        res.status(500).json({ message: error.message });
    }
};

// Exporta todos los controladores
module.exports = {
    crearProducto,
    obtenerProductos,
    obtenerProductoPorId,
    actualizarProducto,
    eliminarProducto,
    generarQrYAsociar
};
