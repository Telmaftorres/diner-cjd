import { supabaseAdmin } from '@/lib/supabase'

export type DinerInfo = {
  date_id: string
  lieu: string | null
  horaire: string | null
  admin_token: string
  rempli: boolean
}

// Récupère la ligne diner_infos d'une date, ou la crée (avec un token) si absente.
export async function getOrCreateDinerInfo(dateId: string): Promise<DinerInfo | null> {
  const { data } = await supabaseAdmin
    .from('diner_infos')
    .select('date_id, lieu, horaire, admin_token, rempli')
    .eq('date_id', dateId)
    .limit(1)

  if (data && data.length > 0) return data[0] as DinerInfo

  const { data: created, error } = await supabaseAdmin
    .from('diner_infos')
    .insert({ date_id: dateId })
    .select('date_id, lieu, horaire, admin_token, rempli')
    .single()

  if (error) return null
  return created as DinerInfo
}
