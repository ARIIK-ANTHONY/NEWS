function toggleMenu() {
    const menu = document.getElementById("menu");
    menu.classList.toggle("show");
}

// Tab Navigation Function
function showTab(tabName) {
    document.querySelectorAll(".tab-content").forEach(tab => tab.classList.remove("active"));
    document.querySelectorAll(".tab-button").forEach(btn => btn.classList.remove("active"));
    document.getElementById(tabName).classList.add("active");
    document.querySelector(`[onclick="showTab('${tabName}')"]`).classList.add("active");

    if (tabName === "jobs") {
        fetchDefaultJobs();
    }
}

// Reusable Function to Render Cards
function renderCards(containerId, items, templateFn) {
    const container = document.getElementById(containerId);
    if (!items || items.length === 0) {
        container.innerHTML = "<p>No results found.</p>";
        return;
    }
    container.innerHTML = items.map(templateFn).join("");
}

// Fetch and Display News
async function fetchNews() {
    try {
        const response = await fetch("/api/news");
        const data = await response.json();

        renderCards("news-results", data.articles, article => `
            <div class="news-detail">
                <img src="${article.urlToImage || 'https://via.placeholder.com/150'}" alt="${article.title}">
                <div>
                    <h3>${article.title}</h3>
                    <p>${article.source.name}</p>
                    <a href="${article.url}" target="_blank">Read More</a>
                </div>
            </div>
        `);
    } catch (error) {
        console.error("❌ Error fetching news:", error.message);
        document.getElementById("news-results").innerHTML = "<p>Error fetching news.</p>";
    }
}

// Fetch Default Jobs
async function fetchDefaultJobs() {
    try {
        const response = await fetch(`/api/jobs?query=developer&location=remote`);
        const data = await response.json();

        renderCards("job-results", data.results, job => `
            <div class="job">
                <h3>${job.role}</h3>
                <p>${job.company_name} - ${job.location}</p>
                <a href="${job.url}" target="_blank">View Job</a>
            </div>
        `);
    } catch (error) {
        console.error("❌ Error fetching default jobs:", error.message);
        document.getElementById("job-results").innerHTML = `<p>${error.message || "Error fetching default jobs."}</p>`;
    }
}

// Search Jobs Function
async function searchJobs() {
    const query = document.getElementById("query").value;
    const location = document.getElementById("location").value;

    if (!query || !location) {
        alert("Please enter both a job title and a location.");
        return;
    }

    try {
        const response = await fetch(`/api/jobs?query=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}`);
        const data = await response.json();

        const jobResultsContainer = document.getElementById("job-results");
        if (data.results && data.results.length > 0) {
            jobResultsContainer.innerHTML = data.results.map(job => `
                <div class="job">
                    <h3>${job.role}</h3>
                    <p>${job.company_name} - ${job.location}</p>
                    <a href="${job.url}" target="_blank">View Job</a>
                </div>
            `).join("");
        } else {
            jobResultsContainer.innerHTML = `<p>${data.message || "No job listings found."}</p>`;
        }
    } catch (error) {
        console.error("❌ Error fetching jobs:", error.message);
        document.getElementById("job-results").innerHTML = `<p>Error fetching jobs. Please try again later.</p>`;
    }
}

// Redirect to News Page
function redirectToNews() {
    window.location.href = "news.html";
}

// Automatically Fetch News on News Page
document.addEventListener("DOMContentLoaded", function () {
    if (window.location.pathname.includes("news.html")) {
        fetchNews();
    }
});