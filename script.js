document.addEventListener("DOMContentLoaded", () => {

  let employees = [];
  let events = [];

  const shiftPriority = {
    morning: ["morning", "midday", "night"],
    midday: ["midday", "night", "morning"],
    night: ["night", "midday", "morning"]
  };

  const empName = document.getElementById("empName");
  const empSeniority = document.getElementById("empSeniority");
  const empMaxHours = document.getElementById("empMaxHours");
  const empPreference = document.getElementById("empPreference");
  const employeeTable = document.getElementById("employeeTable");

  const eventName = document.getElementById("eventName");
  const eventDate = document.getElementById("eventDate");
  const eventStart = document.getElementById("eventStart");
  const eventEnd = document.getElementById("eventEnd");
  const eventStaff = document.getElementById("eventStaff");
  const setupHours = document.getElementById("setupHours");
  const cleanupHours = document.getElementById("cleanupHours");
  const nextDaySetup = document.getElementById("nextDaySetup");
  const eventTable = document.getElementById("eventTable");

  window.addEmployee = function () {
    employees.push({
      name: empName.value,
      seniority: Number(empSeniority.value),
      maxHours: Number(empMaxHours.value),
      hours: 0,
      preference: empPreference.value
    });
    empName.value = empSeniority.value = empMaxHours.value = "";
    renderEmployees();
  };

  function renderEmployees() {
    employeeTable.innerHTML = "";
    employees.sort((a, b) => b.seniority - a.seniority)
      .forEach(e => {
        employeeTable.innerHTML += `
          <tr>
            <td>${e.name}</td>
            <td>${e.seniority}</td>
            <td>${e.maxHours}</td>
            <td>${e.preference}</td>
            <td>${e.hours}</td>
          </tr>`;
      });
  }

  window.addEvent = function () {
    events.push({
      name: eventName.value,
      date: eventDate.value,
      start: eventStart.value,
      end: eventEnd.value,
      staff: Number(eventStaff.value),
      setup: Number(setupHours.value || 0),
      cleanup: Number(cleanupHours.value || 0),
      nextDay: Number(nextDaySetup.value || 0)
    });

    eventName.value = eventDate.value = eventStart.value = eventEnd.value = "";
    eventStaff.value = setupHours.value = cleanupHours.value = nextDaySetup.value = "";
    renderEvents();
  };

  function renderEvents() {
    eventTable.innerHTML = "";
    events.forEach(e => {
      eventTable.innerHTML += `
        <tr>
          <td>${e.name}</td>
          <td>${e.date}</td>
          <td>
            Setup: ${e.setup}h |
            Event: ${e.start}-${e.end} |
            Cleanup: ${e.cleanup}h |
            Next-day: ${e.nextDay}h
          </td>
        </tr>`;
    });
  }

  window.generateSchedule = function () {

    employees.forEach(e => e.hours = 0);

    const shifts = { morning: 0, midday: 0, night: 0 };

    events.forEach(ev => {
      const start = Number(ev.start.split(":")[0]);
      const end = Number(ev.end.split(":")[0]);
      const mainHours = (end - start) * ev.staff;

      if (start < 12) shifts.morning += mainHours;
      else if (start < 18) shifts.midday += mainHours;
      else shifts.night += mainHours;

      if (ev.setup > 0) shifts.midday += ev.setup * ev.staff;
      if (ev.cleanup > 0) shifts.night += ev.cleanup * ev.staff;
      if (ev.nextDay > 0) shifts.morning += ev.nextDay * ev.staff;
    });

    employees.sort((a, b) => b.seniority - a.seniority);

    employees.forEach(emp => {
      let remaining = emp.maxHours;
      for (const shift of shiftPriority[emp.preference]) {
        if (remaining <= 0 || shifts[shift] <= 0) continue;
        const assign = Math.min(remaining, shifts[shift]);
        shifts[shift] -= assign;
        emp.hours += assign;
        remaining -= assign;
      }
    });

    renderEmployees();
    alert("Schedule generated with setup, cleanup, and next-day shifts");
  };

});
