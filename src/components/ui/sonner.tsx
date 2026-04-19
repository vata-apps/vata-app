'use client';

import { useTheme } from 'next-themes';
import { Toaster as Sonner } from 'sonner';

import { VataIcon } from '$components/ui/vata-icon';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      icons={{
        success: <VataIcon name="circle-check" size={16} />,
        info: <VataIcon name="info" size={16} />,
        warning: <VataIcon name="triangle-alert" size={16} />,
        error: <VataIcon name="octagon-x" size={16} />,
        loading: <VataIcon name="loader-circle" size={16} className="animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-muted-foreground',
          actionButton: 'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          cancelButton: 'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
