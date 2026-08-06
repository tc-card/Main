// code.gs – Free Plan
function doGet(e) {
  try {
    if (!e?.parameter) throw new Error('Invalid request: No data received');
    const params = e.parameter;

    // Duplicate check
    if (params.check_duplicates === 'true') {
      const { emailExists, linkExists } = checkDuplicates(params.email, params.link);
      return jsonResponse({ emailExists, linkExists });
    }

    // Stats for live counter
    if (params.get_stats === 'true') {
      return jsonResponse(getSubmissionStats());
    }

    // Get all taken links (for frontend validation)
    if (params.get_all_links === 'true') {
      return jsonResponse({ links: getExistingLinks() });
    }

    // Main submission
    if (!params.name || !params.email || !params.link) {
      throw new Error('Name, email, and link are required');
    }

    const { emailExists, linkExists } = checkDuplicates(params.email, params.link);
    if (emailExists || linkExists) {
      throw new Error('Email or Link already exists');
    }

    const submissionId = submitFormData(params);
    sendNotificationEmail(params.email, params.name, params.link, params.profilePic);

    return jsonResponse({
      status: 'success',
      message: 'Form submitted successfully',
      submissionId
    });

  } catch (error) {
    console.error('Error in doGet:', error);
    return jsonResponse({ status: 'error', message: error.message });
  }
}

// ===== Helper =====
function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ===== Duplicate Check (cached) =====
function checkDuplicates(email, link) {
  const cache = CacheService.getScriptCache();
  const cacheKey = 'form_data_duplicates';
  let data = JSON.parse(cache.get(cacheKey));

  if (!data) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Form');
    if (!sheet) throw new Error('Sheet not found');
    const lastRow = sheet.getLastRow();
    data = sheet.getRange(2, 3, lastRow - 1, 2).getValues(); // columns C (Email) & D (Link)
    cache.put(cacheKey, JSON.stringify(data), 300);
  }

  const emailLower = email.toLowerCase();
  const linkLower = link.toLowerCase();

  const emailExists = data.some(row => row[0]?.toLowerCase() === emailLower);
  const linkExists = data.some(row => row[1]?.toLowerCase() === linkLower);

  return { emailExists, linkExists };
}

// ===== Submission Stats =====
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

// ===== Get all taken links =====
function getExistingLinks() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Form');
  if (!sheet) return [];
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return [];
  return sheet
    .getRange(2, 4, lastRow - 1, 1) // column D (Link)
    .getValues()
    .flat()
    .filter((value) => typeof value === 'string' && value.trim() !== '')
    .map((value) => value.trim());
}

// ===== Form Submission =====
function submitFormData(params) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Form');
  if (!sheet) throw new Error('Sheet not found');

  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'Timestamp', 'Name', 'Email', 'Link', 'Tagline', 'Phone',
      'Address', 'Social Links', 'Selected Style',
      'Profile Picture URL', 'ID', 'Status'
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
    params.social_links ? params.social_links.split(',').join(',\n') : '',
    params.style || 'default',
    params.profilePic || '',
    submissionId,
    'Active'
  ];

  sheet.appendRow(newRow);
  CacheService.getScriptCache().remove('form_data_duplicates');
  return submissionId;
}

// ===== Send Notification Email =====
function sendNotificationEmail(email, name, link, profilePic) {
  const htmlBody = createFreeEmailBody(name, link, profilePic);
  GmailApp.sendEmail(
    email,
    'Your Free Digital Card is Ready! | tccards',
    'Your free digital card has been created.',
    {
      htmlBody,
      name: 'tccards Free Plan',
      replyTo: 'info@tccards.tn'
    }
  );
}

function createFreeEmailBody(name, link, profilePic) {
  return `
<html>
<head>
    <base target="_blank">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #fff; background-color: #121212; margin:0; padding:0; }
        .container { max-width: 600px; margin: 50px auto; padding: 20px; background-color: #1e1e1e; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.3); text-align: center; }
        .content { padding: 20px; background: #000000; border-radius: 8px; margin-top: 20px; }
        .footer { text-align: center; padding: 20px; color: #A0A0A0; font-size: 12px; }
        .table-container { margin-top: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; color: white; }
        th, td { padding: 10px; border: 1px solid #444; text-align: left; }
        th { background-color: #ffffff; color: #000000; }
        .w-32 { width: 8rem; } .h-32 { height: 8rem; } .rounded-full { border-radius: 9999px; } .object-cover { object-fit: cover; } .cursor-pointer { cursor: pointer; }
        a { color: #2563eb; font-weight: bold; text-decoration: none; border-bottom: 2px solid #2563eb; transition: all 0.3s ease; }
        a:hover { color: #1e40af; border-bottom-color: #1e40af; }
        .expiry-notice { color: #f87171; font-weight: bold; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="content">
            <img src="${profilePic || 'https://tccards.tn/Assets/150.png'}" alt="Profile Picture" class="w-32 h-32 rounded-full object-cover cursor-pointer" />
            <p>Hello <strong>${name}</strong>,</p>
            <p>Your <strong>free</strong> digital card is ready to use!</p>
            <p>Your link: <strong>at.tccards.tn/@${link}</strong></p>
            
            <div class="expiry-notice">
                ⏳ Expires in 30 days – Upgrade anytime to keep your card active
            </div>
            
            <div class="table-container">
                <table>
                    <tr><th>Plan</th><td><i style="color: #10B981;">Free Trial</i></td></tr>
                    <tr><th>Features</th><td>Basic profile with social links</td></tr>
                    <tr>
                        <th>Upgrade To</th>
                        <td>
                            <strong style="color: #f59e0b;">Standard Plan</strong><br>
                            Includes NFC card + premium features
                        </td>
                    </tr>
                </table>
            </div>
            <p>
                <a href="https://at.tccards.tn/@${link}">View My Digital Card</a>
            </p>
            <p>
                <a href="https://tccards.tn/plans/standard" style="color: #10B981; border-color: #10B981;">Upgrade to Standard Plan</a>
            </p>
        </div>
        <div class="footer">
            <p>© ${new Date().getFullYear()} Total Connect. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;
}