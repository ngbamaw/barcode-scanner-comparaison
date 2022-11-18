import IBarcodeScanner from "./IBarcodeScanner";
import { IBarcodeResult } from "./zxing";

declare const BarcodeDetector: any;

class NativeBarcodeScanner implements IBarcodeScanner {
  private scanner: any;

  private constructor() {
    this.scanner = new BarcodeDetector();
  }

  static async createInstance(): Promise<NativeBarcodeScanner> {
    return new NativeBarcodeScanner();
  }

  static isSupported(): boolean {
    return "BarcodeDetector" in window;
  }

  async scanBarcode(imageData: ImageData): Promise<IBarcodeResult | null> {
    const barcodes = await this.scanner.detect(imageData);
    if (barcodes.length > 0) {
      const result: IBarcodeResult = {
        format: barcodes[0].format,
        text: barcodes[0].rawValue,
        error: "",
        position: {
          topLeft: {
            x: barcodes[0].cornerPoints[0].x,
            y: barcodes[0].cornerPoints[0].y,
          },
          topRight: {
            x: barcodes[0].cornerPoints[1].x,
            y: barcodes[0].cornerPoints[1].y,
          },
          bottomRight: {
            x: barcodes[0].cornerPoints[2].x,
            y: barcodes[0].cornerPoints[2].y,
          },
          bottomLeft: {
            x: barcodes[0].cornerPoints[3].x,
            y: barcodes[0].cornerPoints[3].y,
          },
        },
      };
      
      return result;
    }

    return null;
  }

  async scanFile(file: File): Promise<IBarcodeResult | null> {
    const barcodes = await this.scanner.detect(await createImageBitmap(file));
    
    if (barcodes.length > 0) {
      const result: IBarcodeResult = {
        format: barcodes[0].format,
        text: barcodes[0].rawValue,
        error: "",
        position: {
          topLeft: {
            x: barcodes[0].cornerPoints[0].x,
            y: barcodes[0].cornerPoints[0].y,
          },
          topRight: {
            x: barcodes[0].cornerPoints[1].x,
            y: barcodes[0].cornerPoints[1].y,
          },
          bottomRight: {
            x: barcodes[0].cornerPoints[2].x,
            y: barcodes[0].cornerPoints[2].y,
          },
          bottomLeft: {
            x: barcodes[0].cornerPoints[3].x,
            y: barcodes[0].cornerPoints[3].y,
          },
        },
      };
      return result;
    }

    return null;
  }
}

export default NativeBarcodeScanner;
