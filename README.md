# nest2spreadsheet
Nest Schedule Controller - saved to Google Spreadsheet

## Installation

1. Clone this repository and install dependencies
```
git clone https://github.com/wcrbrm/nest2spreadsheet
cd nest2spreadsheet
npm install
```
2. Copy `.env.example` into `.env` and put your actual Nest credentials and credentials to access Google Spreadsheet.
```
NEST_EMAIL=
NEST_PASSWORD=
GOOGLE_SPREADSHEET_KEY=
GOOGLE_SERVICE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----
GOOGLE_SERVICE_CLIENT_EMAIL=spreadsheets@spreadsheet-editor-XXXXXX.iam.gserviceaccount.com
```

`GOOGLE_SPREADSHEET_KEY` is the ID of the spreadsheet in the URL:
https://docs.google.com/spreadsheets/`GOOGLE_SPREADSHEET_KEY`/edit


## Credentials of Google's Service Account

This is a 2-legged oauth method and designed to be "an account that belongs to your application instead of to an individual end user".
Use this for an app that needs to access a set of documents that you have full access to.
([read more](https://developers.google.com/identity/protocols/OAuth2ServiceAccount))

__Setup Instructions__

1. Go to the [Google Developers Console](https://console.developers.google.com/project)
2. Select your project or create a new one (and then select it)
3. Enable the Drive API for your project
  - In the sidebar on the left, expand __APIs & auth__ > __APIs__
  - Search for "drive"
  - Click on "Drive API"
  - click the blue "Enable API" button
4. Create a service account for your project
  - In the sidebar on the left, expand __APIs & auth__ > __Credentials__
  - Click blue "Add credentials" button
  - Select the "Service account" option
  - Select "Furnish a new private key" checkbox
  - Select the "JSON" key type option
  - Click blue "Create" button
  - your JSON key file is generated and downloaded to your machine (__it is the only copy!__)
  - Take `GOOGLE_SERVICE_PRIVATE_KEY`, and `GOOGLE_SERVICE_CLIENT_EMAIL` into your environment config `.env`
5. Share the doc (or docs) with your service account using the email noted above

## Running

One-time call: `npm run start`
Watch mode (refreshes every 30 seconds) `npm run watch`




