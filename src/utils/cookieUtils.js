/**
 * Utility per gestire i cookie dell'applicazione
 */

/**
 * Helper di debug per monitorare le operazioni sui cookie
 * @param {string} operazione - Il tipo di operazione eseguita
 * @param {string} nome - Il nome del cookie interessato
 * @param {any} valore - Il valore o il risultato
 * @param {Error|null} errore - L'errore se presente
 */
const debugCookie = (operazione, nome, valore, errore = null) => {
  // Solo in ambiente di sviluppo
  if (process.env.NODE_ENV !== 'production') {
    if (errore) {
      console.error(`Cookie Debug [${operazione}] ${nome}:`, errore);
    } else {
      console.log(`Cookie Debug [${operazione}] ${nome}:`, valore);
    }
  }
};

// Configurazione cookie
const COOKIE_CONFIG = {
  // Nome del cookie per il token di autenticazione
  AUTH_TOKEN_NAME: 'auth_token',
  // Durata token in giorni
  TOKEN_EXPIRES_DAYS: 7,
  // Path del cookie
  COOKIE_PATH: '/',
  // La proprietà SameSite (strict, lax, none)
  SAME_SITE: 'strict',
  // Se il cookie deve essere secure (solo https)
  // In produzione sarà automaticamente impostato a true se in HTTPS
  SECURE: false 
};

/**
 * Imposta un cookie con nome, valore e opzioni
 * @param {string} name - Il nome del cookie
 * @param {string} value - Il valore del cookie
 * @param {number} days - Durata in giorni (default: 7)
 * @param {string} path - Il percorso del cookie (default: '/')
 * @param {boolean} secure - Se il cookie deve essere inviato solo su HTTPS
 * @param {string} sameSite - Politica SameSite (default: 'strict')
 */
export const setCookie = (name, value, { days = 7, path = '/', secure = false, sameSite = 'strict' } = {}) => {
  try {
    const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
    const cookieValue = encodeURIComponent(value);
    
    let cookie = `${name}=${cookieValue}; expires=${expires}; path=${path}; samesite=${sameSite}`;
    
    // Aggiungi secure flag solo se richiesto o in ambiente di produzione
    if (secure || window.location.protocol === 'https:') {
      cookie += '; secure';
    }
    
    document.cookie = cookie;
    debugCookie('SET', name, { value: cookieValue, expires, path });
    return true;
  } catch (error) {
    debugCookie('SET_ERROR', name, null, error);
    return false;
  }
};

/**
 * Ottiene il valore di un cookie dal suo nome
 * @param {string} name - Il nome del cookie da recuperare
 * @returns {string|null} - Il valore del cookie o null se non trovato
 */
export const getCookie = (name) => {
  try {
    const cookies = document.cookie.split(';');
    const cookieName = `${name}=`;
    
    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.indexOf(cookieName) === 0) {
        const value = decodeURIComponent(cookie.substring(cookieName.length));
        debugCookie('GET', name, value);
        return value;
      }
    }
    debugCookie('GET_NOT_FOUND', name, null);
    return null;
  } catch (error) {
    debugCookie('GET_ERROR', name, null, error);
    return null;
  }
};

/**
 * Elimina un cookie impostando una data di scadenza nel passato
 * @param {string} name - Il nome del cookie da eliminare
 * @param {string} path - Il percorso del cookie (default: '/')
 * @returns {boolean} - True se l'operazione è riuscita
 */
