// Initialisation de l'index d'édition
let editIndex = -1; // Par défaut, pas d'édition

document.getElementById('saveButton').addEventListener('click', async () => {
    const productName = document.getElementById('productName').value;
    const code = document.getElementById('uniqueCode').value;
    const description = document.getElementById('description').value;
    const price = parseFloat(document.getElementById('price').value);
    const buyPrice = parseFloat(document.getElementById('buyPrice').value);
    const quantity = parseInt(document.getElementById('quantity').value);
    const quantityType = document.getElementById('quantityType').value;
    const expirationDate = document.getElementById('expirationDate').value;
    const sellerName = document.getElementById('username').textContent; // 🔥 Nom du vendeur

    // Vérification que tous les champs sont remplis
    if (!productName || !code || !description || isNaN(price) || isNaN(quantity)) {
        alert('Veuillez remplir tous les champs avant d\'enregistrer le produit.');
        return;
    }

    try {
        const productRef = (editIndex && editIndex !== -1) 
            ? db.collection('products').doc(editIndex) 
            : db.collection('products').doc();

        // 🔴 Étape 1 : Récupérer l'ancien produit s'il existe
        let oldQuantity = 0;
        let oldPrice = 0;

        const existingProduct = await db.collection('products').where('code', '==', code).get();
        if (!existingProduct.empty) {
            const productDoc = existingProduct.docs[0]; // Prendre le premier résultat
            oldQuantity = productDoc.data().quantity || 0;
            oldPrice = productDoc.data().price || 0;
        }

        // 🔴 Étape 2 : Enregistrer ou mettre à jour le produit
        await productRef.set({
            name: productName,
            code: code,
            description: description,
            price: price,
            buyPrice: buyPrice,
            quantity: quantity,
            expirationDate:expirationDate,
            quantityType: quantityType
        });

        alert('Produit enregistré avec succès !');
        document.getElementById('productForm').reset();
        displayProducts();
        editIndex = -1;

        // 🔴 Étape 3 : Enregistrer dans "details" (historique des modifications)
        await db.collection('details').add({
            productCode: code,
            productName: productName,
            description: description,
            price: price,
            buyPrice: buyPrice,
            quantity: quantity,
            quantityType: quantityType,
            oldQuantity: oldQuantity, // ✅ Ancienne quantité
            oldPrice: oldPrice,       // ✅ Ancien prix
            date: new Date().toISOString(), // 🔥 Date et heure précises
            sellerName: sellerName // 🔥 Nom du vendeur
        });

        console.log("Historique enregistré avec succès !");
    } catch (error) {
        console.error("Erreur lors de l'enregistrement des détails :", error);
    }
});

let lastVisible = null;
const limit = 50;

function displayProducts(reset = false) {
    const tbody = document.querySelector('#productTable tbody');
    if (reset) tbody.innerHTML = ''; // Réinitialiser uniquement si on repart de zéro

    let query = db.collection('products').orderBy('name').limit(limit);
    if (lastVisible && !reset) {
        query = query.startAfter(lastVisible);
    }

    query.get()
        .then((querySnapshot) => {
            if (!querySnapshot.empty) {
                lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
                querySnapshot.forEach((doc) => {
                    const product = doc.data();
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${product.name}</td>
                        <td>${product.code}</td>
                        <td>${product.description}</td>
                        <td>${product.buyPrice}</td>
                        <td>${product.price}</td>
                        <td>${product.quantity} ${product.quantityType}</td>
                        <td>${product.expirationDate}</td>
                        <td>
                            <button onclick="editProduct('${doc.id}')">Modifier</button>
                            <button onclick="deleteProduct('${doc.id}')">Supprimer</button>
                        </td>
                    `;
                    tbody.appendChild(row);
                });
            } else {
                document.getElementById('loadMore').style.display = 'none'; // Cacher le bouton s'il n'y a plus de produits
            }
        })
        .catch((error) => {
            console.error("Erreur lors de l'affichage des produits :", error);
        });
}

document.addEventListener("DOMContentLoaded", () => {
    displayProducts(true);

    const loadMoreBtn = document.getElementById('loadMore');
    loadMoreBtn.addEventListener('click', () => displayProducts());
});


// Fonction pour éditer un produit
function editProduct(id) {
    db.collection('products').doc(id).get()
        .then((doc) => {
            if (doc.exists) {
                const product = doc.data();
                document.getElementById('productName').value = product.name;
                document.getElementById('uniqueCode').value = product.code;
                document.getElementById('description').value = product.description;
                document.getElementById('price').value = product.price;
                document.getElementById('buyPrice').value = product.buyPrice;
                document.getElementById('quantity').value = product.quantity;
                document.getElementById('expirationDate').value = product.expirationDate;
                document.getElementById('quantityType').value = product.quantityType;

                editIndex = id; // Définit l'index d'édition pour ce produit
                cardHidden.style.display = "block";
            }
        })
        .catch((error) => {
            console.error("Erreur lors de l'édition du produit :", error);
        });
}

// Fonction pour supprimer un produit
function deleteProduct(id) {
    const confirmation = confirm('Êtes-vous sûr de vouloir supprimer ce produit ?');
    if (confirmation) {
        db.collection('products').doc(id).delete()
            .then(() => {
                displayProducts(); // Rafraîchir la liste après suppression
            })
            .catch((error) => {
                console.error("Erreur lors de la suppression du produit :", error);
            });
    }
}

// Fonction de recherche des produits
document.getElementById('search').addEventListener('input', (event) => {
    const searchTerm = event.target.value.toLowerCase();
    const searchResults = document.getElementById('searchResults');
    searchResults.innerHTML = ''; // Réinitialisation des résultats de recherche

    db.collection('products').get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                const product = doc.data();
                if (product.name.toLowerCase().includes(searchTerm)) {
                    const li = document.createElement("li");
                    li.textContent = `${product.name} - ${product.code}`;
                    const editButton = document.createElement("button");
                    editButton.textContent = "Éditer";
                    editButton.style.marginLeft = "10px";
                    li.addEventListener('click', () => {
                        editProduct(doc.id);
                        searchResults.innerHTML = ''; // Effacer les résultats après sélection
                        cardHidden.style.display = "block";
                    });
                    li.appendChild(editButton);
                    searchResults.appendChild(li);
                }
            });
        })
        .catch((error) => {
            console.error("Erreur lors de la recherche des produits :", error);
        });
});

// Fonction d'exportation vers Excel
function exportToExcel() {
    db.collection('products').get()
        .then((querySnapshot) => {
            if (!querySnapshot.empty) {
                const worksheetData = [
                    ["Nom", "Code", "Description", "Prix", "Quantité"]
                ];

                querySnapshot.forEach((doc) => {
                    const product = doc.data();
                    worksheetData.push([product.name, product.code, product.description, product.price, product.quantity]);
                });

                const wb = XLSX.utils.book_new();
                const ws = XLSX.utils.aoa_to_sheet(worksheetData);
                XLSX.utils.book_append_sheet(wb, ws, "Products");
                XLSX.writeFile(wb, "GEMEDIC_ProductsDB.xlsx");
            } else {
                alert("Aucune donnée à exporter.");
            }
        })
        .catch((error) => {
            console.error("Erreur lors de l'exportation des données :", error);
        });
}

// Initialisation de l'affichage des produits
displayProducts();