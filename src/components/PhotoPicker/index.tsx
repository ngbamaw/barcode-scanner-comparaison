import { Icon } from "@iconify/react";
import React, { useCallback, useEffect, useState } from "react";

import Loader from "../Loader";
import { fileToImage } from "../../utils";

import styles from "../PhotoPicker/styles.module.scss";
import classNames from "classnames";

interface IProps {
  file?: File | null;
  onChange: (file: File) => void;
  className?: string;
}

const PhotoPicker: React.FC<IProps> = ({ file = null, onChange, className }) => {
  const [currentFile, setCurrentFile] = useState<File | null>(file);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (currentFile) {
      setLoading(true);
      fileToImage(currentFile).then((data) => {
        setPreviewImage(data.src);
        setLoading(false);
        onChange(currentFile);
      });
    }
  }, [currentFile, onChange]);

  const handleOnFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        setCurrentFile(file);
      }
    },
    []
  );

  return (
    <label className={classNames(styles.inputFile, className)}>
      <Loader show={loading} />
      {!previewImage && (
        <div className={styles.picker}>
          <div tabIndex={-1} role={"button"} className={styles.btnFile}>
            <Icon
              icon={"material-symbols:add-a-photo"}
              color={"#186860"}
              width={"48"}
              height={"48"}
            />
          </div>
          <p>Prendre en photo le code barre</p>
          <p>(Attention à ce qu&apos;il soit nettement visible)</p>
        </div>
      )}
      {previewImage && (
        <>
          <img
            className={styles.scannerPreview}
            src={previewImage}
            alt={"preview"}
          />
          <div className={styles.picker}>
            <div tabIndex={-1} role={"button"} className={styles.btnFile}>
              <Icon
                icon={"material-symbols:edit"}
                color={"white"}
                width={"48"}
                height={"48"}
              />
            </div>
            <p>Modifier la photo</p>
          </div>
        </>
      )}
      <input
        type={"file"}
        accept={"image/*"}
        capture={"user"}
        onChange={handleOnFileChange}
      />
    </label>
  );
};

export default PhotoPicker;
