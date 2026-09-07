import { MAX_PER_DATE } from '@/lib/dates'

// URL absolue obligatoire dans les emails. Le domaine Netlify est stable
// (le QR code imprimé pointe dessus).
const LOGO_URL = 'https://diner-cjd.netlify.app/logo-cjd-rouen-email.png'

// Logo dans un cadre blanc, pour les en-têtes sombres (#111).
const logoOnDark = `<table cellpadding="0" cellspacing="0" align="center" style="margin:0 auto 24px;"><tr><td style="background:#ffffff;border-radius:10px;padding:12px 18px;"><img src="${LOGO_URL}" width="150" alt="CJD Rouen" style="display:block;border:0;height:auto;"></td></tr></table>`

export function emailConfirmation({
  prenom,
  dateLabel,
  cancelToken,
  baseUrl,
}: {
  prenom: string
  dateLabel: string
  cancelToken: string
  baseUrl: string
}) {
  const cancelUrl = `${baseUrl}/annuler?token=${cancelToken}`
  return {
    subject: 'Dîner confidentiel — votre place est réservée',
    html: `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
<tr><td align="center">
<table width="480" cellpadding="0" cellspacing="0" style="background:#111;border-radius:12px;overflow:hidden;">
<tr><td style="padding:40px 40px 24px;text-align:center;">
${logoOnDark}
<h1 style="color:#fff;font-size:20px;font-weight:500;margin:0 0 8px;">Bonsoir ${prenom},</h1>
<p style="color:#aaa;font-size:14px;line-height:1.7;margin:0;">
Votre inscription pour le dîner du <strong style="color:#5DCAA5">${dateLabel}</strong> est confirmée.
</p>
</td></tr>
<tr><td style="padding:0 40px 24px;">
<div style="background:#0a1a0a;border:0.5px solid #1D9E75;border-radius:8px;padding:20px;">
<p style="color:#9FE1CB;font-size:13px;line-height:1.7;margin:0;">
Vous serez 8 à table : 7 membres de la section et un invité mystère.<br><br>
Le lieu exact vous sera communiqué au dernier moment, et vous découvrirez les convives à votre arrivée.
</p>
</div>
</td></tr>
<tr><td style="padding:0 40px 32px;">
<p style="color:#555;font-size:12px;line-height:1.7;margin:0;">
Si un imprévu vous empêchait de venir, vous pouvez
<a href="${cancelUrl}" style="color:#888;">signaler votre absence ici</a>
— cela libèrera votre place pour quelqu'un d'autre.
</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`,
  }
}

export function emailLieu({
  prenom,
  dateLabel,
  lieu,
  horaire,
}: {
  prenom: string
  dateLabel: string
  lieu: string
  horaire: string
}) {
  return {
    subject: `Dîner du ${dateLabel} — le lieu se dévoile`,
    html: `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
<tr><td align="center">
<table width="480" cellpadding="0" cellspacing="0" style="background:#111;border-radius:12px;overflow:hidden;">
<tr><td style="padding:40px 40px 24px;text-align:center;">
${logoOnDark}
<h1 style="color:#fff;font-size:20px;font-weight:500;margin:0 0 8px;">Bonsoir ${prenom},</h1>
<p style="color:#aaa;font-size:14px;line-height:1.7;margin:0;">Le dîner approche. Voici ce que vous attendiez.</p>
</td></tr>
<tr><td style="padding:0 40px 24px;">
<div style="background:#0a1a0a;border:0.5px solid #1D9E75;border-radius:8px;padding:24px;">
<p style="color:#5DCAA5;font-size:12px;letter-spacing:.07em;text-transform:uppercase;margin:0 0 8px;">Le lieu</p>
<p style="color:#fff;font-size:16px;font-weight:500;margin:0 0 20px;">${lieu}</p>
<p style="color:#5DCAA5;font-size:12px;letter-spacing:.07em;text-transform:uppercase;margin:0 0 8px;">L'horaire</p>
<p style="color:#fff;font-size:16px;font-weight:500;margin:0 0 20px;">${horaire}</p>
<div style="border-top:0.5px solid #1D9E75;padding-top:20px;">
<p style="color:#9FE1CB;font-size:13px;line-height:1.7;margin:0;">
Ne cherchez pas à savoir qui seront les autres convives — vous les découvrirez à votre arrivée. C'est tout le charme de la soirée.
</p>
</div>
</div>
</td></tr>
<tr><td style="padding:0 40px 32px;text-align:center;">
<p style="color:#555;font-size:12px;">À très bientôt.</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`,
  }
}

export function emailAdminNouvelleInscription({
  prenom,
  nom,
  email,
  tel,
  dateLabel,
  totalInscrits,
  adminUrl,
}: {
  prenom: string
  nom: string
  email: string
  tel: string
  dateLabel: string
  totalInscrits: number
  adminUrl: string
}) {
  return {
    subject: `Nouvelle inscription — ${prenom} ${nom} (${dateLabel})`,
    html: `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;padding:32px;background:#f5f5f5;">
<table width="480" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;padding:32px;">
<tr><td>
<div style="text-align:center;margin:0 0 20px;"><img src="${LOGO_URL}" width="140" alt="CJD Rouen" style="display:inline-block;border:0;height:auto;"></div>
<h2 style="margin:0 0 16px;color:#111;text-align:center;">Nouvelle inscription</h2>
<table style="font-size:14px;line-height:2;width:100%;">
<tr><td style="color:#888;padding-right:16px;">Nom</td><td><strong>${prenom} ${nom}</strong></td></tr>
<tr><td style="color:#888;">Email</td><td>${email}</td></tr>
<tr><td style="color:#888;">Téléphone</td><td>${tel}</td></tr>
<tr><td style="color:#888;">Date choisie</td><td><strong>${dateLabel}</strong></td></tr>
<tr><td style="color:#888;">Inscrits</td><td><strong>${totalInscrits} / ${MAX_PER_DATE}</strong></td></tr>
</table>
<div style="margin-top:24px;padding-top:24px;border-top:0.5px solid #e8e8e4;text-align:center;">
<a href="${adminUrl}" style="display:inline-block;padding:12px 24px;background:#111;color:#fff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;">Voir tous les inscrits</a>
</div>
</td></tr>
</table>
</body>
</html>`,
  }
}
