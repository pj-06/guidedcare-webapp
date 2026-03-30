document.addEventListener("DOMContentLoaded", () => {
    generateTimeInputs();
    loadDoses();

    document.getElementById("timesPerDay")
        .addEventListener("change", generateTimeInputs);

    document.getElementById("addMedBtn")
        .addEventListener("click", addMedicine);

    setInterval(checkMissedDoses, 60000);
    setInterval(checkReminders, 60000);
    setInterval(autoDeleteCompletedCourses, 60000);
});


// 🔹 Generate time inputs
function generateTimeInputs() {
    const count = parseInt(document.getElementById("timesPerDay").value);
    const container = document.getElementById("timeInputs");

    container.innerHTML = "";

    for (let i = 0; i < count; i++) {
        container.innerHTML += `
            <input type="time" class="input time-field">
        `;
    }
}


// 🔹 Add medicine
async function addMedicine() {
    const name = document.getElementById("name").value.trim();
    const days = parseInt(document.getElementById("days").value);

    const timeFields = document.querySelectorAll(".time-field");

    let times = [];
    timeFields.forEach(input => {
        if (input.value) times.push(input.value);
    });

    if (!name || !days || times.length === 0) {
        alert("Fill all fields properly");
        return;
    }

    let inserts = [];

    for (let d = 1; d <= days; d++) {
        times.forEach(t => {
            inserts.push({
                medicine_name: name,
                day: d,
                time: t,
                status: "pending"
            });
        });
    }

    await supabaseClient.from("medicine_doses").insert(inserts);
    loadDoses();
}


// 🔹 Load doses (FIXED future restriction)
async function loadDoses() {
    const { data } = await supabaseClient
        .from("medicine_doses")
        .select("*")
        .order("day");

    const container = document.getElementById("medicineList");
    container.innerHTML = "";

    let grouped = {};

    data.forEach(d => {
        const key = `${d.medicine_name}_day_${d.day}`;

        if (!grouped[key]) {
            grouped[key] = {
                name: d.medicine_name,
                day: d.day,
                doses: []
            };
        }

        grouped[key].doses.push(d);
    });

    const now = new Date();
    const currentTime = now.toTimeString().slice(0,5);

    const today = 1; // ⚠️ TEMP (can upgrade later)

    Object.values(grouped).forEach(group => {
        container.innerHTML += `
            <div class="card">
                <h3>${group.name} - Day ${group.day}</h3>
                <button onclick="deleteMedicine('${group.name}')">🗑 Delete</button>
        `;

        group.doses.forEach(d => {
            const checked = d.status === "taken" ? "checked" : "";

            let disabled = "";

            // ❌ Block future day
            if (group.day > today) {
                disabled = "disabled";
            }

            // ❌ Block future time (same day)
            else if (group.day === today && d.time > currentTime) {
                disabled = "disabled";
            }

            container.innerHTML += `
                <div style="margin:8px 0;">
                    ⏰ ${d.time}
                    <input type="checkbox" ${checked} ${disabled}
                        onchange="markTaken(${d.id})">
                    <span>${d.status}</span>
                </div>
            `;
        });

        container.innerHTML += `</div>`;
    });
}


// 🔹 Mark taken
async function markTaken(id) {
    await supabaseClient
        .from("medicine_doses")
        .update({ status: "taken" })
        .eq("id", id);

    loadDoses();
}


// 🔹 Delete full medicine
async function deleteMedicine(name) {
    if (!confirm("Delete this medicine?")) return;

    await supabaseClient
        .from("medicine_doses")
        .delete()
        .eq("medicine_name", name);

    loadDoses();
}


// 🔹 Auto mark missed
function checkMissedDoses() {
    const now = new Date();

    supabaseClient.from("medicine_doses").select("*").then(res => {
        res.data.forEach(d => {
            if (d.status !== "pending") return;

            const doseTime = new Date();
            const [h, m] = d.time.split(":");
            doseTime.setHours(h, m, 0);

            const diff = (now - doseTime) / 60000;

            if (diff > 10) {
                supabaseClient
                    .from("medicine_doses")
                    .update({ status: "missed" })
                    .eq("id", d.id);
            }
        });
    });
}


// 🔔 Reminder
function checkReminders() {
    const now = new Date().toTimeString().slice(0,5);

    supabaseClient.from("medicine_doses").select("*").then(res => {
        res.data.forEach(d => {
            if (d.status === "pending" && d.time === now) {
                alert(`💊 Take ${d.medicine_name}`);
            }
        });
    });
}


// 🔹 Auto delete completed courses
function autoDeleteCompletedCourses() {
    supabaseClient.from("medicine_doses").select("*").then(res => {

        let grouped = {};

        res.data.forEach(d => {
            if (!grouped[d.medicine_name]) grouped[d.medicine_name] = [];
            grouped[d.medicine_name].push(d);
        });

        Object.keys(grouped).forEach(name => {
            const allDone = grouped[name].every(d => d.status !== "pending");

            if (allDone) {
                supabaseClient
                    .from("medicine_doses")
                    .delete()
                    .eq("medicine_name", name);
            }
        });
    });
}


// 🔹 Summary
async function showSummary() {
    const { data } = await supabaseClient
        .from("medicine_doses")
        .select("*");

    let taken = data.filter(d => d.status === "taken").length;
    let missed = data.filter(d => d.status === "missed").length;

    alert(`
📊 Summary:
✔ Taken: ${taken}
❌ Missed: ${missed}
    `);
}