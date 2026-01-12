// regions.js
import {
    populateDropdown,
    clearDropdown,
    disableDropdown,
    enableDropdown,
    resetDependentDropdowns,
    attachDropdownListener,
    renderNoResults,
    renderError,
    allRegions,
    initRegions
} from "./main.js";

// DOM elements
const stateSelect = document.getElementById("stateSelect");
const citySelect = document.getElementById("citySelect");
const scaleSelect = document.getElementById("scaleSelect");
const typeSelect = document.getElementById("typeSelect");
const resultsContainer = document.getElementById("results");

// Load initial data when page loads
document.addEventListener("DOMContentLoaded", async () => {
    await initRegions();   // loads all JSON chunks
    loadStates();
    setupListeners();
});

// ---------------------------------------------
// STEP 1: Load States (local filtering)
// ---------------------------------------------
function loadStates() {
    try {
        const states = [...new Set(allRegions.map(item => item.State))].sort();
        populateDropdown(stateSelect, states, "State/Territory");
    } catch (err) {
        renderError(resultsContainer, "Unable to load.");
    }
}

// ---------------------------------------------
// STEP 2: Load Cities for Selected State
// ---------------------------------------------
function loadCities(state) {
    try {
        const cities = [...new Set(
            allRegions
                .filter(item => item.State === state)
                .map(item => item.City_Town_Other)
        )].sort();

        populateDropdown(citySelect, cities, "City/Town/Other");
    } catch (err) {
        renderError(resultsContainer, "Unable to load.");
    }
}

// ---------------------------------------------
// STEP 3: Load Scales for Selected City
// ---------------------------------------------
function loadScales(state, city) {
    try {
        const scales = [...new Set(
            allRegions
                .filter(item =>
                    item.State === state &&
                    item.City_Town_Other === city
                )
                .map(item => item.Scale)
        )].sort();

        populateDropdown(scaleSelect, scales, "Scale");
    } catch (err) {
        renderError(resultsContainer, "Unable to load.");
    }
}

// ---------------------------------------------
// STEP 4: Load Types for Selected Scale
// ---------------------------------------------
function loadTypes(state, city, scale) {
    try {
        const types = [...new Set(
            allRegions
                .filter(item =>
                    item.State === state &&
                    item.City_Town_Other === city &&
                    item.Scale === scale
                )
                .map(item => item.Type)
        )].sort();

        populateDropdown(typeSelect, types, "Type");
    } catch (err) {
        renderError(resultsContainer, "Unable to load.");
    }
}

// Helper: Ensure URLs always open as absolute links
function normalizeUrl(url) {
    if (!url) return null;
    if (url.startsWith("http://") || url.startsWith("https://")) {
        return url;
    }
    return "https://" + url;
}

// Helper: Copy text + show tooltip
function copyToClipboard(text, buttonElement) {
    if (!text) return;

    navigator.clipboard.writeText(text).then(() => {
        buttonElement.classList.add("copied");
        setTimeout(() => {
            buttonElement.classList.remove("copied");
        }, 1500);
    }).catch(err => {
        console.error("Clipboard error:", err);
    });
}

// ---------------------------------------------
// STEP 5: Load Results for Selected Type
// ---------------------------------------------
function loadResults(state, city, scale, type) {
    try {
        const employers = allRegions.filter(item =>
            item.State === state &&
            item.City_Town_Other === city &&
            item.Scale === scale &&
            item.Type === type &&
            item.EmployerName
        );

        // Sort employers A → Z by name
        employers.sort((a, b) => a.EmployerName.localeCompare(b.EmployerName));


        if (employers.length === 0) {
            resultsContainer.innerHTML = `<p>No Employers Shown At This Time</p>`;
            return;
        }

        const summaryHTML = `
            <div class="results-summary">
                <h2>Showing ${employers.length} Employers</h2>
                <p><strong>State:</strong> ${state}</p>
                <p><strong>City/Town:</strong> ${city}</p>
                <p><strong>Scale:</strong> ${scale}</p>
                <p><strong>Type:</strong> ${type}</p>
            </div>
        `;

        const tableHeader = `
            <div class="results-table">
                <div class="results-row header">
                    <div class="results-col"><strong>Employer Contact</strong></div>
                    <div class="results-col"><strong>Employer Careers Page by Region</strong></div>
                </div>
        `;

        const tableRows = employers
            .map(item => {
                const name = item.EmployerName;

                const contactLink = normalizeUrl(item.EmployerContact);
                const careersLink = normalizeUrl(item.EmployerCareers);

                const contactHTML = contactLink
                    ? `
                        <a href="${contactLink}" target="_blank">${name} Contact</a>
                        <button class="copy-btn" data-link="${contactLink}">Copy</button>
                      `
                    : `<span>No link available at this time</span>`;

                const careersHTML = careersLink
                    ? `
                        <a href="${careersLink}" target="_blank">${name} Careers Page</a>
                        <button class="copy-btn" data-link="${careersLink}">Copy</button>
                      `
                    : `<span>No link available at this time</span>`;

                return `
                    <div class="results-row">
                        <div class="results-col">${contactHTML}</div>
                        <div class="results-col">${careersHTML}</div>
                    </div>
                `;
            })
            .join("");

        const closingMessage = `
            <div class="results-footer">
                <p>
                    If you are currently in an unstable or unsafe position financially and you do not have a job through no fault of your own, it may be worth checking to see if you qualify for unemployment in your state.
                </p>
            </div>
        `;

        resultsContainer.innerHTML = `
            ${summaryHTML}
            ${tableHeader}
                ${tableRows}
            </div>
            ${closingMessage}
        `;

        // EVENT DELEGATION — attach once, works for all dynamic buttons
        resultsContainer.addEventListener("click", function (event) {
            if (event.target.classList.contains("copy-btn")) {
                const btn = event.target;
                const link = btn.getAttribute("data-link");
                if (link) {
                    copyToClipboard(link, btn);
                }
            }
        });

    } catch (err) {
        console.error(err);
        renderError(resultsContainer, "Failed to load results.");
    }
}



// ---------------------------------------------
// EVENT LISTENERS
// ---------------------------------------------
function setupListeners() {

    // When state changes → load cities
    attachDropdownListener(stateSelect, (state) => {
        resetDependentDropdowns([citySelect, scaleSelect, typeSelect]);
        clearResults();

        if (state) {
            loadCities(state);
        }
    });

    // When city changes → load scales
    attachDropdownListener(citySelect, (city) => {
        resetDependentDropdowns([scaleSelect, typeSelect]);
        clearResults();

        const state = stateSelect.value;
        if (state && city) {
            loadScales(state, city);
        }
    });

    // When scale changes → load types
    attachDropdownListener(scaleSelect, (scale) => {
        resetDependentDropdowns([typeSelect]);
        clearResults();

        const state = stateSelect.value;
        const city = citySelect.value;

        if (state && city && scale) {
            loadTypes(state, city, scale);
        }
    });

    // When type changes → load results
    attachDropdownListener(typeSelect, (type) => {
        clearResults();

        const state = stateSelect.value;
        const city = citySelect.value;
        const scale = scaleSelect.value;

        if (state && city && scale && type) {
            loadResults(state, city, scale, type);
        }
    });
}

// Clear results container
function clearResults() {
    resultsContainer.innerHTML = "";
}
