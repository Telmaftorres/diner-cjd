import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// Pré-remplissage du formulaire de Baptiste : renvoie les valeurs actuelles.
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (!token) return NextResponse.json({ error: 'Lien invalide' }, { status: 400 })

  const { data } = await supabaseAdmin
    .from('diner_infos')
    .select('date_id, lieu, horaire, rempli')
    .eq('admin_token', token)
    .maybeSingle()

  if (!data) return NextResponse.json({ error: 'Lien invalide' }, { status: 404 })
  return NextResponse.json(data)
}

// Enregistrement du lieu / horaire par Baptiste (le token fait office d'accès).
export async function POST(req: NextRequest) {
  const { token, lieu, horaire } = await req.json()

  if (!token || !lieu || !lieu.trim())
    return NextResponse.json({ error: 'Le lieu est requis' }, { status: 400 })

  const { data, error } = await supabaseAdmin
    .from('diner_infos')
    .update({
      lieu: lieu.trim(),
      horaire: (horaire || '19h').trim(),
      rempli: true,
    })
    .eq('admin_token', token)
    .select('date_id')
    .single()

  if (error || !data) return NextResponse.json({ error: 'Lien invalide' }, { status: 404 })
  return NextResponse.json({ ok: true })
}
