// mtnlabs-open-web Cloudflare Worker
// Serves static assets and handles POST /api/waitlist

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Handle waitlist API
    if (url.pathname === '/api/waitlist' && request.method === 'POST') {
      return handleWaitlist(request, env);
    }

    // All other requests: serve static assets
    return env.ASSETS.fetch(request);
  },
};

async function handleWaitlist(request, env) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await request.json();
    const { email, name, activity, about, newsletter } = body;

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json(
        { success: false, error: 'Invalid email address' },
        { status: 400, headers: corsHeaders }
      );
    }

    const timestamp = new Date().toISOString();

    // Send confirmation email to the user
    const confirmationHtml = buildConfirmationEmail(name);
    const confirmResult = await sendPostmarkEmail(env, {
      From: 'mtnlabs <hello@mtnlabs.ai>',
      To: email,
      Subject: "You're on the mtnlabs waitlist! \u26F0\uFE0F",
      HtmlBody: confirmationHtml,
      MessageStream: 'outbound',
    });

    if (!confirmResult.ok) {
      const errText = await confirmResult.text();
      console.error('Postmark confirmation email failed:', errText);
      return Response.json(
        { success: false, error: 'Failed to send confirmation email' },
        { status: 502, headers: corsHeaders }
      );
    }

    // Send notification email to Fredrik
    const notificationHtml = buildNotificationEmail({ email, name, activity, about, newsletter, timestamp });
    const notifyResult = await sendPostmarkEmail(env, {
      From: 'mtnlabs <hello@mtnlabs.ai>',
      To: env.NOTIFY_EMAIL,
      Subject: `New waitlist signup: ${email}`,
      HtmlBody: notificationHtml,
      MessageStream: 'outbound',
    });

    if (!notifyResult.ok) {
      const errText = await notifyResult.text();
      console.error('Postmark notification email failed:', errText);
      // Don't fail the request - the user confirmation was already sent
    }

    return Response.json(
      { success: true },
      { headers: corsHeaders }
    );
  } catch (err) {
    console.error('Waitlist handler error:', err);
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}

async function sendPostmarkEmail(env, payload) {
  return fetch('https://api.postmarkapp.com/email', {
    method: 'POST',
    headers: {
      'X-Postmark-Server-Token': env.POSTMARK_TOKEN,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(payload),
  });
}

function buildConfirmationEmail(name) {
  const greeting = name ? `Hi ${escapeHtml(name)}` : 'Hi there';
  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#080f1c;font-family:'Inter',-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#080f1c;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:rgba(15,23,42,0.95);border:1px solid rgba(34,211,238,0.2);border-radius:16px;padding:40px 36px;">
        <tr><td style="text-align:center;padding-bottom:24px;">
          <div style="font-size:2.5rem;margin-bottom:12px;">\u26F0\uFE0F</div>
          <div style="font-size:1.3rem;font-weight:700;color:#e2e8f0;letter-spacing:-0.01em;">mtnlabs.ai</div>
        </td></tr>
        <tr><td style="color:#e2e8f0;font-size:1rem;line-height:1.7;">
          <p style="margin:0 0 16px;">${greeting},</p>
          <p style="margin:0 0 16px;">Thanks for signing up for the mtnlabs waitlist! We're building something we think you'll love \u2014 AI-powered route planning made for the Norwegian mountains.</p>
          <p style="margin:0 0 16px;">We'll reach out as soon as a spot opens up.</p>
          <p style="margin:0 0 16px;">See you on the trail!</p>
          <p style="margin:0;color:#64748b;">The mtnlabs team</p>
        </td></tr>
        <tr><td style="padding-top:28px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
          <p style="margin:0;font-size:0.75rem;color:#475569;">mtnlabs.ai \u2014 AI-powered route planning for the Norwegian wilderness</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function buildNotificationEmail({ email, name, activity, about, newsletter, timestamp }) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:20px;font-family:monospace;background:#f8f9fa;color:#1a1a1a;">
  <h2 style="margin:0 0 16px;">New waitlist signup</h2>
  <table cellpadding="6" cellspacing="0" style="border-collapse:collapse;">
    <tr><td style="font-weight:bold;vertical-align:top;">Email:</td><td>${escapeHtml(email)}</td></tr>
    <tr><td style="font-weight:bold;vertical-align:top;">Name:</td><td>${escapeHtml(name || '(not provided)')}</td></tr>
    <tr><td style="font-weight:bold;vertical-align:top;">Activity:</td><td>${escapeHtml(activity || '(not selected)')}</td></tr>
    <tr><td style="font-weight:bold;vertical-align:top;">About:</td><td>${escapeHtml(about || '(empty)')}</td></tr>
    <tr><td style="font-weight:bold;vertical-align:top;">Newsletter:</td><td>${newsletter ? '✅ Yes' : '❌ No'}</td></tr>
    <tr><td style="font-weight:bold;vertical-align:top;">Timestamp:</td><td>${escapeHtml(timestamp)}</td></tr>
  </table>
</body>
</html>`;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
