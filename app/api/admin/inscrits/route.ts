import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { adminSecret } = await req.json()

  if (adminSecret !== process.env.ADMIN_SECRET)
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const query = (cols: string) => supabaseAdmin
    .from('inscriptions')
    .select(cols)
    .order('date_id', { ascending: true })
    .order('created_at', { ascending: true })

  let { data, error } = await query('prenom, nom, email, tel, date_label, created_at, annule, is_test')

  // Tolère l'absence de la colonne is_test (migration pas encore appliquée).
  if (error && /is_test/.test(error.message)) {
    ;({ data, error } = await query('prenom, nom, email, tel, date_label, created_at, annule'))
  }

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Infos lieu par date (peut ne pas exister si la migration n'est pas faite).
  let dinerInfos: any[] = []
  const di = await supabaseAdmin
    .from('diner_infos')
    .select('date_id, lieu, horaire, rempli, updated_at')
  if (!di.error && di.data) dinerInfos = di.data

  return NextResponse.json({ inscrits: data, dinerInfos })
}
