const API = "http://localhost:5000";

async function addDeadline() {
    const title = document.getElementById("title").value;
    const date = document.getElementById("date").value;

    if (!title || !date) {
        alert("Please enter task and date");
        return;
    }

    await fetch(`${API}/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, date })
    });

    document.getElementById("title").value = "";
    document.getElementById("date").value = "";

    loadData();
}

async function deleteDeadline(index) {
    await fetch(`${API}/delete/${index}`, {
        method: "DELETE"
    });

    loadData();
}

async function loadData() {
    const res = await fetch(`${API}/deadlines`);
    const data = await res.json();

    const list = document.getElementById("list");
    list.innerHTML = "";

    let labels = [];
    let stressData = [];

    data.forEach((item, index) => {
        const li = document.createElement("li");

        const today = new Date();
        const deadline = new Date(item.date);

        const daysLeft = Math.ceil(
            (deadline - today) / (1000 * 60 * 60 * 24)
        );

        li.innerText = `${item.title} - ${item.date} (${daysLeft} days left)`;

        // 🔴 PROGRESS BAR
        const progress = document.createElement("div");
        let percent = 100 - (daysLeft * 10);
        if (percent < 10) percent = 10;

        progress.style.width = percent + "%";
        progress.style.height = "8px";
        progress.style.background = "red";
        progress.style.margin = "5px 0";

        li.appendChild(progress);

        // ❌ DELETE BUTTON
        const delBtn = document.createElement("button");
        delBtn.innerText = "❌";
        delBtn.onclick = () => deleteDeadline(index);

        li.appendChild(delBtn);

        list.appendChild(li);

        labels.push(item.title);

        if (daysLeft <= 1) {
            stressData.push(100);
            alert(`⚠️ Deadline Tomorrow: ${item.title}`);
        }
        else if (daysLeft <= 3) stressData.push(80);
        else if (daysLeft <= 7) stressData.push(60);
        else stressData.push(30);
    });

    drawChart(labels, stressData);
}

// 🌙 DARK MODE
function toggleMode() {
    document.body.classList.toggle("dark");
}

let chart;

function drawChart(labels, data) {
    const ctx = document.getElementById("chart").getContext("2d");

    if (chart) chart.destroy();

    chart = new Chart(ctx, {
        type: "line", // upgraded graph
        data: {
            labels: labels,
            datasets: [{
                label: "Stress Level",
                data: data,
                backgroundColor: data.map(v =>
                    v >= 80 ? "red" : v >= 60 ? "orange" : "green"
                )
            }]
        }
    });
}

loadData();