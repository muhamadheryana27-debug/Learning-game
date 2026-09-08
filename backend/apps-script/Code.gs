/**
 * Code.gs — Main entry point for Google Apps Script Web App.
 * Handles HTTP requests, routing, validation, and response formatting.
 */

function doGet(e) {
  return handleRequest(e, "GET");
}

function doPost(e) {
  return handleRequest(e, "POST");
}

function handleRequest(e, method) {
  var rawPayload = {};
  var action = "health";

  try {
    if (method === "POST" && e.postData && e.postData.contents) {
      rawPayload = JSON.parse(e.postData.contents);
      action = rawPayload.action || e.parameter.action || "health";
    } else {
      action = e.parameter.action || "health";
    }

    var requestId = "REQ-" + Date.now() + "-" + Math.random().toString(36).substr(2, 6);
    var result;

    switch (action) {
      case "health":
        result = handleHealth(requestId);
        break;
      case "registerStudent": {
        var v = validateAndSanitizeRegisterStudent(rawPayload);
        if (!v.valid) {
          result = { ok: false, action: action, requestId: requestId, error: { code: "VALIDATION_ERROR", message: v.errors.join("; ") } };
        } else {
          result = handleRegisterStudent(v.sanitized, requestId);
        }
        break;
      }
      case "startSession": {
        var v = validateAndSanitizeStartSession(rawPayload);
        if (!v.valid) {
          result = { ok: false, action: action, requestId: requestId, error: { code: "VALIDATION_ERROR", message: v.errors.join("; ") } };
        } else {
          result = handleStartSession(v.sanitized, requestId);
        }
        break;
      }
      case "saveEvent": {
        var v = validateAndSanitizeSaveEvent(rawPayload);
        if (!v.valid) {
          result = { ok: false, action: action, requestId: requestId, error: { code: "VALIDATION_ERROR", message: v.errors.join("; ") } };
        } else {
          result = handleSaveEvent(v.sanitized, requestId);
        }
        break;
      }
      case "saveModuleResult": {
        var v = validateAndSanitizeSaveModuleResult(rawPayload);
        if (!v.valid) {
          result = { ok: false, action: action, requestId: requestId, error: { code: "VALIDATION_ERROR", message: v.errors.join("; ") } };
        } else {
          result = handleSaveModuleResult(v.sanitized, requestId);
        }
        break;
      }
      case "completeSession": {
        var v = validateAndSanitizeCompleteSession(rawPayload);
        if (!v.valid) {
          result = { ok: false, action: action, requestId: requestId, error: { code: "VALIDATION_ERROR", message: v.errors.join("; ") } };
        } else {
          result = handleCompleteSession(v.sanitized, requestId);
        }
        break;
      }
      case "dashboard":
        result = handleDashboard(rawPayload, requestId);
        break;
      default:
        result = { ok: false, action: action, requestId: requestId, error: { code: "UNKNOWN_ACTION", message: "Unknown action: " + action } };
    }

    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    var errorResult = {
      ok: false,
      action: action || "unknown",
      requestId: "ERR-" + Date.now(),
      error: { code: "SERVER_ERROR", message: err.message || "Internal server error" }
    };
    return ContentService
      .createTextOutput(JSON.stringify(errorResult))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function handleHealth(requestId) {
  return {
    ok: true,
    action: "health",
    requestId: requestId,
    data: {
      status: "healthy",
      timestamp: new Date().toISOString(),
      version: "1.0.0"
    }
  };
}

function getSheet(name) {
  var ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    switch (name) {
      case CONFIG.SHEETS.STUDENTS:
        sheet.appendRow(["student_id", "name", "class", "attendance_number", "created_at", "updated_at"]);
        break;
      case CONFIG.SHEETS.SESSIONS:
        sheet.appendRow(["session_id", "student_id", "started_at", "updated_at", "completed_at", "status", "total_score"]);
        break;
      case CONFIG.SHEETS.EVENTS:
        sheet.appendRow(["event_id", "session_id", "student_id", "module_id", "step_id", "event_type", "payload_json", "timestamp"]);
        break;
      case CONFIG.SHEETS.MODULE_RESULTS:
        sheet.appendRow(["result_id", "session_id", "student_id", "module_id", "score", "attempts", "hints_used", "time_spent", "mastery", "completed_at"]);
        break;
    }
  }
  return sheet;
}
