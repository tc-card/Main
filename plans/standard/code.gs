const STANDARD_CONFIG_ = {
  SPREADSHEET_ID: '1tvVAN9sQ4yNPV0om2RKb8EiejoYn8eytTOEi9k26g0E',
  FORM_SHEET: 'Form',
  ANALYTICS_SHEET: 'Analytics',
  DUPLICATE_CACHE_KEY: 'standard_signup_duplicates_v1',
  DUPLICATE_CACHE_SECONDS: 60,
  PROFILE_CACHE_SECONDS: 300,
  PROFILE_DOMAIN: 'https://my.tccards.tn'
};

const STANDARD_FORM_HEADERS_ = [
  'Timestamp', 'Name', 'Email', 'Link', 'Tagline', 'Phone', 'Address',
  'Social Links', 'Selected Style', 'Profile Picture URL', 'Referral Code',
  'ID', 'Status', 'Email Preference', 'Analytics ID'
];

const STANDARD_ANALYTICS_HEADERS_ = [
  'Timestamp', 'Analytics ID', 'Event Type', 'Details'
];

/* ── Setup ──────────────────────────────────────────────── */
function setupStandardSheets() {
  ensureStandardSheets_();
  MailApp.getRemainingDailyQuota();
  return { status: 'success', sheets: [STANDARD_CONFIG_.FORM_SHEET, STANDARD_CONFIG_.ANALYTICS_SHEET] };
}

/* ── GET router -> directions for hackers ─────────────────────────────────────────────
   Supports, in order of evaluation:
     ?healthcheck=true                  → "OK"
     ?action=health                     → "OK"
     ?action=profile & (id|link)        → lookup (explicit)
     ?action=lookup  & (id|link)        → lookup (explicit)
     ?get_stats=true  / action=stats    → stats
     ?get_all_links=true / action=links → links
     ?check_duplicates=true / action=check & email & link → dupe check
     ?check_referral=true               → stub
     ?name & ?email & ?link             → signup
     ?id=…  or  ?link=…  alone          → lookup (legacy viewer compat)
     anything else                      → "Invalid request"
*/
function doGet(e) {
  try {
    const p = e && e.parameter ? e.parameter : {};
    const action = String(p.action || '').toLowerCase();

    if (p.healthcheck || action === 'health') {
      return ContentService.createTextOutput('OK');
    }

    // Best-effort header setup — never blocks a request.
    try { ensureStandardSheets_(); }
    catch (ensureErr) { console.warn('ensureStandardSheets_ warning:', ensureErr); }

    // Explicit lookup (unambiguous)
    if (action === 'profile' || action === 'lookup') {
      return jsonResponse_(lookupProfile_(p.link || p.id, p.id !== undefined));
    }

    if (p.get_stats === 'true' || action === 'stats') {
      return jsonResponse_(getSubmissionStats_());
    }
    if (p.get_all_links === 'true' || action === 'links') {
      return jsonResponse_({ links: getExistingLinks_() });
    }
    if (p.check_duplicates === 'true' || action === 'check') {
      return jsonResponse_(checkDuplicates_(p.email, p.link, true));
    }
    if (p.check_referral === 'true') {
      return jsonResponse_({ codeExists: false, codeDetails: null });
    }

    // Signup: name + email + link must all be present
    if (p.name !== undefined && p.email !== undefined && p.link !== undefined) {
      return jsonResponse_(submitStandardSignup_(p));
    }

    // Legacy viewer profile lookup: bare ?id= or ?link=
    if (p.id !== undefined || p.link !== undefined) {
      return jsonResponse_(lookupProfile_(p.id || p.link, p.id !== undefined));
    }

    throw new Error('Invalid request');
  } catch (error) {
    console.error('GET error:', error);
    return jsonResponse_({ status: 'error', message: error.message || 'Request failed' });
  }
}

