function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = JSON.parse(e.postData.contents);

  const row = [
    new Date(), // Timestamp
    data.name,
    data.tagline,
    data.socialLinks.join(",\n"), // Join the social links array with a comma
    data.email,
    data.phone,
    data.address,
    data.imageUrl || "No image", // Default to "No image" if no image URL is provided
    data.style.background, // Store the background style
    data.style.accent // Store the accent color style
  ];

  sheet.appendRow(row);
  
  return ContentService.createTextOutput(JSON.stringify({ 'status': 'success' }))
    .setMimeType(ContentService.MimeType.JSON);
}
