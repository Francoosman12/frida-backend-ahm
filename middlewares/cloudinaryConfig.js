const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const multerStorage = multer.memoryStorage(); // Usamos memoria para las imágenes antes de subirlas

// Configurar Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configuración de multer para usar la memoria antes de subir a Cloudinary
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },  // 5MB como límite de tamaño de archivo
  fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('image')) {
          cb(null, true);
      } else {
          cb(new Error('El archivo debe ser una imagen'), false);
      }
  },
});


module.exports = upload;
