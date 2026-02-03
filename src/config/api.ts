// Zmień ten URL w zależności od środowiska
export const API_BASE_URL = 'https://aplikacja5v5.onrender.com';
// export const API_BASE_URL = 'http://localhost:5000'; // dla developmentu

// Helper funkcja do budowania pełnych URL-i
export const apiUrl = (endpoint: string) => `${API_BASE_URL}${endpoint}`;