// src/app/dashboard/inscripciones/page.tsx
import { createClient } from '@/server/lib/supabase/server';
import { redirect } from 'next/navigation';
import { InscripcionesView } from './InscripcionesView';

export default async function InscripcionesPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/auth/signin');
  }
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  
  if (!profile || profile.role !== 'estudiante') {
    redirect('/dashboard');
  }
  
  return <InscripcionesView initialRole={profile.role} />;
}
