const STANDARD_CONFIG_ = {
  SPREADSHEET_ID: '1tvVAN9sQ4yNPV0om2RKb8EiejoYn8eytTOEi9k26g0E',
  FORM_SHEET: 'Form',
  ANALYTICS_SHEET: 'Analytics',
  DUPLICATE_CACHE_KEY: 'standard_signup_duplicates_v1',
  DUPLICATE_CACHE_SECONDS: 60,
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

/**
 * Run once in the editor to create/verify both tabs and authorize access.
 */
function setupStandardSheets() {
  ensureStandardSheets_();
  MailApp.getRemainingDailyQuota();
  return {
    status: 'success',
    sheets: [STANDARD_CONFIG_.FORM_SHEET, STANDARD_CONFIG_.ANALYTICS_SHEET]
  };
}

function doGet(e) {
  try {
    const params = e && e.parameter ? e.parameter : {};

    // Healthcheck must be fast and must never fail because of sheet state.
    if (params.healthcheck) {
      return ContentService.createTextOutput('OK');
    }

    // Run header setup, but treat it as best-effort. A cosmetic drift in one
    // tab must not break stats / duplicate checks / submissions.
    try {
      ensureStandardSheets_();
    } catch (ensureErr) {
      console.warn('ensureStandardSheets_ warning:', ensureErr);
    }

    if (params.check_duplicates === 'true') {
      return jsonResponse_(checkDuplicates_(params.email, params.link, true));
    }

    // Standard has no referral discounts or event codes.
    if (params.check_referral === 'true') {
      return jsonResponse_({ codeExists: false, codeDetails: null });
    }

    if (params.get_stats === 'true') {
      return jsonResponse_(getSubmissionStats_());
    }

    if (params.get_all_links === 'true') {
      return jsonResponse_({ links: getExistingLinks_() });
    }

    if (params.name !== undefined || params.email !== undefined || params.link !== undefined) {
      return jsonResponse_(submitStandardSignup_(params));
    }

    throw new Error('Invalid request');
  } catch (error) {
    console.error('Standard signup GET error:', error);
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
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          params = parsed;
        }
      } catch (_) {
        // Keep e.parameter for form-encoded POST requests.
      }
    }

    try {
      ensureStandardSheets_();
    } catch (ensureErr) {
      console.warn('ensureStandardSheets_ warning:', ensureErr);
    }

    if (params.action === 'trackAnalytics') {
      return jsonResponse_(recordStandardAnalyticsEvent_(params));
    }

    return jsonResponse_(submitStandardSignup_(params));
  } catch (error) {
    console.error('Standard POST error:', error);
    return jsonResponse_({ status: 'error', message: error.message || 'Request failed' });
  }
}

function submitStandardSignup_(params) {
  const name = cleanText_(params.name);
  const email = cleanText_(params.email).toLowerCase();
  const link = cleanText_(params.link);

  if (!name || !email || !link) {
    throw new Error('Name, email, and link are required');
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Please enter a valid email address');
  }
  if (!/^[a-zA-Z][a-zA-Z0-9-]{2,14}$/.test(link)) {
    throw new Error('The profile link must be 3–15 characters and start with a letter');
  }

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) {
    throw new Error('Signup is busy. Please try again in a moment.');
  }

  let submissionId;
  try {
    // Always re-read the sheet before writing, so a stale cache cannot allow
    // a duplicate signup.
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
      params.profilePic ||
      params.profile_picture ||
      params.profilePicture ||
      params['Profile Picture URL'] ||
      ''
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
      '', // Referral Code (unused on Standard)
      submissionId,
      'Inactive',
      '', // Email Preference
      submissionId // Analytics ID
    ];

    sheet.getRange(sheet.getLastRow() + 1, 1, 1, STANDARD_FORM_HEADERS_.length)
      .setValues([row]);

    CacheService.getScriptCache().remove(STANDARD_CONFIG_.DUPLICATE_CACHE_KEY);
  } finally {
    lock.releaseLock();
  }

  const emailSent = sendStandardConfirmationEmail_({
    email,
    name,
    link,
    address,
    phone,
    profilePic: params.profilePic || params.profile_picture || params.profilePicture || ''
  });

  return {
    status: 'success',
    message: 'Standard signup received',
    submissionId,
    emailSent
  };
}

