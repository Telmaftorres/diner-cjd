import { MAX_PER_DATE } from '@/lib/dates'

// URL absolue obligatoire dans les emails. Le domaine Netlify est stable
// (le QR code imprimé pointe dessus).
const LOGO_URL = 'https://diner-cjd.netlify.app/logo-cjd-rouen-email.png'

// Logo dans un cadre blanc, pour les en-têtes sombres (#111).
const logoOnDark = `<table cellpadding="0" cellspacing="0" align="center" style="margin:0 auto 24px;"><tr><td style="background:#ffffff;border-radius:10px;padding:12px 18px;"><img src="${LOGO_URL}" width="150" alt="CJD Rouen" style="display:block;border:0;height:auto;"></td></tr></table>`

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
