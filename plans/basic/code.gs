const REFERRAL_CODES = [
  {
    code: "WE10T",
    validFrom: "2025-01-01",
    validTo: "2026-12-31",
    discountValue: "10% OFF"
  }
];

function doGet(e) {
  try {
    if (!e?.parameter) throw new Error('Invalid request: No data received');
    const params = e.parameter;

    // Referral code validation endpoint
    if (params.check_referral === 'true') {
      const { codeExists, codeDetails } = checkReferralCode(params.code);
      return jsonResponse({ codeExists, codeDetails });
    }

    // Form submission endpoint
    if (!params.name || !params.email || !params.link) {
      throw new Error('Name, email, and link are required');
    }

    // Validate referral code if provided
    if (params.referralCode) {
      const { codeExists } = checkReferralCode(params.referralCode);
      if (!codeExists) {
        throw new Error('Invalid referral code');
      }
    }

    const submissionId = submitFormData(params);
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
    
    return { codeExists: true, codeDetails: foundCode };
  }

  return { codeExists: false, codeDetails: null };
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
      'Profile Picture URL', 'Form', 'ID', 'Status'
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
    params.formEmail || '',
    submissionId,
    'Inactive'
  ];

  // Single write operation
  sheet.appendRow(newRow);
  CacheService.getScriptCache().remove('form_data_duplicates'); // Invalidate cache

  return submissionId;
}

function sendNotificationEmailAsync(email, name, link, profilePic) {
  const htmlBody = createEmailBody(name, link, profilePic); 
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
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Your Digital Card is Ready!</title>
    <style type="text/css">
        /* Client-specific styles */
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
        
        /* Reset styles */
        body { margin: 0 !important; padding: 0 !important; width: 100% !important; }
        
        /* iOS BLUE LINKS */
        a[x-apple-data-detectors] {
            color: inherit !important;
            text-decoration: none !important;
            font-size: inherit !important;
            font-family: inherit !important;
            font-weight: inherit !important;
            line-height: inherit !important;
        }
        
        /* Main styles */
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #333333;
            background-color: #f7f7f7;
            line-height: 1.5;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
        }
        
        .header {
            background-color: #6e48aa;
            background: linear-gradient(to right, #6e48aa, #9d50bb);
            padding: 30px 20px;
            text-align: center;
            color: #ffffff;
        }
        
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }
        
        .header p {
            margin: 10px 0 0;
            font-size: 16px;
            opacity: 0.9;
        }
        
        .profile-image {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            border: 4px solid #ffffff;
            margin: -50px auto 20px;
            display: block;
            background-color: #ffffff;
        }
        
        .content {
            padding: 20px 30px 30px;
        }
        
        .welcome-text {
            text-align: center;
            margin-bottom: 25px;
        }
        
        .welcome-text p {
            margin: 10px 0;
            font-size: 16px;
        }
        
        .highlight {
            color: #6e48aa;
            font-weight: 600;
        }
        
        .card-link {
            background-color: #f5f5f5;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            text-align: center;
            font-size: 18px;
            font-weight: 600;
            color: #6e48aa;
        }
        
        .notice-box {
            background-color: #f8f9fa;
            border-left: 4px solid #6e48aa;
            padding: 15px;
            margin: 25px 0;
            font-size: 14px;
        }
        
        .notice-box p {
            margin: 8px 0;
        }
        
        .notice-icon {
            color: #6e48aa;
            margin-right: 8px;
        }
        
        .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #6e48aa;
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 4px;
            font-weight: 600;
            margin: 10px 5px;
            text-align: center;
        }
        
        .button.secondary {
            background-color: #4CAF50;
        }
        
        .button.danger {
            background-color: #e74c3c;
        }
        
        .footer {
            background-color: #2d2d2d;
            color: #ffffff;
            padding: 20px;
            text-align: center;
            font-size: 12px;
        }
        
        .footer a {
            color: #ffffff;
            text-decoration: underline;
        }
        
        .social-icons {
            margin: 15px 0;
        }
        
        .social-icon {
            display: inline-block;
            margin: 0 8px;
            color: #ffffff;
        }
        
        @media screen and (max-width: 600px) {
            .email-container {
                width: 100% !important;
            }
            .content {
                padding: 20px 15px !important;
            }
        }
    </style>
