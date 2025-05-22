import {ExternalToast, toast} from 'sonner';

/**
 * Tipos de toast disponibles
 */
export type ToastType = 'success' | 'error' | 'info' | 'warning' | 'loading';

/**
 * Opciones para el toast
 */
export interface ToastOptions extends ExternalToast {
  /**
   * Duración del toast en milisegundos
   * @default 5000
   */
  duration?: number;
  
  /**
   * Mostrar icono según el tipo
   * @default true
   */
  showIcon?: boolean;
}

/**
 * Hook personalizado para mostrar toasts con Sonner
 * Proporciona una interfaz simplificada y consistente
 */
export function useToast() {
  /**
   * Muestra un toast
   * @param message Mensaje principal del toast
   * @param type Tipo de toast (success, error, info, warning, loading)
   * @param description Descripción opcional
   * @param options Opciones adicionales
   * @returns ID del toast (útil para actualizar toasts de tipo loading)
   */
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
    
    // Añadir icono según el tipo si showIcon es true
    if (options?.showIcon !== false) {
      toastOptions.icon = getIconForType(type);
    }
    
    // Llamar al método correspondiente según el tipo
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
  
  /**
   * Actualiza un toast existente (reemplazándolo con uno nuevo)
   * @param id ID del toast a actualizar
   * @param message Nuevo mensaje
   * @param type Nuevo tipo
   * @param description Nueva descripción
   * @param options Nuevas opciones
   */
  const updateToast = (
    id: string,
    message: string,
    type: ToastType = 'info',
    description?: string,
    options?: ToastOptions
  ) => {
    // Primero eliminar el toast existente
    toast.dismiss(id);
    
    // Luego crear uno nuevo con el mismo ID
    const toastOptions: ToastOptions = {
      duration: 5000,
      id, // Usar el mismo ID
      ...options,
    };
    
    // Añadir icono según el tipo si showIcon es true
    if (options?.showIcon !== false) {
      toastOptions.icon = getIconForType(type);
    }
    
    // Mostrar el nuevo toast con el mismo ID
    showToast(message, type, description, toastOptions);
  };
  
  /**
   * Elimina un toast existente
   * @param id ID del toast a eliminar
   */
  const dismissToast = (id: string) => {
    toast.dismiss(id);
  };
  
  /**
   * Muestra un toast de éxito
   * @param message Mensaje principal
   * @param description Descripción opcional
   * @param options Opciones adicionales
   */
  const success = (message: string, description?: string, options?: ToastOptions) => 
    showToast(message, 'success', description, options);
  
  /**
   * Muestra un toast de error
   * @param message Mensaje principal
   * @param description Descripción opcional
   * @param options Opciones adicionales
   */
  const error = (message: string, description?: string, options?: ToastOptions) => 
    showToast(message, 'error', description, options);
  
  /**
   * Muestra un toast de información
   * @param message Mensaje principal
   * @param description Descripción opcional
   * @param options Opciones adicionales
   */
  const info = (message: string, description?: string, options?: ToastOptions) => 
    showToast(message, 'info', description, options);
  
  /**
   * Muestra un toast de advertencia
   * @param message Mensaje principal
   * @param description Descripción opcional
   * @param options Opciones adicionales
   */
  const warning = (message: string, description?: string, options?: ToastOptions) => 
    showToast(message, 'warning', description, options);
  
  /**
   * Muestra un toast de carga
   * @param message Mensaje principal
   * @param description Descripción opcional
   * @param options Opciones adicionales
   * @returns ID del toast para actualizarlo posteriormente
   */
  const loading = (message: string, description?: string, options?: ToastOptions) => 
    showToast(message, 'loading', description, options);
  
  /**
   * Muestra un toast de promesa
   * @param promise Promesa a monitorear
   * @param messages Mensajes para cada estado (loading, success, error)
   * @param options Opciones adicionales
   */
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

/**
 * Obtiene el icono correspondiente al tipo de toast
 * @param type Tipo de toast
 * @returns Emoji para el tipo de toast
 */
function getIconForType(type: ToastType) {
  switch (type) {
    case 'success':
      return '✅';
    case 'error':
      return '❌';
    case 'warning':
      return '⚠️';
    case 'loading':
      return '⏳'; // Aunque Sonner ya proporciona un spinner, por si acaso
    case 'info':
    default:
      return 'ℹ️';
  }
}
