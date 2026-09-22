import sharp from 'sharp';
import jsQR from 'jsqr';
import { QRDecodeResult } from '../types';
import { base64ToBuffer } from '../utils/helpers';
import { logger } from '../utils/logger';

export class QRService {
  /**
   * Decode a QR code from a base64-encoded image.
   * Uses jsqr for decoding and sharp for pixel data extraction.
   * Returns { destination: null, available: false } on any failure — never throws.
   */
  async decodeQR(imageBase64: string): Promise<QRDecodeResult> {
    try {
      const buffer = base64ToBuffer(imageBase64);

      // Use sharp to get raw RGBA pixel data
      const { data, info } = await sharp(buffer)
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });

      const pixelData = new Uint8ClampedArray(data.buffer, data.byteOffset, data.length);

      const code = jsQR(pixelData, info.width, info.height, {
        inversionAttempts: 'dontInvert',
      });

      if (!code || !code.data) {
        logger.info({ service: 'qr' }, 'No QR code detected in image');
        return { destination: null, available: true };
      }

      logger.info({ service: 'qr', destinationLength: code.data.length }, 'QR code decoded');

      return { destination: code.data, available: true };
    } catch (err) {
      logger.error({ service: 'qr', error: String(err) }, 'QR decode failed');
      return { destination: null, available: false };
    }
  }
}

export const qrService = new QRService();
