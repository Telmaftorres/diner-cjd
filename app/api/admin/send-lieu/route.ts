import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import nodemailer from 'nodemailer'
import { emailLieu } from '@/lib/emails'
import { LIEU, HORAIRE } from '@/lib/config'
import { getOrCreateDinerInfo } from '@/lib/dinerInfos'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

// Envoie l'email « le lieu se dévoile » à tous les inscrits d'une date.
// - Déclenché manuellement depuis /admin (lieu/horaire passés dans la requête),
// - ou automatiquement à J-10 par GitHub Actions (lieu/horaire lus dans diner_infos).
export async function POST(req: NextRequest) {
  const { dateId, adminSecret, lieu, horaire } = await req.json()

  if (adminSecret !== process.env.ADMIN_SECRET)
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  if (!dateId) return NextResponse.json({ error: 'Date manquante' }, { status: 400 })

  const info = await getOrCreateDinerInfo(dateId)

  const lieuFinal = (lieu || info?.lieu || LIEU || '').trim()
  const horaireFinal = (horaire || info?.horaire || HORAIRE || '19h').trim()

  if (!lieuFinal || lieuFinal === 'À communiquer')
    return NextResponse.json({ ok: false, error: 'Lieu non renseigné' }, { status: 400 })

  const { data: inscrits } = await supabaseAdmin
    .from('inscriptions')
    .select('prenom, email, date_label')
    .eq('date_id', dateId)
    .eq('annule', false)
    .eq('is_test', false)

  if (!inscrits || inscrits.length === 0)
    return NextResponse.json({ ok: false, error: 'Aucun inscrit' }, { status: 404 })

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

  // Mémorise ce qui a été envoyé (utile si l'envoi vient du bouton admin).
  if (info) {
    await supabaseAdmin
      .from('diner_infos')
      .update({ lieu: lieuFinal, horaire: horaireFinal, rempli: true })
      .eq('date_id', dateId)
  }

  return NextResponse.json({ ok: true, sent })
}
