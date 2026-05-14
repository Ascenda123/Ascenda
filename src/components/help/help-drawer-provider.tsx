'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { HelpThreadDrawer } from './help-thread-drawer';

interface HelpDrawerContextValue {
  openRequest: (id: string) => void;
  closeRequest: () => void;
  currentRequestId: string | null;
}

const HelpDrawerContext = createContext<HelpDrawerContextValue | null>(null);

export const HelpDrawerProvider = ({ children }: { children: ReactNode }) => {
  const [currentRequestId, setCurrentRequestId] = useState<string | null>(null);
  const pathname = usePathname();

  const openRequest = useCallback((id: string) => setCurrentRequestId(id), []);
  const closeRequest = useCallback(() => setCurrentRequestId(null), []);

  // Auto-open if URL has ?help=<id>. Doesn't strip the param — leaving it
  // lets the user reload and stay on the same conversation.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const id = params.get('help');
    if (id && id !== currentRequestId) {
      setCurrentRequestId(id);
    }
    // No deps on pathname/search because Next's hooks don't refresh on a
    // pure query-string change reliably; we re-check on each pathname change
    // and on hash/search events below.
  }, [pathname, currentRequestId]);

  // Side derives from current pathname so the drawer renders the right
  // affordances (counsellor sees Accept/Resolve, student doesn't).
  const side = pathname?.startsWith('/counsellor') ? 'counsellor' : 'student';

  const value = useMemo(
    () => ({ openRequest, closeRequest, currentRequestId }),
    [openRequest, closeRequest, currentRequestId]
  );

  return (
    <HelpDrawerContext.Provider value={value}>
      {children}
      <HelpThreadDrawer
        open={currentRequestId !== null}
        requestId={currentRequestId}
        side={side}
        onClose={closeRequest}
      />
    </HelpDrawerContext.Provider>
  );
};

export const useHelpDrawer = (): HelpDrawerContextValue => {
  const ctx = useContext(HelpDrawerContext);
  if (!ctx) {
    throw new Error('useHelpDrawer must be used within HelpDrawerProvider');
  }
  return ctx;
};
