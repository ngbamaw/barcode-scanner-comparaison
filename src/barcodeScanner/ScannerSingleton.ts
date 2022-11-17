import {
  ErrorHandler,
  SuccessHandler,
} from "./ZxingBarcodeScanner";
import BarcodeScanner from "./BarcodeScanner";

class ScannerSingleton {
  private static instance: BarcodeScanner | null;
  private static element: HTMLElement | string;
  private static successHandler: SuccessHandler;
  private static errorHandler: ErrorHandler;

  private static async createInstance() {
    ScannerSingleton.instance = await BarcodeScanner.createInstance(
      ScannerSingleton.element,
      ScannerSingleton.successHandler,
      ScannerSingleton.errorHandler
    );
  }
  public static async getInstance(
    element: HTMLElement | string,
    successHandler: SuccessHandler,
    errorHandler: ErrorHandler
  ): Promise<BarcodeScanner> {
    ScannerSingleton.element = element;
    ScannerSingleton.successHandler = successHandler;
    ScannerSingleton.errorHandler = errorHandler;
    if (!ScannerSingleton.instance || ScannerSingleton.element !== element) {
      await ScannerSingleton.createInstance();
    }
    return ScannerSingleton.instance as BarcodeScanner;
  }

  public static destroyInstance() {
    ScannerSingleton.instance?.stop();
    ScannerSingleton.instance = null;
  }
}

export default ScannerSingleton;
