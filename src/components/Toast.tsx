import React, { useEffect } from 'react';

interface ToastProps {
  message: string | null;
  type?: 'success' | 'info';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'info', onClose }) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, 2800);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div
      role="status"
      className="fixed left-1/2 bottom-8 -translate-x-1/2 z-50 flex items-center gap-2.5 px-5 py-2.5 rounded-full text-[13px] font-medium shadow-2xl bg-[#F5F3EC] text-[#0B0B0B] border border-[#2A2A2A]/20 transition-all select-none animate-[pop_0.2s_ease-out]"
    >
      <i
        className={`ti ${type === 'success' ? 'ti-check' : 'ti-info-circle'} text-[16px] text-[#16140F]`}
        aria-hidden="true"
      ></i>
      <span>{message}</span>
    </div>
  );
};
