import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (!token) return NextResponse.redirect(new URL('/?cancel=invalid', req.url))

  const { data, error } = await supabaseAdmin
    .from('inscriptions')
    .select('*')
    .eq('cancel_token', token)
    .single()

  if (error || !data) return NextResponse.redirect(new URL('/?cancel=invalid', req.url))
  if (data.annule) return NextResponse.redirect(new URL('/?cancel=already', req.url))

  await supabaseAdmin
    .from('inscriptions')
    .update({ annule: true })
    .eq('cancel_token', token)

  return NextResponse.redirect(new URL('/?cancel=ok', req.url))
}
