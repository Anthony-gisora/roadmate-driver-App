import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, {
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';

// Token storage keys
const TOKEN_STORAGE_KEY = '@MyApp:auth_token';

// Helper to get token
async function getAuthToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

// Base URLs
const DEFAULT_DEV_BASE_URL = 'http://192.168.100.45:5000/api';
const DEFAULT_SOCKET_URL = 'http://192.168.100.45:5000';
const DEFAULT_PROD_SOCKET_URL = 'https://roadmateassist.onrender.com:5000';
const DEFAULT_PROD_BASE_URL = 'https://roadmateassist.onrender.com/api';
const DEFAULT_IMAGE_URL = 'https://roadmateassist.onrender.com/api/images'

function getBaseUrl(): string {
  //return __DEV__ ? DEFAULT_DEV_BASE_URL : DEFAULT_PROD_BASE_URL;
  return DEFAULT_PROD_BASE_URL;
}

export function getSocketUrl(): string {
  //return __DEV__ ? DEFAULT_SOCKET_URL : DEFAULT_PROD_SOCKET_URL;
  return DEFAULT_PROD_SOCKET_URL;
}

const apiClient: AxiosInstance = axios.create({
  baseURL: getBaseUrl(),
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ✅ Correctly typed interceptor
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => Promise.reject(error)
);

export { apiClient, DEFAULT_IMAGE_URL, DEFAULT_PROD_BASE_URL, DEFAULT_SOCKET_URL };

