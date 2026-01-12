const API_BASE_URL = "https://employer-search-api-dnaqgeekeubtdsgq.westus3-01.azurewebsites.net";

// Generic helper for GET requests with optional filters
async function apiGet(endpoint, filters = {}) {
    const params = new URLSearchParams(filters);
    const url = `${API_BASE_URL}/${endpoint}?${params.toString()}`;

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`API GET request failed: ${response.status}`);
    }

    return response.json();
}

// Keep only the endpoints you actually use:
export function searchEmployers(query) {
    return apiGet("search", { q: query });
}

export function getEmployerResults(employerName) {
    return apiGet("results", { employer: employerName });
}