function doPost(e) {
  try {
    let params = (e && e.parameter) ? e.parameter : {};
    const body = e && e.postData && e.postData.contents;

    if (body) {
      try {
        const parsed = JSON.parse(body);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) params = parsed;
      } catch (_) { /* keep e.parameter for form-encoded POSTs */ }
    }

    try { ensureStandardSheets_(); }
    catch (ensureErr) { console.warn('ensureStandardSheets_ warning:', ensureErr); }

    if (params.action === 'trackAnalytics') {
      return jsonResponse_(recordStandardAnalyticsEvent_(params));
    }

    return jsonResponse_(submitStandardSignup_(params));
  } catch (error) {
    console.error('POST error:', error);
    return jsonResponse_({ status: 'error', message: error.message || 'Request failed' });
  }
}

/* ── Profile lookup viewer's code ──────────── */
function lookupProfile_(identifier, byId) {
  if (!identifier) throw new Error('Invalid identifier parameter');
  const data = findRow(String(identifier).trim(), !!byId);
  if (!data) throw new Error('Profile not found');
  return {
    status: 'success',
    data: {
      status: data.Status || 'Inactive',
      Name: data.Name || '',
      Link: data.Link || '',
      ...sanitizeProfileData(data)
    }
  };
}

function findRow(identifier, byId = false) {
  const cache = CacheService.getScriptCache();
  const cacheKey = (byId ? 'id_' : 'link_') + identifier.trim();

  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    try { return JSON.parse(cachedData); } catch (_) { cache.remove(cacheKey); }
  }

  const spreadsheet = SpreadsheetApp.openById(STANDARD_CONFIG_.SPREADSHEET_ID);
  const sheet = spreadsheet.getSheetByName(STANDARD_CONFIG_.FORM_SHEET);
  if (!sheet) throw new Error('Form sheet not found');

  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  if (lastRow <= 1) return null;

  const data = sheet.getRange(1, 1, lastRow, lastCol).getValues();
  const headers = data[0];
  const columnName = byId ? 'ID' : 'Link';
  const columnIndex = headers.findIndex(h => h.toString().trim() === columnName);
  if (columnIndex === -1) throw new Error(`${columnName} column not found`);

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][columnIndex]).trim() === identifier.trim()) {
      const responseData = {};
      headers.forEach((header, index) => {
        responseData[header] = data[i][index] !== null ? String(data[i][index]).trim() : '';
      });
      if (!responseData.Name) throw new Error('Profile data missing required Name field');
      try {
        cache.put(cacheKey, JSON.stringify(responseData), STANDARD_CONFIG_.PROFILE_CACHE_SECONDS);
      } catch (_) {}
      return responseData;
    }
  }
  return null;
}

function sanitizeProfileData(data) {
  const safe = {};
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      safe[key] = data[key]
        ? data[key].toString().replace(/</g, '&lt;').replace(/>/g, '&gt;')
        : '';
    }
  }
  return safe;
}

function clearProfileCache_(link, id) {
  const cache = CacheService.getScriptCache();
  if (link) cache.remove('link_' + String(link).trim());
  if (id)   cache.remove('id_'   + String(id).trim());
}

function clearCache() { CacheService.getScriptCache().removeAll(); }

/* ── Signup ──────────────────────────────────────────────── */
function submitStandardSignup_(params) {
  const name = cleanText_(params.name);
  const email = cleanText_(params.email).toLowerCase();
  const link = cleanText_(params.link);

  if (!name || !email || !link) throw new Error('Name, email, and link are required');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Please enter a valid email address');
  if (!/^[a-zA-Z][a-zA-Z0-9-]{2,14}$/.test(link)) throw new Error('The profile link must be 3–15 characters and start with a letter');

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) throw new Error('Signup is busy. Please try again in a moment.');

  let submissionId;
  try {
    const duplicates = checkDuplicates_(email, link, false);
    if (duplicates.emailExists) throw new Error('Email already exists');
    if (duplicates.linkExists) throw new Error('Link already exists');

    const sheet = getStandardSheet_(STANDARD_CONFIG_.FORM_SHEET);
    submissionId = Utilities.getUuid();

    const socialLinks = normalizeSocialLinks_(
      params.social_links !== undefined ? params.social_links : params.socialLinks
    );

    const address = cleanText_(params.address);
    const phone = cleanText_(params.phone);
    const profilePic = cleanText_(
      params.profilePic || params.profile_picture || params.profilePicture ||
      params['Profile Picture URL'] || ''
    );

    const row = [
      new Date(),
      safeSheetText_(name),
      safeSheetText_(email),
      safeSheetText_(link),
      safeSheetText_(params.tagline),
      safeSheetText_(phone),
      safeSheetText_(address),
      safeSheetText_(socialLinks),
      safeSheetText_(params.style || params.selectedStyle || 'default'),
      safeSheetText_(profilePic),
      '',
      submissionId,
      'Inactive',
      '',
      submissionId
    ];

    sheet.getRange(sheet.getLastRow() + 1, 1, 1, STANDARD_FORM_HEADERS_.length).setValues([row]);

    CacheService.getScriptCache().remove(STANDARD_CONFIG_.DUPLICATE_CACHE_KEY);
    clearProfileCache_(link, submissionId);   // ← so /@link resolves immediately after signup
  } finally {
    lock.releaseLock();
  }

  const emailSent = sendStandardConfirmationEmail_({
    email, name, link, address, phone,
    profilePic: params.profilePic || params.profile_picture || params.profilePicture || ''
  });

  return { status: 'success', message: 'Standard signup received', submissionId, emailSent };
}

