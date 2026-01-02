// Storage keys
const STORAGE = {
    QUIZZES: "quizzes",
    RESULTS: "quiz_results",
    CURRENT_USER: "current_user",
};

// Global state
let currentQuiz = null;
let currentQuestionIndex = 0;
let userAnswers = [];
let timerInterval = null;
let timeRemaining = 0;
let questionCount = 0;
let editingQuizId = null;

// Initialize app - This should only run in index.html
if (
    window.location.pathname.includes("index.html") ||
    window.location.pathname === "/"
) {
    document.addEventListener("DOMContentLoaded", initializeStorage);
}

// Initialize localStorage
function initializeStorage() {
    if (!localStorage.getItem(STORAGE.QUIZZES)) {
        localStorage.setItem(STORAGE.QUIZZES, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE.RESULTS)) {
        localStorage.setItem(STORAGE.RESULTS, JSON.stringify([]));
    }
}

// Screen management
function showScreen(screenId) {
    document.querySelectorAll(".screen").forEach((screen) => {
        screen.classList.remove("active");
    });
    const screenElement = document.getElementById(screenId);
    if (screenElement) {
        screenElement.classList.add("active");
    }
}

// Logout function (used by both admin and user)

function logout() {
    // Clear both localStorage and sessionStorage to be safe
    sessionStorage.clear();
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userRole");
    localStorage.removeItem(STORAGE.CURRENT_USER);

    // Redirect based on current page
    if (
        window.location.pathname.includes("admin.html") ||
        window.location.pathname.includes("user.html")
    ) {
        window.location.href = "../index.html";
    } else {
        window.location.href = "index.html";
    }
}

// Admin Tab Management
function switchAdminTab(tabName) {
    // Update tab buttons
    document.querySelectorAll(".tab-btn").forEach((btn) => {
        btn.classList.remove("active");
    });

    // Update tab content
    document.querySelectorAll(".admin-tab").forEach((tab) => {
        tab.classList.remove("active");
    });

    // Activate clicked tab
    document.getElementById(tabName + "Tab").classList.add("active");

    // Activate corresponding button
    const buttons = document.querySelectorAll(".tab-btn");
    buttons.forEach((btn) => {
        if (btn.textContent.toLowerCase().includes(tabName)) {
            btn.classList.add("active");
        }
    });

    // Load content for the tab
    if (tabName === "manage") {
        loadQuizzesList();
    } else if (tabName === "scores") {
        loadScores();
    }
}

// Check authentication on page load for admin and user pages
// Check authentication on page load for admin and user pages
function checkAuth(requiredRole) {
    const userEmail = localStorage.getItem("userEmail"); // Changed from sessionStorage
    const userRole = localStorage.getItem("userRole"); // Changed from sessionStorage

    if (!userEmail || userRole !== requiredRole) {
        Swal.fire({
            icon: "error",
            title: "Access Denied",
            text: `Please login as ${requiredRole} to access this page.`,
        }).then(() => {
            window.location.href = "../index.html";
        });
        return false;
    }
    return true;
}

// Initialize functions when DOM is loaded
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
        // Initialize storage
        initializeStorage();


        // Check if we're on admin or user page and verify auth
        if (window.location.pathname.includes("admin.html")) {
            if (checkAuth("admin")) {
                // Show welcome message
                const userEmail = sessionStorage.getItem("userEmail");
                const header = document.querySelector(".admin-header h1");
                if (header) {
                    // header.textContent = `Admin Dashboard - Welcome ${userEmail}`;
                }
                // Load initial tab
                switchAdminTab("create");
            }
        } else if (window.location.pathname.includes("user.html")) {
            if (checkAuth("user")) {
                const userEmail = sessionStorage.getItem("userEmail");
                const header = document.querySelector(".user-header h1");
                if (header) {
                    // header.textContent = `Available Quizzes - Welcome ${userEmail}`;
                }
                loadAvailableQuizzes();
            }
        }
    });
}
