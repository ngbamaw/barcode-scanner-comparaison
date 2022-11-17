import { BarcodeFormat } from "./zxing";
import { BarcodeResult } from "./BarcodeScanner";

interface IBarcodeScanner {
    scanBarcode(imageData: ImageData, format?: BarcodeFormat): Promise<BarcodeResult | null>;
    scanFile(file: File): Promise<BarcodeResult | null>;
}

export default IBarcodeScanner;