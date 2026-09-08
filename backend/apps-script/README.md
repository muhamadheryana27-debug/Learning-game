# Google Apps Script Backend

## Setup

1. Create a new Google Sheet for data storage
2. Copy the Sheet ID from the URL (the long string between `/d/` and `/edit`)
3. Open the Google Apps Script editor (Extensions → Apps Script)
4. Copy all `.gs` files into the script editor
5. Set `CONFIG.SPREADSHEET_ID` in `Config.gs` to your Sheet ID
6. Deploy as Web App:
   - Deploy → New Deployment
   - Type: Web App
   - Execute as: Me
   - Who has access: Anyone
   - Copy the deployment URL

## Environment Variable

Set in your `.env`:

```
VITE_GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

## Endpoints

| Action | Method | Required Fields |
|---|---|---|
| `health` | GET | — |
| `registerStudent` | POST | studentId, name, className, attendanceNumber |
| `startSession` | POST | sessionId, studentId |
| `saveEvent` | POST | sessionId, studentId, eventType |
| `saveModuleResult` | POST | sessionId, studentId, moduleId |
| `completeSession` | POST | sessionId, studentId |
| `dashboard` | POST | — (optional: className, limit) |

## Response Format

```json
{
  "ok": true,
  "action": "registerStudent",
  "requestId": "REQ-1234567890",
  "data": { "studentId": "VIII-A-01-budi" }
}
```

## Google Sheets Schema

### Students
| Column | Field |
|---|---|
| A | student_id |
| B | name |
| C | class |
| D | attendance_number |
| E | created_at |
| F | updated_at |

### Sessions
| Column | Field |
|---|---|
| A | session_id |
| B | student_id |
| C | started_at |
| D | updated_at |
| E | completed_at |
| F | status |
| G | total_score |

### Events
| Column | Field |
|---|---|
| A | event_id |
| B | session_id |
| C | student_id |
| D | module_id |
| E | step_id |
| F | event_type |
| G | payload_json |
| H | timestamp |

### ModuleResults
| Column | Field |
|---|---|
| A | result_id |
| B | session_id |
| C | student_id |
| D | module_id |
| E | score |
| F | attempts |
| G | hints_used |
| H | time_spent |
| I | mastery |
| J | completed_at |
