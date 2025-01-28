function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  let data;
  
  try {
    data = JSON.parse(e.postData.contents);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ 'status': 'error', 'message': 'Invalid JSON data' }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // Validate required fields
  if (!data.name || !data.email) {
    return ContentService.createTextOutput(JSON.stringify({ 'status': 'error', 'message': 'Name and email are required' }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const row = [
    new Date(), // Timestamp
    data.name || "No name",
    data.tagline || "No tagline",
    data.socialLinks ? data.socialLinks.join(",\n") : "No links", // Join the social links array with a comma
    data.email || "No email",
    data.phone || "No phone",
    data.address || "No address",
    data.imageUrl || "No image", // Default to "No image" if no image URL is provided
    data.style?.background || "No background", // Store the background style
    data.style?.accent || "No accent color" // Store the accent color style
  ];

  try {
    sheet.appendRow(row);
    return ContentService.createTextOutput(JSON.stringify({ 'status': 'success', 'message': 'Data saved successfully' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ 'status': 'error', 'message': 'Failed to save data' }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}