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

    // Validate required fields
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
        'Profile Picture URL', // New column for profile picture URL
        'Background Image URL', // New column for background image URL
        'ID',
        'Status'
      ]);
    }

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
      formData.form_type || '',       // Form Type
      formData.profile_picture || '',  // Profile Picture URL
      formData.background_image || '',  // Background Image URL
      submissionId,                   // Submission ID
      'Innactive'                        // Status
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
          .button {
              display: block;
              width: 100%;
              padding: 12px;
              background: #2563eb;
              color: white;
              text-decoration: none;
              border-radius: 5px;
              margin-top: 15px;
              cursor: pointer;
              transition: background 0.3s;
          }
          .button:hover {
              background-color: #1e40af;
          }
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
              <img src="http://tc-card.github.io/Main/Assets/code.png" alt="Logo" />
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
                  <a href="http://tc-card.github.io/Main/plans/standard/view-card?id=${submissionId}">
                      View My Digital Card
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
      replyTo: 'support@totalconnect.com'
    }
  );
}