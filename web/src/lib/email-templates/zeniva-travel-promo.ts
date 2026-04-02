// Template email HTML professionnel - Campagne voyage Zeniva Travel
export const ZENIVA_TRAVEL_PROMO_TEMPLATE = {
  name: "Zeniva - Promotion Voyage",
  subject: "{{FIRST_NAME}}, votre prochaine aventure vous attend",
  preview_text: "Decouvrez nos forfaits exclusifs et partez a l'aventure avec Zeniva Travel",
  audience_type: "all",
  html_body: `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Zeniva Travel</title>
</head>
<body style="margin:0;padding:0;background-color:#F7F9FC;font-family:Arial,Helvetica,sans-serif;-webkit-font-smoothing:antialiased;">

<!-- Preheader -->
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
Decouvrez nos forfaits exclusifs et partez a l'aventure avec Zeniva Travel
</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F7F9FC;">
<tr><td align="center" style="padding:20px 10px;">

<!-- Main Container -->
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(15,108,245,0.08);">

<!-- Header with Gradient -->
<tr>
<td style="background:linear-gradient(135deg,#0B1B4D 0%,#0F6CF5 100%);padding:40px 40px 48px;text-align:center;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
  <tr>
  <td align="center" style="padding-bottom:24px;">
    <table role="presentation" cellpadding="0" cellspacing="0">
    <tr>
      <td style="background-color:rgba(255,255,255,0.15);border-radius:12px;padding:10px 20px;">
        <span style="font-size:24px;font-weight:800;color:#ffffff;letter-spacing:1px;">ZENIVA</span>
        <span style="font-size:12px;color:#E6B85A;display:block;letter-spacing:3px;margin-top:2px;">TRAVEL</span>
      </td>
    </tr>
    </table>
  </td>
  </tr>
  <tr>
  <td align="center">
    <h1 style="margin:0;font-size:28px;font-weight:800;color:#ffffff;line-height:1.3;">
      Votre prochaine aventure<br>
      <span style="color:#E6B85A;">vous attend</span>
    </h1>
    <p style="margin:16px 0 0;font-size:15px;color:rgba(255,255,255,0.8);line-height:1.5;">
      Des destinations de reve, des prix exceptionnels.
    </p>
  </td>
  </tr>
  </table>
</td>
</tr>

<!-- Greeting -->
<tr>
<td style="padding:32px 40px 0;">
  <p style="margin:0;font-size:16px;color:#0B1228;line-height:1.6;">
    Bonjour <strong>{{FIRST_NAME}}</strong>,
  </p>
  <p style="margin:12px 0 0;font-size:15px;color:#6B7280;line-height:1.7;">
    Nous avons selectionne pour vous nos meilleures offres de la saison. Des destinations paradisiaques, des hotels premium et des experiences inoubliables — le tout a des prix exclusifs reserves a nos membres.
  </p>
</td>
</tr>

<!-- Featured Destination Card -->
<tr>
<td style="padding:24px 40px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#081A4A 0%,#2B6BFF 100%);border-radius:12px;overflow:hidden;">
  <tr>
  <td style="padding:28px 24px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr>
    <td>
      <span style="display:inline-block;background-color:#E6B85A;color:#0B1B4D;font-size:11px;font-weight:700;padding:4px 12px;border-radius:20px;letter-spacing:0.5px;">OFFRE VEDETTE</span>
      <h2 style="margin:12px 0 8px;font-size:22px;font-weight:700;color:#ffffff;">Riviera Maya, Mexique</h2>
      <p style="margin:0;font-size:14px;color:rgba(255,255,255,0.7);line-height:1.5;">7 nuits tout-inclus | Vol + Hotel 5* | Transferts</p>
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:16px;">
      <tr>
        <td style="padding-right:16px;">
          <span style="font-size:13px;color:rgba(255,255,255,0.5);text-decoration:line-through;">1 499 $</span>
        </td>
        <td>
          <span style="font-size:28px;font-weight:800;color:#E6B85A;">899 $</span>
          <span style="font-size:12px;color:rgba(255,255,255,0.6);">/pers.</span>
        </td>
      </tr>
      </table>
    </td>
    </tr>
    </table>
  </td>
  </tr>
  </table>
</td>
</tr>

<!-- 3 Destination Cards -->
<tr>
<td style="padding:0 40px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
  <tr>
    <td width="33%" style="padding:0 6px 0 0;vertical-align:top;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #E5E7EB;border-radius:10px;overflow:hidden;">
      <tr><td style="background-color:#0F6CF5;height:8px;"></td></tr>
      <tr><td style="padding:16px 12px;text-align:center;">
        <p style="margin:0;font-size:13px;font-weight:700;color:#0B1228;">Punta Cana</p>
        <p style="margin:4px 0;font-size:11px;color:#6B7280;">7 nuits tout-inclus</p>
        <p style="margin:8px 0 0;font-size:18px;font-weight:800;color:#0F6CF5;">799 $</p>
      </td></tr>
      </table>
    </td>
    <td width="33%" style="padding:0 3px;vertical-align:top;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #E5E7EB;border-radius:10px;overflow:hidden;">
      <tr><td style="background-color:#E6B85A;height:8px;"></td></tr>
      <tr><td style="padding:16px 12px;text-align:center;">
        <p style="margin:0;font-size:13px;font-weight:700;color:#0B1228;">Cuba</p>
        <p style="margin:4px 0;font-size:11px;color:#6B7280;">5 nuits tout-inclus</p>
        <p style="margin:8px 0 0;font-size:18px;font-weight:800;color:#0F6CF5;">649 $</p>
      </td></tr>
      </table>
    </td>
    <td width="33%" style="padding:0 0 0 6px;vertical-align:top;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #E5E7EB;border-radius:10px;overflow:hidden;">
      <tr><td style="background-color:#0B1B4D;height:8px;"></td></tr>
      <tr><td style="padding:16px 12px;text-align:center;">
        <p style="margin:0;font-size:13px;font-weight:700;color:#0B1228;">Jamaique</p>
        <p style="margin:4px 0;font-size:11px;color:#6B7280;">7 nuits tout-inclus</p>
        <p style="margin:8px 0 0;font-size:18px;font-weight:800;color:#0F6CF5;">949 $</p>
      </td></tr>
      </table>
    </td>
  </tr>
  </table>
</td>
</tr>

<!-- CTA Button -->
<tr>
<td align="center" style="padding:32px 40px;">
  <table role="presentation" cellpadding="0" cellspacing="0">
  <tr>
  <td style="background:linear-gradient(135deg,#0F6CF5 0%,#0B1B4D 100%);border-radius:10px;">
    <a href="https://www.zenivatravel.com" target="_blank" style="display:inline-block;padding:14px 40px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;letter-spacing:0.3px;">
      Voir toutes les offres
    </a>
  </td>
  </tr>
  </table>
  <p style="margin:12px 0 0;font-size:12px;color:#6B7280;">Offres valides pour une duree limitee. Taxes en sus.</p>
</td>
</tr>

<!-- Divider -->
<tr>
<td style="padding:0 40px;">
  <div style="height:1px;background-color:#E5E7EB;"></div>
</td>
</tr>

<!-- Trust badges -->
<tr>
<td style="padding:24px 40px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
  <tr>
    <td width="33%" style="text-align:center;vertical-align:top;padding:0 8px;">
      <p style="margin:0;font-size:20px;">&#9989;</p>
      <p style="margin:4px 0 0;font-size:12px;font-weight:700;color:#0B1228;">TICO Licenciee</p>
      <p style="margin:2px 0 0;font-size:11px;color:#6B7280;">Agence certifiee</p>
    </td>
    <td width="33%" style="text-align:center;vertical-align:top;padding:0 8px;">
      <p style="margin:0;font-size:20px;">&#128274;</p>
      <p style="margin:4px 0 0;font-size:12px;font-weight:700;color:#0B1228;">Paiement securise</p>
      <p style="margin:2px 0 0;font-size:11px;color:#6B7280;">ZeniPay protege</p>
    </td>
    <td width="33%" style="text-align:center;vertical-align:top;padding:0 8px;">
      <p style="margin:0;font-size:20px;">&#9733;</p>
      <p style="margin:4px 0 0;font-size:12px;font-weight:700;color:#0B1228;">Support 24/7</p>
      <p style="margin:2px 0 0;font-size:11px;color:#6B7280;">Lina, votre concierge</p>
    </td>
  </tr>
  </table>
</td>
</tr>

<!-- Footer -->
<tr>
<td style="background-color:#0B1B4D;padding:28px 40px;text-align:center;">
  <p style="margin:0;font-size:14px;font-weight:700;color:#ffffff;letter-spacing:0.5px;">ZENIVA <span style="color:#E6B85A;">TRAVEL</span></p>
  <p style="margin:8px 0 0;font-size:12px;color:rgba(255,255,255,0.6);line-height:1.5;">
    Votre agence de voyage premium au Canada
  </p>
  <table role="presentation" cellpadding="0" cellspacing="0" style="margin:16px auto 0;">
  <tr>
    <td style="padding:0 8px;"><a href="https://www.zenivatravel.com" style="font-size:12px;color:#E6B85A;text-decoration:none;">Site web</a></td>
    <td style="color:rgba(255,255,255,0.3);">|</td>
    <td style="padding:0 8px;"><a href="mailto:info@zeniva.ca" style="font-size:12px;color:#E6B85A;text-decoration:none;">Contact</a></td>
    <td style="color:rgba(255,255,255,0.3);">|</td>
    <td style="padding:0 8px;"><a href="#" style="font-size:12px;color:#E6B85A;text-decoration:none;">Se desabonner</a></td>
  </tr>
  </table>
  <p style="margin:16px 0 0;font-size:10px;color:rgba(255,255,255,0.35);line-height:1.4;">
    &copy; 2026 Zeniva Travel Inc. Tous droits reserves.<br>
    Cet email a ete envoye a {{EMAIL}}. Si vous ne souhaitez plus recevoir nos offres, cliquez sur Se desabonner.
  </p>
</td>
</tr>

</table>
<!-- End Main Container -->

</td></tr>
</table>

</body>
</html>`,
};

