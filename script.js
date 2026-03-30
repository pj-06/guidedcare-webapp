/* ==== AUTH ==== */
async function checkAuth() {
    const { data } = await supabaseClient.auth.getSession();
    if (!data.session) {
        window.location.href = "login.html";
    }
}

async function logout() {
    await supabaseClient.auth.signOut();
    window.location.href = "login.html";
}

/*family */
async function addMember() {
    const name = document.getElementById("name").value;
    const age = document.getElementById("age").value;
    const relation = document.getElementById("relation").value;

    await supabaseClient.from("family_members").insert([
        { name, age, relation }
    ]);

    loadMembers();
}
async function loadFamily() {
    const { data } = await supabaseClient
        .from("family_members")
        .select("*");

    let html = "";

    data.forEach(member => {
        html += `
        <div class="card">
            <p><strong>${member.name}</strong> - ${member.relation}</p>
            <button class="btn delete-btn" onclick="deleteFamily('${member.id}')">Delete</button>
        </div>
        `;
    });

    document.getElementById("familyList").innerHTML = html;
}
async function deleteFamily(id) {
    await supabaseClient
        .from("family_members")
        .delete()
        .eq("id", id);

    loadFamily();
}

/*records */
async function addRecord() {
    const patient = document.getElementById("patientSelect").value;
    const diagnosis = document.getElementById("diagnosis").value;
    const prescription = document.getElementById("prescription").value;

    await supabaseClient.from("health_records").insert([
        { patient_name: patient, diagnosis, prescription }
    ]);

    document.getElementById("diagnosis").value = "";
    document.getElementById("prescription").value = "";

    loadRecords();
}

async function loadRecords() {
    const { data } = await supabaseClient
        .from("health_records")
        .select("*");

    let html = "";

    data.forEach(record => {
        html += `
        <div class="card">
            <h3>${record.patient_name}</h3>
            <p><strong>Diagnosis:</strong> ${record.diagnosis}</p>
            <p><strong>Prescription:</strong> ${record.prescription}</p>
            <button class="btn delete-btn" onclick="deleteRecord('${record.id}')">Delete</button>
        </div>
        `;
    });

    document.getElementById("recordList").innerHTML = html;
}

async function loadFamilyDropdown() {
    const { data } = await supabaseClient
        .from("family_members")
        .select("*");

    let options = "";
    data.forEach(member => {
        options += `<option value="${member.name}">${member.name}</option>`;
    });

    document.getElementById("patientSelect").innerHTML = options;
}
async function deleteRecord(id) {
    await supabaseClient
        .from("health_records")
        .delete()
        .eq("id", id);

    loadRecords();
}

function initScrollBehavior() {
    let lastScroll = 0;
    const topbar = document.querySelector(".topbar");

    // Prevent errors if topbar hasn't loaded yet or doesn't exist
    if (!topbar) return;

    window.addEventListener("scroll", () => {
        const currentScroll = window.scrollY;

        if (currentScroll <= 0) {
            topbar.style.transform = "translateY(0)";
        } 
        else if (currentScroll > lastScroll && currentScroll > 80) {
            topbar.style.transform = "translateY(-100%)";
        } 
        else {
            topbar.style.transform = "translateY(0)";
        }

        lastScroll = currentScroll;
    });
}

document.addEventListener("DOMContentLoaded", async () => {

    const { data: members } = await supabaseClient
        .from("family_members")
        .select("*");

    const { data: records } = await supabaseClient
        .from("health_records")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

    document.getElementById("memberCount").innerText = members.length;
    document.getElementById("recordCount").innerText = records.length;

    // 🔥 RECENT ACTIVITY
    const activityList = document.getElementById("activityList");

    activityList.innerHTML = ""; // clear old

    records.forEach(record => {
        const li = document.createElement("li");

        li.innerHTML = `📁 Added record for <b>${record.patient_name}</b>`;
        activityList.appendChild(li);
    });

});