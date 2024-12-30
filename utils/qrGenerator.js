const QRCode = require('qrcode');

exports.generarQR = async (id) => {
    try {
        const url = `https://ahm.com/products/${id}`;
        const qrCodeImage = await QRCode.toDataURL(url);
        return qrCodeImage; // Devuelve la imagen como un string base64
    } catch (error) {
        console.error('Error generando QR:', error);
    }
};
