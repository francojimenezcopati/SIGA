// src/app/api/inscripciones/route.ts
import { createClient } from '@/server/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json(
      { error: 'No autorizado' },
      { status: 401 }
    );
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'estudiante') {
    return NextResponse.json(
      { error: 'Solo estudiantes pueden inscribirse' },
      { status: 403 }
    );
  }

  const { materia_id } = await request.json();

  if (!materia_id) {
    return NextResponse.json(
      { error: 'ID de materia requerido' },
      { status: 400 }
    );
  }

  // Check if already enrolled
  const { data: existing } = await supabase
    .from('inscripciones')
    .select('id')
    .eq('estudiante_id', user.id)
    .eq('materia_id', materia_id)
    .single();

  if (existing) {
    return NextResponse.json(
      { error: 'Ya estás inscrito en esta materia' },
      { status: 409 }
    );
  }

  const { data: inscripcion, error } = await supabase
    .from('inscripciones')
    .insert({
      estudiante_id: user.id,
      materia_id,
      fecha_inscripcion: new Date().toISOString(),
      estado: 'activa',
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(inscripcion, { status: 201 });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json(
      { error: 'No autorizado' },
      { status: 401 }
    );
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'estudiante') {
    return NextResponse.json(
      { error: 'Solo estudiantes pueden darse de baja' },
      { status: 403 }
    );
  }

  const url = new URL(request.url);
  const inscripcionId = url.pathname.split('/').pop();

  if (!inscripcionId) {
    return NextResponse.json(
      { error: 'ID de inscripción requerido' },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from('inscripciones')
    .delete()
    .eq('id', inscripcionId)
    .eq('estudiante_id', user.id);

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true }, { status: 200 });
}