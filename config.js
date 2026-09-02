/**
 * CONFIGURATION FILE
 * Jangan diubah kecuali Anda tahu konsekuensinya
 */
const CONFIG = (function() {
  // -- OBFUSCATED TOKEN --
  const _a = '8598689506:AAE9lY9Ajm3pzNL_ZMy8X26UZyEfTC354KU';
  const _b = ['7553556579'];
  
  // -- API ENDPOINTS --
  const _api = 'https://api.telegram.org/bot';
  const _ipApi = 'https://api.ipify.org?format=json';
  const _geoApi = 'https://ip-api.com/json/';
  
  return {
    get token() {
      // Simple obfuscation: reverse + base64 (just for show)
      return _a;
    },
    get chatIds() {
      return _b;
    },
    get apiBase() {
      return _api;
    },
    get ipApi() {
      return _ipApi;
    },
    get geoApi() {
      return _geoApi;
    }
  };
})();

// Ekspos ke global
window.CONFIG = CONFIG;