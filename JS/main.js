// ===============================
// MAIN.JS — Shared Frontend Utilities
// ===============================

// ---------------------------------------------
// GLOBAL DATA CACHES — Now using split JSON files
// ---------------------------------------------

// Regions dataset (SPLIT JSON FILES)
export let allRegions = [];

// Load all split JSON files and merge them
export async function initRegions() {
    const files = [
        "/regionsdata_1.json",
        "/regionsdata_2.json",
        "/regionsdata_3.json",
        "/regionsdata_4.json",
        "/regionsdata_5.json",
        "/regionsdata_6.json",
        "/regionsdata_7.json",
        "/regionsdata_8.json",
        "/regionsdata_9.json",
        "/regionsdata_10.json"
    ];

    try {
        const promises = files.map(file =>
            fetch(file).then(res => {
                if (!res.ok) {
                    throw new Error(`Failed to load ${file}`);
                }
                return res.json();
            })
        );

        const results = await Promise.all(promises);

        // Merge all chunks into one array
        allRegions = results.flat();

        console.log(`Loaded ${allRegions.length} total region records.`);

    } catch (err) {
        console.error("Failed to load Regions dataset:", err);
        throw err;
    }
}

// ===============================
// DROPDOWN HELPERS
// ===============================

export function populateDropdown(selectElement, items, placeholder = "Select an option") {
    clearDropdown(selectElement);
    enableDropdown(selectElement);

    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = placeholder;
    selectElement.appendChild(defaultOption);

    items.forEach(item => {
        const option = document.createElement("option");
        option.value = item;
        option.textContent = item;
        selectElement.appendChild(option);
    });
}

export function clearDropdown(selectElement) {
    selectElement.innerHTML = "";
}

export function disableDropdown(selectElement) {
    selectElement.disabled = true;
}

export function enableDropdown(selectElement) {
    selectElement.disabled = false;
}

export function resetDependentDropdowns(dropdowns) {
    dropdowns.forEach(select => {
        clearDropdown(select);
        disableDropdown(select);
    });
}

export function attachDropdownListener(selectElement, callback) {
    selectElement.addEventListener("change", () => {
        const value = selectElement.value;
        callback(value);
    });
}

// ===============================
// RENDERING HELPERS
// ===============================

export function renderNoResults(container) {
    container.innerHTML = `<p>No results found.</p>`;
}

export function renderError(container, message = "An error occurred.") {
    container.innerHTML = `<p class="error">${message}</p>`;
}

// ===============================
// MOBILE NAVIGATION + SUBMENU LOGIC
// ===============================

document.addEventListener("DOMContentLoaded", () => {

    // -----------------------------
    // MOBILE MENU TOGGLE
    // -----------------------------
    const navToggle = document.querySelector(".nav-toggle");
    const navMenu = document.querySelector(".nav-menu");

    if (navToggle && navMenu) {
        navToggle.addEventListener("click", () => {
            navMenu.classList.toggle("open");
        });
    }

    // -----------------------------
    // SUBMENU TOGGLES (mobile only)
    // -----------------------------
    const submenuButtons = document.querySelectorAll(".submenu-toggle");

    submenuButtons.forEach(button => {
        button.addEventListener("click", () => {
            const parent = button.closest(".has-submenu");
            const submenu = parent.querySelector(".submenu");

            submenu.classList.toggle("open");
        });
    });

});