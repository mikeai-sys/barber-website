import { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react';

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};
const colors = {
  success: 'border-green-500/40 text-green-400',
  error: 'border-red-500/40 text-red-400',
  warning: 'border-yellow-500/40 text-yellow-400',
  info: 'border-[color:var(--color-gold)]/40 text-[color:var(--color-gold)]',
};

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
  }, []);

  const dismiss = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] flex flex-col gap-2 items-center pointer-events-none"
        style={{ bottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <AnimatePresence>
          {toasts.map(t => {
            const Icon = icons[t.type] || Info;
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className={`pointer-events-auto flex items-center gap-3 px-5 py-3 rounded-lg border bg-[color:var(--color-charcoal)]/95 backdrop-blur-lg shadow-2xl ${colors[t.type] || colors.info} max-w-sm`}
              >
                <Icon size={18} className="shrink-0" />
                <span className="text-sm text-[color:var(--color-bone)]">{t.message}</span>
                <button onClick={() => dismiss(t.id)} className="ml-auto text-[color:var(--color-ash)] hover:text-[color:var(--color-bone)] shrink-0"><X size={14} /></button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
