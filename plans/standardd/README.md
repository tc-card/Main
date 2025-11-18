# Standard Plan - Digital Business Card

## Overview
The Standard Plan offers enhanced features for professionals looking to elevate their digital presence with analytics, custom branding, and team support.

## Features
- 5 Premium NFC Cards
- Custom Card Design
- Unlimited Media Links
- Analytics Dashboard
- Email Support
- No Watermark
- Real-time Link Updates

## Files Structure

### Frontend Files
- **index.html** - Main landing and data collection form
- **dashboard.html** - Analytics dashboard for card owners
- **main.js** - Form handling and validation logic
- **dashboard.js** - Dashboard data visualization and charts
- **config.js** - Configuration settings (API endpoints, validation rules)
- **script.js** - Additional UI features

### Backend Files
- **code.gs** - Google Apps Script for backend processing

## Google Apps Script Setup

### Prerequisites
1. Google Account with access to Google Sheets
2. Google Apps Script project

### Setup Instructions

1. **Create a Google Sheet**
   - Create a new Google Sheet
   - Name it "Standard Plan Submissions" or similar
   
2. **Create Required Sheets**
   The script will auto-create these sheets on first run:
   - `Form Submissions` - Stores all form submissions
   - `Analytics` - Tracks user analytics events
   - `Referral Codes` - (Optional) Store referral codes

3. **Set up Google Apps Script**
   - Open the Google Sheet
   - Go to Extensions > Apps Script
   - Copy the content from `code.gs` into the script editor
   - Save the project

4. **Deploy as Web App**
   - Click "Deploy" > "New deployment"
   - Select type: Web app
   - Execute as: Me
   - Who has access: Anyone
   - Click "Deploy"
   - Copy the Web App URL

5. **Update Configuration**
   - Update `config.js` with your new Web App URL:
   ```javascript
   googleScriptUrl: "YOUR_WEB_APP_URL_HERE"
   ```

### Referral Codes Setup (Optional)
1. Create a sheet named "Referral Codes"
2. Add headers: `Code` | `Discount Value` | `Valid Until`
3. Add referral codes (5 characters, uppercase)

Example:
```
Code    | Discount Value | Valid Until
ABCD1   | 10% OFF       | 2024-12-31
XYZ99   | 15% OFF       | 2024-06-30
```

## Form Workflow

1. **User fills the form** with:
   - Profile picture (uploaded to Cloudinary)
   - Name and tagline
   - Custom URL link
   - Social/professional links
   - Contact information
   - Card style preference
   - Optional referral code

2. **Validation checks**:
   - Duplicate email/link detection
   - Referral code validation
   - Image size and type validation

3. **Data processing**:
   - Image uploaded to Cloudinary
   - Form data sent to Google Sheets
   - Confirmation email sent to user
   - Unique submission ID generated

4. **Post-submission**:
   - User receives email with dashboard link
   - Can access analytics dashboard with submission ID

## Analytics Dashboard

### Metrics Tracked
- Total profile views
- Link clicks
- Contact saves (vCard downloads)
- Engagement rate
- Recent activity timeline

### Charts
- Profile views over time (line chart)
- Most clicked links (bar chart)

### Data Collection
Analytics events are tracked in the `Analytics` sheet:
- View events: When someone views the card
- Click events: When someone clicks a link
- Save events: When someone saves the contact

## UX/UI Features

### Persuasion Psychology Elements
1. **Social Proof**: "Join 2,500+ professionals"
2. **Progress Indicators**: Visual step completion
3. **Scarcity**: "5 spots left today" messaging
4. **Trust Signals**: Security badges (Secure, Protected, Instant)
5. **Benefits Reminder**: Pre-submission feature recap
6. **Professional Design**: Glassmorphism effects, smooth animations

### Form Progress Tracking
- Automatic progress bar updates
- Step indicators (1 of 4, 2 of 4, etc.)
- Real-time validation feedback

## API Endpoints

The Google Apps Script handles these query parameters:

### Check Duplicates
```
?check_duplicates=true&email={email}&link={link}
```
Returns: `{ emailExists: boolean, linkExists: boolean }`

### Check Referral Code
```
?check_referral=true&code={code}
```
Returns: `{ codeExists: boolean, codeDetails: {...} }`

### Track Analytics
```
?track_analytics=true&userId={id}&eventType={type}&eventData={data}
```
Returns: `{ status: "success" }`

### Get Analytics
```
?get_analytics=true&id={userId}
```
Returns: Analytics data object

### Form Submission
```
?name={name}&email={email}&link={link}&...
```
Returns: `{ status: "success", submissionId: "..." }`

## Customization

### Styling
Modify the gradient presets in `config.js`:
```javascript
export const stylePresets = {
  corporateGradient: { background: "..." },
  oceanGradient: { background: "..." },
  // Add more presets
};
```

### Validation Rules
Update validation patterns in `config.js`:
```javascript
export const CONFIG = {
  emailRegex: /pattern/,
  linkRegex: /pattern/,
  maxFileSize: 5 * 1024 * 1024,
  // ...
};
```

## Troubleshooting

### Form submission fails
- Check Google Apps Script deployment URL
- Verify CORS settings in Apps Script
- Check browser console for errors

### Images not uploading
- Verify Cloudinary credentials
- Check image size (max 5MB)
- Ensure allowed file types (JPEG, PNG, GIF)

### Analytics not showing
- Verify submission ID in URL
- Check Analytics sheet has data
- Ensure proper Google Sheets permissions

## Support
For issues or questions, contact support at support@tccards.tn

## Version
Current Version: 1.0.0
Last Updated: 2024
