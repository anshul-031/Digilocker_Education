"use client";

import { useEffect, useState } from 'react';
import { Person } from '@/lib/types';
import { EducationCard } from '@/components/ui/education-card';
import { GraduationCap, User, Calendar, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [person, setPerson] = useState<Person | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/education');
        if (!response.ok) {
          if (response.status === 401) {
            // If not authenticated, redirect to home
            router.push('/');
            return;
          }
          throw new Error('Failed to fetch education data');
        }
        const data = await response.json();
        setPerson(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error</h1>
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={() => router.push('/')}>
            Return Home
          </Button>
        </div>
      </div>
    );
  }

  if (!person) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No Data Available</h1>
          <Button onClick={() => router.push('/')}>
            Return Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8 p-6 bg-card rounded-lg shadow-lg">
            <div className="flex items-center gap-4 mb-4">
              <User className="h-12 w-12 text-primary" />
              <div>
                <h1 className="text-3xl font-bold text-card-foreground">{person.name}</h1>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>DOB: {person.dateOfBirth}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Education Records */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-6">
              <GraduationCap className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold">Education History</h2>
            </div>
            
            <div className="grid gap-6">
              {person.educationRecords.map((record) => (
                <EducationCard key={record.id} record={record} />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}