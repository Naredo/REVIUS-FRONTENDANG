// URL base del API: siempre a través del gateway.
// - En navegador: usa mismo origen (proxy) para evitar CORS.
// - En SSR: usa el gateway directo (por defecto en Docker), con override vía API_URL.
const getApiUrl = (): string => {
  if (typeof window !== 'undefined') {
    return '';
  }

  return process.env['API_URL'] ?? 'http://gateway-service:9001';
};

export const environment = {
  production: false,
  apiUrl: getApiUrl()
};
