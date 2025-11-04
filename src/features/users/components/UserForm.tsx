import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import {
  userFormSchema,
  type UserFormData,
} from '@/features/users/schemas/users.schema';
import { useCreateUser } from '@/features/users/api/users.hooks';
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

export function UserForm() {
  const navigate = useNavigate();
  const createUserMutation = useCreateUser();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phoneNumber: '',
      active: true,
      role: 'User',
      avatar: '',
      bio: '',
    },
  });

  const onSubmit = async (data: UserFormData) => {
    await createUserMutation.mutateAsync(data);
    navigate('/');
  };

  const handleCancel = () => {
    navigate('/');
  };

  const phoneValue = watch('phoneNumber');

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
              disabled={isSubmitting}
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
              disabled={isSubmitting}
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
            <PhoneInput
              id="phoneNumber"
              placeholder="Enter phone number"
              value={phoneValue}
              onChange={(value) => setValue('phoneNumber', value || '')}
              disabled={isSubmitting}
              defaultCountry="MY"
              international
              aria-invalid={!!errors.phoneNumber}
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
            <Select
              onValueChange={(value) =>
                setValue('role', value as 'Admin' | 'User' | 'Guest')
              }
              defaultValue="User"
              disabled={isSubmitting}
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
            <FieldError errors={[errors.role]} />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel htmlFor="active">
            Status <span className="text-destructive">*</span>
          </FieldLabel>
          <FieldContent>
            <Select
              onValueChange={(value) =>
                setValue('active', value === 'true' ? true : false)
              }
              defaultValue="true"
              disabled={isSubmitting}
            >
              <SelectTrigger id="active" aria-invalid={!!errors.active}>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectContent>
            </Select>
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
              disabled={isSubmitting}
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
              disabled={isSubmitting}
              aria-invalid={!!errors.bio}
            />
            <FieldDescription>
              Optional: 500 characters max, {500 - (watch('bio')?.length || 0)} left
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
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create User
        </Button>
      </div>
    </form>
  );
}
