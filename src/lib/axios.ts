import axios from 'axios';
import { MOCK_API_CONFIG } from '@/constants/config';

export const mockApiClient = axios.create({
    baseURL: MOCK_API_CONFIG.MOCK_API_BASE_URL,
    timeout: MOCK_API_CONFIG.MOCK_API_TIMEOUT,
});