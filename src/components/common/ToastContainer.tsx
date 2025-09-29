import React from 'react';
import Toast, { type ToastProps } from './Toast';

interface ToastContainerProps {
  toasts: ToastProps[];
  onCloseToast: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onCloseToast }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[10000] space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="transform transition-all duration-300 ease-in-out toast-slide-in"
        >
          <Toast
            id={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={onCloseToast}
          />
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
