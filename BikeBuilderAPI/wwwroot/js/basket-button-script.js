let AllBasketItems = [];
let NumberOfBasketItems;
async function LoadBasket() {
    try {
        const resp = await fetch("basket/user-basket.json");
        if (!resp.ok) throw new Error("Failed to load basket");

        AllBasketItems = await resp.json();

        NumberOfBasketItems = AllBasketItems.length;

        if (NumberOfBasketItems !== 0) {
            document.querySelector('.basket-text').textContent =
                "Basket (" + NumberOfBasketItems + ")";
        }

    } catch (err) {
        console.error("Error loading basket:", err);
    }
}

LoadBasket();

// If number of reviews doesn't equal 0 then add the number of reviews to the text
if (NumberOfBasketItems != null) {
    document.querySelector('.basket-text').textContent = "Basket (" + NumberOfBasketItems + ")";
}