export const deleteCookie = (name, path = '/') => {
  try {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path};`;
    debugCookie('DELETE', name, { path });
    return true;
  } catch (error) {
    debugCookie('DELETE_ERROR', name, null, error);
    return false;
  }
};

/**
 * Controlla se i cookie sono abilitati nel browser
 * @returns {boolean} - True se i cookie sono abilitati
 */
export const areCookiesEnabled = () => {
  try {
    setCookie('__test_cookie__', 'test', { days: 1 });
    const enabled = getCookie('__test_cookie__') === 'test';
    deleteCookie('__test_cookie__');
    debugCookie('CHECK_ENABLED', '__test_cookie__', enabled);
    return enabled;
  } catch (e) {
    debugCookie('CHECK_ENABLED_ERROR', '__test_cookie__', null, e);
    return false;
  }
};

/**
 * Salva il token di autenticazione sia nei cookie che nel localStorage
 * @param {string} token - Il token di autenticazione
 * @param {number} daysValid - Giorni di validità (default: 7)
 * @returns {boolean} - True se l'operazione è riuscita
 */
export const saveAuthToken = (token, daysValid = COOKIE_CONFIG.TOKEN_EXPIRES_DAYS) => {
  try {
    // Salva in localStorage 
    localStorage.setItem('token', token);
    
    // Salva anche nei cookie come backup
    setCookie(COOKIE_CONFIG.AUTH_TOKEN_NAME, token, { 
      days: daysValid, 
      path: COOKIE_CONFIG.COOKIE_PATH,
      sameSite: COOKIE_CONFIG.SAME_SITE,
      secure: COOKIE_CONFIG.SECURE || window.location.protocol === 'https:'
    });
    
    // Salva anche la data di scadenza per calcoli futuri
    const expiresAt = new Date(Date.now() + daysValid * 24 * 60 * 60 * 1000).getTime();
    localStorage.setItem('token_expires_at', expiresAt);
    
    debugCookie('SAVE_TOKEN', COOKIE_CONFIG.AUTH_TOKEN_NAME, { 
      localStorage: true, 
      cookie: true,
      expiresAt: new Date(expiresAt).toISOString()
    });
    return true;
  } catch (error) {
    debugCookie('SAVE_TOKEN_ERROR', COOKIE_CONFIG.AUTH_TOKEN_NAME, null, error);
    
    // Tentativo di fallback su solo cookie se localStorage fallisce
    try {
      setCookie(COOKIE_CONFIG.AUTH_TOKEN_NAME, token, { 
        days: daysValid, 
        path: COOKIE_CONFIG.COOKIE_PATH,
        sameSite: COOKIE_CONFIG.SAME_SITE,
        secure: COOKIE_CONFIG.SECURE || window.location.protocol === 'https:'
      });
      debugCookie('SAVE_TOKEN_FALLBACK', COOKIE_CONFIG.AUTH_TOKEN_NAME, { localStorage: false, cookie: true });
      return true;
    } catch (e) {
      debugCookie('SAVE_TOKEN_FALLBACK_ERROR', COOKIE_CONFIG.AUTH_TOKEN_NAME, null, e);
      return false;
    }
  }
};

/**
 * Recupera il token di autenticazione da localStorage o cookie
 * @returns {string|null} - Il token o null se non trovato
 */
export const getAuthToken = () => {
  try {
    // Prima prova da localStorage
    let token = localStorage.getItem('token');
    
    // Se non presente, prova dai cookie
    if (!token) {
      token = getCookie(COOKIE_CONFIG.AUTH_TOKEN_NAME);
      
      // Se trovato nei cookie ma non in localStorage, ripristina anche in localStorage
      if (token) {
        try {
          localStorage.setItem('token', token);
          
          // Ripristina anche la data di scadenza predefinita se mancante
          if (!localStorage.getItem('token_expires_at')) {
            const expiresAt = new Date(Date.now() + COOKIE_CONFIG.TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000).getTime();
            localStorage.setItem('token_expires_at', expiresAt);
          }
          
          debugCookie('GET_TOKEN_RESTORE', COOKIE_CONFIG.AUTH_TOKEN_NAME, { source: 'cookie', restored: true });
        } catch (e) {
          debugCookie('GET_TOKEN_RESTORE_ERROR', COOKIE_CONFIG.AUTH_TOKEN_NAME, { source: 'cookie', restored: false }, e);
        }
      } else {
        debugCookie('GET_TOKEN_NOT_FOUND', COOKIE_CONFIG.AUTH_TOKEN_NAME, null);
      }
    } else {
      debugCookie('GET_TOKEN', COOKIE_CONFIG.AUTH_TOKEN_NAME, { source: 'localStorage' });
      
      // Verifica se il token è scaduto nel localStorage
      const expiresAt = localStorage.getItem('token_expires_at');
      if (expiresAt && parseInt(expiresAt) < Date.now()) {
        debugCookie('TOKEN_EXPIRED', COOKIE_CONFIG.AUTH_TOKEN_NAME, { expiresAt: new Date(parseInt(expiresAt)).toISOString() });
        
        // Rimuovi il token scaduto
        removeAuthToken();
        return null;
      }
    }
    
    return token;
  } catch (error) {
    debugCookie('GET_TOKEN_ERROR', COOKIE_CONFIG.AUTH_TOKEN_NAME, null, error);
    
    // Fallback sui cookie se localStorage non è disponibile
    try {
      const token = getCookie(COOKIE_CONFIG.AUTH_TOKEN_NAME);
      debugCookie('GET_TOKEN_FALLBACK', COOKIE_CONFIG.AUTH_TOKEN_NAME, { source: 'cookie fallback' });
      return token;
    } catch (e) {
      debugCookie('GET_TOKEN_FALLBACK_ERROR', COOKIE_CONFIG.AUTH_TOKEN_NAME, null, e);
      return null;
    }
  }
};

/**
 * Verifica se esiste un token di autenticazione valido
 * @returns {boolean} - True se esiste un token valido
 */
export const hasValidToken = () => {
  const token = getAuthToken();
  return !!token;
};

/**
 * Rimuove il token di autenticazione da localStorage e cookie
 * @returns {boolean} - True se l'operazione è riuscita
 */
export const removeAuthToken = () => {
  let success = true;
  
  try {
    // Rimuovi da localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('token_expires_at');
  } catch (error) {
    debugCookie('REMOVE_TOKEN_LOCALSTORAGE_ERROR', 'token', null, error);
    success = false;
  }
  
  try {
    // Rimuovi dai cookie
    deleteCookie(COOKIE_CONFIG.AUTH_TOKEN_NAME);
  } catch (error) {
    debugCookie('REMOVE_TOKEN_COOKIE_ERROR', COOKIE_CONFIG.AUTH_TOKEN_NAME, null, error);
    success = false;
  }
  
  debugCookie('REMOVE_TOKEN', COOKIE_CONFIG.AUTH_TOKEN_NAME, { success });
  return success;
};

/**
 * Estende la durata del token attuale se presente
 * @param {number} daysValid - Nuova durata in giorni (default: 7)
 * @returns {boolean} - True se l'operazione è riuscita
 */
export const extendTokenValidity = (daysValid = COOKIE_CONFIG.TOKEN_EXPIRES_DAYS) => {
  const currentToken = getAuthToken();
  if (!currentToken) {
    debugCookie('EXTEND_TOKEN_ERROR', COOKIE_CONFIG.AUTH_TOKEN_NAME, { error: 'No token found' });
    return false;
  }
  
  return saveAuthToken(currentToken, daysValid);
}; 