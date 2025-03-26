// Find row by link with caching and case-insensitive matching
function findRowByLink(link) {
    const cache = CacheService.getScriptCache();
    const cachedData = cache.get(link.toLowerCase());
    if (cachedData) return JSON.parse(cachedData);
    
    // For additional databases
    const spreadsheet = SpreadsheetApp.openById('DIFFERENT_SPREADSHEET_ID');
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const linkColumnIndex = headers.findIndex(h => h.toLowerCase() === 'link');
    
    if (linkColumnIndex === -1) throw new Error('Link column not found');

    const cleanLink = link.trim().toLowerCase();
    for (let i = 1; i < data.length; i++) {
        if (String(data[i][linkColumnIndex]).trim().toLowerCase() === cleanLink) {
            const row = data[i];
            const responseData = {};
            headers.forEach((header, index) => {
                responseData[header] = row[index];
            });
            
            cache.put(cleanLink, JSON.stringify(responseData), 600); // Cache for 10 minutes
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
        if (!e?.parameter?.link) {
            throw new Error('Link parameter is required');
        }

        console.log('Looking up link:', e.parameter.link);
        const data = findRowByLink(e.parameter.link);
        
        if (!data) {
            throw new Error('Profile not found');
        }

        const response = {
            status: 'Active',
            ...data
        };

        const callback = e.parameter.callback;
        const responseText = callback 
            ? `${callback}(${JSON.stringify(response)})`
            : JSON.stringify(response);

        return ContentService.createTextOutput(responseText)
            .setMimeType(callback ? ContentService.MimeType.JAVASCRIPT : ContentService.MimeType.JSON)
            .setHeaders(headers);

    } catch (error) {
        console.error('Error:', error.message);
        return ContentService.createTextOutput(JSON.stringify({
            status: 'error',
            message: error.message
        }))
        .setMimeType(ContentService.MimeType.JSON)
        .setHeaders(headers);
    }
}