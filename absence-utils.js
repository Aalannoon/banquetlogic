// Helper function to normalize the date to local midnight
function toMidnightTime(date) {
  const dateString = date instanceof Date ? date : new Date(date + "T00:00:00");
  return new Date(dateString).setHours(0, 0, 0, 0); // Normalize to midnight
}

// Statuses that mean "absent until unchecked" when set on employee from Employees tab
var GLOBAL_ABSENCE_STATUSES = ['sick', 'vacation', 'floating_holiday', 'unpaid_vacation', 'requested_off'];

// Function to check if an employee is absent on a given date
function isAbsentOnDate(employee, date) {
  if (!employee) return false;
  // Employee-tab checkbox: status set = absent on every date until unchecked
  if (employee.status && GLOBAL_ABSENCE_STATUSES.indexOf(employee.status) !== -1) return true;
  const shiftTime = toMidnightTime(date); // Normalize date for comparison
  if (!employee.absences || employee.absences.length === 0) return false;

  return employee.absences.some(absence => {
    const start = toMidnightTime(absence.startDate);
    const end = toMidnightTime(absence.endDate);
    return shiftTime >= start && shiftTime <= end; // Check if date is within the absence range
  });
}

// Return the absence type (e.g. 'sick', 'vacation') for the first absence covering this date, or null
function getAbsenceTypeOnDate(employee, date) {
  if (!employee) return null;
  // Employee-tab checkbox: status set = show this type. Vacation (paid) only on weekdays so Days shows 5/5; others every day
  if (employee.status && GLOBAL_ABSENCE_STATUSES.indexOf(employee.status) !== -1) {
    if (employee.status === 'vacation') {
      var d = date instanceof Date ? date : new Date(date + 'T12:00:00');
      var day = d.getDay(); // 0 = Sunday, 6 = Saturday
      if (day >= 1 && day <= 5) return employee.status; // Monday–Friday only
      return null;
    }
    return employee.status; // sick, floating_holiday, unpaid_vacation, requested_off: every day
  }
  if (!employee.absences || employee.absences.length === 0) return null;
  const shiftTime = toMidnightTime(date);
  const match = employee.absences.find(absence => {
    const start = toMidnightTime(absence.startDate);
    const end = toMidnightTime(absence.endDate);
    return shiftTime >= start && shiftTime <= end;
  });
  return match ? match.type : null;
}
