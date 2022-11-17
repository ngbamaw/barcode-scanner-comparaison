import { useCallback, useEffect, useState } from 'react';

type func = () => void;

const useTimeout = (delay = 0, active = true): [boolean, func, func] => {
  const [elapsed, setElapsed] = useState<boolean>(!active);
  const [timer, setTimer] = useState<any>(null);

  const action = useCallback(() => {
    const timeout = setTimeout(() => {
      setElapsed(true);
      clearTimeout(timeout);
      setTimer(null);
    }, delay);

    setTimer(timeout);
  }, [delay]);

  useEffect(() => {
    if (active) {
      action();
    }
  }, [action, active]);

  const cancel = useCallback(() => {
    clearTimeout(timer);
    setTimer(null);
    setElapsed(false);
  }, [timer]);

  const reset = useCallback(() => {
    cancel();
    action();
  }, [action, cancel]);

  return [elapsed, cancel, reset];
};

export default useTimeout;
