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

