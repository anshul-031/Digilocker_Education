"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ErrorPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const message = searchParams.get('message') || 'An error occurred';

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center p-8">
        <div className="flex justify-center mb-4">
          <AlertCircle className="h-12 w-12 text-destructive" />
        </div>
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p className="text-muted-foreground mb-6">
          {message.replace(/_/g, ' ')}
        </p>
        <Button onClick={() => router.push('/')}>
          Return Home
        </Button>
      </div>
    </div>
  );
}