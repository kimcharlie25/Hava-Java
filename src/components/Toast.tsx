import React, { useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error';

interface ToastProps {
    message: string;
    type: ToastType;
    isVisible: boolean;
    onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, isVisible, onClose }) => {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                onClose();
            }, 3000); // Auto close after 3 seconds
            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose]);

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none px-4">
            <div className="pointer-events-auto animate-fade-in-up w-full max-w-sm">
                <div className={`flex items-center space-x-3 px-6 py-4 rounded-xl shadow-2xl border ${type === 'success'
                    ? 'bg-white border-green-100 text-gray-800'
                    : 'bg-white border-red-100 text-gray-800'
                    }`}>
                    {type === 'success' ? (
                        <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                    ) : (
                        <XCircle className="h-6 w-6 text-red-500 flex-shrink-0" />
                    )}

                    <p className="font-medium text-sm md:text-base flex-1">{message}</p>

                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
                    >
                        <X className="h-4 w-4 text-gray-400" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Toast;
