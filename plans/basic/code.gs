const REFERRAL_CODES = [
  {
    code: "WE10T",
    validFrom: "2025-01-01",
    validTo: "2026-12-31",
    type: "discount",
    value: "10% OFF",
    label: "Discount"
  },
  {
    code: "GMC26",
    validFrom: "2026-08-08",
    validTo: "2026-08-10",
    type: "event",
    value: "AI MEET TN",
    label: "GMC MEET AI&STARTUP"
  },
  {
    code: "NAU-26",
    validFrom: "2026-08-08",
    validTo: "2026-08-10",
    type: "Free",
    value: "Ali wants feedback",
    label: "share the idea and share your thoughts"
  }
];

function doGet(e) {
  // health check, duplicate check, stats, etc.
  if (e.parameter.healthcheck) return ContentService.createTextOutput('OK');
  try {
    if (!e?.parameter) throw new Error('Invalid request: No data received');
    const params = e.parameter;

    if (params.check_duplicates === 'true') {
      const { emailExists, linkExists } = checkDuplicates(params.email, params.link);
      return jsonResponse({ emailExists, linkExists });
    }

    if (params.check_referral === 'true') {
      const { codeExists, codeDetails } = checkReferralCode(params.code);
      return jsonResponse({ codeExists, codeDetails });
    }

    if (params.get_stats === 'true') {
      return jsonResponse(getSubmissionStats());
    }

    if (params.get_all_links === 'true') {
      return jsonResponse({ links: getExistingLinks() });
    }

    // Deduplication
    const { emailExists, linkExists } = checkDuplicates(params.email, params.link);
    if (emailExists || linkExists) {
      throw new Error(emailExists ? 'Email already exists' : 'Link already exists');
    }
    if (!params.name || !params.email || !params.link) {
      throw new Error('Name, email, and link are required');
    }

    // Validate privilege code (if provided) and get details
    let codeDetails = null;
    if (params.referralCode) {
      const { codeExists, codeDetails: details } = checkReferralCode(params.referralCode);
      if (!codeExists) {
        throw new Error('Invalid privilege code');
      }
      codeDetails = details;
    }

    const submissionId = submitFormData(params);
    sendNotificationEmailAsync(params.email, params.name, params.address, params.link, params.phone, params.profilePic, codeDetails);

    return jsonResponse({
      status: 'success',
      message: 'Form submitted successfully',
      submissionId
    });

  } catch (error) {
    console.error(`Submission Error:`, error);
    return jsonResponse({ status: 'error', message: error.message });
  }
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function checkReferralCode(code) {
  const codeUpper = code.toUpperCase();
  const foundCode = REFERRAL_CODES.find(c => c.code.toUpperCase() === codeUpper);
  if (foundCode) {
    const now = new Date();
    const validFrom = new Date(foundCode.validFrom);
    const validTo = new Date(foundCode.validTo);
    if (now < validFrom || now > validTo) {
      return { codeExists: false, codeDetails: null };
    }
    return { 
      codeExists: true, 
      codeDetails: { 
        type: foundCode.type, 
        value: foundCode.value,
        label: foundCode.label || foundCode.code 
      } 
    };
  }
  return { codeExists: false, codeDetails: null };
}

function getSubmissionStats() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Form');
  if (!sheet) return { totalCount: 0, monthlyGrowth: 0 };
  const lastRow = sheet.getLastRow();
  const totalCount = Math.max(0, lastRow - 1);
  const rowCount = Math.max(0, lastRow - 1);
  const values = rowCount > 0 ? sheet.getRange(2, 1, rowCount, 1).getValues() : [];
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const monthlyGrowth = values.reduce((count, row) => {
    const submittedAt = row[0];
    if (submittedAt instanceof Date && submittedAt >= startOfMonth && submittedAt < startOfNextMonth) {
      return count + 1;
    }
    return count;
  }, 0);
  return { totalCount, monthlyGrowth };
}

