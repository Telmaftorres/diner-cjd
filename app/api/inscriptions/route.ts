import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import nodemailer from 'nodemailer'
import { emailConfirmation, emailAdminNouvelleInscription } from '@/lib/emails'
import { DATES, MAX_PER_DATE } from '@/lib/dates'
import crypto from 'crypto'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

async function sendEmail(to: string, subject: string, html: string) {
  await transporter.sendMail({
    from: '"CJD Rouen — Dîner confidentiel" <baptiste@kontfeel.fr>',
    to,
    subject,
    html,
  })
}

export async function POST(req: NextRequest) {
  const { prenom, nom, email, tel, dateId, test } = await req.json()
  const isTest = test === true

  if (!prenom || !nom || !email || !tel || !dateId)
    return NextResponse.json({ error: 'Champs manquants' }, { status: 400 })

  const date = DATES.find(d => d.id === dateId)
  if (!date) return NextResponse.json({ error: 'Date invalide' }, { status: 400 })

  const dateLabel = date.label

  // En mode test, on n'applique ni la limite de places ni le contrôle de doublon
  // (pour pouvoir tester autant de fois qu'on veut), mais on écrit quand même la
  // ligne — marquée is_test.
  if (!isTest) {
    const { count } = await supabaseAdmin
      .from('inscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('date_id', dateId)
      .eq('annule', false)
      .eq('is_test', false)

    if ((count ?? 0) >= MAX_PER_DATE)
      return NextResponse.json({ error: 'Complet' }, { status: 409 })

    // Une seule inscription par personne, toutes dates confondues.
    const { data: existing } = await supabaseAdmin
      .from('inscriptions')
      .select('id')
      .eq('email', email)
      .eq('annule', false)
      .eq('is_test', false)
      .limit(1)

    if (existing && existing.length > 0)
      return NextResponse.json({ error: 'Déjà inscrit' }, { status: 409 })
  }

  const cancelToken = crypto.randomUUID()

  const row: Record<string, any> = {
    prenom, nom, email, tel,
    date_id: dateId,
    date_label: dateLabel,
    cancel_token: cancelToken,
    annule: false,
    is_test: isTest,
  }

  let { error } = await supabaseAdmin.from('inscriptions').insert(row)

  // Tolère l'absence de la colonne is_test (migration pas encore appliquée).
  if (error && /is_test/.test(error.message)) {
    delete row.is_test
    if (isTest) return NextResponse.json({ error: 'Colonne is_test manquante — appliquer la migration Supabase.' }, { status: 500 })
    ;({ error } = await supabaseAdmin.from('inscriptions').insert(row))
  }

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { count: newCount } = await supabaseAdmin
    .from('inscriptions')
    .select('*', { count: 'exact', head: true })
    .eq('date_id', dateId)
    .eq('annule', false)
    .eq('is_test', false)

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL!
  const tag = isTest ? '[TEST] ' : ''

  // Email de confirmation au participant (sa place est réservée).
  try {
    const { html, subject } = emailConfirmation({ prenom, dateLabel, cancelToken, baseUrl })
    await sendEmail(email, tag + subject, html)
  } catch (e: any) {
    console.error('Erreur email participant:', e.message)
  }

  // Notification à l'admin.
  try {
    const admin = emailAdminNouvelleInscription({
      prenom, nom, email, tel, dateLabel,
      totalInscrits: newCount ?? 1,
      adminUrl: `${baseUrl}/admin`,
    })
    await sendEmail(process.env.ADMIN_EMAIL!, tag + admin.subject, admin.html)
  } catch (e: any) {
    console.error('Erreur email admin:', e.message)
  }

  return NextResponse.json({ ok: true, test: isTest })
}