/* ── Analytics no anal & not ytics ──────────────────────────────────────────── */
function recordStandardAnalyticsEvent_(params) {
  const allowedEvents = new Set([
    'view', 'link_click', 'contact_email', 'contact_phone',
    'contact_location', 'share_click', 'copy_details', 'save_contact'
  ]);
  const analyticsId = cleanText_(params.analyticsId);
  const eventType = cleanText_(params.eventType).toLowerCase();
  if (!analyticsId || !allowedEvents.has(eventType)) throw new Error('Invalid analytics event');

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) throw new Error('Analytics is busy.');

  try {
    const form = getStandardSheet_(STANDARD_CONFIG_.FORM_SHEET);
    const formHeaders = form.getRange(1, 1, 1, form.getLastColumn())
      .getDisplayValues()[0].map(v => String(v).trim());
    const analyticsIdCol = formHeaders.indexOf('Analytics ID');
    const idCol = formHeaders.indexOf('ID');
    const statusCol = formHeaders.indexOf('Status');
    if (analyticsIdCol < 0 && idCol < 0) throw new Error('Form is missing an Analytics ID or ID column');

    const profile = form.getDataRange().getValues().slice(1).find(row => {
      const rowId = String(
        (analyticsIdCol >= 0 && row[analyticsIdCol]) ||
        (idCol >= 0 && row[idCol]) || ''
      ).trim();
      return rowId === analyticsId;
    });
    if (!profile || (statusCol >= 0 &&
        String(profile[statusCol] || '').trim().toLowerCase() !== 'active')) {
      throw new Error('Analytics profile not found or inactive');
    }

    const details = {};
    if (eventType === 'link_click') {
      const input = params.details && typeof params.details === 'object' ? params.details : {};
      const raw = cleanText_(input.domain || input.url);
      const domain = raw.replace(/^https?:\/\//i, '').split(/[/?#]/)[0].toLowerCase().replace(/^www\./, '');
      if (!domain || !/^[a-z0-9.-]+$/.test(domain)) throw new Error('Invalid link domain');
      details.domain = domain;
    }

    const analytics = getStandardSheet_(STANDARD_CONFIG_.ANALYTICS_SHEET);
    const headers = analytics.getRange(1, 1, 1, analytics.getLastColumn())
      .getDisplayValues()[0].map(v => String(v).trim());
    const idHeader = headers.includes('Analytics ID') ? 'Analytics ID' : 'Profile ID';
    if (!headers.includes('Timestamp') || !headers.includes(idHeader) ||
        !headers.includes('Event Type') || !headers.includes('Details')) {
      throw new Error('Analytics sheet headers do not match the expected layout');
    }

    const record = {
      Timestamp: new Date(),
      [idHeader]: analyticsId,
      'Event Type': eventType,
      Details: JSON.stringify(details)
    };
    analytics.appendRow(headers.map(h =>
      Object.prototype.hasOwnProperty.call(record, h) ? record[h] : ''
    ));

    return { status: 'success' };
  } finally {
    lock.releaseLock();
  }
}

