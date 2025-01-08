function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = JSON.parse(e.postData.contents);
  
  // Prepare the row data to be appended
  const row = [
    new Date(), // Timestamp
    data.name,
    data.tagline,
    data.companyLinks.join(",\n"), // Joining the links into a single string
    data.email,
    data.phone,
    data.address,
    data.crm, // CRM value (optional)
    data.domain, // Domain value (optional)
    data.imageUrl || "No image", // Use the uploaded image URL or "No image"
    JSON.stringify(data.crmFeatures), // CRM Features as a JSON string
    JSON.stringify(data.businessDays), // Business Days as a JSON string
    JSON.stringify(data.workSchedule), // Work Schedule as a JSON string
    JSON.stringify(data.feedbackSettings), // Feedback Settings as a JSON string
    JSON.stringify(data.messagingSettings), // Messaging Settings as a JSON string
    JSON.stringify(data.discountSettings), // Discount Settings as a JSON string
    JSON.stringify(data.testimonialSettings), // Testimonial Settings as a JSON string
    JSON.stringify(data.style) // Style settings as a JSON string
  ];

  // Append the data to the Google Sheet
  sheet.appendRow(row);
  
  // Return a success response
  return ContentService.createTextOutput(JSON.stringify({ 'status': 'success' }))
    .setMimeType(ContentService.MimeType.JSON);
}
