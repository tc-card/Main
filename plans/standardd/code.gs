// Main form submission handler
function doGet(e) {
  const headers = {
    'Access-Control-Allow-Origin': '*', // Allow all origins
    'Access-Control-Allow-Methods': 'GET', // Allow GET requests
    'Access-Control-Allow-Headers': 'Content-Type' // Allow the Content-Type header
  };

  try {
    // Validate incoming data
    if (!e || !e.parameter) {
      throw new Error('Invalid request: No data received');
    }

    const formData = e.parameter;

    // Handle different request types
    if (formData.check_duplicates) {
      return checkDuplicates(formData.email, formData.link, headers);
    }

    if (formData.check_referral) {
      return checkReferralCode(formData.code, headers);
    }

    if (formData.track_analytics) {
      return trackAnalytics(formData, headers);
    }

    if (formData.get_analytics) {
      return getAnalytics(formData.id, headers);
    }

    // Validate required fields (form submission)
    if (!formData?.name || !formData?.email) {
      throw new Error('Name and email are required fields');
    }

    // Open the spreadsheet and sheet
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName('Form Submissions') || spreadsheet.insertSheet('Form Submissions');

     // Create headers if first submission
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Timestamp',
        'Name',
        'Tagline',
        'Email',
        'Phone',
        'Address',
        'Social Links',
        'Selected Style',
        'Form Type',
        'Profile Picture URL',
        'Background Image URL',
        'ID',
        'Status',
        'Link'
      ]);
    }

    // Initialize Analytics sheet if it doesn't exist
    initializeAnalyticsSheet(spreadsheet);

    // Generate submission ID
    const submissionId = Utilities.getUuid();

    // Process social links safely
    let socialLinks = '';
    if (formData.social_links) {
      socialLinks = formData.social_links.split(',').join(',\n');
    }

    // Prepare row data
    const rowData = [
      new Date(),                    // Timestamp
      formData.name,                 // Name
      formData.tagline || '',        // Tagline
      formData.email,                // Email
      formData.phone || '',          // Phone
      formData.address || '',        // Address
      socialLinks,                   // Social Links
      formData.style || 'default',    // Selected Style
      formData.form_type || 'standard',       // Form Type
      formData.profilePic || '',  // Profile Picture URL
      formData.background_image || '',  // Background Image URL
      submissionId,                   // Submission ID
      'Active',                        // Status
      formData.link || ''             // Link
    ];

    // Add data to sheet
    sheet.appendRow(rowData);

    // Send email notification
    try {
      sendNotificationEmail(formData.email, formData.name, submissionId, formData.profile_picture);
    } catch (emailError) {
      console.error('Email notification failed:', emailError);
      // Continue execution even if email fails
    }

    // Return success response with CORS headers
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'Form submitted successfully',
      submissionId: submissionId,
      cardId: submissionId
    }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders(headers);

  } catch (error) {
    // Log error and return error response with CORS headers
    console.error('Form submission error:', error);
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.message || 'An error occurred while processing your request',
    }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders(headers);
  }
}

// Send email notification to user
function sendNotificationEmail(userEmail, userName, submissionId, profile_picture) {
  const htmlBody = `
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
          .header {
              background: #2a2a2a;
              color: white;
              padding: 20px;
              border-radius: 8px;
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
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">
              <img src="http://tccards.tn/Assets/150.png" alt="Logo" />
              <h1>Welcome to Total Connect <br>Digital Cards</h1>
          </div>
          <div class="content">
              <img src="${profile_picture}" alt="Profile Picture" class="w-32 h-32 rounded-full object-cover cursor-pointer" />
              <p>Hello <strong>${userName}</strong>,</p>
              <p>Your digital card has been created successfully!</p>
              <p>Submission ID: <strong>${submissionId}</strong></p>
              <div class="table-container">
                  <table>
                      <tr>
                          <th>Plan Name</th>
                          <td><i style="color: orange;">Standard</i></td>
                      </tr>
                      <tr>
                          <th>Delivery Price</th>
                          <td>7dt all over tunisia</td>
                      </tr>
                      <tr>
                          <th>Total Price</th>
                          <td><strong style="color: rgb(233, 67, 158);">100dt</strong></td>
                      </tr>
                  </table>
              </div>
              <p>
                  <a href="http://tccards.tn/plans/standardd/view-card?id=${submissionId}">
                      View My Digital Card
                  </a>
              </p>
              <p style="margin-top: 15px;">
                  <a href="http://tccards.tn/plans/standardd/dashboard.html?id=${submissionId}">
                      View Analytics Dashboard
                  </a>
              </p>
          </div>
          <div class="footer">
              <p>© ${new Date().getFullYear()} Total Connect. All rights reserved.</p>
          </div>
      </div>
  </body>
  </html>`;

  GmailApp.sendEmail(
    userEmail,
    'Your Digital Card is Ready! | Total Connect',
    'Your digital card has been created successfully.',
    {
      htmlBody: htmlBody,
      name: 'Total Connect Digital Cards',
      replyTo: 'support@tccards.tn'
    }
  );
}



// vew-card.gs

