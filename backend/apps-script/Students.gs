/**
 * Students.gs — Student registration handler.
 * Receives pre-validated + sanitized data from Code.gs.
 */

function handleRegisterStudent(sanitized, requestId) {
  var sheet = getSheet(CONFIG.SHEETS.STUDENTS);
  var now = new Date().toISOString();

  // Check if student already exists
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === sanitized.studentId) {
      sheet.getRange(i + 1, 2).setValue(sanitized.name);
      sheet.getRange(i + 1, 3).setValue(sanitized.className);
      sheet.getRange(i + 1, 4).setValue(sanitized.attendanceNumber);
      sheet.getRange(i + 1, 6).setValue(now);
      return {
        ok: true,
        action: "registerStudent",
        requestId: requestId,
        data: { studentId: sanitized.studentId, updated: true }
      };
    }
  }

  sheet.appendRow([
    sanitized.studentId,
    sanitized.name,
    sanitized.className,
    sanitized.attendanceNumber,
    now,
    now
  ]);

  return {
    ok: true,
    action: "registerStudent",
    requestId: requestId,
    data: { studentId: sanitized.studentId, created: true }
  };
}
