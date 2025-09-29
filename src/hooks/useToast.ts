import { useState, useCallback } from 'react';
import type { ToastProps } from '../components/common/Toast';

let toastId = 0;

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const addToast = useCallback((
    message: string, 
    type: 'success' | 'error' | 'warning' | 'info' = 'info',
    duration: number = 5000
  ) => {
    const id = `toast-${++toastId}`;
    const newToast: ToastProps = {
      id,
      message,
      type,
      duration,
      onClose: removeToast
    };

    setToasts(prev => [...prev, newToast]);
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const success = useCallback((message: string, duration?: number) => 
    addToast(message, 'success', duration), [addToast]);

  const error = useCallback((message: string, duration?: number) => 
    addToast(message, 'error', duration), [addToast]);

  const warning = useCallback((message: string, duration?: number) => 
    addToast(message, 'warning', duration), [addToast]);

  const info = useCallback((message: string, duration?: number) => 
    addToast(message, 'info', duration), [addToast]);

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info
  };
};

export default useToast;
