import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import nodemailer from 'nodemailer'
import { emailLieu } from '@/lib/emails'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function POST(req: NextRequest) {
  const { dateId, adminSecret } = await req.json()

  if (adminSecret !== process.env.ADMIN_SECRET)
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { data: info } = await supabaseAdmin
    .from('diner_infos')
    .select('lieu, horaire, rempli')
    .eq('date_id', dateId)
    .single()

  if (!info || !info.rempli || !info.lieu || !info.horaire)
    return NextResponse.json({ error: 'Lieu non renseigné' }, { status: 404 })

  const { data: inscrits } = await supabaseAdmin
    .from('inscriptions')
    .select('prenom, email, date_label')
    .eq('date_id', dateId)
    .eq('annule', false)

  if (!inscrits || inscrits.length === 0)
    return NextResponse.json({ error: 'Aucun inscrit' }, { status: 404 })

  let sent = 0
  for (const inscrit of inscrits) {
    const { html, subject } = emailLieu({
      prenom: inscrit.prenom,
      dateLabel: inscrit.date_label,
      lieu: info.lieu,
      horaire: info.horaire,
    })
    await transporter.sendMail({
      from: '"Dîner CJD" <baptiste@kontfeel.fr>',
      to: inscrit.email,
      subject,
      html,
    })
    sent++
  }

  return NextResponse.json({ ok: true, sent })
}
