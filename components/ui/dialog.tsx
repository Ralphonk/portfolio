'use client';
import * as React from 'react';
import * as Primitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
export const Dialog = Primitive.Root;
export const DialogTrigger = Primitive.Trigger;
export const DialogTitle = Primitive.Title;
export const DialogDescription = Primitive.Description;
export function DialogContent({ children, header, footer }: { children: React.ReactNode; header?: React.ReactNode; footer?: React.ReactNode }) {
  const closeRef = React.useRef<HTMLButtonElement>(null);
  return <Primitive.Portal>
    <Primitive.Overlay className="dialog-overlay"/>
    <Primitive.Content className="dialog-content" onOpenAutoFocus={event => {
      // Keep opening focus at the top, rather than scrolling to an external link.
      event.preventDefault();
      closeRef.current?.focus({ preventScroll: true });
    }}>
      {header && <div className="dialog-header">{header}</div>}
      <div className="dialog-scroll" data-lenis-prevent>{children}</div>
      {footer && <div className="dialog-footer">{footer}</div>}
      <Primitive.Close ref={closeRef} className="dialog-close" aria-label="Close project details"><X size={20}/></Primitive.Close>
    </Primitive.Content>
  </Primitive.Portal>;
}
