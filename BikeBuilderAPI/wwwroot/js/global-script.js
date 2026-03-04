/*
    global-script.js

    This script runs on every page of the Bike Builder system.
    It listens for the browser's pageshow event and forces a full page reload
    if the page was restored from the browser's back/forward cache (bfcache).
    This ensures that session state, basket counts, and login status are always
    fresh when the user navigates back to a page, rather than displaying
    a stale cached version.
*/

// Force a reload if the page is restored from the browser's back/forward cache
// "event.persisted" is true when the page is loaded from bfcache rather than a fresh request
window.addEventListener("pageshow", (event) => {
    if (event.persisted) {
        window.location.reload();
    }
});