import { ThemeToggle } from '@/components/ThemeToggle';
import { Separator } from '@/components/ui/separator';

interface HeaderProps {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
}

export function Header({ title, description, actions }: HeaderProps) {
  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto px-6">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-6">
              <a href="/" className="flex items-center gap-2">
                <span className="font-semibold text-xl bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
                  MockAPI skj
                </span>
              </a>
            </div>

            <div className="flex items-center gap-4">
              {actions}
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {(title || description) && (
        <>
          <Separator />
          <div className="container mx-auto px-6 py-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                {title && (
                  <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
                )}
                {description && (
                  <p className="text-muted-foreground">{description}</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
