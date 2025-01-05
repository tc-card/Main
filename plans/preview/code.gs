function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = JSON.parse(e.postData.contents);
  
  const row = [
    new Date(), // Timestamp
    data.name,
    data.tagline,
    data.socialLinks.join(",\n"),
    data.email,
    data.phone,
    data.address,
    data.imageUrl || "No image"
  ];
  
  sheet.appendRow(row);
  return ContentService.createTextOutput(JSON.stringify({ 'status': 'success' }))
    .setMimeType(ContentService.MimeType.JSON);
}