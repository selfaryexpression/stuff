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

        // Sort A → Z
        employers.sort((a, b) => a.EmployerName.localeCompare(b.EmployerName));

        if (employers.length === 0) {
            resultsContainer.innerHTML = `<p>No Employers Shown At This Time</p>`;
            return;
        }

        // Summary header
        const summaryHTML = `
            <div class="results-summary">
                <h2>Showing ${employers.length} Employers</h2>
                <p><strong>Date Posted:</strong> ${dateRange}</p>
                <p><strong>Scale:</strong> ${scale}</p>
                <p><strong>Type:</strong> ${type}</p>
            </div>
        `;

        // Build results list
        const resultsHTML = employers
            .map(item => {
                const name = item.EmployerName;
                const careersLink = normalizeUrl(item.EmployerCareers);

                const careersHTML = careersLink
                    ? `
                        <a href="${careersLink}" target="_blank">${name}</a>
                        <button class="copy-btn" data-link="${careersLink}">Copy</button>
                      `
                    : `<span>${name} — No link available at this time</span>`;

                return `
                    <div class="dateposted-card">
                        <h3>${careersHTML}</h3>
                    </div>
                `;
            })
            .join("");

        // Closing message
        const closingMessage = `
            <div class="results-footer">
                <p>
                    If you are currently in an unstable or unsafe position financially and you do not have a job through no fault of your own, 
                    it may be worth checking to see if you qualify for unemployment in your state.
                </p>
            </div>
        `;

        // Combine everything
        resultsContainer.innerHTML = `
            ${summaryHTML}
            ${resultsHTML}
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
