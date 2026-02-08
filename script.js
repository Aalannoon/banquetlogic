let employees = [];

function addEmployee() {
  const name = document.getElementById("name").value;
  const seniority = Number(document.getElementById("seniority").value);

  if (!name || !seniority) return alert("Fill all fields");

  employees.push({
    name,
    seniority,
    hours: 0
  });

  document.getElementById("name").value = "";
  document.getElementById("seniority").value = "";

  renderEmployees();
}

function renderEmployees() {
  const list = document.getElementById("employeeList");
  list.innerHTML = "";

  employees.forEach(e => {
    const li = document.createElement("li");
    li.textContent = `${e.name} – ${e.seniority} yrs`;
    list.appendChild(li);
  });
}

function generateSchedule() {
  if (employees.length === 0) return;

  // Sort by seniority (highest first)
  const sorted = [...employees].sort(
    (a, b) => b.seniority - a.seniority
  );

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  let schedule = {};

  days.forEach(day => {
    schedule[day] = sorted[day % sorted.length].name;
  });

  document.getElementById("scheduleOutput").textContent =
    JSON.stringify(schedule, null, 2);
}
