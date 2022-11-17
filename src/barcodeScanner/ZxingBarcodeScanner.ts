import ZXingModule, {
  IZXing,
  IBarcodeResult as BarcodeResultType,
} from "./zxing";
import IBarcodeScanner from "./IBarcodeScanner";

export type SuccessHandler = (result: BarcodeResultType) => void;
export type ErrorHandler = (error: Error) => void;

class ZxingBarcodeScanner implements IBarcodeScanner {
  private zxing: IZXing;

  private constructor(zxing: IZXing) {
    this.zxing = zxing;
  }

  static async createInstance(): Promise<ZxingBarcodeScanner> {
    const zxing = await ZXingModule();
    if (!zxing) {
      throw new Error("Failed to create instance");
    }
    return new ZxingBarcodeScanner(zxing);
  }

  async scanBarcode(imageData: ImageData) {
    const sourceBuffer = imageData.data;
    const buffer = this.zxing._malloc(sourceBuffer.byteLength);
    this.zxing.HEAPU8.set(sourceBuffer, buffer);

    const result = this.zxing.readBarcodeFromPixmap(
      buffer,
      imageData.width,
      imageData.height,
      true,
      ""
    );

    this.zxing._free(buffer);
    
    return result;
  }

  scanFile(file: File): Promise<BarcodeResultType | null> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = (evt) => {
        if (evt.target === null) {
          return;
        }
        const fileData = new Uint8Array(evt.target.result as ArrayBufferLike);
        const buffer = this.zxing._malloc(fileData.length);
        this.zxing.HEAPU8.set(fileData, buffer);
        const result = this.zxing.readBarcodeFromImage(
          buffer,
          fileData.length,
          true,
          ""
        );
        this.zxing._free(buffer);

        if (result.error) {
          reject(new Error(result.error));
        } else {
          resolve(result);
        }
      };

      reader.readAsArrayBuffer(file);
    });
  }
}

export default ZxingBarcodeScanner;
