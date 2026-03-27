import { google } from 'googleapis'

function getAuth() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const keyBase64 = process.env.GOOGLE_PRIVATE_KEY_BASE64

  if (!email || !keyBase64) {
    throw new Error('Google Sheets credentials not configured')
  }

  const privateKey = Buffer.from(keyBase64, 'base64').toString('utf-8')

  return new google.auth.JWT({
    email,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })
}

export function getSheetsClient() {
  return google.sheets({ version: 'v4', auth: getAuth() })
}

export function getSpreadsheetId() {
  const id = process.env.GOOGLE_SPREADSHEET_ID
  if (!id) throw new Error('GOOGLE_SPREADSHEET_ID not configured')
  return id
}
