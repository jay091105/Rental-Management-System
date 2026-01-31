// QR Code generation utility
import QRCode from 'qrcode';

export const generateQRCode = async (data: string): Promise<string> => {
  try {
    // Generate QR code as data URL
    const qrCodeDataURL = await QRCode.toDataURL(data, {
      width: 200,
      margin: 2
    });
    return qrCodeDataURL;
  } catch (error) {
    // Fallback to external service if QRCode library fails
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data)}`;
  }
};
