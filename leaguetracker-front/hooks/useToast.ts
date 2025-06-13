import {ExternalToast, toast} from 'sonner';

export type ToastType = 'success' | 'error' | 'info' | 'warning' | 'loading';

export interface ToastOptions extends ExternalToast {
  duration?: number;

  showIcon?: boolean;
}

export function useToast() {
  const showToast = (
    message: string,
    type: ToastType = 'info',
    description?: string,
    options?: ToastOptions
  ) => {
    const toastOptions: ToastOptions = {
      duration: 5000,
      ...options,
    };

    if (options?.showIcon !== false) {
      toastOptions.icon = getIconForType(type);
    }

    switch (type) {
      case 'success':
        return toast.success(message, {
          description,
          ...toastOptions,
        });
      case 'error':
        return toast.error(message, {
          description,
          ...toastOptions,
        });
      case 'warning':
        return toast.warning(message, {
          description,
          ...toastOptions,
        });
      case 'loading':
        return toast.loading(message, {
          description,
          ...toastOptions,
        });
      case 'info':
      default:
        return toast(message, {
          description,
          ...toastOptions,
        });
    }
  };

  const updateToast = (
    id: string,
    message: string,
    type: ToastType = 'info',
    description?: string,
    options?: ToastOptions
  ) => {
    toast.dismiss(id);

    const toastOptions: ToastOptions = {
      duration: 5000,
      id,
      ...options,
    };

    if (options?.showIcon !== false) {
      toastOptions.icon = getIconForType(type);
    }

    showToast(message, type, description, toastOptions);
  };

  const dismissToast = (id: string) => {
    toast.dismiss(id);
  };

  const success = (message: string, description?: string, options?: ToastOptions) =>
    showToast(message, 'success', description, options);

  const error = (message: string, description?: string, options?: ToastOptions) =>
    showToast(message, 'error', description, options);

  const info = (message: string, description?: string, options?: ToastOptions) =>
    showToast(message, 'info', description, options);

  const warning = (message: string, description?: string, options?: ToastOptions) =>
    showToast(message, 'warning', description, options);

  const loading = (message: string, description?: string, options?: ToastOptions) =>
    showToast(message, 'loading', description, options);

  const promise = <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    },
    options?: ToastOptions
  ) => {
    return toast.promise(promise, {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
      ...options,
    });
  };

  return {
    showToast,
    updateToast,
    dismissToast,
    success,
    error,
    info,
    warning,
    loading,
    promise,
  };
}

function getIconForType(type: ToastType) {
  switch (type) {
    case 'success':
      return '✅';
    case 'error':
      return '❌';
    case 'warning':
      return '⚠️';
    case 'loading':
      return '⏳';
    case 'info':
    default:
      return 'ℹ️';
  }
}
