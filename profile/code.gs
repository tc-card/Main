// Find row by link
function findRowByLink(link) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Form Submissions');
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const linkColumnIndex = headers.indexOf('link'); // Ensure column name matches exactly

    for (let i = 1; i < data.length; i++) {
        if (data[i][linkColumnIndex] === link) {
            const row = data[i];
            const responseData = {};
            headers.forEach((header, index) => {
                responseData[header] = row[index];
            });
            return responseData;
        }
    }
    return null;
}

// Main GET request handler
function doGet(e) {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type'
    };

    try {
        if (!e || !e.parameter) {
            throw new Error('Invalid request');
        }

        // Handle link-based lookup
        if (e.parameter.link) {
            const data = findRowByLink(e.parameter.link);
            if (!data) {
                throw new Error('Profile not found');
            }

            const callback = e.parameter.callback;
            const response = JSON.stringify(data);

            return ContentService.createTextOutput(
                callback ? `${callback}(${response})` : response
            )
            .setMimeType(ContentService.MimeType.JAVASCRIPT)
            .setHeaders(headers);
        } else {
            throw new Error('Link parameter is required');
        }

    } catch (error) {
        return ContentService.createTextOutput(JSON.stringify({
            status: 'error',
            message: error.message
        }))
        .setMimeType(ContentService.MimeType.JSON)
        .setHeaders(headers);
    }
}