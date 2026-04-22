import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import nodemailer from 'nodemailer'

export async function POST(req: NextRequest) {
  const { adminSecret } = await req.json()

  if (adminSecret !== process.env.ADMIN_SECRET)
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const results: Record<string, any> = {}

  // Test Supabase - inscriptions
  try {
    const { count, error } = await supabaseAdmin
      .from('inscriptions')
      .select('*', { count: 'exact', head: true })
    results.supabase_inscriptions = error ? { ok: false, error: error.message } : { ok: true, count }
  } catch (e: any) {
    results.supabase_inscriptions = { ok: false, error: e.message }
  }

  // Test Supabase - diner_infos
  try {
    const { data, error } = await supabaseAdmin
      .from('diner_infos')
      .select('date_id, rempli')
    results.supabase_diner_infos = error ? { ok: false, error: error.message } : { ok: true, count: data?.length }
  } catch (e: any) {
    results.supabase_diner_infos = { ok: false, error: e.message }
  }

  // Test SMTP
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
    await transporter.verify()
    results.smtp = { ok: true }
  } catch (e: any) {
    results.smtp = { ok: false, error: e.message }
  }

  // Test variables d'environnement
  results.env = {
    supabase_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabase_anon: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    supabase_service: !!process.env.SUPABASE_SERVICE_KEY,
    smtp_host: !!process.env.SMTP_HOST,
    smtp_user: !!process.env.SMTP_USER,
    smtp_pass: !!process.env.SMTP_PASS,
    admin_email: !!process.env.ADMIN_EMAIL,
    admin_secret: !!process.env.ADMIN_SECRET,
    base_url: !!process.env.NEXT_PUBLIC_BASE_URL,
  }

  const allOk = results.supabase_inscriptions.ok && results.supabase_diner_infos.ok && results.smtp.ok
  return NextResponse.json({ ok: allOk, results })
}