/* ── Duplicate checks (the other calls) ──────────────────────────────────── */
function checkDuplicates_(email, link, useCache) {
  const normalizedEmail = cleanText_(email).toLowerCase();
  const normalizedLink = cleanText_(link).toLowerCase();
  const cache = CacheService.getScriptCache();

  let rows = null;
  if (useCache) {
    const cached = cache.get(STANDARD_CONFIG_.DUPLICATE_CACHE_KEY);
    if (cached) { try { rows = JSON.parse(cached); } catch (_) { cache.remove(STANDARD_CONFIG_.DUPLICATE_CACHE_KEY); } }
  }
  if (!Array.isArray(rows)) {
    const sheet = getStandardSheet_(STANDARD_CONFIG_.FORM_SHEET);
    const count = Math.max(0, sheet.getLastRow() - 1);
    rows = count ? sheet.getRange(2, 3, count, 2).getDisplayValues() : [];
    if (useCache) {
      cache.put(STANDARD_CONFIG_.DUPLICATE_CACHE_KEY, JSON.stringify(rows), STANDARD_CONFIG_.DUPLICATE_CACHE_SECONDS);
    }
  }

  return {
    status: 'success',
    emailExists: !!normalizedEmail && rows.some(row =>
      String(row[0] || '').trim().toLowerCase() === normalizedEmail),
    linkExists: !!normalizedLink && rows.some(row =>
      String(row[1] || '').trim().toLowerCase() === normalizedLink)
  };
}

/* ── Stats / links (calls) ─────────────────────────────────────── */
function getSubmissionStats_() {
  const sheet = getStandardSheet_(STANDARD_CONFIG_.FORM_SHEET);
  const count = Math.max(0, sheet.getLastRow() - 1);
  if (!count) return { status: 'success', totalCount: 0, monthlyGrowth: 0 };

  const values = sheet.getRange(2, 1, count, 1).getValues();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const nextMonth  = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const monthlyGrowth = values.reduce((total, [value]) => {
    const date = value instanceof Date ? value : new Date(value);
    return !Number.isNaN(date.getTime()) && date >= monthStart && date < nextMonth ? total + 1 : total;
  }, 0);

  return { status: 'success', totalCount: count, monthlyGrowth };
}

function getExistingLinks_() {
  const sheet = getStandardSheet_(STANDARD_CONFIG_.FORM_SHEET);
  const count = Math.max(0, sheet.getLastRow() - 1);
  if (!count) return [];
  return sheet.getRange(2, 4, count, 1).getDisplayValues().flat()
    .map(v => String(v).trim()).filter(Boolean);
}

