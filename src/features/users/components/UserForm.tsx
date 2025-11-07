import { useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
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
  } = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues,
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const isMutating =
    createUserMutation.isPending || updateUserMutation.isPending;
  const isFormSubmitting = isSubmitting || isMutating;

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
      navigate('/');
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
          <FieldLabel htmlFor="avatar">Avatar URL</FieldLabel>
          <FieldContent>
            <Input
              id="avatar"
              type="url"
              placeholder="https://example.com/avatar.jpg"
              {...register('avatar')}
              disabled={isFormSubmitting}
              aria-invalid={!!errors.avatar}
            />
            <FieldDescription>
              Optional: Provide a URL to the user's avatar image
            </FieldDescription>
            <FieldError errors={[errors.avatar]} />
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
            <FieldDescription>
              Optional: 500 characters max
            </FieldDescription>
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
