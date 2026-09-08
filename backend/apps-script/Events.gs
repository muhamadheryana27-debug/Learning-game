/**
 * Events.gs — Telemetry event and module result handlers.
 * Receives pre-validated + sanitized data from Code.gs.
 */

function handleSaveEvent(sanitized, requestId) {
  var sheet = getSheet(CONFIG.SHEETS.EVENTS);
  var now = new Date().toISOString();

  sheet.appendRow([
    "evt-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
    sanitized.sessionId,
    sanitized.studentId,
    sanitized.moduleId,
    sanitized.stepId,
    sanitized.eventType,
    JSON.stringify(sanitized.payload),
    sanitized.timestamp
  ]);

  return {
    ok: true,
    action: "saveEvent",
    requestId: requestId,
    data: { eventType: sanitized.eventType }
  };
}

function handleSaveModuleResult(sanitized, requestId) {
  var sheet = getSheet(CONFIG.SHEETS.MODULE_RESULTS);
  var now = new Date().toISOString();

  sheet.appendRow([
    "result-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
    sanitized.sessionId,
    sanitized.studentId,
    sanitized.moduleId,
    sanitized.score,
    sanitized.attempts,
    sanitized.hintsUsed,
    sanitized.timeSpent,
    sanitized.mastery,
    sanitized.completedAt
  ]);

  return {
    ok: true,
    action: "saveModuleResult",
    requestId: requestId,
    data: { moduleId: sanitized.moduleId, score: sanitized.score }
  };
}

function handleDashboard(payload, requestId) {
  var sheet = getSheet(CONFIG.SHEETS.SESSIONS);
  var studentSheet = getSheet(CONFIG.SHEETS.STUDENTS);
  var moduleSheet = getSheet(CONFIG.SHEETS.MODULE_RESULTS);

  var sessionsData = sheet.getDataRange().getValues();
  var studentsData = studentSheet.getDataRange().getValues();
  var modulesData = moduleSheet.getDataRange().getValues();

  var students = {};
  for (var i = 1; i < studentsData.length; i++) {
    students[studentsData[i][0]] = {
      name: studentsData[i][1],
      className: studentsData[i][2],
      attendanceNumber: studentsData[i][3]
    };
  }

  var moduleResults = {};
  for (var j = 1; j < modulesData.length; j++) {
    var key = modulesData[j][1] + "-" + modulesData[j][3];
    moduleResults[key] = {
      score: modulesData[j][4],
      attempts: modulesData[j][5],
      hintsUsed: modulesData[j][6],
      mastery: modulesData[j][9]
    };
  }

  var rows = [];
  for (var k = 1; k < sessionsData.length; k++) {
    var session = sessionsData[k];
    var studentId = session[1];
    var student = students[studentId] || {};

    var mod1 = moduleResults[session[0] + "-mod1"] || {};
    var mod2 = moduleResults[session[0] + "-mod2"] || {};

    rows.push({
      studentId: studentId,
      name: student.name || "",
      className: student.className || "",
      attendanceNumber: student.attendanceNumber || 0,
      sessionId: session[0],
      startedAt: session[2],
      completedAt: session[4],
      status: session[5],
      totalScore: session[6],
      modules: { mod1: mod1, mod2: mod2 }
    });
  }

  if (payload.className) {
    rows = rows.filter(function(r) { return r.className === payload.className; });
  }

  rows.sort(function(a, b) {
    return (b.startedAt || "").localeCompare(a.startedAt || "");
  });

  var limit = payload.limit || 100;
  rows = rows.slice(0, limit);

  return {
    ok: true,
    action: "dashboard",
    requestId: requestId,
    data: rows
  };
}
