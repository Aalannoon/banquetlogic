let employees = [];
let events = [];
let vacations = [];

const staffingRatios = {
  cocktail: 30,
  buffet: 25,
  plated: 15,
  vip: 10
};

// ---------------- EMPLOYEES ----------------
function addEmployee() {
  employees.push({
    id: Date.now(),
    name: empName.value,
    hireDate: empHireDate.value,
    maxHours: Number(empMaxHours.value),
    preference: empPreference.value,
    active: true,
    hours: 0
  });

  empName.value = "";
  empHireDate.value = "";
  empMaxHours.value = "";

  recalcSeniority();
  renderEmployees();
}

function recalcSeniority() {
  const active = employees.filter(e => e.active && e.hireDate);
  active.sort((a, b) => new Date(a.hireDate) - new Date(b.hireDate));
  active.forEach((e, i) => e.seniority = i + 1);
}

function deactivateEmployee(id) {
  const emp = employees.find(e => e.id === id);
  emp.active = false;
  emp.seniority = null;
  recalcSeniority();
  renderEmployees();
}

// ---------------- VACATIONS ----------------
function addVacation() {
  vacations.push({
    empId: Number(vacEmployee.value),
    start: vacStart.value,
    end: vacEnd.value
  });

  vacStart.value = "";
  vacEnd.value = "";

  renderVacations();
}

function isOnVacation(empId, date) {
  return vacations.some(v =>
    v.empId === empId &&
    date >= v.start &&
    date <= v.end
  );
}

// ---------------- RENDER EMPLOYEES ----------------
function renderEmployees() {
  employeeTable.innerHTML = "";
  vacEmployee.innerHTML = "";

  employees
    .sort((a, b) => (a.seniority || 999) - (b.seniority || 999))
    .forEach(e => {
      employeeTable.innerHTML += `
        <tr class="${!e.active ? "inactive" : ""}">
          <td>${e.name}</td>
          <td>${e.seniority ?? "-"}</td>
          <td>${e.hireDate || "-"}</td>
          <td>${e.preference}</td>
          <td>${e.maxHours}</td>
          <td>${e.active ? "Active" : "Retired"}</td>
          <td>
            ${e.active ? `<button onclick="deactivateEmployee(${e.id})">Retire</button>` : ""}
          </td>
        </tr>
      `;

      if (e.active) {
        vacEmployee.innerHTML += `<option value="${e.id}">${e.name}</option>`;
      }
    });
}

// ---------------- EVENTS ----------------
function recommendStaff() {
  const guests = Number(eventGuests.value);
  if (!guests) return;

  const base = Math.ceil(guests / staffingRatios[eventType.value]);
  eventStaff.value = base;
  setupStaff.value = Math.max(1, Math.round(base * 0.4));
  cleanupStaff.value = Math.max(1, Math.round(base * 0.3));
}

function addEvent() {
  events.push({
    name: eventName.value,
    date: eventDate.value,
    guests: Number(eventGuests.value),
    start: eventStart.value,
    end: eventEnd.value,
    setup: Number(setupStaff.value),
    event: Number(eventStaff.value),
    cleanup: Number(cleanupStaff.value)
  });

  renderEvents();
}

function renderEvents() {
  eventTable.innerHTML = "";
  events.forEach(e => {
    eventTable.innerHTML += `
      <tr>
        <td>${e.name}</td>
        <td>${e.date}</td>
        <td>${e.guests}</td>
        <td>${e.setup}</td>
        <td>${e.event}</td>
        <td>${e.cleanup}</td>
      </tr>
    `;
  });
}

// ---------------- TIMELINE ----------------
function renderTimeline() {
  const date = timelineDate.value;
  timeline.innerHTML = "";
  warnings.innerHTML = "";

  const dayEvents = events.filter(e => e.date === date);
  if (!dayEvents.length) {
    timeline.innerHTML = "<p>No events scheduled.</p>";
    return;
  }

  const availableStaff = employees.filter(
    e => e.active && !isOnVacation(e.id, date)
  );

  if (availableStaff.length < 5) {
    warnings.innerHTML += `<div class="warning">⚠ Low staff available due to vacations</div>`;
  }

  dayEvents.forEach(e => {
    timeline.innerHTML += `
      <h3>${e.name}</h3>

      <div class="block setup">
        🛠 Setup (${e.setup})
        <textarea placeholder="Setup notes"></textarea>
      </div>

      <div class="block event">
        🎉 Event ${e.start}–${e.end} (${e.event})
        <textarea placeholder="Event notes"></textarea>
      </div>

      <div class="block cleanup">
        🧹 Cleanup (${e.cleanup})
        <textarea placeholder="Cleanup notes"></textarea>
      </div>
    `;
  });
}

// ---------------- VACATION TABLE ----------------
function renderVacations() {
  vacationTable.innerHTML = "";
  vacations.forEach(v => {
    const emp = employees.find(e => e.id === v.empId);
    vacationTable.innerHTML += `
      <tr>
        <td>${emp?.name}</td>
        <td>${v.start}</td>
        <td>${v.end}</td>
      </tr>
    `;
  });
}
