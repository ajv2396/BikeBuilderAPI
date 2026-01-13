let AllBasketItems = [];
let NumberOfBasketItems;

async function LoadBasket() {
    try {
        const BasketText = document.querySelector('.basket-text');

        const resp = await fetch(`basket/user-basket.json?ts=${Date.now()}`, {
            cache: "no-store" //force to not cache
        });
        if (!resp.ok) throw new Error("Failed to load basket");

        AllBasketItems = await resp.json();

        NumberOfBasketItems = AllBasketItems.length;

        if (NumberOfBasketItems !== 0) {
            document.querySelector('.basket-text').textContent =
                "Basket (" + NumberOfBasketItems + ")";
        }

        // If number of reviews doesn't equal 0 then add the number of reviews to the text
        if (NumberOfBasketItems != null) {
            document.querySelector('.basket-text').textContent = "Basket (" + NumberOfBasketItems + ")";
        }

        //animation
        BasketText.classList.add("basket-bump");
        setTimeout(() => BasketText.classList.remove("basket-bump"), 200);

    } catch (err) {
        console.error("Error loading basket:", err);
    }
}

//expose script globally
window.LoadBasket = LoadBasket;


LoadBasket();