function getExistingLinks() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Form');
  if (!sheet) return [];
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return [];
  return sheet
    .getRange(2, 4, lastRow - 1, 1)
    .getValues()
    .flat()
    .filter((value) => typeof value === 'string' && value.trim() !== '')
    .map((value) => value.trim());
}

function checkDuplicates(email, link) {
  const cache = CacheService.getScriptCache();
  const cacheKey = 'form_data_duplicates';
  let data = JSON.parse(cache.get(cacheKey));
  if (!data) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Form');
    if (!sheet) throw new Error('Sheet not found');
    const lastRow = sheet.getLastRow();
    data = sheet.getRange(2, 3, lastRow - 1, 2).getValues();
    cache.put(cacheKey, JSON.stringify(data), 60);
  }
  const emailLower = String(email || '').trim().toLowerCase();
  const normalizedLink = String(link || '').trim();
  const emailExists = data.some(row => String(row[0] || '').trim().toLowerCase() === emailLower);
  const linkExists = data.some(row => String(row[1] || '').trim() === normalizedLink);
  return { emailExists, linkExists };
}

function submitFormData(params) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Form');
  if (!sheet) throw new Error('Sheet not found');
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'Timestamp', 'Name', 'Email', 'Link', 'Tagline', 'Phone',
      'Address', 'Social Links', 'Selected Style',
      'Profile Picture URL', 'Referral Code', 'ID', 'Status'
    ]);
  }
  const submissionId = Utilities.getUuid();
  const newRow = [
    new Date(),
    params.name,
    params.email,
    params.link,
    params.tagline || '',
    params.phone || '',
    params.address || '',
    params.social_links ? params.social_links.split(',').join('\n') : '',
    params.style || 'default',
    params.profilePic || '',
    params.referralCode || '',
    submissionId,
    'Inactive'
  ];
  sheet.appendRow(newRow);
  CacheService.getScriptCache().remove('form_data_duplicates');
  return submissionId;
}

function sendNotificationEmailAsync(email, name, address, link, phone, profilePic, codeDetails) {
  try {
    if (!email || !name || !link) {
      console.error('Missing required parameters for email');
      return false;
    }
    let htmlBody;
    let subject;
    if (codeDetails && codeDetails.type === 'event') {
      htmlBody = createEventEmailBody(name, address, link, phone, profilePic, codeDetails);
      subject = '🎟️ Your Event Digital Card – tccards';
    } else {
      htmlBody = createDefaultEmailBody(name, address, link, phone, profilePic, codeDetails);
      subject = 'Your Digital Card is Ready – tccards';
    }
    const message = {
      to: email,
      subject: subject,
      htmlBody: htmlBody,
      name: 'tccards.tn',
      replyTo: 'info@tccards.tn'
    };
    MailApp.sendEmail(message);
    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    return false;
  }
}

