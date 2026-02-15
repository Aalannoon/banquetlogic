// Helper function to normalize the date to local midnight
function toMidnightTime(date) {
  const dateString = date instanceof Date ? date : new Date(date + "T00:00:00");
  return new Date(dateString).setHours(0, 0, 0, 0); // Normalize to midnight
}

// Function to check if an employee is absent on a given date
function isAbsentOnDate(employee, date) {
  const shiftTime = toMidnightTime(date); // Normalize date for comparison
  if (!employee.absences || employee.absences.length === 0) return false; // If no absences

  return employee.absences.some(absence => {
    const start = toMidnightTime(absence.startDate);
    const end = toMidnightTime(absence.endDate);
    return shiftTime >= start && shiftTime <= end; // Check if date is within the absence range
  });
}
