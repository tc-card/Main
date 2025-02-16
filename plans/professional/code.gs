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
        'Status',
        // CRM Features and Settings Columns
        'CRM Features', // Comma-separated list of selected CRM features
        'Schedule Business Days', // Business days for Work Schedule Display
        'Schedule Business Hours', // Business hours for Work Schedule Display
        'Feedback Star Rating', // Star rating for Feedback System
        'Feedback Comments', // Comments for Feedback System
        'Feedback Notifications', // Notifications for Feedback System
        'Messaging Required Fields', // Required fields for Messaging Form
        'Messaging Template', // Message template for Messaging Form
        'Discounts Title', // Title for Discounts Display
        'Discounts Code', // Code for Discounts Display
        'Discounts Start Date', // Start date for Discounts Display
        'Discounts End Date', // End date for Discounts Display
        'Testimonials Show Photos', // Show photos for Testimonials Section
        'Testimonials Show Ratings', // Show ratings for Testimonials Section
        'Testimonials Layout' // Layout for Testimonials Section
      ]);
    }

    // Generate submission ID
    const submissionId = Utilities.getUuid();

    // Process social links safely
    let socialLinks = '';
    if (formData.social_links) {
      socialLinks = formData.social_links.split(',').join(',\n');
    }

    // Parse CRM features and settings
    const crmFeatures = formData.crm_features ? formData.crm_features.split(',') : [];
    const crmSettings = formData.crm_settings ? JSON.parse(formData.crm_settings) : {};

    // Flatten CRM settings into individual columns
    const scheduleBusinessDays = crmSettings.schedule?.businessDays?.join(', ') || '';
    const scheduleBusinessHours = crmSettings.schedule?.businessHours
      ? `${crmSettings.schedule.businessHours.start} to ${crmSettings.schedule.businessHours.end}`
      : '';
    const feedbackStarRating = crmSettings.feedback?.starRating || false;
    const feedbackComments = crmSettings.feedback?.comments || false;
    const feedbackNotifications = crmSettings.feedback?.notifications || false;
    const messagingRequiredFields = crmSettings.messaging?.requiredFields?.join(', ') || '';
    const messagingTemplate = crmSettings.messaging?.messageTemplate || '';
    const discountsTitle = crmSettings.discounts?.title || '';
    const discountsCode = crmSettings.discounts?.code || '';
    const discountsStartDate = crmSettings.discounts?.startDate || '';
    const discountsEndDate = crmSettings.discounts?.endDate || '';
    const testimonialsShowPhotos = crmSettings.testimonials?.showPhotos || false;
    const testimonialsShowRatings = crmSettings.testimonials?.showRatings || false;
    const testimonialsLayout = crmSettings.testimonials?.layout || '';

    // Prepare row data
    const rowData = [
      new Date(),                    // Timestamp
      formData.name,                 // Name
      formData.tagline || '',        // Tagline
      formData.email,                // Email
      formData.phone || '',          // Phone
      formData.address || '',        // Address
      socialLinks,                   // Social Links
      formData.style || 'default',   // Selected Style
      formData.form_type || '',      // Form Type
      formData.profile_picture || '',  // Profile Picture URL
      formData.background_image || '',  // Background Image URL
      submissionId,                  // Submission ID
      'Innactive',                   // Status
      // CRM Features and Settings
      crmFeatures.join(', '),        // CRM Features
      scheduleBusinessDays,          // Schedule Business Days
      scheduleBusinessHours,         // Schedule Business Hours
      feedbackStarRating,            // Feedback Star Rating
      feedbackComments,              // Feedback Comments
      feedbackNotifications,         // Feedback Notifications
      messagingRequiredFields,       // Messaging Required Fields
      messagingTemplate,             // Messaging Template
      discountsTitle,                // Discounts Title
      discountsCode,                 // Discounts Code
      discountsStartDate,            // Discounts Start Date
      discountsEndDate,              // Discounts End Date
      testimonialsShowPhotos,        // Testimonials Show Photos
      testimonialsShowRatings,       // Testimonials Show Ratings
      testimonialsLayout             // Testimonials Layout
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