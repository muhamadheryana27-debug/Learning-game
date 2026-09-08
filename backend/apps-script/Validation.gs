/**
 * Validation.gs — Server-side validation for GAS backend.
 * Phase 13: Sanity checks before writing to sheets.
 */

var VALID_MODULES = ["mod1", "mod2"];
var VALID_SESSION_STATUSES = ["active", "completed", "abandoned"];
var VALID_EVENT_TYPES = [
  "SESSION_STARTED", "MODULE_STARTED", "MISSION_STARTED",
  "ACTION_ATTEMPTED", "ANSWER_SUBMITTED", "ANSWER_CORRECT", "ANSWER_WRONG",
  "HINT_REQUESTED", "DEBUG_ATTEMPT", "DEBUG_SUCCESS",
  "MODULE_COMPLETED", "SESSION_COMPLETED"
];
var VALID_CLASSES = ["VIII-A", "VIII-B", "VIII-C", "VIII-D", "VIII-E", "VIII-F", "VIII-G", "VIII-H"];

function validatePayload(payload, requiredFields) {
  var errors = [];
  for (var i = 0; i < requiredFields.length; i++) {
    var field = requiredFields[i];
    if (payload[field] === undefined || payload[field] === null || payload[field] === "") {
      errors.push("Missing field: " + field);
    }
  }
  return errors;
}

function validateStudentId(studentId) {
  if (!studentId || typeof studentId !== "string") return "Invalid studentId";
  if (studentId.length > 100) return "studentId too long";
  return null;
}

function validateSessionId(sessionId) {
  if (!sessionId || typeof sessionId !== "string") return "Invalid sessionId";
  if (!sessionId.startsWith("session-")) return "sessionId must start with 'session-'";
  if (sessionId.length > 100) return "sessionId too long";
  return null;
}

function validateModuleName(moduleId) {
  if (!moduleId) return null; // optional in some contexts
  if (VALID_MODULES.indexOf(moduleId) === -1) return "Invalid moduleId: " + moduleId;
  return null;
}

function validateClassName(className) {
  if (!className) return null;
  if (VALID_CLASSES.indexOf(className) === -1) return "Invalid className: " + className;
  return null;
}

function validateScore(score) {
  if (score === undefined || score === null) return null;
  if (typeof score !== "number") return "Score must be a number";
  if (score < 0 || score > 100) return "Score must be 0-100";
  return null;
}

function validateAttendanceNumber(num) {
  if (num === undefined || num === null) return "Missing attendanceNumber";
  if (typeof num !== "number" || !Number.isInteger(num)) return "attendanceNumber must be an integer";
  if (num < 1 || num > 40) return "attendanceNumber must be 1-40";
  return null;
}

function sanitizeString(str, maxLength) {
  if (typeof str !== "string") return "";
  return str.substring(0, maxLength || 500).replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
}

function validateAndSanitizeRegisterStudent(payload) {
  var errors = validatePayload(payload, ["studentId", "name", "className", "attendanceNumber"]);
  if (errors.length > 0) return { valid: false, errors: errors };

  var e;
  e = validateStudentId(payload.studentId); if (e) errors.push(e);
  e = validateClassName(payload.className); if (e) errors.push(e);
  e = validateAttendanceNumber(payload.attendanceNumber); if (e) errors.push(e);

  if (typeof payload.name !== "string" || payload.name.length < 3) errors.push("Name must be at least 3 characters");
  if (payload.name && payload.name.length > 60) errors.push("Name too long (max 60)");

  if (errors.length > 0) return { valid: false, errors: errors };

  return {
    valid: true,
    sanitized: {
      studentId: sanitizeString(payload.studentId, 100),
      name: sanitizeString(payload.name, 60),
      className: payload.className,
      attendanceNumber: Math.floor(Number(payload.attendanceNumber))
    }
  };
}