/* ── Email ──────────────────────────────────────────────── */
function sendStandardConfirmationEmail_(options) {
  const opts = options || {};
  const email = cleanText_(opts.email);
  const name = cleanText_(opts.name);
  const link = cleanText_(opts.link);
  const address = cleanText_(opts.address);
  const phone = cleanText_(opts.phone);
  const profilePicRaw = cleanText_(opts.profilePic);

  const profileUrl = `${STANDARD_CONFIG_.PROFILE_DOMAIN}/@${encodeURIComponent(link)}`;
  const safeName = name ? String(name).trim() : 'Valued Customer';
  const safeAddress = address ? String(address).trim() : 'The address you provided on your card';
  const safePhone = phone ? String(phone).trim() : 'The number you provided';
  const currentYear = new Date().getFullYear();
  const profilePic = /^https?:\/\/\S+$/i.test(profilePicRaw) ? profilePicRaw : '';

  const nameHtml = escapeHtml_(safeName);
  const addressHtml = escapeHtml_(safeAddress);
  const phoneHtml = escapeHtml_(safePhone);
  const linkHtml = escapeHtml_(link);
  const profileUrlHtml = escapeHtml_(profileUrl);
  const profilePicHtml = escapeHtml_(profilePic);

  const plainBody = [
    `Order received, ${safeName}!`, '',
    "Thanks for your order — we've received it. Our team will reach out to you soon to confirm the details with you.", '',
    'Here are the details we have on file:',
    `  Name: ${safeName}`,
    `  Digital Card: ${profileUrl}`,
    `  Shipping Address: ${safeAddress}`,
    `  Phone: ${safePhone}`, '',
    "You don't need to do anything right now. We'll confirm your order with you before anything ships.", '',
    'Need help? If you have any questions about this order, reply to this email or contact us at info@tccards.tn.', '',
    `© ${currentYear} tccards.tn. All rights reserved.`,
    'This is an automated message, please do not reply to this email.'
  ].join('\n');

  try {
    MailApp.sendEmail({
      to: email,
      subject: `Order received, ${safeName}!`,
      name: 'tccards.tn',
      replyTo: 'info@tccards.tn',
      body: plainBody,
      htmlBody: `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<title>Order Received</title>
<style>
p { color: #171717 !important; font-size: 14px !important; line-height: 24px !important; margin: 0 0 16px 0 !important; }
h1 { color: #171717 !important; font-size: 24px !important; line-height: 32px !important; font-weight: 600 !important; letter-spacing: -0.02em !important; margin: 0 0 24px 0 !important; padding: 0 !important; }
a { color: #0067D6 !important; text-decoration: none !important; }
strong { color: #171717 !important; font-weight: 600 !important; }
hr { border-top: 1px solid #E6E6E6 !important; border-bottom: none !important; border-left: none !important; border-right: none !important; }
.footer-text { color: #7D7D7D !important; font-size: 12px !important; line-height: 1.5 !important; margin: 0 0 8px 0 !important; }
.footer-text a { color: #7D7D7D !important; text-decoration: underline !important; font-weight: 400 !important; }
.brand-logo { display: block; filter: invert(0); }
.detail-label { color: #7D7D7D !important; font-size: 13px !important; line-height: 20px !important; }
.detail-value { color: #171717 !important; font-size: 14px !important; line-height: 20px !important; }
.btn-link { color: #ffffff !important; text-decoration: none !important; }
@media (prefers-color-scheme: dark) {
  html, body { background-color: #0A0A0A !important; }
  body, p, td, th, span { color: #ededed !important; }
  h1, strong { color: #ffffff !important; }
  a { color: #4da3ff !important; }
  .footer-text, .footer-text p { color: #7D7D7D !important; }
  .footer-text a { color: #7D7D7D !important; }
  hr { border-top-color: #333333 !important; }
  .brand-logo { display: block; filter: invert(0); border-radius: 25px; background-color: black; }
  .tccards-details-block { background-color: #1F1F1F !important; color: #ffffff !important; }
  .detail-label { color: #8F8F8F !important; }
  .detail-value { color: #EDEDED !important; }
  .btn-link { color: #ffffff !important; }
}
</style>
</head>
<body style="background-color:#ffffff; margin:0; padding:0;">
<table width="100%" border="0" cellspacing="0" cellpadding="0" style="width:100% !important;">
  <tr><td align="center">
    <table style="margin:40px 0;" width="600" border="0" cellspacing="0" cellpadding="40">
      <tr><td align="center">
        <div style="font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; text-align:left; width:465px;">
          <div style="margin-bottom:48px">
            <img src="https://edit.tccards.tn/Assets/images/logo.png" width="24" height="21" alt="tccards.tn" class="brand-logo">
          </div>
          ${profilePicHtml ? `<div style="margin-bottom:24px"><img src="${profilePicHtml}" width="48" height="48" alt="${nameHtml}" style="display:block; border-radius:50%; object-fit:cover;"></div>` : ''}
          <h1>Order received, <strong>${nameHtml}</strong>!</h1>
          <p>Thanks for your order — we've received it. Our team will reach out to you soon to confirm the details with you.</p>
          <p>Here are the details we have on file:</p>
          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="width:100% !important; margin:24px 0;">
            <tr><td bgcolor="#F2F2F2" class="tccards-details-block" style="border-radius:8px; padding:20px 24px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="width:100% !important;">
                <tr><td class="detail-label" width="140" style="padding:8px 0; vertical-align:top;">Name</td><td class="detail-value" style="padding:8px 0; vertical-align:top;">${nameHtml}</td></tr>
                <tr><td class="detail-label" style="padding:8px 0; vertical-align:top;">Digital Card</td><td class="detail-value" style="padding:8px 0; vertical-align:top; word-break:break-all;"><a href="${profileUrlHtml}" target="_blank">my.tccards.tn/@${linkHtml}</a></td></tr>
                <tr><td class="detail-label" style="padding:8px 0; vertical-align:top;">Shipping Address</td><td class="detail-value" style="padding:8px 0; vertical-align:top;">${addressHtml}</td></tr>
                <tr><td class="detail-label" style="padding:8px 0; vertical-align:top;">Phone</td><td class="detail-value" style="padding:8px 0; vertical-align:top;">${phoneHtml}</td></tr>
              </table>
            </td></tr>
          </table>
          <p>You don't need to do anything right now. We'll confirm your order with you before anything ships.</p>
          <hr style="margin:44px 0 32px 0; width:100%;">
          <p class="footer-text" style="margin-bottom: 20px;"><strong>Need help?</strong> If you have any questions about this order, reply to this email or contact us at <a href="mailto:info@tccards.tn">info@tccards.tn</a>.</p>
          <p class="footer-text">&copy; ${currentYear} <a href="https://www.tccards.tn" target="_blank">tccards.tn</a>. All rights reserved.<br>This is an automated message, please do not reply to this email.</p>
        </div>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`
    });
    return true;
  } catch (error) {
    console.error('Standard confirmation email failed:', error);
    return false;
  }
}