export const ZENIVA_AGENCY_OUTREACH_TEMPLATE = {
  name: "Zeniva - Outreach Agences B2B",
  subject: "Partenariat Zeniva Travel — {{COMPANY_NAME}}",
  preview_text: "Boostez vos ventes avec la plateforme Zeniva Travel",
  audience_type: "agencies",
  html_body: `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Zeniva Travel - Partenariat</title>
</head>
<body style="margin:0;padding:0;background-color:#F7F9FC;font-family:Arial,Helvetica,sans-serif;-webkit-font-smoothing:antialiased;">

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F7F9FC;">
<tr><td align="center" style="padding:20px 10px;">

<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(15,108,245,0.08);">

<!-- Header -->
<tr>
<td style="background:linear-gradient(135deg,#0B1B4D 0%,#0F6CF5 100%);padding:32px 40px;text-align:center;">
  <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
  <tr>
    <td style="background-color:rgba(255,255,255,0.15);border-radius:12px;padding:10px 20px;">
      <span style="font-size:24px;font-weight:800;color:#ffffff;letter-spacing:1px;">ZENIVA</span>
      <span style="font-size:12px;color:#E6B85A;display:block;letter-spacing:3px;margin-top:2px;">TRAVEL</span>
    </td>
  </tr>
  </table>
</td>
</tr>

<!-- Body -->
<tr>
<td style="padding:32px 40px;">
  <p style="margin:0;font-size:16px;color:#0B1228;line-height:1.6;">
    Bonjour <strong>{{FIRST_NAME}}</strong>,
  </p>
  <p style="margin:16px 0;font-size:15px;color:#6B7280;line-height:1.7;">
    Je me permets de vous contacter au nom de <strong style="color:#0B1228;">Zeniva Travel</strong>. Nous avons developpe une plateforme innovante qui permet aux agences comme <strong style="color:#0F6CF5;">{{COMPANY_NAME}}</strong> d'offrir a leurs clients une experience de reservation premium.
  </p>

  <!-- Benefits -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;background-color:#F7F9FC;border-radius:10px;border-left:4px solid #0F6CF5;">
  <tr><td style="padding:20px;">
    <p style="margin:0 0 12px;font-size:14px;font-weight:700;color:#0B1228;">Ce que Zeniva apporte a votre agence :</p>
    <table role="presentation" cellpadding="0" cellspacing="0">
    <tr><td style="padding:4px 0;font-size:14px;color:#6B7280;">&#10003; &nbsp;Moteur de recherche multi-GDS integre</td></tr>
    <tr><td style="padding:4px 0;font-size:14px;color:#6B7280;">&#10003; &nbsp;Systeme de paiement ZeniPay securise</td></tr>
    <tr><td style="padding:4px 0;font-size:14px;color:#6B7280;">&#10003; &nbsp;IA concierge Lina pour vos clients</td></tr>
    <tr><td style="padding:4px 0;font-size:14px;color:#6B7280;">&#10003; &nbsp;Tableaux de bord et analytics en temps reel</td></tr>
    <tr><td style="padding:4px 0;font-size:14px;color:#6B7280;">&#10003; &nbsp;Commission competitive et support dedie</td></tr>
    </table>
  </td></tr>
  </table>

  <p style="margin:16px 0;font-size:15px;color:#6B7280;line-height:1.7;">
    Seriez-vous disponible pour un appel de 15 minutes cette semaine afin que je puisse vous presenter notre plateforme en detail ?
  </p>
</td>
</tr>

<!-- CTA -->
<tr>
<td align="center" style="padding:0 40px 32px;">
  <table role="presentation" cellpadding="0" cellspacing="0">
  <tr>
  <td style="background:linear-gradient(135deg,#0F6CF5 0%,#0B1B4D 100%);border-radius:10px;">
    <a href="https://www.zenivatravel.com/demo" target="_blank" style="display:inline-block;padding:14px 36px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;">
      Planifier une demo
    </a>
  </td>
  </tr>
  </table>
</td>
</tr>

<!-- Signature -->
<tr>
<td style="padding:0 40px 24px;">
  <div style="height:1px;background-color:#E5E7EB;margin-bottom:20px;"></div>
  <p style="margin:0;font-size:14px;font-weight:700;color:#0B1228;">Alexandre Blais</p>
  <p style="margin:2px 0;font-size:13px;color:#6B7280;">Fondateur, Zeniva Travel</p>
  <p style="margin:2px 0;font-size:13px;color:#0F6CF5;">info@zeniva.ca</p>
</td>
</tr>

<!-- Footer -->
<tr>
<td style="background-color:#0B1B4D;padding:20px 40px;text-align:center;">
  <p style="margin:0;font-size:13px;font-weight:700;color:#ffffff;">ZENIVA <span style="color:#E6B85A;">TRAVEL</span></p>
  <p style="margin:6px 0 0;font-size:11px;color:rgba(255,255,255,0.5);line-height:1.4;">
    &copy; 2026 Zeniva Travel Inc. | <a href="#" style="color:#E6B85A;text-decoration:none;">Se desabonner</a>
  </p>
</td>
</tr>

</table>
</td></tr>
</table>

</body>
</html>`,
};
