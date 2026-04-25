// Vercel Serverless Function — POST /api/contact
// Receives the contact form, validates server-side, blocks bots,
// then relays the message via IONOS SMTP from y.ozbek@cogelas.fr to info@cogelas.fr.

const nodemailer = require('nodemailer');

// Simple per-IP rate limit. In-memory: best-effort across warm lambda instances,
// fails open if the instance is cold-started. Honeypot + timing are the real guard.
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_MAX = 5;
const ipHits = new Map(); // ip -> [timestamp, ...]

function rateLimited(ip) {
  const now = Date.now();
  const cutoff = now - RATE_LIMIT_WINDOW_MS;
  const hits = (ipHits.get(ip) || []).filter(t => t > cutoff);
  if (hits.length >= RATE_LIMIT_MAX) {
    ipHits.set(ip, hits);
    return true;
  }
  hits.push(now);
  ipHits.set(ip, hits);
  return false;
}

function clean(s, max = 2000) {
  return String(s == null ? '' : s).trim().slice(0, max);
}

function isEmail(s) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[c]);
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Vercel parses JSON bodies automatically when Content-Type is application/json
  const body = req.body || {};

  // 1. Honeypot — must be empty
  if (clean(body._honey)) {
    return res.status(200).json({ ok: true }); // pretend success, don't tip off bot
  }

  // 2. Timing check — form must take > 2s to fill
  const ts = Number(body._ts);
  if (!ts || (Date.now() - ts) < 2000) {
    return res.status(200).json({ ok: true }); // same: silent reject
  }

  // 3. Rate limit by IP
  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
             req.headers['x-real-ip'] || 'unknown';
  if (rateLimited(ip)) {
    return res.status(429).json({ error: 'Trop de tentatives. Reessayez plus tard.' });
  }

  // 4. Field validation
  const nom       = clean(body.nom, 100);
  const prenom    = clean(body.prenom, 100);
  const email     = clean(body.email, 200);
  const telephone = clean(body.telephone, 50);
  const sujet     = clean(body.sujet, 200);
  const message   = clean(body.message, 5000);

  if (!nom || !prenom || !email || !sujet || !message) {
    return res.status(400).json({ error: 'Champs requis manquants.' });
  }
  if (!isEmail(email)) {
    return res.status(400).json({ error: 'Adresse email invalide.' });
  }

  // 5. Send via IONOS SMTP
  const user = process.env.IONOS_SMTP_USER;
  const pass = process.env.IONOS_SMTP_PASS;
  if (!user || !pass) {
    console.error('IONOS_SMTP_USER or IONOS_SMTP_PASS not set');
    return res.status(500).json({ error: 'Service indisponible. Reessayez plus tard.' });
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.ionos.fr',
    port: 587,
    secure: false, // STARTTLS upgrade
    requireTLS: true,
    auth: { user, pass }
  });

  const subject = `Nouveau message depuis cogelas.fr — ${sujet}`;

  const text =
`Nom:        ${nom}
Prenom:     ${prenom}
Email:      ${email}
Telephone:  ${telephone || '-'}
Sujet:      ${sujet}

Message:
${message}

--
Envoye depuis le formulaire de contact cogelas.fr
IP: ${ip}`;

  const html = `
<table cellpadding="8" cellspacing="0" border="0" style="font-family:Arial,sans-serif;font-size:14px;color:#001017;border-collapse:collapse;">
  <tr><td style="background:#001017;color:#fff;padding:16px 24px;font-weight:700;letter-spacing:1px;">NOUVEAU MESSAGE — COGELAS.FR</td></tr>
  <tr><td style="padding:24px;">
    <p style="margin:0 0 12px;"><strong>Nom :</strong> ${escapeHtml(nom)}</p>
    <p style="margin:0 0 12px;"><strong>Prenom :</strong> ${escapeHtml(prenom)}</p>
    <p style="margin:0 0 12px;"><strong>Email :</strong> <a href="mailto:${escapeHtml(email)}" style="color:#D9000D;">${escapeHtml(email)}</a></p>
    <p style="margin:0 0 12px;"><strong>Telephone :</strong> ${escapeHtml(telephone || '-')}</p>
    <p style="margin:0 0 12px;"><strong>Sujet :</strong> ${escapeHtml(sujet)}</p>
    <p style="margin:24px 0 8px;"><strong>Message :</strong></p>
    <div style="white-space:pre-wrap;border-left:3px solid #D9000D;padding:12px 16px;background:#f8f9fa;">${escapeHtml(message)}</div>
    <p style="margin:24px 0 0;color:#6c757d;font-size:12px;">Envoye depuis le formulaire de contact cogelas.fr — IP ${escapeHtml(ip)}</p>
  </td></tr>
</table>`;

  try {
    await transporter.sendMail({
      from: `"Formulaire cogelas.fr" <${user}>`, // must equal authenticated user
      to: 'info@cogelas.fr',
      replyTo: `"${nom} ${prenom}" <${email}>`,
      subject,
      text,
      html
    });
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('SMTP send failed:', err);
    return res.status(502).json({ error: 'Echec de l\'envoi. Reessayez plus tard.' });
  }
};
