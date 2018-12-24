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

`GOOGLE_SPREADSHEET_KEY` is the ID of the spreadsheet in the URL, which you can see while opening it in browser:
https://docs.google.com/spreadsheets/`GOOGLE_SPREADSHEET_KEY`/edit


## Credentials of Google's Service Account

Providing google spreadsheet and service credentials is optional, without them it will just display data (with warnings) 

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
  - Update `GOOGLE_SERVICE_PRIVATE_KEY`, and `GOOGLE_SERVICE_CLIENT_EMAIL` from that JSON file in your environment config `.env`

## Spreadsheet Preparation

1. Share the spreadsheet with your service account using the email `GOOGLE_SERVICE_CLIENT_EMAIL` noted above. Otherwise you will receive
2. Your spreadsheet MUST have 1 row set up, containing EXACTLY these column names: `time`, `current_temp`, `target_temp`, `humidity`.
3. Extra rows should be manually deleted

## Running

One-time call: `npm run start`
Watch mode (refreshes every 30 seconds) `npm run watch`

## Running with Docker

Clone repositort and set up variables. Then start docker service
```
docker-compose up -d
```

To Stop the service:
```
docker-compose down
```