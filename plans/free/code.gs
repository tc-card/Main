function doGet(e) {
  try {
    if (!e?.parameter) throw new Error('Invalid request: No data received');
    const params = e.parameter;

    // ===== (1) DUPLICATE CHECK =====
    if (params.check_duplicates === 'true') {
      const { emailExists, linkExists } = checkDuplicates(params.email, params.link);
      return jsonResponse({ emailExists, linkExists });
    }

    // ===== (2) FORM SUBMISSION =====
    if (!params.name || !params.email || !params.link) {
      throw new Error('Name, email, and link are required');
    }

    // Double-check duplicates
    const { emailExists, linkExists } = checkDuplicates(params.email, params.link);
    if (emailExists || linkExists) {
      throw new Error('Email or Link already exists');
    }

    const submissionId = submitFormData(params);
    sendNotificationEmailAsync(submissionId, params.email, params.name, params.link, params.profilePic);

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

// ===== HELPER FUNCTION =====
function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ===== (1) DUPLICATE CHECK (Cached + Optimized) =====
function checkDuplicates(email, link) {
  const cache = CacheService.getScriptCache();
  const cacheKey = 'form_data_duplicates';
  let data = JSON.parse(cache.get(cacheKey));

  if (!data) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Form');
    if (!sheet) throw new Error('Sheet not found');

    // Only read necessary columns (Email & Link)
    const lastRow = sheet.getLastRow();
    data = sheet.getRange(2, 3, lastRow - 1, 2).getValues(); // Columns C (Email) & D (Link)
    cache.put(cacheKey, JSON.stringify(data), 300); // Cache for 5 mins
  }

  const emailLower = email.toLowerCase();
  const linkLower = link.toLowerCase();

  const emailExists = data.some(row => row[0]?.toLowerCase() === emailLower);
  const linkExists = data.some(row => row[1]?.toLowerCase() === linkLower);

  return { emailExists, linkExists };
}

// ===== (2) FORM SUBMISSION (Batch Write) =====
function submitFormData(params) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Form');
  if (!sheet) throw new Error('Sheet not found');

  // Create headers if sheet is empty (optimized)
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'Timestamp', 'Name', 'Email', 'Link', 'Tagline', 'Phone',
      'Address', 'Social Links', 'Selected Style',
      'Profile Picture URL', 'ID', 'Status'
    ]);
  }

  // Prepare data in batch
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

  // Single write operation
  sheet.appendRow(newRow);
  CacheService.getScriptCache().remove('form_data_duplicates'); // Invalidate cache

  return submissionId;
}

function sendNotificationEmailAsync(submissionId, email, name, link, profilePic) {
  const htmlBody = createEmailBody(submissionId, name, link, profilePic); 
    GmailApp.sendEmail(
      email,
      'Your Digital Card is Ready! | Total Connect',
      'Your digital card has been created successfully.',
      {
        htmlBody,
        name: 'Total Connect Digital Cards',
        replyTo: 'info@tccards.tn'
      }
    );
}

function createEmailBody(name, link, profilePic) {
  return `
<html>
<head>
    <base target="_blank">
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #fff;
            background-color: #121212;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 50px auto;
            padding: 20px;
            background-color: #1e1e1e;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
            text-align: center;
        }
        .content {
            padding: 20px;
            background: #000000;
            border-radius: 8px;
            margin-top: 20px;
        }
        .footer {
            text-align: center;
            padding: 20px;
            color: #A0A0A0;
            font-size: 12px;
        }
        .table-container {
            margin-top: 20px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            color: white;
        }
        th, td {
            padding: 10px;
            border: 1px solid #444;
            text-align: left;
        }
        th {
            background-color: #ffffff;
            color: #000000;
        }
        .w-32 { width: 8rem; }
        .h-32 { height: 8rem; }
        .rounded-full { border-radius: 9999px; }
        .object-cover { object-fit: cover; }
        .cursor-pointer { cursor: pointer; }
        a {
            color: #2563eb;
            font-weight: bold;
            text-decoration: none;
            border-bottom: 2px solid #2563eb;
            transition: all 0.3s ease;
        }
        a:hover {
            color: #1e40af;
            border-bottom-color: #1e40af;
        }
        .expiry-notice {
            color: #f87171;
            font-weight: bold;
            margin: 15px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="content">
            <img src="${profilePic}" alt="Profile Picture" class="w-32 h-32 rounded-full object-cover cursor-pointer" />
            <p>Hello <strong>${name}</strong>,</p>
            <p>Your <strong>free</strong> digital card is ready to use!</p>
            <p>Your link: <strong>@${link}</strong></p>
            <q>Submission id: <strong>${submissionId}</strong><br><small>email us for deletion</small></q>
            
            
            <div class="expiry-notice">
                ⏳ Expires in 30 days - Upgrade anytime to keep your card active
            </div>
            
            <div class="table-container">
                <table>
                    <tr>
                        <th>Plan Name</th>
                        <td><i style="color: #10B981;">Free Trial</i></td>
                    </tr>
                    <tr>
                        <th>Features</th>
                        <td>Basic profile with social links</td>
                    </tr>
                    <tr>
                        <th>Upgrade To</th>
                        <td>
                            <strong style="color: rgb(233, 67, 158);">Standard Plan (100dt)</strong><br>
                            Includes NFC card + premium features
                        </td>
                    </tr>
                </table>
            </div>
            <p>
                <a href="https://p.tccards.tn/profile/@${link}">
                    View My Digital Card Now
                </a>
            </p>
            <p>
                <a href="https://tccards.tn/plans/standard" style="color: #10B981; border-color: #10B981;">
                    Upgrade to Standard Plan
                </a>
            </p>
        </div>
        <div class="footer">
            <p>© ${new Date().getFullYear()} Total Connect. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;
}