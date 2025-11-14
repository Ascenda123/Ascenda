import type { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="form-page">
      <div className="w-full max-w-md form-flow">
        <Card className="form-panel form-panel--roomy border-0 bg-white">
          <CardHeader className="form-stack border-0 bg-transparent px-0 pt-0">
            <CardTitle className="text-center text-2xl font-semibold">Ascenda</CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">{children}</CardContent>
        </Card>
      </div>
    </main>
  );
}
