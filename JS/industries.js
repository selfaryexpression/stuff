// industry.js
import {
    populateDropdown,
    clearDropdown,
    disableDropdown,
    enableDropdown,
    resetDependentDropdowns,
    attachDropdownListener,
    renderNoResults,
    renderError,
    allIndustries,
    initIndustries
} from "./main.js";

import { getIndustries } from "./api.js";

// DOM elements
const industrySelect = document.getElementById("industrySelect");
const subindustrySelect = document.getElementById("subindustrySelect");
const scaleSelect = document.getElementById("scaleSelect");
const typeSelect = document.getElementById("typeSelect");
const resultsContainer = document.getElementById("results");

// Load initial data when page loads
document.addEventListener("DOMContentLoaded", async () => {
    await initIndustries(); // NEW: load full dataset once
    loadIndustries();
    setupListeners();
});

// ---------------------------------------------
// STEP 1: Load Industries (local filtering)
// ---------------------------------------------
function loadIndustries() {
    try {
        const industries = [...new Set(
            allIndustries.map(item => item.Industry)
        )].sort();

        populateDropdown(industrySelect, industries, "Industry");
    } catch (err) {
        renderError(resultsContainer, "Unable to load.");
    }
}

// ---------------------------------------------
// STEP 2: Load Subindustries for Selected Industry
// ---------------------------------------------
function loadSubindustries(industry) {
    try {
        const subindustries = [...new Set(
            allIndustries
                .filter(item => item.Industry === industry)
                .map(item => item.Subindustry)
        )].sort();

        populateDropdown(subindustrySelect, subindustries, "Subindustry");
    } catch (err) {
        renderError(resultsContainer, "Unable to load.");
    }
}

// ---------------------------------------------
// STEP 3: Load Scales for Selected Subindustry
// ---------------------------------------------
function loadScales(industry, subindustry) {
    try {
        const scales = [...new Set(
            allIndustries
                .filter(item =>
                    item.Industry === industry &&
                    item.Subindustry === subindustry
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
function loadTypes(industry, subindustry, scale) {
    try {
        const types = [...new Set(
            allIndustries
                .filter(item =>
                    item.Industry === industry &&
                    item.Subindustry === subindustry &&
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
function loadResults(industry, subindustry, scale, type) {
    try {
        const employers = allIndustries.filter(item =>
            item.Industry === industry &&
            item.Subindustry === subindustry &&
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

        // Build results
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
                    <div class="industry-card">
                        <h3>${careersHTML}</h3>
                    </div>
                `;
            })
            .join("");

        resultsContainer.innerHTML = resultsHTML;

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

    attachDropdownListener(industrySelect, (industry) => {
        resetDependentDropdowns([subindustrySelect, scaleSelect, typeSelect]);
        clearResults();

        if (industry) {
            loadSubindustries(industry);
        }
    });

    attachDropdownListener(subindustrySelect, (subindustry) => {
        resetDependentDropdowns([scaleSelect, typeSelect]);
        clearResults();

        const industry = industrySelect.value;
        if (industry && subindustry) {
            loadScales(industry, subindustry);
        }
    });

    attachDropdownListener(scaleSelect, (scale) => {
        resetDependentDropdowns([typeSelect]);
        clearResults();

        const industry = industrySelect.value;
        const subindustry = subindustrySelect.value;

        if (industry && subindustry && scale) {
            loadTypes(industry, subindustry, scale);
        }
    });

    attachDropdownListener(typeSelect, (type) => {
        clearResults();

        const industry = industrySelect.value;
        const subindustry = subindustrySelect.value;
        const scale = scaleSelect.value;

        if (industry && subindustry && scale && type) {
            loadResults(industry, subindustry, scale, type);
        }
    });
}

function clearResults() {
    resultsContainer.innerHTML = "";
}
