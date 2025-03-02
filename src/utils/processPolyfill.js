// Polyfill per process.env nel browser
if (typeof window !== 'undefined' && (typeof process === 'undefined' || !process.env)) {
  window.process = {
    env: {
      NODE_ENV: 'development',
      PUBLIC_URL: '',
      REACT_APP_BASE_URL: window.location.origin,
      REACT_APP_API_URL: `${window.location.origin}/api`,
    }
  };
}

export default window.process; 