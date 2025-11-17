export function installErrorLogger() {
  if (typeof window === 'undefined') {
    return;
  }

  // Log browser info for debugging
  console.log('Browser Info:', {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    cookieEnabled: navigator.cookieEnabled,
    onLine: navigator.onLine,
    localStorageAvailable: typeof Storage !== 'undefined',
    indexedDBAvailable: typeof indexedDB !== 'undefined',
  });

  // Check for localStorage issues
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    console.log('localStorage: OK');
  } catch (e) {
    console.error('localStorage: FAILED', e);
  }

  // Check for Service Workers
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      if (registrations.length > 0) {
        console.warn('Service Workers registered:', registrations.length);
        registrations.forEach((reg, i) => {
          console.warn(`Service Worker ${i}:`, reg.scope);
        });
      } else {
        console.log('No Service Workers registered');
      }
    });
  }

  const originalError = console.error;
  console.error = (message?: any, ...optionalParams: any[]) => {
    try {
      if (message instanceof Error) {
        originalError('console.error caught Error:', {
          name: message.name,
          message: message.message,
          stack: message.stack,
        });
      } else if (
        typeof message === 'string' &&
        optionalParams.length > 0 &&
        optionalParams[0] instanceof Error
      ) {
        const err = optionalParams[0];
        originalError('console.error caught Error object in params:', {
          name: err.name,
          message: err.message,
          stack: err.stack,
        });
      }
    } catch {
      // ignore logging failures
    }

    originalError(message, ...optionalParams);
  };

  window.addEventListener('error', (event) => {
    try {
      const stack = event?.error?.stack || 'no stack';
      originalError('window.onerror:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: stack,
      });
    } catch {
      originalError('window.onerror: <unavailable>');
    }
  });

  window.addEventListener('unhandledrejection', (event) => {
    try {
      const reason: any = event?.reason;
      const stack =
        reason && typeof reason === 'object' && 'stack' in reason
          ? reason.stack
          : JSON.stringify(reason);
      originalError('window.unhandledrejection:', {
        reason: reason,
        stack: stack,
      });
    } catch {
      originalError('window.unhandledrejection: <unavailable>');
    }
  });
}