function doGet(e) {
  const callback = e.parameter.callback;

  try {
    if (!e || !e.parameter || !e.parameter.id) {
      throw new Error('Invalid request: No ID provided');
    }

    const ID = e.parameter.id;

    // Fetch data from the sheet
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName('Form Submissions');

    if (!sheet) {
      throw new Error('Sheet not found');
    }

    const data = sheet.getDataRange().getValues();
    const headerRow = data[0]; // First row is headers
    const row = data.find(row => row[11] === ID); // Assuming ID is in the 12th column

    if (!row) {
      throw new Error('Card not found');
    }

    // Map row data to headers
    const cardData = {};
    headerRow.forEach((header, index) => {
      cardData[header] = row[index];
    });

    // Return card data as JSONP
    const response = {
      status: 'Active',
      ...cardData
    };

    if (callback) {
      return ContentService.createTextOutput(`${callback}(${JSON.stringify(response)})`)
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    } else {
      return ContentService.createTextOutput(JSON.stringify(response))
        .setMimeType(ContentService.MimeType.JSON);
    }

  } catch (error) {
    // Log error and return error response
    console.error('Request error:', error);
    const errorResponse = {
      status: 'error',
      message: error.message || 'An error occurred while processing your request',
    };

    if (callback) {
      return ContentService.createTextOutput(`${callback}(${JSON.stringify(errorResponse)})`)
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    } else {
      return ContentService.createTextOutput(JSON.stringify(errorResponse))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
}

// Helper function to check for duplicate emails and links
function checkDuplicates(email, link, headers) {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName('Form Submissions');
    
    if (!sheet || sheet.getLastRow() <= 1) {
      return ContentService.createTextOutput(JSON.stringify({
        emailExists: false,
        linkExists: false
      }))
        .setMimeType(ContentService.MimeType.JSON)
        .setHeaders(headers);
    }

    const data = sheet.getDataRange().getValues();
    const emailExists = data.some((row, index) => index > 0 && row[3] === email);
    const linkExists = data.some((row, index) => index > 0 && row[13] === link);

    return ContentService.createTextOutput(JSON.stringify({
      emailExists: emailExists,
      linkExists: linkExists
    }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders(headers);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.message
    }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders(headers);
  }
}

// Helper function to check referral codes
function checkReferralCode(code, headers) {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName('Referral Codes');
    
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({
        codeExists: false
      }))
        .setMimeType(ContentService.MimeType.JSON)
        .setHeaders(headers);
    }

    const data = sheet.getDataRange().getValues();
    const codeRow = data.find((row, index) => index > 0 && row[0] === code);

    if (codeRow) {
      return ContentService.createTextOutput(JSON.stringify({
        codeExists: true,
        codeDetails: {
          discountValue: codeRow[1] || '10% OFF',
          validUntil: codeRow[2] || 'Valid'
        }
      }))
        .setMimeType(ContentService.MimeType.JSON)
        .setHeaders(headers);
    }

    return ContentService.createTextOutput(JSON.stringify({
      codeExists: false
    }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders(headers);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.message
    }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders(headers);
  }
}

// Initialize Analytics sheet
function initializeAnalyticsSheet(spreadsheet) {
  let analyticsSheet = spreadsheet.getSheetByName('Analytics');
  
  if (!analyticsSheet) {
    analyticsSheet = spreadsheet.insertSheet('Analytics');
    analyticsSheet.appendRow([
      'Timestamp',
      'User ID',
      'Event Type',
      'Event Data',
      'IP Address',
      'User Agent'
    ]);
  }
}

// Track analytics events
function trackAnalytics(data, headers) {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    let analyticsSheet = spreadsheet.getSheetByName('Analytics');
    
    if (!analyticsSheet) {
      initializeAnalyticsSheet(spreadsheet);
      analyticsSheet = spreadsheet.getSheetByName('Analytics');
    }

    analyticsSheet.appendRow([
      new Date(),
      data.userId || 'unknown',
      data.eventType || 'view',
      data.eventData || '',
      data.ipAddress || '',
      data.userAgent || ''
    ]);

    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'Analytics tracked'
    }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders(headers);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.message
    }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders(headers);
  }
}

// Get analytics for a user
function getAnalytics(userId, headers) {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const analyticsSheet = spreadsheet.getSheetByName('Analytics');
    
    if (!analyticsSheet) {
      return ContentService.createTextOutput(JSON.stringify({
        totalViews: 0,
        totalClicks: 0,
        contactSaves: 0,
        recentActivity: []
      }))
        .setMimeType(ContentService.MimeType.JSON)
        .setHeaders(headers);
    }

    const data = analyticsSheet.getDataRange().getValues();
    const userEvents = data.filter((row, index) => index > 0 && row[1] === userId);

    const totalViews = userEvents.filter(row => row[2] === 'view').length;
    const totalClicks = userEvents.filter(row => row[2] === 'click').length;
    const contactSaves = userEvents.filter(row => row[2] === 'save').length;

    return ContentService.createTextOutput(JSON.stringify({
      totalViews: totalViews,
      totalClicks: totalClicks,
      contactSaves: contactSaves,
      engagementRate: totalViews > 0 ? ((totalClicks + contactSaves) / totalViews * 100).toFixed(1) : 0,
      recentActivity: userEvents.slice(-10).reverse()
    }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders(headers);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.message
    }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders(headers);
  }
}