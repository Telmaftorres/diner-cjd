import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import * as Brevo from '@getbrevo/brevo'
import { emailLieu } from '@/lib/emails'

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
  const { dateId, lieu, horaire, adminSecret } = await req.json()

  if (adminSecret !== process.env.ADMIN_SECRET)
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

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
      lieu,
      horaire,
    })
    await sendEmail(inscrit.email, subject, html)
    sent++
  }

  return NextResponse.json({ ok: true, sent })
}