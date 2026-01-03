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

import { getRegions } from "./api.js";

// DOM elements
const stateSelect = document.getElementById("stateSelect");
const citySelect = document.getElementById("citySelect");
const scaleSelect = document.getElementById("scaleSelect");
const typeSelect = document.getElementById("typeSelect");
const resultsContainer = document.getElementById("results");

// Load initial data when page loads
document.addEventListener("DOMContentLoaded", async () => {
    await initRegions(); // NEW: load full dataset once
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

        if (employers.length === 0) {
            resultsContainer.innerHTML = `<p>No Employers Shown At This Time</p>`;
            return;
        }

        resultsContainer.innerHTML = employers
            .map(item => {
                const name = item.EmployerName;
                const link = item.EmployerLink;

                return `
                    <div class="region-card">
                        <h3>
                            ${
                                link
                                    ? `<a href="${link}" target="_blank">${name}</a>`
                                    : name
                            }
                        </h3>
                    </div>
                `;
            })
            .join("");

    } catch (err) {
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
