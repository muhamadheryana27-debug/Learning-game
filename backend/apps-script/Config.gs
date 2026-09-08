/**
 * Config.gs — Environment configuration for Google Apps Script backend.
 */

const CONFIG = {
  // Spreadsheet ID — set after creating the Google Sheet
  SPREADSHEET_ID: "",

  // Sheet names
  SHEETS: {
    STUDENTS: "Students",
    SESSIONS: "Sessions",
    EVENTS: "Events",
    MODULE_RESULTS: "ModuleResults",
  },

  // CORS
  ALLOWED_ORIGINS: ["*"],

  // Rate limiting (simple)
  MAX_REQUESTS_PER_MINUTE: 60,
};
