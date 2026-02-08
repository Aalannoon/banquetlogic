let employees = [];
let events = [];

const staffingRatios = {
  cocktail: 30,
  buffet: 25,
  plated: 15,
  vip: 10
};

// Preference fallback order
const shiftPriority = {
  morning: ["morning", "midday", "night"],
  midday: ["midday", "night", "morning"],
  night: ["night", "midday", "morning"]
};

// EMPLOYEES
function addEmployee() {
  employees.push({
    name: empName.value,
    seniority: Number(empSeniority.value), // 1 = highest
    maxHours: Number(empMaxHours.value),
    preference: empPreference.value,
    hours: 0
  });

  empName.value = "";
  empSeniority.value = "";
  empMaxHours.value = "";

  renderEmployees();
}

function renderEmployees() {
  employeeTable.innerHTML = "";
  employees
    .sort((a, b) => a.seniority - b.seniority) // LOWER = MORE SENIOR
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

// EVENTS
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

  eventName.value = "";
  eventDate.value = "";
  eventGuests.value = "";
  eventStart.value = "";
  eventEnd.value = "";
  setupStaff.value = "";
  eventStaff.value = "";
  cleanupStaff.value = "";

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
      </tr>`;
  });
}

// TIMELINE + WARNINGS
function renderTimeline() {
  const date = timelineDate.value;
  const container = document.getElementById("timeline");
  const warnings = document.getElementById("warnings");

  container.innerHTML = "";
  warnings.innerHTML = "";

  const dayEvents = events.filter(e => e.date === date);
  if (!dayEvents.length) {
    container.innerHTML = "<p>No events scheduled.</p>";
    return;
  }

  generateWarnings();

  dayEvents.forEach(e => {
    container.innerHTML += `
      <h3>${e.name}</h3>

      <div class="block setup">
        🛠 Setup (${e.setup} servers)
        <textarea placeholder="Manager notes"></textarea>
      </div>

      <div class="block event">
        🎉 Event ${e.start}–${e.end} (${e.event} servers)
        <textarea placeholder="Manager notes"></textarea>
      </div>

      <div class="block cleanup">
        🧹 Cleanup (${e.cleanup} servers)
        <textarea placeholder="Manager notes"></textarea>
      </div>
    `;
  });
}

// WARNINGS (non-blocking)
function generateWarnings() {
  const warnings = document.getElementById("warnings");

  employees.forEach(e => {
    if (e.hours > e.maxHours) {
      warnings.innerHTML += `
        <div class="warning">⚠ ${e.name} exceeds max hours</div>`;
    }

    // Senior staff = low rank number
    if (e.seniority <= 3 && e.hours < e.maxHours * 0.5) {
      warnings.innerHTML += `
        <div class="warning">⚠ Senior staff ${e.name} is underutilized</div>`;
    }
  });
}