function createDefaultEmailBody(name, address, link, phone, profilePic, codeDetails) {
  // Use the full email template from createEmailBody
  let html = createEmailBody(name, address, link, phone, profilePic);
  
  // If a discount code was used, inject a note (optional)
  if (codeDetails && codeDetails.type === 'discount') {
    html = html.replace(
      '</body>',
      `<p style="color:#34d399;font-weight:bold;">🎉 Discount applied: ${codeDetails.value}</p></body>`
    );
  }
  
  return html;
}
function createEmailBody(name, address, link, phone, profilePic) {
  return `
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
  .brand-logo { filter: invert(1) !important; }
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

              ${profilePic ? `<div style="margin-bottom:24px"><img src="${profilePic}" width="48" height="48" alt="${name}" style="display:block; border-radius:50%; object-fit:cover;"></div>` : ''}

              <h1>Order received, <strong>${name}</strong>!</h1>
              <p>Thanks for your order — we've received it. Our team will reach out to you soon to confirm the details with you.</p>
              <p>Here are the details we have on file:</p>

              <!-- Details Block -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="width:100% !important; margin:24px 0;">
                <tr>
                  <td bgcolor="#F2F2F2" class="tccards-details-block" style="border-radius:8px; padding:20px 24px; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="width:100% !important;">
                      <tr>
                        <td class="detail-label" width="140" style="padding:8px 0; vertical-align:top;">Name</td>
                        <td class="detail-value" style="padding:8px 0; vertical-align:top;">${name}</td>
                      </tr>
                      <tr>
                        <td class="detail-label" style="padding:8px 0; vertical-align:top;">Digital Card</td>
                        <td class="detail-value" style="padding:8px 0; vertical-align:top; word-break:break-all;">
                          <a href="https://card.tccards.tn/@${link}" target="_blank">card.tccards.tn/@${link}</a>
                        </td>
                      </tr>
                      <tr>
                        <td class="detail-label" style="padding:8px 0; vertical-align:top;">Shipping Address</td>
                        <td class="detail-value" style="padding:8px 0; vertical-align:top;">${address || 'The address you provided on your card'}</td>
                      </tr>
                      <tr>
                        <td class="detail-label" style="padding:8px 0; vertical-align:top;">Phone</td>
                        <td class="detail-value" style="padding:8px 0; vertical-align:top;">${phone || 'The number you provided'}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p>You don't need to do anything right now. We'll confirm your order with you before anything ships.</p>

              <!-- Button -->
              <table border="0" cellspacing="0" cellpadding="0" style="margin:8px 0 0 0;">
                <tr>
                  <td align="center" bgcolor="#0067D6" style="border-radius:6px;">
                    <a href="https://card.tccards.tn/@${link}" target="_blank" class="btn-link" style="display:inline-block; padding:12px 24px; font-size:14px; font-weight:600; line-height:20px; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;">View My Digital Card</a>
                  </td>
                </tr>
              </table>

              <hr style="margin:44px 0 32px 0; width:100%;">

              <!-- Footer -->
              <p class="footer-text" style="margin-bottom: 20px;">
                <strong>Need help?</strong> If you have any questions about this order, reply to this email or contact us at <a href="mailto:info@tccards.tn">info@tccards.tn</a>.
              </p>

              <p class="footer-text">
                &copy; ${new Date().getFullYear()} <a href="https://tccards.tn" target="_blank">tccards.tn</a>. All rights reserved.<br>
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
</html>
`;
}

function createEventEmailBody(name, address, link, phone, profilePic, codeDetails) {
  const eventName = codeDetails ? codeDetails.value : 'our event';
  // Build a special event-themed email (you can fully customize this)
  return `
<!doctype html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<style>body{font-family:sans-serif;background:#0a0a0f;color:#fff;padding:20px;}.container{max-width:600px;margin:auto;background:#1a1a2e;padding:30px;border-radius:16px;border:1px solid rgba(255,255,255,0.05);}.event-badge{background:linear-gradient(135deg,#8b5cf6,#6d28d9);padding:8px 16px;border-radius:40px;display:inline-block;font-weight:700;}</style>
</head>
<body>
<div class="container">
  <div style="text-align:center;">
    <div class="event-badge">🎉 ${eventName}</div>
    <h1 style="font-size:32px;margin:20px 0 10px;">Welcome, ${name}!</h1>
    <p style="font-size:18px;color:#cbd5e1;">Your digital card for the event is ready.</p>
  </div>
  <div style="background:#0f172a;border-radius:12px;padding:20px;margin:20px 0;text-align:center;">
    <p style="font-size:14px;color:#94a3b8;">Your profile link</p>
    <p style="font-size:22px;font-weight:700;"><a href="https://card.tccards.tn/@${link}" style="color:#8b5cf6;text-decoration:none;">card.tccards.tn/@${link}</a></p>
    <p style="font-size:14px;color:#94a3b8;">Tap or scan to share with other attendees.</p>
  </div>
  <p style="color:#94a3b8;font-size:14px;text-align:center;">We look forward to seeing you at the event!</p>
  <hr style="border-color:#1e293b;margin:20px 0;">
  <p style="color:#475569;font-size:12px;text-align:center;">© ${new Date().getFullYear()} Total Connect. All rights reserved.</p>
</div>
</body>
</html>
  `;
}