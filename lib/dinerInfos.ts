import { supabaseAdmin } from '@/lib/supabase'

export type DinerInfo = {
  date_id: string
  lieu: string | null
  horaire: string
  admin_token: string
  rempli: boolean
  updated_at?: string
}

// Récupère la ligne diner_infos d'une date, ou la crée (avec un token) si absente.
export async function getOrCreateDinerInfo(dateId: string): Promise<DinerInfo | null> {
  const { data } = await supabaseAdmin
    .from('diner_infos')
    .select('*')
    .eq('date_id', dateId)
    .maybeSingle()

  if (data) return data as DinerInfo

  const { data: created, error } = await supabaseAdmin
    .from('diner_infos')
    .insert({ date_id: dateId })
    .select('*')
    .single()

  if (error) return null
  return created as DinerInfo
}
