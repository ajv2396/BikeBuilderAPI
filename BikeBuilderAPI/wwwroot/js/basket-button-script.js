/*
    basket-button-script.js

    This script manages the basket button displayed in the navigation bar.
    It fetches the current basket JSON file to count how many bikes the user
    has added, then updates the basket button label to show the count.
    It also triggers a brief animation on the button when the count updates.
    The LoadBasket function is exposed globally so other scripts can call it
    to refresh the basket count (e.g. after adding a new item).
*/

let AllBasketItems = [];    // Stores all items currently in the basket JSON file
let NumberOfBasketItems;    // Stores the total count of basket items

// Fetches the basket JSON file and updates the basket button text with the item count
async function LoadBasket() {
    try {
        const BasketText = document.querySelector('.basket-text');

        // Fetch basket file with a timestamp query string to bypass browser caching
        const resp = await fetch(`basket/user-basket.json?ts=${Date.now()}`, {
            cache: "no-store" //force to not cache
        });
        if (!resp.ok) throw new Error("Failed to load basket");

        // Parse the basket JSON into AllBasketItems array
        AllBasketItems = await resp.json();

        // Count the total number of items in the basket
        NumberOfBasketItems = AllBasketItems.length;

        // Update button text if basket has items
        if (NumberOfBasketItems !== 0) {
            document.querySelector('.basket-text').textContent =
                "Basket (" + NumberOfBasketItems + ")";
        }

        // Always update the button text to show the current basket count
        if (NumberOfBasketItems != null) {
            document.querySelector('.basket-text').textContent = "Basket (" + NumberOfBasketItems + ")";
        }

        // Briefly apply the basket-bump CSS animation class, then remove it after 200ms
        BasketText.classList.add("basket-bump");
        setTimeout(() => BasketText.classList.remove("basket-bump"), 200);

    } catch (err) {
        console.error("Error loading basket:", err);
    }
}

// Expose LoadBasket globally so other scripts (e.g. builder-script.js) can trigger a basket refresh
window.LoadBasket = LoadBasket;

// Run LoadBasket immediately when the script loads to set the initial basket count
LoadBasket();