import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import BarcodeScanner, {
  BarcodeResult,
  SCANNER_TYPE,
} from "../barcodeScanner/BarcodeScanner";
import ScannerSingleton from "../barcodeScanner/ScannerSingleton";

const cameraAvailable = BarcodeScanner.cameraAvailable();

const useScanner = (elementId: string) => {
  const [code, setCode] = useState<string | null>(null);
  const [scannerType, setScannerType] = useState<SCANNER_TYPE>(
    SCANNER_TYPE.ZXING
  );
  const [position, setPosition] = useState<BarcodeResult["position"] | null>(
    null
  );
  const [error, setError] = useState<Error | null>(null);
  const [failCamera, setFailCamera] = useState<boolean>(false);
  const [scanner, setScanner] = useState<BarcodeScanner | null>(null);

  const onScanSuccess = useCallback((result: BarcodeResult | null) => {
    setCode(result?.text ?? null);
    if (result && result.text !== "") {
      setPosition(result.position);
    }
  }, []);

  const onScanFailure = useCallback((qrError: Error) => {
    setError(qrError);
  }, []);

  useEffect(() => {
    ScannerSingleton.getInstance(elementId, onScanSuccess, onScanFailure).then(
      (instance) => {
        setScanner(instance);
        setScannerType(instance.getScannerType());
      }
    );

    return () => {
      ScannerSingleton.destroyInstance();
      setScanner(null);
    };
  }, [elementId, onScanFailure, onScanSuccess]);

  const start = useCallback(() => {
    scanner?.render().catch(() => setFailCamera(true));
  }, [scanner]);

  const stop = useCallback(() => {
    scanner?.stop();
  }, [scanner]);

  const reset = useCallback(() => {
    setCode(null);
    setError(null);
    setPosition(null);
  }, []);

  const isCameraAvailable = useMemo(
    () => cameraAvailable && !failCamera,
    [failCamera]
  );

  const scanFile = useCallback(
    (file: File) => {
      scanner?.scanFile(file).then(onScanSuccess).catch(onScanFailure);
    },
    [onScanFailure, onScanSuccess, scanner]
  );

  const enable = useCallback(() => {
    scanner?.enable();
  }, [scanner]);

  const disable = useCallback(() => {
    scanner?.disable();
  }, [scanner]);

  const isSupported = useCallback((type: SCANNER_TYPE) => {
    return scanner?.isSupported(type);
  }, [scanner]);

  useEffect(() => {
    scanner?.changeScanner(scannerType);
  }, [scanner, scannerType]);

  const changeScanner = useCallback(
    (type: SCANNER_TYPE) => {
      setScannerType(type);
    },
    [scanner]
  );

  return {
    code,
    position,
    error,
    isEnable: !!scanner?.isEnable,
    enable,
    disable,
    start,
    stop,
    reset,
    scanFile,
    changeScanner,
    isSupported,
    scannerType,
    cameraAvailable: isCameraAvailable,
  };
};

export default useScanner;