/* ── Sheet plumbing ────────────────────────────────────── */
function ensureStandardSheets_() {
  const spreadsheet = SpreadsheetApp.openById(STANDARD_CONFIG_.SPREADSHEET_ID);
  ensureSheetHeaders_(spreadsheet, STANDARD_CONFIG_.FORM_SHEET, STANDARD_FORM_HEADERS_);
  ensureSheetHeaders_(spreadsheet, STANDARD_CONFIG_.ANALYTICS_SHEET, STANDARD_ANALYTICS_HEADERS_);
}

function ensureSheetHeaders_(spreadsheet, sheetName, headers) {
  let sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) sheet = spreadsheet.insertSheet(sheetName);

  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    return;
  }

  const current = sheet.getRange(1, 1, 1, headers.length).getDisplayValues()[0]
    .map(v => String(v).trim());

  if (current.every(v => !v)) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    return;
  }

  let firstMismatch = -1;
  for (let i = 0; i < headers.length; i++) {
    const ok = current[i] === headers[i] ||
      (sheetName === STANDARD_CONFIG_.ANALYTICS_SHEET &&
       headers[i] === 'Analytics ID' && current[i] === 'Profile ID');
    if (!ok) { firstMismatch = i; break; }
  }
  if (firstMismatch < 0) return;

  const isLastColumn = firstMismatch === headers.length - 1;
  if (isLastColumn && !current[firstMismatch]) {
    sheet.getRange(1, headers.length).setValue(headers[headers.length - 1]);
    return;
  }
  console.warn(`Header drift in "${sheetName}" at column ${firstMismatch + 1}: expected "${headers[firstMismatch]}", found "${current[firstMismatch]}". Continuing.`);
}

function getStandardSheet_(sheetName) {
  const spreadsheet = SpreadsheetApp.openById(STANDARD_CONFIG_.SPREADSHEET_ID);
  const sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) throw new Error(`Sheet not found: ${sheetName}`);
  return sheet;
}

/* ── security -> https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTpNYJyT_wECvWqwBkaNmjnFBoxwQycypvTTCZXcnJNezOIdBe_PE__NaM&s=10 ───────────────────────────────────────────── */
function normalizeSocialLinks_(value) {
  if (Array.isArray(value)) return value.map(cleanText_).filter(Boolean).join('\n');
  return String(value || '').split(',').map(v => v.trim()).filter(Boolean).join('\n');
}
function cleanText_(value) { return String(value == null ? '' : value).trim(); }
function safeSheetText_(value) {
  const text = cleanText_(value);
  return /^[=+\-@]/.test(text) ? `'${text}` : text;
}
function escapeHtml_(value) {
  return String(value == null ? '' : value).replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);
}
function jsonResponse_(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}