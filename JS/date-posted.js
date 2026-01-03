// date-posted.js
import {
    populateDropdown,
    clearDropdown,
    disableDropdown,
    enableDropdown,
    resetDependentDropdowns,
    attachDropdownListener,
    renderNoResults,
    renderError,
    allJobsByDate,
    initJobsByDate
} from "./main.js";

import { getJobsByDate } from "./api.js";

// DOM elements
const datepostedSelect = document.getElementById("datepostedSelect");
const scaleSelect = document.getElementById("scaleSelect");
const typeSelect = document.getElementById("typeSelect");
const resultsContainer = document.getElementById("results");

// Load initial data when page loads
document.addEventListener("DOMContentLoaded", async () => {
    await initJobsByDate(); // NEW: load full dataset once
    loadDateOptions();
    setupListeners();
});

// ---------------------------------------------
// STEP 1: Load Date Posted Options
// ---------------------------------------------
function loadDateOptions() {
    const dateRanges = [
        "Last 3 Days",
        "Last 7 Days",
        "Last 14 Days"
    ];

    populateDropdown(datepostedSelect, dateRanges, "Date Posted");
}

// ---------------------------------------------
// STEP 2: Load Scales for Selected Date Range
// ---------------------------------------------
function loadScales(dateRange) {
    try {
        const scales = [...new Set(
            allJobsByDate
                .filter(item => item.DatePosted === dateRange)
                .map(item => item.Scale)
        )].sort();

        populateDropdown(scaleSelect, scales, "Scale");
    } catch (err) {
        renderError(resultsContainer, "Unable to load.");
    }
}

// ---------------------------------------------
// STEP 3: Load Types for Selected Scale
// ---------------------------------------------
function loadTypes(dateRange, scale) {
    try {
        const types = [...new Set(
            allJobsByDate
                .filter(item =>
                    item.DatePosted === dateRange &&
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
// STEP 4: Load Results for Selected Type
// ---------------------------------------------
function loadResults(dateRange, scale, type) {
    try {
        const employers = allJobsByDate.filter(item =>
            item.DatePosted === dateRange &&
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
                    <div class="dateposted-card">
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

    attachDropdownListener(datepostedSelect, (dateRange) => {
        resetDependentDropdowns([scaleSelect, typeSelect]);
        clearResults();

        if (dateRange) {
            loadScales(dateRange);
        }
    });

    attachDropdownListener(scaleSelect, (scale) => {
        resetDependentDropdowns([typeSelect]);
        clearResults();

        const dateRange = datepostedSelect.value;

        if (dateRange && scale) {
            loadTypes(dateRange, scale);
        }
    });

    attachDropdownListener(typeSelect, (type) => {
        clearResults();

        const dateRange = datepostedSelect.value;
        const scale = scaleSelect.value;

        if (dateRange && scale && type) {
            loadResults(dateRange, scale, type);
        }
    });
}

function clearResults() {
    resultsContainer.innerHTML = "";
}
