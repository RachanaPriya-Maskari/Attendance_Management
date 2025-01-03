const apiUrl = "http://localhost:3000";

const fetchStudents = async () => {
    const response = await fetch(`${apiUrl}/students`);
    const students = await response.json();
    const tbody = document.querySelector("#studentsTable tbody");
    tbody.innerHTML = "";
    students.forEach(({ rollNumber, name, status }) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${rollNumber}</td>
            <td>${name}</td>
            <td><input type="checkbox" ${status ? "checked" : ""} data-roll="${rollNumber}"></td>
            <td>
                <button class="delete" data-roll="${rollNumber}">Delete</button>
            </td>`;
        tbody.appendChild(tr);
    });
};

const addStudent = async (name, rollNumber) => {
    await fetch(`${apiUrl}/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, rollNumber }),
    });
    fetchStudents();
};

const deleteStudent = async (rollNumber) => {
    await fetch(`${apiUrl}/students/${rollNumber}`, { method: "DELETE" });
    fetchStudents();
};

const updateStudent = async (rollNumber, status) => {
    await fetch(`${apiUrl}/students/${rollNumber}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
    });
    fetchStudents();
};

document.querySelector("#studentForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.querySelector("#name").value;
    const rollNumber = document.querySelector("#rollNumber").value;
    addStudent(name, rollNumber);
    e.target.reset();
});

document.querySelector("#studentsTable").addEventListener("change", (e) => {
    if (e.target.type === "checkbox") {
        const rollNumber = e.target.dataset.roll;
        const status = e.target.checked;
        updateStudent(rollNumber, status);
    }
});

document.querySelector("#studentsTable").addEventListener("click", (e) => {
    if (e.target.classList.contains("delete")) {
        const rollNumber = e.target.dataset.roll;
        deleteStudent(rollNumber);
    }
});

document.querySelector("#downloadCsv").addEventListener("click", async () => {
    const response = await fetch(`${apiUrl}/export`, { method: "POST" });
    const csv = await response.text();
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
});

fetchStudents();
