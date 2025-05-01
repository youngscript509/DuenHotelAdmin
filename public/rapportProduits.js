let lastVisible = null;
const limit = 50;
const productsCollection = db.collection('products');

async function displayProducts(filter = {}, reset = false, isSearch = false) {
    let productTableBody = document.querySelector("#productTable tbody");
    if (reset || isSearch) productTableBody.innerHTML = ''; // Réinitialiser uniquement si nécessaire

    let query = productsCollection.orderBy('name');
    if (!isSearch) {
        if (lastVisible && !reset) {
            query = query.startAfter(lastVisible);
        }
        query = query.limit(limit);
    }

    try {
        const snapshot = await query.get();
        if (!snapshot.empty) {
            if (!isSearch) lastVisible = snapshot.docs[snapshot.docs.length - 1];
            snapshot.forEach((doc) => {
                let product = doc.data();
                let productId = doc.id;

                // Appliquer les filtres côté client
                if ((filter.price === undefined || product.price == filter.price) &&
                    (filter.quantity === undefined || product.quantity == filter.quantity)) {

                    let row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${product.code}</td>
                        <td>${product.name}</td>
                        <td>${product.price}</td>
                        <td>${product.quantity}</td>
                        <td><button class="btn-details" data-code="${product.code}">Détails</button></td>
                    `;
                    productTableBody.appendChild(row);
                }
            });
        } else {
            document.getElementById('loadMore').style.display = isSearch ? 'none' : 'block';
        }
    } catch (error) {
        console.error("Erreur lors de l'affichage des produits : ", error);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    displayProducts({}, true);

    document.getElementById('loadMore').addEventListener('click', () => displayProducts());

    document.getElementById('filterButton').addEventListener('click', () => {
        let price = document.getElementById('price').value.trim();
        let quantity = document.getElementById('quantity').value.trim();

        displayProducts({
            price: price ? parseFloat(price) : undefined,
            quantity: quantity ? parseInt(quantity) : undefined
        }, true, true);
    });

    document.getElementById('resetButton').addEventListener('click', () => {
        document.getElementById('price').value = '';
        document.getElementById('quantity').value = '';
        displayProducts({}, true);
    });
});
