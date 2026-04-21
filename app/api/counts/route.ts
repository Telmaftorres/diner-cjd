import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { DATES } from '@/lib/dates'

export async function GET() {
  const counts: Record<string, number> = {}
  for (const date of DATES) {
    const { count } = await supabaseAdmin
      .from('inscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('date_id', date.id)
      .eq('annule', false)
    counts[date.id] = count ?? 0
  }
  return NextResponse.json(counts)
}