</head>
<body style="margin: 0; padding: 0;">
    <!-- Email container -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="600" style="margin: auto;" class="email-container">
        <!-- Header -->
        <tr>
            <td class="header">
                <h1>Your Digital Card is Ready! 🎉</h1>
                <p>Connect with style and simplicity</p>
            </td>
        </tr>
        
        <!-- Profile image -->
        <tr>
            <td align="center" style="padding: 0;">
                <img src="${profilePic}" alt="Profile Picture" width="100" style="height: auto; display: block;" class="profile-image" />
            </td>
        </tr>
        
        <!-- Content -->
        <tr>
            <td class="content">
                <div class="welcome-text">
                    <p>Hello <span class="highlight">${name}</span>,</p>
                    <p>Your <span class="highlight">basic</span> digital card has been created and is ready to use!</p>
                </div>
                
                <div class="card-link">
                    Your tag: <span class="highlight">@${link}</span>
                </div>
                
                <div class="notice-box">
                    <p><span class="notice-icon">⏳</span> No expiry date - Your card is active as long as the data is present</p>
                    <p><span class="notice-icon">ℹ️</span> Your Digital Profile is currently inactive and will be activated after payment</p>
                </div>
                
                <table width="100%" cellpadding="0" cellspacing="0" style="margin: 25px 0; border-collapse: collapse;">
                    <tr>
                        <th style="text-align: left; padding: 10px; border-bottom: 1px solid #e0e0e0; font-weight: 600;">Plan Name</th>
                        <td style="text-align: right; padding: 10px; border-bottom: 1px solid #e0e0e0; color: #6e48aa; font-weight: 600;">Basic</td>
                    </tr>
                    <tr>
                        <th style="text-align: left; padding: 10px; border-bottom: 1px solid #e0e0e0; font-weight: 600;">Features</th>
                        <td style="text-align: right; padding: 10px; border-bottom: 1px solid #e0e0e0;">
                            <p style="margin: 5px 0;">• Basic Digital Profile</p>
                            <p style="margin: 5px 0;">• 1 NFC Card</p>
                            <p style="margin: 5px 0;">• +3 Media links (6 total)</p>
                            <p style="margin: 5px 0;">• Basic Email Contact Form</p>
                        </td>
                    </tr>
                    <tr>
                        <th style="text-align: left; padding: 10px; border-bottom: 1px solid #e0e0e0; font-weight: 600;">Upgrade To</th>
                        <td style="text-align: right; padding: 10px; border-bottom: 1px solid #e0e0e0;">
                            <a href="https://tccards.tn/plans/standard" style="color: #e67e22; text-decoration: none; font-weight: 600;">Standard Plan</a>
                            <p style="margin: 5px 0; font-size: 12px; color: #777;">Includes 5 NFC cards + premium features</p>
                        </td>
                    </tr>
                </table>
                
                <div style="text-align: center; margin: 25px 0;">
                    <a href="https://edit.tccards.tn/" class="button secondary" style="background-color: #4CAF50;">Edit My Profile</a>
                    <a href="https://card.tccards.tn/termination" class="button danger" style="background-color: #e74c3c;">Delete My Data</a>
                </div>
            </td>
        </tr>
        
        <!-- Footer -->
        <tr>
            <td class="footer">
                <div class="social-icons">
                    <a href="https://facebook.com" class="social-icon">Facebook</a> | 
                    <a href="https://twitter.com" class="social-icon">Twitter</a> | 
                    <a href="https://instagram.com" class="social-icon">Instagram</a> | 
                    <a href="https://linkedin.com" class="social-icon">LinkedIn</a>
                </div>
                <p>© ${new Date().getFullYear()} Total Connect. All rights reserved.</p>
                <p><a href="https://tccards.tn/privacy">Privacy Policy</a> | <a href="https://tccards.tn/terms">Terms of Service</a></p>
            </td>
        </tr>
    </table>
</body>
</html>
`;
}