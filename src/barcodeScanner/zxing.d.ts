enum BarcodeFormat {
  EAN_8 = 'EAN_8',
  EAN_13 = 'EAN_13',
  CODE_128 = 'CODE_128',
  CODE_39 = 'CODE_39',
  ITF = 'ITF',
  QR_CODE = 'QR_CODE',
  DATA_MATRIX = 'DATA_MATRIX',
  PDF_417 = 'PDF_417',
  AZTEC = 'AZTEC',
  CODABAR = 'CODABAR',
  UPC_A = 'UPC_A',
  UPC_E = 'UPC_E',
  UPC_EAN_EXTENSION = 'UPC_EAN_EXTENSION',
  RSS_14 = 'RSS_14',
}
interface IPosition {
  x: number;
  y: number;
}

export interface IBarcodeResult {
  format: BarcodeFormat;
  text: string;
  error: string;
  position: {
    topLeft: IPosition;
    topRight: IPosition;
    bottomRight: IPosition;
    bottomLeft: IPosition;
  };
}

export interface IZXing {
  _malloc(byteLength: number): number;
  HEAPU8: Uint8Array;
  _free(buffer: number): void;
  readBarcodeFromPixmap(buffer: number, width: number, height: number, tryHarder: boolean, format: string): IBarcodeResult;
  readBarcodeFromImage(buffer: number, length: number, tryHarder: boolean, format: string): IBarcodeResult;
}
export default function ZXing(): Promise<IZXing>;
