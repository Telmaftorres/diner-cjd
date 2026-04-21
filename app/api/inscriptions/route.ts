import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import * as Brevo from '@getbrevo/brevo'
import { emailConfirmation, emailAdminNouvelleInscription } from '@/lib/emails'
import { DATES, MAX_PER_DATE } from '@/lib/dates'
import crypto from 'crypto'

const apiInstance = new Brevo.TransactionalEmailsApi()
apiInstance.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY!)

async function sendEmail(to: string, subject: string, html: string) {
  const email = new Brevo.SendSmtpEmail()
  email.subject = subject
  email.htmlContent = html
  email.sender = { name: 'Dîner CJD', email: 'telma@kontfeel.fr' }
  email.to = [{ email: to }]
  await apiInstance.sendTransacEmail(email)
}

export async function POST(req: NextRequest) {
  const { prenom, nom, email, tel, dateId } = await req.json()

  if (!prenom || !nom || !email || !tel || !dateId)
    return NextResponse.json({ error: 'Champs manquants' }, { status: 400 })

  const date = DATES.find(d => d.id === dateId)
  if (!date) return NextResponse.json({ error: 'Date invalide' }, { status: 400 })

  const { count } = await supabaseAdmin
    .from('inscriptions')
    .select('*', { count: 'exact', head: true })
    .eq('date_id', dateId)
    .eq('annule', false)

  if ((count ?? 0) >= MAX_PER_DATE)
    return NextResponse.json({ error: 'Complet' }, { status: 409 })

  const { data: existing } = await supabaseAdmin
    .from('inscriptions')
    .select('id')
    .eq('email', email)
    .eq('date_id', dateId)
    .eq('annule', false)
    .single()

  if (existing)
    return NextResponse.json({ error: 'Déjà inscrit' }, { status: 409 })

  const cancelToken = crypto.randomUUID()

  const { error } = await supabaseAdmin.from('inscriptions').insert({
    prenom, nom, email, tel,
    date_id: dateId,
    date_label: date.label + ' ' + date.sub,
    cancel_token: cancelToken,
    annule: false,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { count: newCount } = await supabaseAdmin
    .from('inscriptions')
    .select('*', { count: 'exact', head: true })
    .eq('date_id', dateId)
    .eq('annule', false)

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL!
  const dateLabel = date.label + ' ' + date.sub

  const { html, subject } = emailConfirmation({ prenom, nom, dateLabel, cancelToken, baseUrl })
  await sendEmail(email, subject, html)

  const admin = emailAdminNouvelleInscription({ prenom, nom, email, tel, dateLabel, totalInscrits: newCount ?? 1 })
  await sendEmail(process.env.ADMIN_EMAIL!, admin.subject, admin.html)

  return NextResponse.json({ ok: true })
}