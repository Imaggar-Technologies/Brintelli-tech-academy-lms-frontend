# Lead Creation Scripts

Scripts to create leads with specified emails and names.

## Scripts

### 1. Node.js Script (`create-leads.js`)

Run from the command line using Node.js.

#### Basic Usage

```bash
# Pass token as argument
node scripts/create-leads.js your_auth_token_here

# Or set as environment variable
export TOKEN=your_auth_token_here
node scripts/create-leads.js

# On Windows PowerShell
$env:TOKEN="your_auth_token_here"
node scripts/create-leads.js
```

#### Create Multiple Leads Per Email

To create multiple leads with the same email but different names:

```bash
export CREATE_MULTIPLE=true
export TOKEN=your_auth_token_here
node scripts/create-leads.js
```

#### Custom API URL

```bash
export API_BASE_URL=http://localhost:3000
export TOKEN=your_auth_token_here
node scripts/create-leads.js
```

### 2. Browser Console Script (`create-leads-browser.js`)

Run directly in the browser console while logged into the application.

#### Usage

1. Open your browser's developer console (F12)
2. Make sure you're logged into the application
3. Navigate to a page where the application is loaded
4. Copy and paste the script content, or import it:

```javascript
// Import and run
import('./scripts/create-leads-browser.js').then(m => m.createLeads())

// Or modify the script to set createMultipleLeadsPerEmail = true
// then import and run
```

## Lead Data

The scripts create leads with the following emails and names:

- `kannapinnaacc@gmail.com` → leo
- `1412jones@gmail.com` → jones
- `natarajcse2004@gmail.com` → nataraj
- `imaggartechnologiespvtltd@gmail.com` → maga
- `ck.chandramohan.official@gmail.com` → chandramohan

## Getting Your Auth Token

To get your authentication token:

1. Log into the application in your browser
2. Open Developer Tools (F12)
3. Go to Application/Storage → Local Storage
4. Look for the `token` key
5. Copy the token value

Or check the Redux store:

```javascript
// In browser console
JSON.parse(localStorage.getItem('persist:root')).auth
```

## Notes

- The scripts will skip leads that already exist (if the API returns an error for duplicate emails)
- All leads are created with the default status and pipeline stage
- The scripts provide a summary of created and failed leads at the end

