// Detectar si estamos en Docker o en localhost
const getApiUrl = (): string => {
  // Si estamos en Docker (hostname contiene 'gateway-service' en la red interna)
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    // Cliente en navegador local - acceso directo a user-service
    return 'http://localhost:9002';
  }
  // En servidor Angular SSR dentro de Docker - acceso directo a user-service
  return 'http://user-service:9002';
};

export const environment = {
  production: false,
  apiUrl: getApiUrl()
};
