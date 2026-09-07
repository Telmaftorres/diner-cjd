import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getOrCreateDinerInfo } from '@/lib/dinerInfos'

// Saisie / correction du lieu par Telma depuis /admin (« en secours »).
export async function POST(req: NextRequest) {
  const { adminSecret, dateId, lieu, horaire } = await req.json()

  if (adminSecret !== process.env.ADMIN_SECRET)
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  if (!dateId || !lieu || !lieu.trim())
    return NextResponse.json({ error: 'Champs manquants' }, { status: 400 })

  const info = await getOrCreateDinerInfo(dateId)
  if (!info) return NextResponse.json({ error: 'diner_infos indisponible (migration ?)' }, { status: 500 })

  const { error } = await supabaseAdmin
    .from('diner_infos')
    .update({
      lieu: lieu.trim(),
      horaire: (horaire || '19h').trim(),
      rempli: true,
    })
    .eq('date_id', dateId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
