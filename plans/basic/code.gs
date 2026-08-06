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
    code: "EVENT24",
    validFrom: "2026-08-01",
    validTo: "2026-08-15",
    type: "event",
    value: "TechSummit 2026",
    label: "Tech Summit 2026"
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
function createEmailBody(name ,address ,link, phone ,profilePic) {
  return `
<!doctype html>
<html lang="en">
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
              * {
        box-sizing: border-box;
      }
      body {
        margin: 0;
      }
      body {
        font-family:
          Inter,
          -apple-system,
          BlinkMacSystemFont,
          sans-serif;
        line-height: 1.6;
        background-color: rgb(15, 23, 42);
        margin-top: 0px;
        margin-right: 0px;
        margin-bottom: 0px;
        margin-left: 0px;
        padding-top: 0px;
        padding-right: 0px;
        padding-bottom: 0px;
        padding-left: 0px;
        -webkit-font-smoothing: antialiased;
        color: white !important;
      }
      .container {
        max-width: 600px;
        margin-top: 0px;
        margin-right: auto;
        margin-bottom: 0px;
        margin-left: auto;
        padding-top: 0px;
        padding-right: 20px;
        padding-bottom: 0px;
        padding-left: 20px;
      }
      .card {
        background-image: linear-gradient(145deg, rgb(30, 41, 59), rgb(15, 23, 42));
        background-position-x: initial;
        background-position-y: initial;
        background-size: initial;
        background-repeat: initial;
        background-attachment: initial;
        background-origin: initial;
        background-clip: initial;
        background-color: initial;
        border-top-left-radius: 16px;
        border-top-right-radius: 16px;
        border-bottom-right-radius: 16px;
        border-bottom-left-radius: 16px;
        margin-top: 40px;
        margin-right: auto;
        margin-bottom: 40px;
        margin-left: auto;
        overflow-x: hidden;
        overflow-y: hidden;
        box-shadow: rgba(0, 0, 0, 0.3) 0px 10px 25px -5px;
        border-top-width: 1px;
        border-right-width: 1px;
        border-bottom-width: 1px;
        border-left-width: 1px;
        border-top-style: solid;
        border-right-style: solid;
        border-bottom-style: solid;
        border-left-style: solid;
        border-top-color: rgba(255, 255, 255, 0.05);
        border-right-color: rgba(255, 255, 255, 0.05);
        border-bottom-color: rgba(255, 255, 255, 0.05);
        border-left-color: rgba(255, 255, 255, 0.05);
        border-image-source: none;
        border-image-slice: 100%;
        border-image-width: 1;
        border-image-outset: 0;
        border-image-repeat: stretch;
      }
      .header {
        padding-top: 40px;
        padding-right: 30px;
        padding-bottom: 30px;
        padding-left: 30px;
        text-align: center;
        background-image: linear-gradient(
          135deg,
          rgb(110, 72, 170),
          rgb(157, 80, 187)
        );
        background-position-x: initial;
        background-position-y: initial;
        background-size: initial;
        background-repeat: initial;
        background-attachment: initial;
        background-origin: initial;
        background-clip: initial;
        background-color: initial;
        position: relative;
        overflow-x: hidden;
        overflow-y: hidden;
      }
      .header::after {
        content: "";
        position: absolute;
        top: -50%;
        right: -50%;
        width: 100%;
        height: 200%;
        background-image: radial-gradient(
          circle,
          rgba(255, 255, 255, 0.1) 0%,
          transparent 70%
        );
        background-position-x: initial;
        background-position-y: initial;
        background-size: initial;
        background-repeat: initial;
        background-attachment: initial;
        background-origin: initial;
        background-clip: initial;
        background-color: initial;
        transform: rotate(30deg);
      }
      .content {
        padding-top: 30px;
        padding-right: 30px;
        padding-bottom: 30px;
        padding-left: 30px;
      }
      .avatar-container {
        position: relative;
        width: 110px;
        height: 110px;
        margin-top: 0px;
        margin-right: auto;
        margin-bottom: 20px;
        margin-left: auto;
      }
      .avatar {
        width: 100%;
        height: 100%;
        border-top-left-radius: 50%;
        border-top-right-radius: 50%;
        border-bottom-right-radius: 50%;
        border-bottom-left-radius: 50%;
        object-fit: cover;
        border-top-width: 3px;
        border-right-width: 3px;
        border-bottom-width: 3px;
        border-left-width: 3px;
        border-top-style: solid;
        border-right-style: solid;
        border-bottom-style: solid;
        border-left-style: solid;
        border-top-color: rgba(255, 255, 255, 0.15);
        border-right-color: rgba(255, 255, 255, 0.15);
        border-bottom-color: rgba(255, 255, 255, 0.15);
        border-left-color: rgba(255, 255, 255, 0.15);
        border-image-source: none;
        border-image-slice: 100%;
        border-image-width: 1;
        border-image-outset: 0;
        border-image-repeat: stretch;
        display: block;
        transition-behavior: normal;
        transition-duration: 0.3s;
        transition-timing-function: ease;
        transition-delay: 0s;
        transition-property: all;
        position: relative;
        z-index: 2;
      }
      .avatar-container::before {
        content: "";
        position: absolute;
        top: -5px;
        left: -5px;
        right: -5px;
        bottom: -5px;
        background-image: linear-gradient(
          45deg,
          rgb(110, 72, 170),
          rgb(183, 148, 244)
        );
        background-position-x: initial;
        background-position-y: initial;
        background-size: initial;
        background-repeat: initial;
        background-attachment: initial;
        background-origin: initial;
        background-clip: initial;
        background-color: initial;
        border-top-left-radius: 50%;
        border-top-right-radius: 50%;
        border-bottom-right-radius: 50%;
        border-bottom-left-radius: 50%;
        z-index: 1;
        opacity: 0.7;
        transition-behavior: normal;
        transition-duration: 0.3s;
        transition-timing-function: ease;
        transition-delay: 0s;
        transition-property: all;
      }
      .avatar-container:hover::before {
        top: -8px;
        left: -8px;
        right: -8px;
        bottom: -8px;
        opacity: 0.9;
      }
      .avatar-container:hover .avatar {
        transform: scale(1.05);
        box-shadow: rgba(0, 0, 0, 0.3) 0px 5px 15px;
      }
      h1 {
        font-size: 26px;
        font-weight: 700;
        margin-top: 0px;
        margin-right: 0px;
        margin-bottom: 10px;
        margin-left: 0px;
        color: white;
        position: relative;
        z-index: 2;
      }
      .subtitle {
        font-size: 16px;
        color: rgba(255, 255, 255, 0.8);
        margin-top: 0px;
        margin-right: 0px;
        margin-bottom: 20px;
        margin-left: 0px;
        position: relative;
        z-index: 2;
      }
      .user-link {
        display: inline-block;
        background-image: initial;
        background-position-x: initial;
        background-position-y: initial;
        background-size: initial;
        background-repeat: initial;
        background-attachment: initial;
        background-origin: initial;
        background-clip: initial;
        background-color: rgba(255, 255, 255, 0.1);
        color: white;
        padding-top: 10px;
        padding-right: 20px;
        padding-bottom: 10px;
        padding-left: 20px;
        border-top-left-radius: 8px;
        border-top-right-radius: 8px;
        border-bottom-right-radius: 8px;
        border-bottom-left-radius: 8px;
        font-weight: 600;
        margin-top: 10px;
        margin-right: 0px;
        margin-bottom: 10px;
        margin-left: 0px;
        text-decoration-line: none;
        text-decoration-thickness: initial;
        text-decoration-style: initial;
        text-decoration-color: initial;
        transition-behavior: normal;
        transition-duration: 0.2s;
        transition-timing-function: ease;
        transition-delay: 0s;
        transition-property: all;
        border-top-width: 1px;
        border-right-width: 1px;
        border-bottom-width: 1px;
        border-left-width: 1px;
        border-top-style: solid;
        border-right-style: solid;
        border-bottom-style: solid;
        border-left-style: solid;
        border-top-color: rgba(255, 255, 255, 0.2);
        border-right-color: rgba(255, 255, 255, 0.2);
        border-bottom-color: rgba(255, 255, 255, 0.2);
        border-left-color: rgba(255, 255, 255, 0.2);
        border-image-source: none;
        border-image-slice: 100%;
        border-image-width: 1;
        border-image-outset: 0;
        border-image-repeat: stretch;
        position: relative;
        z-index: 2;
      }
      .user-link:hover {
        background-image: initial;
        background-position-x: initial;
        background-position-y: initial;
        background-size: initial;
        background-repeat: initial;
        background-attachment: initial;
        background-origin: initial;
        background-clip: initial;
        background-color: rgba(255, 255, 255, 0.2);
        transform: translateY(-2px);
        box-shadow: rgba(0, 0, 0, 0.2) 0px 4px 12px;
      }
      .notice-box {
        background-image: initial;
        background-position-x: initial;
        background-position-y: initial;
        background-size: initial;
        background-repeat: initial;
        background-attachment: initial;
        background-origin: initial;
        background-clip: initial;
        background-color: rgba(30, 64, 175, 0.1);
        border-left-width: 4px;
        border-left-style: solid;
        border-left-color: rgb(110, 72, 170);
        padding-top: 14px;
        padding-right: 18px;
        padding-bottom: 14px;
        padding-left: 18px;
        border-top-left-radius: 0px;
        border-top-right-radius: 8px;
        border-bottom-right-radius: 8px;
        border-bottom-left-radius: 0px;
        margin-top: 25px;
        margin-right: 0px;
        margin-bottom: 25px;
        margin-left: 0px;
        display: flex;
        align-items: center;
        row-gap: 12px;
        column-gap: 12px;
        transition-behavior: normal;
        transition-duration: 0.3s;
        transition-timing-function: ease;
        transition-delay: 0s;
        transition-property: all;
      }
      .notice-box:hover {
        transform: translateX(5px);
        box-shadow: rgba(110, 72, 170, 0.3) 5px 0px 15px -5px;
      }
      .notice-icon {
        font-size: 20px;
        color: rgb(183, 148, 244);
      }
      .table-container {
        margin-top: 30px;
        margin-right: 0px;
        margin-bottom: 30px;
        margin-left: 0px;
        background-image: initial;
        background-position-x: initial;
        background-position-y: initial;
        background-size: initial;
        background-repeat: initial;
        background-attachment: initial;
        background-origin: initial;
        background-clip: initial;
        background-color: rgba(30, 41, 59, 0.5);
        border-top-left-radius: 12px;
        border-top-right-radius: 12px;
        border-bottom-right-radius: 12px;
        border-bottom-left-radius: 12px;
        overflow-x: hidden;
        overflow-y: hidden;
        border-top-width: 1px;
        border-right-width: 1px;
        border-bottom-width: 1px;
        border-left-width: 1px;
        border-top-style: solid;
        border-right-style: solid;
        border-bottom-style: solid;
        border-left-style: solid;
        border-top-color: rgba(255, 255, 255, 0.05);
        border-right-color: rgba(255, 255, 255, 0.05);
        border-bottom-color: rgba(255, 255, 255, 0.05);
        border-left-color: rgba(255, 255, 255, 0.05);
        border-image-source: none;
        border-image-slice: 100%;
        border-image-width: 1;
        border-image-outset: 0;
        border-image-repeat: stretch;
        transition-behavior: normal;
        transition-duration: 0.3s;
        transition-timing-function: ease;
        transition-delay: 0s;
        transition-property: all;
      }
      .table-container:hover {
        transform: translateY(-3px);
        box-shadow: rgba(0, 0, 0, 0.2) 0px 8px 20px -5px;
      }
      table {
        width: 100%;
        border-collapse: collapse;
      }
      th,
      td {
        padding-top: 18px;
        padding-right: 18px;
        padding-bottom: 18px;
        padding-left: 18px;
        text-align: left;
        border-bottom-width: 1px;
        border-bottom-style: solid;
        border-bottom-color: rgba(255, 255, 255, 0.05);
      }
      th {
        background-color: rgba(110, 72, 170, 0.2);
        color: rgb(183, 148, 244);
        font-weight: 600;
        width: 35%;
      }
      td {
        color: rgb(226, 232, 240);
        vertical-align: top;
      }
      .badge {
        display: inline-block;
        padding-top: 6px;
        padding-right: 12px;
        padding-bottom: 6px;
        padding-left: 12px;
        border-top-left-radius: 6px;
        border-top-right-radius: 6px;
        border-bottom-right-radius: 6px;
        border-bottom-left-radius: 6px;
        font-size: 14px;
        font-weight: 600;
        margin-bottom: 5px;
      }
      .badge-basic {
        background-image: initial;
        background-position-x: initial;
        background-position-y: initial;
        background-size: initial;
        background-repeat: initial;
        background-attachment: initial;
        background-origin: initial;
        background-clip: initial;
        background-color: rgba(110, 72, 170, 0.2);
        color: rgb(183, 148, 244);
        border-top-width: 1px;
        border-right-width: 1px;
        border-bottom-width: 1px;
        border-left-width: 1px;
        border-top-style: solid;
        border-right-style: solid;
        border-bottom-style: solid;
        border-left-style: solid;
        border-top-color: rgba(183, 148, 244, 0.3);
        border-right-color: rgba(183, 148, 244, 0.3);
        border-bottom-color: rgba(183, 148, 244, 0.3);
        border-left-color: rgba(183, 148, 244, 0.3);
        border-image-source: none;
        border-image-slice: 100%;
        border-image-width: 1;
        border-image-outset: 0;
        border-image-repeat: stretch;
      }
      .feature-list {
        margin-top: 0px;
        margin-right: 0px;
        margin-bottom: 0px;
        margin-left: 0px;
        padding-left: 0px;
        list-style-type: none;
      }
      .feature-list li {
        position: relative;
        padding-left: 20px;
        margin-bottom: 8px;
      }
      .feature-list li::before {
        content: "•";
        position: absolute;
        left: 0px;
        color: rgb(183, 148, 244);
        font-weight: bold;
      }
      .delivery-card {
        background-image: initial;
        background-position-x: initial;
        background-position-y: initial;
        background-size: initial;
        background-repeat: initial;
        background-attachment: initial;
        background-origin: initial;
        background-clip: initial;
        background-color: rgba(30, 41, 59, 0.5);
        border-top-left-radius: 12px;
        border-top-right-radius: 12px;
        border-bottom-right-radius: 12px;
        border-bottom-left-radius: 12px;
        padding-top: 20px;
        padding-right: 20px;
        padding-bottom: 20px;
        padding-left: 20px;
        margin-top: 30px;
        margin-right: 0px;
        margin-bottom: 30px;
        margin-left: 0px;
        border-top-width: 1px;
        border-right-width: 1px;
        border-bottom-width: 1px;
        border-left-width: 1px;
        border-top-style: dashed;
        border-right-style: dashed;
        border-bottom-style: dashed;
        border-left-style: dashed;
        border-top-color: rgba(183, 148, 244, 0.3);
        border-right-color: rgba(183, 148, 244, 0.3);
        border-bottom-color: rgba(183, 148, 244, 0.3);
        border-left-color: rgba(183, 148, 244, 0.3);
        border-image-source: none;
        border-image-slice: 100%;
        border-image-width: 1;
        border-image-outset: 0;
        border-image-repeat: stretch;
        transition-behavior: normal;
        transition-duration: 0.3s;
        transition-timing-function: ease;
        transition-delay: 0s;
        transition-property: all;
      }
      .delivery-card:hover {
        border-top-style: solid;
        border-right-style: solid;
        border-bottom-style: solid;
        border-left-style: solid;
        transform: translateY(-3px);
        box-shadow: rgba(0, 0, 0, 0.2) 0px 8px 20px -5px;
      }
      .delivery-header {
        display: flex;
        align-items: center;
        row-gap: 12px;
        column-gap: 12px;
        margin-bottom: 18px;
      }
      .delivery-icon {
        font-size: 24px;
        color: rgb(183, 148, 244);
      }
      .delivery-title {
        font-weight: 600;
        color: white;
        font-size: 18px;
      }
      .btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding-top: 14px;
        padding-right: 24px;
        padding-bottom: 14px;
        padding-left: 24px;
        border-top-left-radius: 8px;
        border-top-right-radius: 8px;
        border-bottom-right-radius: 8px;
        border-bottom-left-radius: 8px;
        font-weight: 600;
        margin-top: 5px;
        margin-right: 5px;
        margin-bottom: 5px;
        margin-left: 5px;
        text-decoration-line: none;
        text-decoration-thickness: initial;
        text-decoration-style: initial;
        text-decoration-color: initial;
        text-align: center;
        transition-behavior: normal;
        transition-duration: 0.2s;
        transition-timing-function: ease;
        transition-delay: 0s;
        transition-property: all;
        border-top-width: medium;
        border-right-width: medium;
        border-bottom-width: medium;
        border-left-width: medium;
        border-top-style: none;
        border-right-style: none;
        border-bottom-style: none;
        border-left-style: none;
        border-top-color: currentcolor;
        border-right-color: currentcolor;
        border-bottom-color: currentcolor;
        border-left-color: currentcolor;
        border-image-source: none;
        border-image-slice: 100%;
        border-image-width: 1;
        border-image-outset: 0;
        border-image-repeat: stretch;
        cursor: pointer;
        font-size: 15px;
      }
      .btn-primary {
        background-image: initial;
        background-position-x: initial;
        background-position-y: initial;
        background-size: initial;
        background-repeat: initial;
        background-attachment: initial;
        background-origin: initial;
        background-clip: initial;
        background-color: rgb(110, 72, 170);
        color: white;
      }
      .btn-primary:hover {
        background-image: initial;
        background-position-x: initial;
        background-position-y: initial;
        background-size: initial;
        background-repeat: initial;
        background-attachment: initial;
        background-origin: initial;
        background-clip: initial;
        background-color: rgb(93, 61, 153);
        box-shadow: rgba(110, 72, 170, 0.4) 0px 6px 15px;
        transform: translateY(-2px);
      }
      .btn-secondary {
        background-image: initial;
        background-position-x: initial;
        background-position-y: initial;
        background-size: initial;
        background-repeat: initial;
        background-attachment: initial;
        background-origin: initial;
        background-clip: initial;
        background-color: rgba(30, 41, 59, 0.5);
        color: rgb(183, 148, 244);
        border-top-width: 1px;
        border-right-width: 1px;
        border-bottom-width: 1px;
        border-left-width: 1px;
        border-top-style: solid;
        border-right-style: solid;
        border-bottom-style: solid;
        border-left-style: solid;
        border-top-color: rgba(183, 148, 244, 0.3);
        border-right-color: rgba(183, 148, 244, 0.3);
        border-bottom-color: rgba(183, 148, 244, 0.3);
        border-left-color: rgba(183, 148, 244, 0.3);
        border-image-source: none;
        border-image-slice: 100%;
        border-image-width: 1;
        border-image-outset: 0;
        border-image-repeat: stretch;
      }
      .btn-secondary:hover {
        background-image: initial;
        background-position-x: initial;
        background-position-y: initial;
        background-size: initial;
        background-repeat: initial;
        background-attachment: initial;
        background-origin: initial;
        background-clip: initial;
        background-color: rgba(110, 72, 170, 0.1);
        box-shadow: rgba(110, 72, 170, 0.2) 0px 6px 15px;
        transform: translateY(-2px);
      }
      .action-grid {
        display: grid;
        grid-template-columns: 1fr;
        row-gap: 15px;
        column-gap: 15px;
        margin-top: 30px;
        margin-right: 0px;
        margin-bottom: 30px;
        margin-left: 0px;
      }
      .footer {
        text-align: center;
        padding-top: 25px;
        padding-right: 20px;
        padding-bottom: 25px;
        padding-left: 20px;
        color: rgb(148, 163, 184);
        font-size: 14px;
        line-height: 1.6;
      }
      .animate {
        animation-duration: 0.6s;
        animation-timing-function: ease;
        animation-delay: 0s;
        animation-iteration-count: 1;
        animation-direction: normal;
        animation-fill-mode: forwards;
        animation-play-state: running;
        animation-name: fadeIn;
        animation-timeline: auto;
        animation-range-start: normal;
        animation-range-end: normal;
      }
      .delay-1 {
        animation-delay: 0.1s;
      }
      .delay-2 {
        animation-delay: 0.2s;
      }
      .delay-3 {
        animation-delay: 0.3s;
      }
      #im6tt {
        color: #fff;
      }
      #ia69c {
        color: #fff;
      }
      #i439k {
        width: 100%;
        border-collapse: collapse;
        border: none;
      }
      #iu6gd {
        width: 130px;
        color: #94a3b8;
        font-weight: 500;
        padding: 8px 0;
        vertical-align: top;
      }
      #iphq8 {
        color: #e2e8f0;
        padding: 8px 0;
        vertical-align: top;
      }
      #id3o3 {
        width: 130px;
        color: #94a3b8;
        font-weight: 500;
        padding: 8px 0;
        vertical-align: top;
      }
      #is30p {
        color: #e2e8f0;
        padding: 8px 0;
        vertical-align: top;
      }
      #iqeku {
        width: 130px;
        color: #94a3b8;
        font-weight: 500;
        padding: 8px 0;
        vertical-align: top;
      }
      #icowf {
        color: #e2e8f0;
        padding: 8px 0;
        vertical-align: top;
      }
      #ipnng {
        width: 130px;
        color: #94a3b8;
        font-weight: 500;
        padding: 8px 0;
        vertical-align: top;
      }
      #i3dpw {
        color: #e2e8f0;
        padding: 8px 0;
        vertical-align: top;
      }
      #iqozg {
        width: 100%;
        border-collapse: collapse;
        border: none;
      }
      #if9ya {
        width: 130px;
        color: #94a3b8;
        font-weight: 500;
        padding: 8px 0;
        vertical-align: top;
      }
      #itgzp {
        color: #e2e8f0;
        padding: 8px 0;
        vertical-align: top;
      }
      #ic71k {
        width: 130px;
        color: #94a3b8;
        font-weight: 500;
        padding: 8px 0;
        vertical-align: top;
      }
      #i1c6yq {
        color: #e2e8f0;
        padding: 8px 0;
        vertical-align: top;
      }
      #is2yeh {
        width: 130px;
        color: #94a3b8;
        font-weight: 500;
        padding: 8px 0;
        vertical-align: top;
      }
      #iu7kkq {
        color: #e2e8f0;
        padding: 8px 0;
        vertical-align: top;
      }
      #ikf5z3 {
        color: #fff;
      }
      #id9whu {
        color: #fff;
      }
      #inam9d {
        text-align: center;
        font-size: 14px;
        color: #94a3b8;
        margin-top: 10px;
      }
      #iufs7m {
        color: #b794f4;
        text-decoration: none;
        font-weight: 500;
      }
      #ir9zow {
        margin-top: 15px;
      }
      #iyhx05 {
        color: #94a3b8;
        text-decoration: underline;
      }
      #inbcn6 {
        color: #94a3b8;
        text-decoration: underline;
      }
      @keyframes fadeIn {
        0% {
          opacity: 0;
          transform: translateY(10px);
        }
        100% {
          opacity: 1;
          transform: translateY(0px);
        }
      }
      @media (max-width: 480px) {
        .header {
          padding-top: 30px;
          padding-right: 20px;
          padding-bottom: 30px;
          padding-left: 20px;
        }
        .content {
          padding-top: 25px;
          padding-right: 20px;
          padding-bottom: 25px;
          padding-left: 20px;
        }
        th,
        td {
          padding-top: 14px;
          padding-right: 12px;
          padding-bottom: 14px;
          padding-left: 12px;
          display: block;
          width: 100%;
        }
        th {
          border-bottom-width: medium;
          border-bottom-style: none;
          border-bottom-color: currentcolor;
          padding-bottom: 5px;
        }
        td {
          padding-top: 5px;
          padding-bottom: 15px;
        }
      }
    </style>
  </head>
  <body>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <div class="container">
      <div class="card">
        <div class="header">
          <div class="avatar-container animate">
            <img
              src="${profilePic || 'https://via.placeholder.com/150/1e293b/b794f4?text=TC'}"
              alt="${name}'s Profile Picture"
              class="avatar"
            />
          </div>
          <h1 class="animate delay-1">Your Digital Card is Ready! 🎉</h1>
          <p class="subtitle animate delay-1">
            Connect with style and simplicity
          </p>
          <a
            href="https://card.tccards.tn/@${link}"
            class="user-link animate delay-2"
            id="im6tt"
            >card.tccards.tn/@${link}</a
          >
        </div>
        <div class="content">
          <div class="notice-box animate delay-2">
            <span class="notice-icon">✨</span
            ><span id="ia69c"
              >Your digital profile will be activated within 24 hours of payment
              confirmation!</span
            >
          </div>
          <div class="table-container animate delay-1">
            <table>
              <tbody>
                <tr>
                  <th>Plan Name</th>
                  <td><span class="badge badge-basic">Basic Plan</span></td>
                </tr>
                <tr>
                  <th>Features</th>
                  <td>
                    <ul class="feature-list">
                      <li>Basic Digital Profile</li>
                      <li>Editing dashboard</li>
                      <li>1 NFC Card (shipping soon)</li>
                      <li>6 Media links</li>
                      <li>Basic analytics</li>
                    </ul>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="delivery-card animate delay-2">
            <div class="delivery-header">
              <span class="delivery-icon">📦</span
              ><span class="delivery-title">NFC Card Delivery</span>
            </div>
            <table id="i439k">
              <tbody>
                <tr>
                  <td id="iu6gd">Status</td>
                  <td id="iphq8">Preparing for shipment</td>
                </tr>
                <tr>
                  <td id="id3o3">Estimated Delivery</td>
                  <td id="is30p">3-7 business days</td>
                </tr>
                <tr>
                  <td id="iqeku">Shipping Address</td>
                  <td id="icowf">
                    ${address || 'The address you provided on your card'}
                  </td>
                </tr>
                <tr>
                  <td id="ipnng">Tracking</td>
                  <td id="i3dpw">
                    You will be contacted by our delivery team via phone:
                    <strong>${phone || 'the number you provided'}</strong>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="delivery-card animate delay-2">
            <div class="delivery-header">
              <span class="delivery-icon">🚚</span
              ><span class="delivery-title">Payment Options</span>
            </div>
            <table id="iqozg">
              <tbody>
                <tr>
                  <td id="if9ya">In Person 🧑🏻</td>
                  <td id="itgzp">Delivery: 7dt</td>
                </tr>
                <tr>
                  <td id="ic71k">Your Card</td>
                  <td id="i1c6yq">At 65dt</td>
                </tr>
                <tr>
                  <td id="is2yeh">Discounts ?</td>
                  <td id="iu7kkq">
                    If you entered a valid referral code, you have a 10%
                    discount on your card
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="action-grid animate delay-3">
            <a
              href="https://card.tccards.tn/@${link}"
              class="btn btn-primary"
              id="ikf5z3"
            >
              View My Digital Card </a
            ><a
              href="https://edit.tccards.tn/"
              class="btn btn-secondary"
              id="id9whu"
            >
              Edit My Profile
            </a>
          </div>
          <p id="inam9d">
            Need help?
            <a href="mailto:info@tccards.tn" id="iufs7m"
              >Contact our support team</a
            >
          </p>
        </div>
      </div>
      <div class="footer">
        <p>
          © ${new Date().getFullYear()} Total Connect. All rights reserved.
        </p>
        <p id="ir9zow">
          <a href="https://tccards.tn/pp" id="iyhx05">Privacy Policy</a> •
          <a href="https://edit.tccards.tn" id="inbcn6">Seek Help</a>
        </p>
      </div>
    </div>
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