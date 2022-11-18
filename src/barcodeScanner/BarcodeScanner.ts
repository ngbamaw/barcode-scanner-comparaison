import Camera from "../barcodeScanner/Camera";
import IBarcodeScanner from "../barcodeScanner/IBarcodeScanner";
import NativeBarcodeScanner from "../barcodeScanner/NativeBarcodeScanner";
import { IBarcodeResult } from "../barcodeScanner/zxing";
import ZxingBarcodeScanner from "./ZxingBarcodeScanner";

export type SuccessHandler = (result: IBarcodeResult | null) => void;
export type ErrorHandler = (error: Error) => void;

export enum SCANNER_TYPE {
  NATIVE = "NATIVE",
  ZXING = "ZXING",
}

class BarcodeScanner {
  private scanner: IBarcodeScanner;
  private scannerType: SCANNER_TYPE;
  private successHandler: SuccessHandler;
  private errorHandler: ErrorHandler;
  private camera: Camera | null = null;
  private activated = true;

  private constructor(
    element: HTMLElement | string,
    scanner: IBarcodeScanner,
    scannerType: SCANNER_TYPE,
    successHandler: SuccessHandler,
    errorHandler: ErrorHandler
  ) {
    this.successHandler = successHandler;
    this.errorHandler = errorHandler;
    this.activated = true;
    this.scanner = scanner;
    this.scannerType = scannerType;

    if (Camera.isAccessible()) {
      this.camera = new Camera(element);
    }
  }

  public static async createInstance(
    element: HTMLElement | string,
    successHandler: SuccessHandler,
    errorHandler: ErrorHandler,
    scanner: SCANNER_TYPE = SCANNER_TYPE.ZXING
  ): Promise<BarcodeScanner> {
    const scannerInstance: IBarcodeScanner =
      await BarcodeScanner.getScannerInstance(scanner);

    return new BarcodeScanner(
      element,
      scannerInstance,
      scanner,
      successHandler,
      errorHandler
    );
  }

  private static getScannerInstance(type: SCANNER_TYPE) {
    switch (type) {
      case SCANNER_TYPE.NATIVE:
        return NativeBarcodeScanner.createInstance();

      case SCANNER_TYPE.ZXING:
        return ZxingBarcodeScanner.createInstance();

      default:
        return ZxingBarcodeScanner.createInstance();
    }
  }

  public getScannerType(): SCANNER_TYPE {
    return this.scannerType;
  }

  public isSupported(type: SCANNER_TYPE) {
    if (type === SCANNER_TYPE.NATIVE) {
      return NativeBarcodeScanner.isSupported();
    }

    return true;
  }

  public async changeScanner(type: SCANNER_TYPE) {
    if (type !== this.scannerType) {
      this.scannerType = type;
      this.scanner = await BarcodeScanner.getScannerInstance(type);
    }
  }

  async scanFile(file: File) {
    return this.scanner.scanFile(file);
  }

  static cameraAvailable() {
    return Camera.isAccessible();
  }

  isEnable() {
    return this.activated;
  }

  disable() {
    this.activated = false;
  }

  enable() {
    this.activated = true;
  }

  setPreview(imageData: ImageData) {
    const preview = document.getElementById("preview") as HTMLImageElement;

    const canvasElement = document.createElement("canvas");
    canvasElement.width = imageData.width;
    canvasElement.height = imageData.height;
    const canvas = canvasElement.getContext("2d") as CanvasRenderingContext2D;
    canvas.putImageData(imageData, 1, 1);
    const result = canvasElement.toDataURL();
    preview.src = result;
  }

  private getImageDataFromCanvas(
    canvasElement: HTMLCanvasElement,
    x = 0,
    y = 0,
    width = 0,
    height = 0
  ) {
    const canvas = canvasElement.getContext("2d") as CanvasRenderingContext2D;
    const imageData = canvas.getImageData(x, y, width, height);
    return imageData;
  }

  stop() {
    this.camera?.stopCamera();
  }

  async render() {
    const onCallback = (
      canvasElement: HTMLCanvasElement,
      container: HTMLElement
    ) => {
      if (!this.activated) {
        return;
      }

      const width = container.clientWidth;

      if (width === 0) {
        return;
      }

      const imageData = this.getImageDataFromCanvas(
        canvasElement,
        0,
        0,
        width,
        canvasElement.height
      );

      this.scanner
        .scanBarcode(imageData)
        .then((result) => {
            this.successHandler(result);
        })
        .catch((error) => {
          this.errorHandler(error);
        });
    };

    await this.camera?.startCamera(onCallback, 15);
  }
}

export type BarcodeResult = IBarcodeResult;
export default BarcodeScanner;
