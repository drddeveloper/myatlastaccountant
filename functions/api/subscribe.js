/**
 * POST /api/subscribe — newsletter signup → ActiveCampaign.
 *
 * Cloudflare Pages Function. Takes our own form's fields, forwards them to the
 * ActiveCampaign hosted-form endpoint (proc.php) server-side, and returns a
 * plain JSON result the page can render inline.
 *
 * Why proxy instead of posting straight from the browser:
 *   - proc.php sends no CORS headers, which is why AC's own embed falls back to
 *     JSONP (it injects a <script> at proc.php?…&jsonp=true). A browser fetch()
 *     to it is blocked; JSONP would need the CSP opened to activehosted.com and
 *     evals whatever AC returns.
 *   - Server-to-server has no CORS at all, so the page stays same-origin and
 *     `connect-src 'self'` in public/_headers needs no change.
 *   - No AC stylesheet, no AC JavaScript, no Roboto from bunny.net, no AC
 *     branding block on the page.
 *
 * No API key needed — the hosted-form endpoint is public by design. Which list
 * the contact lands on is baked into the AC form config (u/f below), not sent
 * from here.
 *
 * Payload (JSON or form-encoded):
 *   firstname  string, required
 *   lastname   string, required
 *   email      string, required
 *   company    string — honeypot. Must be empty; bots that fill it get a fake
 *              success and nothing is sent onward.
 *
 * Responses:
 *   200 { ok: true }              – accepted by ActiveCampaign
 *   400 { ok: false, error }      – validation failure
 *   405 { ok: false, error }      – non-POST
 *   502 { ok: false, error }      – ActiveCampaign unreachable or erroring
 *
 * Without JavaScript the form posts natively and this returns a 303 to
 * /thank-you/ instead of JSON.
 */

// From the embed code the client generated in ActiveCampaign (2026-08-04).
// These identify the account and the specific form; they are not secrets — they
// ship in any AC embed — but they must match the form or the post is rejected.
const AC_ENDPOINT = 'https://atlasaccountantgroup.activehosted.com/proc.php';
const AC_HIDDEN = {
  u: '1',
  f: '1',
  s: '',
  c: '0',
  m: '0',
  act: 'sub',
  v: '2',
  or: '7fbacbb5-a232-45c7-8e3f-7c840ada8beb',
};

const json = (status, data) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

// Deliberately permissive: the authority on whether an address is real is the
// confirmation email, not a regex. This only catches obvious typos.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const clean = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

export async function onRequest(context) {
  if (context.request.method !== 'POST') {
    return json(405, { ok: false, error: 'Method not allowed.' });
  }
  return onRequestPost(context);
}

export async function onRequestPost({ request }) {
  const contentType = request.headers.get('Content-Type') || '';
  const wantsJson = (request.headers.get('Accept') || '').includes('application/json');

  let body = {};
  try {
    if (contentType.includes('application/json')) {
      body = await request.json();
    } else {
      body = Object.fromEntries(await request.formData());
    }
  } catch {
    return json(400, { ok: false, error: 'Could not read the submitted form.' });
  }

  // Honeypot. Real people never see this field, so anything in it is a bot.
  // Return success so the bot doesn't learn to try again with it blank.
  if (clean(body.company, 200)) {
    return wantsJson ? json(200, { ok: true }) : Response.redirect(new URL('/thank-you/', request.url), 303);
  }

  const firstname = clean(body.firstname, 100);
  const lastname = clean(body.lastname, 100);
  const email = clean(body.email, 200);

  if (!firstname) return json(400, { ok: false, error: 'Please enter your first name.' });
  if (!lastname) return json(400, { ok: false, error: 'Please enter your last name.' });
  if (!EMAIL_RE.test(email)) return json(400, { ok: false, error: 'Please enter a valid email address.' });

  const params = new URLSearchParams({ ...AC_HIDDEN, firstname, lastname, email });

  let acResponse;
  try {
    acResponse = await fetch(`${AC_ENDPOINT}?jsonp=true`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: params.toString(),
    });
  } catch {
    return json(502, {
      ok: false,
      error: 'We could not reach our email system. Please try again in a moment.',
    });
  }

  // proc.php answers HTTP 200 even when it rejects the submission, so the
  // status alone proves nothing — the verdict is in the body. With
  // `Accept: application/json` it returns JSON shaped like
  //   { action: "show_error" | "show_thank_you" | …, data: { message }, js }
  // (verified against the live endpoint 2026-08-04). Fall back to sniffing the
  // JSONP `js` string if the shape ever changes.
  if (!acResponse.ok) {
    return json(502, {
      ok: false,
      error: 'Our email system rejected the signup. Please try again in a moment.',
    });
  }

  const text = await acResponse.text();
  let action = '';
  let acMessage = '';
  try {
    const parsed = JSON.parse(text);
    action = parsed.action || '';
    acMessage = (parsed.data && parsed.data.message) || '';
  } catch {
    action = /_show_error\s*\(/.test(text) ? 'show_error' : '';
  }

  if (action === 'show_error') {
    // AC's own wording is written for its form builder ("Forms must have an
    // email field…") and would confuse a visitor, so we send our own copy and
    // keep theirs under `detail` for debugging.
    return json(400, {
      ok: false,
      error: 'That signup could not be completed. Please check the address and try again.',
      detail: acMessage || undefined,
    });
  }

  if (!wantsJson) {
    return Response.redirect(new URL('/thank-you/', request.url), 303);
  }
  return json(200, { ok: true });
}
