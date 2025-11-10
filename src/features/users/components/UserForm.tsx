import { useEffect, useMemo, useState, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { Loader2, Upload, X, Image as ImageIcon } from 'lucide-react';
import { isAxiosError } from 'axios';
import {
  userFormSchema,
  type User,
  type UserFormData,
} from '@/features/users/schemas/users.schema';
import { useCreateUser, useUpdateUser } from '@/features/users/api/users.hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PhoneInput } from '@/components/ui/phone-input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/components/ui/field';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

type UserFormMode = 'create' | 'edit';

interface UserFormProps {
  mode: UserFormMode;
  initialData?: User;
  userId?: string;
}

function normalizeRole(role?: string): 'Admin' | 'User' | 'Guest' {
  if (role === 'Admin' || role === 'User' || role === 'Guest') {
    return role;
  }
  return 'User';
}

export function UserForm({ mode, initialData, userId }: UserFormProps) {
  const navigate = useNavigate();
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const defaultValues = useMemo<UserFormData>(() => {
    if (mode === 'edit' && initialData) {
      return {
        name: initialData.name,
        email: initialData.email,
        phoneNumber: initialData.phoneNumber,
        active: initialData.active,
        role: normalizeRole(initialData.role),
        avatar: initialData.avatar ?? '',
        bio: initialData.bio ?? '',
      };
    }

    return {
      name: '',
      email: '',
      phoneNumber: '',
      active: true,
      role: 'User',
      avatar: '',
      bio: '',
    };
  }, [initialData, mode]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    control,
    reset,
    setValue,
  } = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues,
  });

  useEffect(() => {
    reset(defaultValues);
    if (defaultValues.avatar) {
      setAvatarPreview(defaultValues.avatar);
    } else {
      setAvatarPreview(null);
    }
    setSelectedFile(null);
  }, [defaultValues, reset]);

  const isMutating =
    createUserMutation.isPending || updateUserMutation.isPending;
  const isFormSubmitting = isSubmitting || isMutating;

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('File size must be less than 10MB');
      return;
    }

    setSelectedFile(file);
    setValue('avatarFile', file);

    setValue('avatar', '');

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setSelectedFile(null);
    setAvatarPreview(null);
    setValue('avatarFile', undefined);
    setValue('avatar', '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAvatarUrlChange = (url: string) => {
    if (url) {
      setAvatarPreview(url);
      setSelectedFile(null);
      setValue('avatarFile', undefined);
    } else {
      if (!selectedFile) {
        setAvatarPreview(null);
      }
    }
  };

  const onSubmit = async (data: UserFormData) => {
    navigate('/');

    if (mode === 'edit' && !userId) {
      return;
    }

    try {
      if (mode === 'create') {
        await createUserMutation.mutateAsync(data);
      } else if (userId) {
        await updateUserMutation.mutateAsync({ id: userId, data });
      }
    } catch (error) {
      if (
        mode === 'edit' &&
        isAxiosError(error) &&
        error.response?.status === 404
      ) {
        navigate('/', { replace: true });
      }
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-6">
        <Field>
          <FieldLabel htmlFor="name">
            Name <span className="text-destructive">*</span>
          </FieldLabel>
          <FieldContent>
            <Input
              id="name"
              placeholder="Enter user's full name"
              {...register('name')}
              disabled={isFormSubmitting}
              aria-invalid={!!errors.name}
            />
            <FieldError errors={[errors.name]} />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel htmlFor="email">
            Email <span className="text-destructive">*</span>
          </FieldLabel>
          <FieldContent>
            <Input
              id="email"
              type="email"
              placeholder="Enter email address"
              {...register('email')}
              disabled={isFormSubmitting}
              aria-invalid={!!errors.email}
            />
            <FieldError errors={[errors.email]} />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel htmlFor="phoneNumber">
            Phone Number <span className="text-destructive">*</span>
          </FieldLabel>
          <FieldContent>
            <Controller
              name="phoneNumber"
              control={control}
              render={({ field }) => (
                <PhoneInput
                  id="phoneNumber"
                  placeholder="Enter phone number"
                  value={field.value}
                  onChange={(value) => field.onChange(value || '')}
                  disabled={isFormSubmitting}
                  defaultCountry="MY"
                  international
                  aria-invalid={!!errors.phoneNumber}
                />
              )}
            />
            <FieldDescription>Please include the country code</FieldDescription>
            <FieldError errors={[errors.phoneNumber]} />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel htmlFor="role">
            Role <span className="text-destructive">*</span>
          </FieldLabel>
          <FieldContent>
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={isFormSubmitting}
                >
                  <SelectTrigger id="role" aria-invalid={!!errors.role}>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="User">User</SelectItem>
                    <SelectItem value="Guest">Guest</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError errors={[errors.role]} />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel htmlFor="active">
            Status <span className="text-destructive">*</span>
          </FieldLabel>
          <FieldContent>
            <Controller
              name="active"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={(value) => field.onChange(value === 'true')}
                  value={field.value ? 'true' : 'false'}
                  disabled={isFormSubmitting}
                >
                  <SelectTrigger id="active" aria-invalid={!!errors.active}>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            <FieldDescription>
              Mark this user's status in the system
            </FieldDescription>
            <FieldError errors={[errors.active]} />
          </FieldContent>
        </Field>

        <Separator />

        <Field>
          <FieldLabel>Avatar</FieldLabel>
          <FieldContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage
                    src={avatarPreview || undefined}
                    alt="User avatar"
                  />
                  <AvatarFallback>
                    <ImageIcon className="h-8 w-8" />
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-2">
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isFormSubmitting}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Image
                    </Button>

                    {(avatarPreview || selectedFile) && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleRemoveAvatar}
                        disabled={isFormSubmitting}
                      >
                        <X className="mr-2 h-4 w-4" />
                        Remove
                      </Button>
                    )}
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={isFormSubmitting}
                  />

                  {selectedFile && (
                    <p className="text-sm text-muted-foreground">
                      Selected: {selectedFile.name} (
                      {(selectedFile.size / 1024).toFixed(2)} KB)
                    </p>
                  )}
                </div>
              </div>

              {/* Or Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or use URL
                  </span>
                </div>
              </div>

              <Input
                id="avatar"
                type="url"
                placeholder="https://example.com/avatar.jpg"
                {...register('avatar', {
                  onChange: (e) => handleAvatarUrlChange(e.target.value),
                })}
                disabled={isFormSubmitting || !!selectedFile}
                aria-invalid={!!errors.avatar}
              />

              <FieldDescription>
                Optional: Upload an image file (max 10MB) or provide a URL.
              </FieldDescription>
              <FieldError errors={[errors.avatar]} />
            </div>
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel htmlFor="bio">Bio</FieldLabel>
          <FieldContent>
            <Textarea
              id="bio"
              placeholder="Enter a brief bio (max 500 characters)"
              className="min-h-[120px]"
              maxLength={500}
              {...register('bio')}
              disabled={isFormSubmitting}
              aria-invalid={!!errors.bio}
            />
            <FieldDescription>Optional: 500 characters max</FieldDescription>
            <FieldError errors={[errors.bio]} />
          </FieldContent>
        </Field>
      </div>

      <Separator />

      <div className="flex items-center justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={isFormSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isFormSubmitting}>
          {isFormSubmitting && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          {mode === 'create' ? 'Create User' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}
