/**
 * Sessions.gs — Session lifecycle handlers.
 * Receives pre-validated + sanitized data from Code.gs.
 */

function handleStartSession(sanitized, requestId) {
  var sheet = getSheet(CONFIG.SHEETS.SESSIONS);
  var now = new Date().toISOString();

  sheet.appendRow([
    sanitized.sessionId,
    sanitized.studentId,
    sanitized.startedAt,
    now,
    "",
    "active",
    0
  ]);

  return {
    ok: true,
    action: "startSession",
    requestId: requestId,
    data: { sessionId: sanitized.sessionId }
  };
}

function handleCompleteSession(sanitized, requestId) {
  var sheet = getSheet(CONFIG.SHEETS.SESSIONS);
  var data = sheet.getDataRange().getValues();
  var now = new Date().toISOString();

  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === sanitized.sessionId) {
      sheet.getRange(i + 1, 4).setValue(now);
      sheet.getRange(i + 1, 5).setValue(sanitized.completedAt);
      sheet.getRange(i + 1, 6).setValue("completed");
      sheet.getRange(i + 1, 7).setValue(sanitized.totalScore);
      return {
        ok: true,
        action: "completeSession",
        requestId: requestId,
        data: { sessionId: sanitized.sessionId, totalScore: sanitized.totalScore }
      };
    }
  }

  sheet.appendRow([
    sanitized.sessionId,
    sanitized.studentId,
    sanitized.completedAt,
    now,
    sanitized.completedAt,
    "completed",
    sanitized.totalScore
  ]);

  return {
    ok: true,
    action: "completeSession",
    requestId: requestId,
    data: { sessionId: sanitized.sessionId, created: true }
  };
}
