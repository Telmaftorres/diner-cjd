import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import nodemailer from 'nodemailer'
import { emailLieu } from '@/lib/emails'
import { LIEU, HORAIRE } from '@/lib/config'

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
  const { dateId, adminSecret, lieu, horaire } = await req.json()

  if (adminSecret !== process.env.ADMIN_SECRET)
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  // Le lieu peut changer d'un dîner à l'autre : on prend celui fourni dans la
  // requête, sinon la valeur par défaut de lib/config.ts.
  const lieuFinal = lieu || LIEU
  const horaireFinal = horaire || HORAIRE

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
      lieu: lieuFinal,
      horaire: horaireFinal,
    })
    await transporter.sendMail({
      from: '"CJD Rouen — Dîner confidentiel" <baptiste@kontfeel.fr>',
      to: inscrit.email,
      subject,
      html,
    })
    sent++
  }

  return NextResponse.json({ ok: true, sent })
}
