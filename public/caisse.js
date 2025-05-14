
const caisseRef = collection(db, "caisse");

// Solde initial
const balances = {
  gourde: 3175,
  usd: 504,
  carteGde: 161644,
  carteUsd: 30,
  moncash: 2720,
  zell: 0
};

const balanceTable = document.getElementById('balanceTable');

function updateDisplay() {
  balanceTable.innerHTML = '';
  for (let [method, amount] of Object.entries(balances)) {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${method.toUpperCase()}</td><td>${amount.toLocaleString()}</td>`;
    balanceTable.appendChild(tr);
  }
}

// Écoute en temps réel
onSnapshot(caisseRef, (snapshot) => {
  // Réinitialisation des balances
  for (let key in balances) balances[key] = 0;

  snapshot.forEach(doc => {
    const { type, method, amount } = doc.data();
    if (type === "recette") balances[method] += amount;
    else balances[method] -= amount;
  });

  updateDisplay();
});

// Formulaire
document.getElementById('financeForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const date = document.getElementById('date').value;
  const type = document.getElementById('type').value;
  const method = document.getElementById('method').value;
  const amount = parseFloat(document.getElementById('amount').value);
  const responsible = document.getElementById('responsible').value.trim();
  const description = document.getElementById('description').value.trim();

  if (!date || !method || isNaN(amount) || !responsible || !description) {
    return alert("Tous les champs sont requis.");
  }

  try {
    await addDoc(caisseRef, {
      date,
      type,
      method,
      amount,
      responsible,
      description
    });
    alert("Enregistré avec succès.");
    e.target.reset();
  } catch (err) {
    console.error("Erreur d'enregistrement :", err);
  }
});


async function filterByDate() {
  const date = document.getElementById('filterDate').value;
  const tbody = document.querySelector("#historyTable tbody");
  tbody.innerHTML = "";

  if (!date) return alert("Choisis une date.");

  const q = query(caisseRef, where("date", "==", date));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    tbody.innerHTML = `<tr><td colspan="6">Aucune donnée pour cette date</td></tr>`;
    return;
  }

  querySnapshot.forEach(doc => {
    const { date, type, method, amount, responsible, description } = doc.data();
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${date}</td>
      <td>${type}</td>
      <td>${method.toUpperCase()}</td>
      <td>${amount.toLocaleString()}</td>
      <td>${responsible}</td>
      <td>${description}</td>
    `;
    tbody.appendChild(tr);
  });

  // Génère le graphique
  generateChart(date);
}


let chartInstance;

async function generateChart(date) {
  const q = query(caisseRef, where("date", "==", date));
  const querySnapshot = await getDocs(q);

  const totals = {
    recette: { gourde: 0, usd: 0, carteGde: 0, carteUsd: 0, moncash: 0, zell: 0 },
    depense: { gourde: 0, usd: 0, carteGde: 0, carteUsd: 0, moncash: 0, zell: 0 }
  };

  querySnapshot.forEach(doc => {
    const { type, method, amount } = doc.data();
    totals[type][method] += amount;
  });

  const methods = ["gourde", "usd", "carteGde", "carteUsd", "moncash", "zell"];

  const recettes = methods.map(m => totals.recette[m]);
  const depenses = methods.map(m => totals.depense[m]);

  const ctx = document.getElementById('paymentChart').getContext('2d');
  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: methods.map(m => m.toUpperCase()),
      datasets: [
        {
          label: 'Recettes',
          data: recettes,
          backgroundColor: 'green'
        },
        {
          label: 'Dépenses',
          data: depenses,
          backgroundColor: 'red'
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: `Graphique des Recettes et Dépenses - ${date}`
        }
      }
    }
  });
}


async function exportExcel() {
  const date = document.getElementById('filterDate').value;
  if (!date) return alert("Choisis une date.");

  const q = query(caisseRef, where("date", "==", date));
  const querySnapshot = await getDocs(q);

  const data = [["Date", "Type", "Méthode", "Montant", "Responsable", "Description"]];

  querySnapshot.forEach(doc => {
    const d = doc.data();
    data.push([
      d.date,
      d.type,
      d.method.toUpperCase(),
      d.amount,
      d.responsible,
      d.description
    ]);
  });

  if (data.length === 1) return alert("Aucune donnée à exporter.");

  const worksheet = XLSX.utils.aoa_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Caisse");

  XLSX.writeFile(workbook, `rapport-caisse-${date}.xlsx`);
}


 async function exportPDF() {
  const { jsPDF } = window.jspdf;
  const date = document.getElementById('filterDate').value;
  if (!date) return alert("Choisis une date.");

  const q = query(caisseRef, where("date", "==", date));
  const querySnapshot = await getDocs(q);

  const doc = new jsPDF();
  doc.text(`Rapport de caisse - ${date}`, 10, 10);

  const rows = [];
  querySnapshot.forEach(docSnap => {
    const d = docSnap.data();
    rows.push([
      d.date,
      d.type,
      d.method.toUpperCase(),
      d.amount.toLocaleString(),
      d.responsible,
      d.description
    ]);
  });

  if (rows.length === 0) {
    alert("Aucune donnée à exporter.");
    return;
  }

  doc.autoTable({
    startY: 20,
    head: [["Date", "Type", "Méthode", "Montant", "Responsable", "Description"]],
    body: rows
  });

  doc.save(`rapport-caisse-${date}.pdf`);
}
