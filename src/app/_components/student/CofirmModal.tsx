'use client';

import { AlertTriangle, Info, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  variant?: 'danger' | 'info';
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Xác nhận thao tác',
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy bỏ',
  isLoading = false,
  variant = 'danger',
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const isDanger = variant === 'danger';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl transition-all sm:p-7">
        {/* Nút đóng góc phải */}
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="absolute right-4 top-4 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
        >
          <X className="size-5" />
        </button>

        <div className="flex flex-col items-center text-center">
          {/* Biểu tượng Icon */}
          <div
            className={`mb-4 grid size-12 place-items-center rounded-2xl ${
              isDanger ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'
            }`}
          >
            {isDanger ? <AlertTriangle className="size-6" /> : <Info className="size-6" />}
          </div>

          {/* Tiêu đề & Nội dung */}
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          <p className="mt-2 text-xs leading-relaxed text-slate-500">{message}</p>

          {/* Cụm Nút Thao Tác */}
          <div className="mt-6 flex w-full gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className={`flex-1 rounded-xl py-2.5 text-xs font-bold text-white shadow-sm transition-colors disabled:opacity-50 ${
                isDanger
                  ? 'bg-rose-600 hover:bg-rose-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isLoading ? 'Đang xử lý...' : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}