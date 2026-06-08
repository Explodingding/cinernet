'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface ToastProps {
  message: string | null;
  onDismiss: () => void;
}

export function Toast({ message, onDismiss }: ToastProps) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 px-4 py-3 rounded-lg text-sm font-medium shadow-lg max-w-md text-center"
          style={{
            background: 'rgba(15, 23, 42, 0.96)',
            border: '1px solid rgba(52, 211, 153, 0.35)',
            color: '#e2e8f0',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          }}
          onClick={onDismiss}
          role="status"
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
