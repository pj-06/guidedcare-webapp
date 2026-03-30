function startCase(type) {
    const questionBox = document.getElementById("questionBox");
    const guideBox = document.getElementById("guideBox");

    questionBox.innerHTML = "";
    guideBox.style.display = "block";
    guideBox.innerHTML = "";

    if (type === "bleeding") {
        questionBox.innerHTML = `
            <p><b>Is the bleeding severe?</b></p>
            <button onclick="bleedingGuide(true)">Yes</button>
            <button onclick="bleedingGuide(false)">No</button>
        `;
    }

    if (type === "burn") {
        showSteps("🔥 Burn Treatment", [
            "Cool under running water (10–15 minutes)",
            "Do NOT apply ice",
            "Cover with sterile cloth",
            "Avoid breaking blisters"
        ]);
    }

    if (type === "fracture") {
        showSteps("🦴 Fracture Care", [
            "Immobilize the injured area",
            "Use a splint if available",
            "Avoid unnecessary movement",
            "Seek medical attention"
        ], true);
    }

    if (type === "unconscious") {
        showSteps("😵 Unconscious Person", [
            "Check breathing",
            "Call emergency services",
            "Place in recovery position",
            "Start CPR if needed"
        ], true);
    }

    if (type === "choking") {
        showSteps("😷 Choking Emergency", [
            "Encourage coughing",
            "Give 5 back blows",
            "Perform abdominal thrusts",
            "Call emergency services"
        ], true);
    }
}

function bleedingGuide(isSevere) {
    if (isSevere) {
        showSteps("🩸 Severe Bleeding", [
            "Apply strong pressure immediately",
            "Use cloth or bandage",
            "Elevate the injured area",
            "Do NOT remove soaked cloth",
            "Call emergency services"
        ], true);
    } else {
        showSteps("🩸 Minor Bleeding", [
            "Clean with water",
            "Apply light pressure",
            "Cover with bandage"
        ]);
    }
}

function showSteps(title, steps, emergency = false) {
    const guideBox = document.getElementById("guideBox");

    let html = `<h2>${title}</h2><ul>`;

    steps.forEach(step => {
        html += `<li>✔ ${step}</li>`;
    });

    html += "</ul>";

    if (emergency) {
        html += `<p class="warning">⚠ Seek medical help immediately!</p>`;
    }

    guideBox.innerHTML = html;
}

