import { mockApiClient } from '@/lib/axios';
import {
  type User,
  type UserFormData,
  usersArraySchema,
  userResponseSchema,
} from '@/features/users/schemas/users.schema';
import { USERS_ENDPOINTS } from '@/constants/endpoints';
import { uploadImageToCloudinary } from '@/lib/cloudinary';

export async function getAllUsers(): Promise<User[]> {
  const response = await mockApiClient.get(USERS_ENDPOINTS.getAll);

  const validatedData = usersArraySchema.parse(response.data);

  return validatedData;
}

function prepareUserDataSync(data: UserFormData): {
  apiData: Omit<UserFormData, 'avatarFile'>;
  avatarFile: File | null;
  localPreviewUrl: string | null;
} {
  const { avatarFile, ...userData } = data;

  if (avatarFile instanceof File) {
    const localPreviewUrl = URL.createObjectURL(avatarFile);
    
    return {
      apiData: {
        ...userData,
        avatar: '',
      },
      avatarFile,
      localPreviewUrl,
    };
  }

  return {
    apiData: userData,
    avatarFile: null,
    localPreviewUrl: null,
  };
}

async function uploadAndUpdateAvatar(
  userId: string,
  avatarFile: File
): Promise<string> {
  const avatarUrl = await uploadImageToCloudinary(avatarFile);
  
  await mockApiClient.put(USERS_ENDPOINTS.update(userId), {
    avatar: avatarUrl,
  });
  
  return avatarUrl;
}

export async function createUser(data: UserFormData): Promise<{
  user: User;
  avatarUploadPromise?: Promise<string>;
  localPreviewUrl?: string;
}> {
  const { apiData, avatarFile, localPreviewUrl } = prepareUserDataSync(data);
  
  const response = await mockApiClient.post(USERS_ENDPOINTS.create, apiData);
  const validatedData = userResponseSchema.parse(response.data);

  if (avatarFile) {
    const avatarUploadPromise = uploadAndUpdateAvatar(validatedData.id, avatarFile);
    
    return {
      user: validatedData,
      avatarUploadPromise,
      localPreviewUrl: localPreviewUrl || undefined,
    };
  }

  return { user: validatedData };
}

export async function getUserById(id: string): Promise<User> {
  const response = await mockApiClient.get(USERS_ENDPOINTS.getById(id));

  const validatedData = userResponseSchema.parse(response.data);

  return validatedData;
}

export async function updateUser({ 
  id, 
  data 
}: { 
  id: string; 
  data: UserFormData 
}): Promise<{
  user: User;
  avatarUploadPromise?: Promise<string>;
  localPreviewUrl?: string;
}> {
  const { apiData, avatarFile, localPreviewUrl } = prepareUserDataSync(data);
  
  const response = await mockApiClient.put(USERS_ENDPOINTS.update(id), apiData);
  const validatedData = userResponseSchema.parse(response.data);

  if (avatarFile) {
    const avatarUploadPromise = uploadAndUpdateAvatar(id, avatarFile);
    
    return {
      user: validatedData,
      avatarUploadPromise,
      localPreviewUrl: localPreviewUrl || undefined,
    };
  }

  return { user: validatedData };
}

export async function deleteUser(id: string): Promise<void> {
  await mockApiClient.delete(USERS_ENDPOINTS.delete(id));
}
