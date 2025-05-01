document.getElementById('barcodeInput').addEventListener('input', (event) => {
    const barcode = event.target.value;

    // Simulate fetching medicine data based on the barcode
    const medicineData = fetchMedicineData(barcode);

    if (medicineData) {
        document.getElementById('productName').value = medicineData.name || '';
        document.getElementById('uniqueCode').value = medicineData.code || '';
        document.getElementById('description').value = medicineData.description || '';
        document.getElementById('dosage').value = medicineData.dosage || '';
        document.getElementById('usage').value = medicineData.usage || '';
    }

    // Clear the barcode input field after processing
    event.target.value = '';
});

// Dummy function to simulate fetching medicine data based on a barcode
function fetchMedicineData(barcode) {
    const mockDatabase = {
        '123456789012': {
            name: 'Aspirin',
            code: 'A123',
            description: 'Pain reliever',
            dosage: '500mg',
            usage: 'Oral'
        },
        '987654321098': {
            name: 'Ibuprofen',
            code: 'I987',
            description: 'Anti-inflammatory',
            dosage: '400mg',
            usage: 'Oral'
        }
        // Add more mock data as needed
    };

    return mockDatabase[barcode] || null;
}

let editIndex = -1;

document.getElementById('saveButton').addEventListener('click', () => {
    const productName = document.getElementById('productName').value;
    const uniqueCode = document.getElementById('uniqueCode').value;
    const description = document.getElementById('description').value;
    const dosage = document.getElementById('dosage').value;
    const usage = document.getElementById('usage').value;
    const price = document.getElementById('price').value;
    const quantity = document.getElementById('quantity').value;

    if (!productName || !uniqueCode || !description || !dosage || !usage || !price || !quantity) {
        alert('Veuillez remplir tous les champs avant d\'enregistrer le produit.');
        return;
    }

    const product = {
        name: productName,
        code: uniqueCode,
        description: description,
        dosage: dosage,
        usage: usage,
        price: price,
        quantity: quantity
    };

    let products = JSON.parse(localStorage.getItem('products')) || [];

    if (editIndex > -1) {
        products[editIndex] = product;
        editIndex = -1;
    } else {
        products.push(product);
    }

    localStorage.setItem('products', JSON.stringify(products));

    alert('Produit enregistré avec succès !');
    document.getElementById('productForm').reset();

    displayProducts();
});

function displayProducts() {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const tbody = document.querySelector('#productTable tbody');
    tbody.innerHTML = '';

    products.forEach((product, index) => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${product.name}</td>
            <td>${product.code}</td>
            <td>${product.description}</td>
            <td>${product.dosage}</td>
            <td>${product.usage}</td>
            <td>${product.price}</td>
            <td>${product.quantity}</td>
            <td>
                <button onclick="editProduct(${index})">Modifier</button>
                <button onclick="deleteProduct(${index})">Supprimer</button>
            </td>
        `;

        tbody.appendChild(row);
    });
}

function editProduct(index) {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const product = products[index];

    document.getElementById('productName').value = product.name;
    document.getElementById('uniqueCode').value = product.code;
    document.getElementById('description').value = product.description;
    document.getElementById('dosage').value = product.dosage;
    document.getElementById('usage').value = product.usage;
    document.getElementById('price').value = product.price;
    document.getElementById('quantity').value = product.quantity;

    editIndex = index;
}

function deleteProduct(index) {
    const confirmation = confirm('Êtes-vous sûr de vouloir supprimer ce produit ?');
    if (confirmation) {
        const products = JSON.parse(localStorage.getItem('products')) || [];
        products.splice(index, 1);
        localStorage.setItem('products', JSON.stringify(products));
        displayProducts();
    }
}

document.getElementById('search').addEventListener('input', (event) => {
    const searchTerm = event.target.value.toLowerCase();
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const searchResults = document.getElementById('searchResults');
    searchResults.innerHTML = '';

    products.forEach((product, index) => {
        if (product.name.toLowerCase().includes(searchTerm)) {
            const li = document.createElement('li');
            li.textContent = product.name;
            li.addEventListener('click', () => {
                document.getElementById('productName').value = product.name;
                document.getElementById('uniqueCode').value = product.code;
                document.getElementById('description').value = product.description;
                document.getElementById('dosage').value = product.dosage;
                document.getElementById('usage').value = product.usage;
                document.getElementById('price').value = product.price;
                document.getElementById('quantity').value = product.quantity;
                editIndex = index;
                searchResults.innerHTML = '';
            });
            searchResults.appendChild(li);
        }
    });
});

document.getElementById('exportButton').addEventListener('click', () => {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const worksheet = XLSX.utils.json_to_sheet(products);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');
    XLSX.writeFile(workbook, 'products.xlsx');
});

document.getElementById('importButton').addEventListener('click', () => {
    const fileInput = document.getElementById('importFile');
    const file = fileInput.files[0];

    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            const data = new Uint8Array(event.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const products = XLSX.utils.sheet_to_json(worksheet);

            localStorage.setItem('products', JSON.stringify(products));
            displayProducts();
        };
        reader.readAsArrayBuffer(file);
    } else {
        alert('Veuillez sélectionner un fichier à importer.');
    }
});

// Initial display of products
displayProducts();