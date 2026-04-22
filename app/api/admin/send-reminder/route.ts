import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import nodemailer from 'nodemailer'
import { DATES } from '@/lib/dates'

const ADMIN_EMAIL = 'baptiste@kontfeel.fr'

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
  const { adminSecret } = await req.json()

  if (adminSecret !== process.env.ADMIN_SECRET)
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const today = new Date()
  const target = new Date(today)
  target.setDate(today.getDate() + 0) // test avec aujourd'hui
  const targetId = target.toISOString().split('T')[0]
  console.log('targetId:', targetId)

  return NextResponse.json({ debug: targetId })

  const date = DATES.find(d => d.id === targetId)
  if (!date) return NextResponse.json({ ok: false, message: 'Pas de dîner dans 14 jours' })

  const { data: info } = await supabaseAdmin
    .from('diner_infos')
    .select('admin_token, rempli')
    .eq('date_id', targetId)
    .single()

  if (!info || info.rempli)
    return NextResponse.json({ ok: false, message: 'Déjà rempli ou introuvable' })

  const formUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/admin/${info.admin_token}`

  await transporter.sendMail({
    from: '"Dîner CJD" <baptiste@kontfeel.fr>',
    to: ADMIN_EMAIL,
    subject: `Dîner du ${date.label} ${date.sub} — renseignez le lieu`,
    html: `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;padding:32px;background:#f5f5f5;">
<table width="480" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;padding:32px;border:0.5px solid #e8e8e4;">
<tr><td style="text-align:center;padding-bottom:24px;">
<p style="font-size:28px;margin:0 0 12px;">🌹</p>
<h1 style="font-size:18px;font-weight:600;color:#111;margin:0 0 8px;">Dîner du ${date.label} ${date.sub}</h1>
<p style="color:#888;font-size:14px;line-height:1.7;margin:0;">Dans 14 jours ! Merci de renseigner le lieu et l'horaire pour que les invités soient prévenus à temps.</p>
</td></tr>
<tr><td style="text-align:center;padding-top:8px;">
<a href="${formUrl}" style="display:inline-block;padding:14px 32px;background:#111;color:#fff;text-decoration:none;border-radius:10px;font-size:15px;font-weight:600;">Renseigner le lieu</a>
</td></tr>
</table>
</body>
</html>`,
  })

  return NextResponse.json({ ok: true, dateId: targetId })
}
