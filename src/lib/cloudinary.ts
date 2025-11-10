import { cloudinaryClient } from '@/lib/axios';
import { CLOUDINARY_CONFIG } from '@/constants/config';
import axios from 'axios';

export interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
}

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

function validateImageFile(file: File): void {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error(
      'Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.'
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File size exceeds 10MB. Please upload a smaller image.');
  }
}

export async function uploadImageToCloudinary(file: File): Promise<string> {
  validateImageFile(file);

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_CONFIG.UPLOAD_PRESET);
  formData.append('folder', 'user_avatars');

  try {
    const response = await cloudinaryClient.post<CloudinaryUploadResponse>(
      '/image/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data.secure_url;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage =
        error.response?.data?.error?.message ||
        'Failed to upload image to Cloudinary';
      throw new Error(errorMessage);
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error('An unexpected error occurred during upload');
  }
}