function validateAndSanitizeStartSession(payload) {
  var errors = validatePayload(payload, ["sessionId", "studentId"]);
  if (errors.length > 0) return { valid: false, errors: errors };

  var e;
  e = validateSessionId(payload.sessionId); if (e) errors.push(e);
  e = validateStudentId(payload.studentId); if (e) errors.push(e);

  if (errors.length > 0) return { valid: false, errors: errors };

  return {
    valid: true,
    sanitized: {
      sessionId: sanitizeString(payload.sessionId, 100),
      studentId: sanitizeString(payload.studentId, 100),
      startedAt: payload.startedAt || new Date().toISOString()
    }
  };
}

function validateAndSanitizeSaveEvent(payload) {
  var errors = validatePayload(payload, ["sessionId", "studentId", "eventType"]);
  if (errors.length > 0) return { valid: false, errors: errors };

  var e;
  e = validateSessionId(payload.sessionId); if (e) errors.push(e);
  e = validateStudentId(payload.studentId); if (e) errors.push(e);
  e = validateModuleName(payload.moduleId); if (e) errors.push(e);

  if (VALID_EVENT_TYPES.indexOf(payload.eventType) === -1) {
    errors.push("Invalid eventType: " + payload.eventType);
  }

  if (errors.length > 0) return { valid: false, errors: errors };

  return {
    valid: true,
    sanitized: {
      sessionId: sanitizeString(payload.sessionId, 100),
      studentId: sanitizeString(payload.studentId, 100),
      moduleId: payload.moduleId ? sanitizeString(payload.moduleId, 50) : "",
      stepId: payload.stepId ? sanitizeString(payload.stepId, 50) : "",
      eventType: payload.eventType,
      payload: payload.payload || {},
      timestamp: payload.timestamp || new Date().toISOString()
    }
  };
}

function validateAndSanitizeSaveModuleResult(payload) {
  var errors = validatePayload(payload, ["sessionId", "studentId", "moduleId"]);
  if (errors.length > 0) return { valid: false, errors: errors };

  var e;
  e = validateSessionId(payload.sessionId); if (e) errors.push(e);
  e = validateStudentId(payload.studentId); if (e) errors.push(e);
  e = validateModuleName(payload.moduleId); if (e) errors.push(e);
  e = validateScore(payload.score); if (e) errors.push(e);

  if (payload.attempts !== undefined && (typeof payload.attempts !== "number" || payload.attempts < 0)) {
    errors.push("attempts must be a non-negative number");
  }
  if (payload.hintsUsed !== undefined && (typeof payload.hintsUsed !== "number" || payload.hintsUsed < 0)) {
    errors.push("hintsUsed must be a non-negative number");
  }

  if (errors.length > 0) return { valid: false, errors: errors };

  return {
    valid: true,
    sanitized: {
      sessionId: sanitizeString(payload.sessionId, 100),
      studentId: sanitizeString(payload.studentId, 100),
      moduleId: payload.moduleId,
      score: Math.min(100, Math.max(0, Math.round(Number(payload.score) || 0))),
      attempts: Math.max(0, Math.floor(Number(payload.attempts) || 0)),
      hintsUsed: Math.max(0, Math.floor(Number(payload.hintsUsed) || 0)),
      timeSpent: Math.max(0, Number(payload.timeSpent) || 0),
      mastery: Math.min(100, Math.max(0, Number(payload.mastery) || 0)),
      completedAt: payload.completedAt || new Date().toISOString()
    }
  };
}

function validateAndSanitizeCompleteSession(payload) {
  var errors = validatePayload(payload, ["sessionId", "studentId"]);
  if (errors.length > 0) return { valid: false, errors: errors };

  var e;
  e = validateSessionId(payload.sessionId); if (e) errors.push(e);
  e = validateStudentId(payload.studentId); if (e) errors.push(e);
  e = validateScore(payload.totalScore); if (e) errors.push(e);

  if (errors.length > 0) return { valid: false, errors: errors };

  return {
    valid: true,
    sanitized: {
      sessionId: sanitizeString(payload.sessionId, 100),
      studentId: sanitizeString(payload.studentId, 100),
      totalScore: Math.min(100, Math.max(0, Math.round(Number(payload.totalScore) || 0))),
      completedAt: payload.completedAt || new Date().toISOString()
    }
  };
}