function recordStandardAnalyticsEvent_(params) {
  const allowedEvents = new Set([
    'view', 'link_click', 'contact_email', 'contact_phone',
    'contact_location', 'share_click', 'copy_details', 'save_contact'
  ]);
  const analyticsId = cleanText_(params.analyticsId);
  const eventType = cleanText_(params.eventType).toLowerCase();
  if (!analyticsId || !allowedEvents.has(eventType)) {
    throw new Error('Invalid analytics event');
  }

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) throw new Error('Analytics is busy.');

  try {
    const form = getStandardSheet_(STANDARD_CONFIG_.FORM_SHEET);
    const formHeaders = form.getRange(1, 1, 1, form.getLastColumn())
      .getDisplayValues()[0].map(value => String(value).trim());
    const analyticsIdCol = formHeaders.indexOf('Analytics ID');
    const idCol = formHeaders.indexOf('ID');
    const statusCol = formHeaders.indexOf('Status');
    if (analyticsIdCol < 0 && idCol < 0) {
      throw new Error('Form is missing an Analytics ID or ID column');
    }

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
      const input = params.details && typeof params.details === 'object'
        ? params.details
        : {};
      const raw = cleanText_(input.domain || input.url);
      const domain = raw.replace(/^https?:\/\//i, '')
        .split(/[/?#]/)[0].toLowerCase().replace(/^www\./, '');
      if (!domain || !/^[a-z0-9.-]+$/.test(domain)) {
        throw new Error('Invalid link domain');
      }
      details.domain = domain;
    }

    const analytics = getStandardSheet_(STANDARD_CONFIG_.ANALYTICS_SHEET);
    const headers = analytics.getRange(1, 1, 1, analytics.getLastColumn())
      .getDisplayValues()[0].map(value => String(value).trim());
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
    analytics.appendRow(headers.map(header =>
      Object.prototype.hasOwnProperty.call(record, header) ? record[header] : ''
    ));

    return { status: 'success' };
  } finally {
    lock.releaseLock();
  }
}

function checkDuplicates_(email, link, useCache) {
  const normalizedEmail = cleanText_(email).toLowerCase();
  const normalizedLink = cleanText_(link).toLowerCase();
  const cache = CacheService.getScriptCache();

  let rows = null;
  if (useCache) {
    const cached = cache.get(STANDARD_CONFIG_.DUPLICATE_CACHE_KEY);
    if (cached) {
      try {
        rows = JSON.parse(cached);
      } catch (_) {
        cache.remove(STANDARD_CONFIG_.DUPLICATE_CACHE_KEY);
      }
    }
  }

  if (!Array.isArray(rows)) {
    const sheet = getStandardSheet_(STANDARD_CONFIG_.FORM_SHEET);
    const count = Math.max(0, sheet.getLastRow() - 1);
    rows = count
      ? sheet.getRange(2, 3, count, 2).getDisplayValues()
      : [];

    if (useCache) {
      cache.put(
        STANDARD_CONFIG_.DUPLICATE_CACHE_KEY,
        JSON.stringify(rows),
        STANDARD_CONFIG_.DUPLICATE_CACHE_SECONDS
      );
    }
  }

  return {
    status: 'success',
    emailExists: !!normalizedEmail && rows.some(row =>
      String(row[0] || '').trim().toLowerCase() === normalizedEmail
    ),
    linkExists: !!normalizedLink && rows.some(row =>
      String(row[1] || '').trim().toLowerCase() === normalizedLink
    )
  };
}

function getSubmissionStats_() {
  const sheet = getStandardSheet_(STANDARD_CONFIG_.FORM_SHEET);
  const count = Math.max(0, sheet.getLastRow() - 1);
  if (!count) return { status: 'success', totalCount: 0, monthlyGrowth: 0 };

  const values = sheet.getRange(2, 1, count, 1).getValues();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const monthlyGrowth = values.reduce((total, [value]) => {
    const date = value instanceof Date ? value : new Date(value);
    return !Number.isNaN(date.getTime()) && date >= monthStart && date < nextMonth
      ? total + 1
      : total;
  }, 0);

  return { status: 'success', totalCount: count, monthlyGrowth };
}

function getExistingLinks_() {
  const sheet = getStandardSheet_(STANDARD_CONFIG_.FORM_SHEET);
  const count = Math.max(0, sheet.getLastRow() - 1);
  if (!count) return [];

  return sheet.getRange(2, 4, count, 1)
    .getDisplayValues()
    .flat()
    .map(value => String(value).trim())
    .filter(Boolean);
}

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
    `Order received, ${safeName}!`,
    '',
    "Thanks for your order — we've received it. Our team will reach out to you soon to confirm the details with you.",
    '',
    'Here are the details we have on file:',
    `  Name: ${safeName}`,
    `  Digital Card: ${profileUrl}`,
    `  Shipping Address: ${safeAddress}`,
    `  Phone: ${safePhone}`,
    '',
    "You don't need to do anything right now. We'll confirm your order with you before anything ships.",
    '',
    'Need help? If you have any questions about this order, reply to this email or contact us at info@tccards.tn.',
    '',
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
  .brand-logo { display: block; filter: invert(0); background-color: 50% transparent; border-radius: 25px; background-color: black; }
  .tccards-details-block { background-color: #1F1F1F !important; color: #ffffff !important; }
  .detail-label { color: #8F8F8F !important; }
  .detail-value { color: #EDEDED !important; }
  .btn-link { color: #ffffff !important; }
}
</style>
</head>
<body style="background-color:#ffffff; margin:0; padding:0;">

<table width="100%" border="0" cellspacing="0" cellpadding="0" style="width:100% !important;">
  <tr>
    <td align="center">
      <table style="margin:40px 0;" width="600" border="0" cellspacing="0" cellpadding="40">
        <tr>
          <td align="center">
            <div style="font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; text-align:left; width:465px;">

              <div style="margin-bottom:48px">
                <img src="https://edit.tccards.tn/Assets/images/logo.png" width="24" height="21" alt="tccards.tn" class="brand-logo">
              </div>

              ${profilePicHtml ? `<div style="margin-bottom:24px"><img src="${profilePicHtml}" width="48" height="48" alt="${nameHtml}" style="display:block; border-radius:50%; object-fit:cover;"></div>` : ''}

              <h1>Order received, <strong>${nameHtml}</strong>!</h1>
              <p>Thanks for your order — we've received it. Our team will reach out to you soon to confirm the details with you.</p>
              <p>Here are the details we have on file:</p>

              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="width:100% !important; margin:24px 0;">
                <tr>
                  <td bgcolor="#F2F2F2" class="tccards-details-block" style="border-radius:8px; padding:20px 24px; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="width:100% !important;">
                      <tr>
                        <td class="detail-label" width="140" style="padding:8px 0; vertical-align:top;">Name</td>
                        <td class="detail-value" style="padding:8px 0; vertical-align:top;">${nameHtml}</td>
                      </tr>
                      <tr>
                        <td class="detail-label" style="padding:8px 0; vertical-align:top;">Digital Card</td>
                        <td class="detail-value" style="padding:8px 0; vertical-align:top; word-break:break-all;">
                          <a href="${profileUrlHtml}" target="_blank">my.tccards.tn/@${linkHtml}</a>
                        </td>
                      </tr>
                      <tr>
                        <td class="detail-label" style="padding:8px 0; vertical-align:top;">Shipping Address</td>
                        <td class="detail-value" style="padding:8px 0; vertical-align:top;">${addressHtml}</td>
                      </tr>
                      <tr>
                        <td class="detail-label" style="padding:8px 0; vertical-align:top;">Phone</td>
                        <td class="detail-value" style="padding:8px 0; vertical-align:top;">${phoneHtml}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p>You don't need to do anything right now. We'll confirm your order with you before anything ships.</p>

              <hr style="margin:44px 0 32px 0; width:100%;">

              <p class="footer-text" style="margin-bottom: 20px;">
                <strong>Need help?</strong> If you have any questions about this order, reply to this email or contact us at <a href="mailto:info@tccards.tn">info@tccards.tn</a>.
              </p>

              <p class="footer-text">
                &copy; ${currentYear} <a href="https://www.tccards.tn" target="_blank">tccards.tn</a>. All rights reserved.<br>
                This is an automated message, please do not reply to this email.
              </p>

            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
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

function ensureStandardSheets_() {
  const spreadsheet = SpreadsheetApp.openById(STANDARD_CONFIG_.SPREADSHEET_ID);
  ensureSheetHeaders_(spreadsheet, STANDARD_CONFIG_.FORM_SHEET, STANDARD_FORM_HEADERS_);
  ensureSheetHeaders_(spreadsheet, STANDARD_CONFIG_.ANALYTICS_SHEET, STANDARD_ANALYTICS_HEADERS_);
}

/**
 * Creates the tab / headers if needed. If the sheet already has headers,
 * this only auto-adds a missing trailing "Analytics ID" column. Otherwise
 * it logs a warning and lets the caller continue — we never want a cosmetic
 * header drift to break every request, the way Basic's server never does.
 */
function ensureSheetHeaders_(spreadsheet, sheetName, headers) {
  let sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) sheet = spreadsheet.insertSheet(sheetName);

  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    return;
  }

  const current = sheet.getRange(1, 1, 1, headers.length)
    .getDisplayValues()[0]
    .map(value => String(value).trim());

  if (current.every(value => !value)) {
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

  // If the only problem is a missing trailing "Analytics ID", add it.
  const isLastColumn = firstMismatch === headers.length - 1;
  const trailingIsEmpty = !current[firstMismatch];
  if (isLastColumn && trailingIsEmpty) {
    sheet.getRange(1, headers.length).setValue(headers[headers.length - 1]);
    console.log(`Added missing header "${headers[headers.length - 1]}" to "${sheetName}".`);
    return;
  }

  console.warn(
    `Header drift in "${sheetName}" at column ${firstMismatch + 1}: ` +
    `expected "${headers[firstMismatch]}", found "${current[firstMismatch]}". Continuing.`
  );
}

function getStandardSheet_(sheetName) {
  const spreadsheet = SpreadsheetApp.openById(STANDARD_CONFIG_.SPREADSHEET_ID);
  const sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) throw new Error(`Sheet not found: ${sheetName}`);
  return sheet;
}

function normalizeSocialLinks_(value) {
  if (Array.isArray(value)) {
    return value.map(cleanText_).filter(Boolean).join('\n');
  }
  return String(value || '')
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
    .join('\n');
}

function cleanText_(value) {
  return String(value == null ? '' : value).trim();
}

function safeSheetText_(value) {
  const text = cleanText_(value);
  return /^[=+\-@]/.test(text) ? `'${text}` : text;
}

function escapeHtml_(value) {
  return String(value == null ? '' : value).replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[char]);
}

function jsonResponse_(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}