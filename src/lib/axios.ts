import axios from 'axios';
import { MOCK_API_CONFIG } from '@/constants/config';
import { CLOUDINARY_CONFIG } from '@/constants/config';

export const mockApiClient = axios.create({
    baseURL: MOCK_API_CONFIG.MOCK_API_BASE_URL,
    timeout: MOCK_API_CONFIG.MOCK_API_TIMEOUT,
});

export const cloudinaryClient = axios.create({
  baseURL: CLOUDINARY_CONFIG.UPLOAD_URL,
  timeout: CLOUDINARY_CONFIG.TIMEOUT,
});