import React, {
  CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import classNames from "classnames";
import { CSSTransition } from "react-transition-group";

import useScanner from "../../hooks/useScanner";
import PhotoPicker from "../PhotoPicker";
import useTimeout from "../../hooks/useTimeout";

import styles from "./styles.module.scss";
import { SCANNER_TYPE } from "../../barcodeScanner/BarcodeScanner";

interface IProps {
  width?: CSSProperties["width"];
  height?: CSSProperties["height"];
  enableCamera?: boolean;
  onCode?: (code: string | null) => void;
  file?: File;
}

const Scanner: React.FC<IProps> = ({
  width = 0,
  height = 0,
  onCode,
  enableCamera = false,
  file = null,
}) => {
  const {
    code,
    position,
    start,
    stop,
    scanFile,
    changeScanner,
    scannerType,
    cameraAvailable,
    isSupported,
    disable,
    enable,
    error,
  } = useScanner("reader");
  const [detected, setDetected] = useState<boolean>(false);
  const [currentCode, setCurrentCode] = useState<string | null>(null);
  const [timeout, setTimeoutValue] = useState<any>();
  const [currentFile, setCurrentFile] = useState<File | null>(file);
  const [isReady, _, wait] = useTimeout(3 * 1000, false);

  const highlight = useRef<HTMLDivElement>(null);
  const DURATION = 300;

  useEffect(() => {
    if (code) {
      setCurrentCode(code);
    }
  }, [code]);

  useEffect(() => {
    if (enableCamera && cameraAvailable) {
      start();
    }

    return () => stop();
  }, [cameraAvailable, enableCamera, start, stop]);

  useEffect(() => {
    if (!isReady) {
      disable();
    }

    if (isReady && enableCamera) {
      enable();
    }
  }, [isReady, enableCamera, disable, enable]);

  useEffect(() => {
    if (currentFile) {
      scanFile(currentFile);
    }
  }, [currentFile, scanFile]);

  const onChangePhoto = useCallback((file: File) => {
    setCurrentFile(file);
  }, []);

  const onChangeScanner = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      changeScanner(e.target.value as SCANNER_TYPE);
    },
    []
  );

  useEffect(() => {
    if (error) console.error(error);
  }, [error]);

  useEffect(() => {
    if (code) {
      clearTimeout(timeout);
      setDetected(true);
    }
    if (!code && detected) {
      setTimeoutValue(
        setTimeout(() => {
          setDetected(false);
        }, 1000)
      );
    }
  }, [code, timeout]);

  const x1 = position?.topRight.x || 0;
  const x2 = position?.topLeft.x || 0;

  const displayCode = useMemo(
    () => cameraAvailable || currentFile,
    [cameraAvailable, currentFile]
  );

  return (
    <>
      <PhotoPicker
        className={classNames({
          [styles.hide]: cameraAvailable && enableCamera,
        })}
        onChange={onChangePhoto}
        file={file}
      />
      <div
        id={"reader"}
        className={classNames(styles.scanner, {
          [styles.hide]: !cameraAvailable || !enableCamera,
        })}
        style={{ width, height }}
      >
        {/* <span
          ref={detectedStatus}
          className={classNames(styles.detectionStatus, {
            [styles.codeDetected]: detected,
          })}
        >
          <Icon icon={"akar-icons:circle-check-fill"} />
          Code detecté
        </span> */}
        <img id={"preview"} className={styles.preview} />
      </div>
      {displayCode && (
        <p className={styles.code}>
          Code : <b>{currentCode || "Aucun code"}</b>
        </p>
      )}
      <select
        defaultValue={scannerType}
        className={styles.scannerChanger}
        onChange={onChangeScanner}
      >
        <option
          value={SCANNER_TYPE.NATIVE}
          disabled={!isSupported(SCANNER_TYPE.NATIVE)}
        >
          Native {!isSupported(SCANNER_TYPE.NATIVE) && "(unsupported)"}
        </option>
        <option value={SCANNER_TYPE.ZXING}>Wasm (zxing)</option>
      </select>

      <CSSTransition
        in={!!code}
        timeout={DURATION}
        unmountOnExit
        nodeRef={highlight}
        classNames={{
          enter: styles.highlightCodeEnter,
          enterActive: styles.highlightCodeActive,
          exit: styles.highlightCodeExit,
          exitActive: styles.highlightCodeExitActive,
        }}
      >
        <div
          className={styles.highlightCode}
          ref={highlight}
          style={{
            top: position?.topLeft.y,
            left: position?.topLeft.x,
            width: x1 - x2,
          }}
        />
      </CSSTransition>
    </>
  );
};

export default Scanner;
