import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { token, lieu, horaire } = await req.json()

  if (!token || !lieu || !horaire)
    return NextResponse.json({ error: 'Champs manquants' }, { status: 400 })

  const { data, error } = await supabaseAdmin
    .from('diner_infos')
    .update({ lieu, horaire, rempli: true })
    .eq('admin_token', token)
    .eq('rempli', false)
    .select()
    .single()

  if (error || !data)
    return NextResponse.json({ error: 'Token invalide' }, { status: 404 })

  return NextResponse.json({ ok: true })
}
