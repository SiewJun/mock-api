export const MOCK_API_CONFIG = {
  MOCK_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  MOCK_API_TIMEOUT: 10000,
} as const;

export const CLOUDINARY_CONFIG = {
  CLOUD_NAME: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
  UPLOAD_PRESET: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
  UPLOAD_URL: `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}`,
  TIMEOUT: 10000,
} as const;
