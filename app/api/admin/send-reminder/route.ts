import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import nodemailer from 'nodemailer'
import { DATES } from '@/lib/dates'
import { getOrCreateDinerInfo } from '@/lib/dinerInfos'
import { emailRappelLieu } from '@/lib/emails'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

// Appelé chaque jour par GitHub Actions (reminder-j14.yml).
// Si un dîner a lieu dans exactement 14 jours et que son lieu n'est pas encore
// renseigné, envoie un email à Baptiste avec le lien de saisie.
export async function POST(req: NextRequest) {
  const { adminSecret } = await req.json()

  if (adminSecret !== process.env.ADMIN_SECRET)
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const target = new Date()
  target.setDate(target.getDate() + 14)
  const targetId = target.toISOString().split('T')[0]

  const date = DATES.find(d => d.id === targetId)
  if (!date) return NextResponse.json({ ok: false, message: 'Aucun dîner dans 14 jours' })

  const info = await getOrCreateDinerInfo(targetId)
  if (!info) return NextResponse.json({ ok: false, message: 'diner_infos indisponible (migration ?)' })
  if (info.rempli) return NextResponse.json({ ok: false, message: 'Lieu déjà renseigné' })

  const { count } = await supabaseAdmin
    .from('inscriptions')
    .select('*', { count: 'exact', head: true })
    .eq('date_id', targetId)
    .eq('annule', false)
    .eq('is_test', false)

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL!
  const { subject, html } = emailRappelLieu({
    dateLabel: date.label,
    formUrl: `${baseUrl}/lieu/${info.admin_token}`,
    nbInscrits: count ?? 0,
  })

  await transporter.sendMail({
    from: '"CJD Rouen — Dîner confidentiel" <baptiste@kontfeel.fr>',
    to: process.env.ADMIN_EMAIL!,
    subject,
    html,
  })

  return NextResponse.json({ ok: true, dateId: targetId })
}
