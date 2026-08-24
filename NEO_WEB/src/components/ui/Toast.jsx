// components/ui/Toast.jsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  RiCheckLine,
  RiErrorWarningLine,
  RiAlertLine,
  RiInformationLine,
  RiCloseLine,
} from 'react-icons/ri';

const ToastContext = createContext(null);

const ICONS = {
  success: <RiCheckLine size={16} />,
  error:   <RiErrorWarningLine size={16} />,
  warning: <RiAlertLine size={16} />,
  info:    <RiInformationLine size={16} />,
};

let toastId = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ title, message, type = 'info', duration = 4000 }) => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="toast-container" aria-live="polite">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast toast-${toast.type}`} role="alert">
            <span className="toast-icon">{ICONS[toast.type]}</span>
            <div className="toast-body">
              {toast.title   && <div className="toast-title">{toast.title}</div>}
              {toast.message && <div className="toast-message">{toast.message}</div>}
            </div>
            <button
              className="toast-close"
              onClick={() => removeToast(toast.id)}
              aria-label="Dismiss notification"
            >
              <RiCloseLine size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

export default ToastProvider;
