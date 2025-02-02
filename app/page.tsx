"use client";

import { useEffect, useState } from 'react';
import { Person } from '@/lib/types';
import { EducationCard } from '@/components/ui/education-card';
import { GraduationCap, User, Calendar, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [person, setPerson] = useState<Person | null>(null);

  const handleLogin = () => {
    window.location.href = '/api/auth/login';
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/education');
        if (!response.ok) {
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

    // Check if user is authenticated
    fetch('/api/auth/status')
      .then(res => res.json())
      .then(data => {
        if (data.authenticated) {
          fetchData();
        }
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!person) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Your Education Records</h1>
          <Button onClick={handleLogin}>
            Connect to DigiLocker
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {error && (
            <div className="mb-4 p-4 bg-destructive text-destructive-foreground rounded-lg">
              {error}
            </div>
          )}
          
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