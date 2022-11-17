import cx from 'classnames';
import { CSSTransition } from 'react-transition-group';
import { useEffect, useRef, useState } from 'react';

import { LOADER_COLOR } from '../constants/loader';

import styles from './styles.module.scss';

type Props = {
  color?: LOADER_COLOR;
  show: boolean;
};

const Loader: React.FC<Props> = ({ color = LOADER_COLOR.PRIMARY, show }: Props) => {
  const [showLoader, setShowLoader] = useState(false);
  const nodeRef = useRef(null);

  useEffect(() => {
    if (show) {
      setShowLoader(true);
    } else {
      setShowLoader(false);
    }
  }, [show]);

  const className = cx(styles.lds_ellipsis, {
    [styles.primary]: color === LOADER_COLOR.PRIMARY,
    [styles.white]: color === LOADER_COLOR.WHITE,
  });

  return (
    <CSSTransition
      nodeRef={nodeRef}
      in={showLoader}
      timeout={300}
      unmountOnExit
      classNames={{
        enter: styles.backdropEnter,
        enterActive: styles.backdropEnterActive,
        exit: styles.backdropExit,
        exitActive: styles.backdropExitActive,
      }}>
      <div ref={nodeRef} className={styles.backdrop}>
        <div className={className}>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
    </CSSTransition>
  );
};

export default Loader;
