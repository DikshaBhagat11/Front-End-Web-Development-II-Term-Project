const API_URL = "https://api.coingecko.com/api/v3/coins/markets";
let cryptosData = []; // Store fetched data globally
let userPreferences = JSON.parse(localStorage.getItem("userPreferences")) || {
    sort: "market_cap",
    theme: "light",
    favorites: [],
};

// Fetch cryptocurrencies and render the list
async function fetchCryptos() {
    try {
        const url = `${API_URL}?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&_=${Date.now()}`; // Prevent caching
        const response = await fetch(url);
        const data = await response.json();

        // Update global data and re-render
        cryptosData = data;
        displayCryptos(data);
        displayFavorites();
        displayComparison();
    } catch (error) {
        console.error("Failed to fetch cryptocurrency data:", error);
    }
}

// Display cryptocurrencies
function displayCryptos(cryptos) {
    const cryptoList = document.getElementById("crypto-list");
    cryptoList.innerHTML = ""; // Clear the existing list

    const sortedCryptos = sortCryptos(cryptos); // Sort based on preferences
    sortedCryptos.forEach((crypto) => {
        const isFavorite = userPreferences.favorites.includes(crypto.id) ? "★" : "☆";
        const cryptoItem = document.createElement("div");
        cryptoItem.innerHTML = `
            <h3>${crypto.name} (${crypto.symbol.toUpperCase()})</h3>
            <p>Price: $${crypto.current_price.toFixed(2)}</p>
            <p>24h Change: ${crypto.price_change_percentage_24h.toFixed(2)}%</p>
            <p>Market Cap: $${crypto.market_cap.toLocaleString()}</p>
            <button onclick="toggleFavorite('${crypto.id}')">${isFavorite}</button>
            <button onclick="addToComparison('${crypto.id}')">Add to Compare</button>
        `;
        cryptoList.appendChild(cryptoItem);
    });
}

// Sort cryptocurrencies based on user preference
function sortCryptos(cryptos) {
    const sortOption = userPreferences.sort;
    return cryptos.sort((a, b) => {
        if (sortOption === "price") return b.current_price - a.current_price;
        if (sortOption === "24h_change") return b.price_change_percentage_24h - a.price_change_percentage_24h;
        return b.market_cap - a.market_cap;
    });
}

// Functions for managing selected cryptocurrencies in the comparison section
function getSelectedCryptos() {
    const storedCryptos = localStorage.getItem("selectedCryptos");
    return storedCryptos ? JSON.parse(storedCryptos) : [];
}

function saveSelectedCryptos(selectedCryptos) {
    localStorage.setItem("selectedCryptos", JSON.stringify(selectedCryptos));
}

function addToComparison(cryptoId) {
    const selectedCryptos = getSelectedCryptos();

    if (selectedCryptos.includes(cryptoId)) {
        alert("This cryptocurrency is already in the comparison list.");
        return;
    }

    if (selectedCryptos.length >= 5) {
        alert("You can compare up to 5 cryptocurrencies only.");
        return;
    }

    selectedCryptos.push(cryptoId);
    saveSelectedCryptos(selectedCryptos);
    displayComparison();
}

function removeFromComparison(cryptoId) {
    let selectedCryptos = getSelectedCryptos();
    selectedCryptos = selectedCryptos.filter(id => id !== cryptoId);
    saveSelectedCryptos(selectedCryptos);
    displayComparison();
}

function displayComparison() {
    const comparisonContainer = document.getElementById("comparison-container");
    const comparisonHeading = document.getElementById("comparison-heading");
    const selectedCryptos = getSelectedCryptos();  // Assuming this function gets selected crypto IDs

    comparisonContainer.innerHTML = "";

    if (selectedCryptos.length > 0) {
        comparisonHeading.style.display = "block";
    } else {
        comparisonHeading.style.display = "none";
    }

    selectedCryptos.forEach((cryptoId) => {
        const cryptoData = cryptosData.find((crypto) => crypto.id === cryptoId);  // Find the data for each selected crypto
        if (cryptoData) {
            const cryptoElement = document.createElement("div");
            cryptoElement.className = "crypto-item";
            cryptoElement.innerHTML = `
                <h3>${cryptoData.name} (${cryptoData.symbol.toUpperCase()})</h3>
                <p>Price: $${cryptoData.current_price.toFixed(2)}</p>
                <p>24h Change: ${cryptoData.price_change_percentage_24h.toFixed(2)}%</p>
                <p>Market Cap: $${cryptoData.market_cap.toLocaleString()}</p>
                <button onclick="removeFromComparison('${cryptoData.id}')">Remove</button>
            `;
            comparisonContainer.appendChild(cryptoElement);
        }
    });
}

// Toggle favorite cryptocurrencies
function toggleFavorite(cryptoId) {
    const index = userPreferences.favorites.indexOf(cryptoId);
    if (index === -1) {
        userPreferences.favorites.push(cryptoId);
    } else {
        userPreferences.favorites.splice(index, 1);
    }
    saveUserPreferences();
    displayCryptos(cryptosData);  // Refresh crypto list
    displayFavorites();  // Refresh favorite list
}

// Display the favorite cryptocurrencies
function displayFavorites() {
    const favoritesContainer = document.getElementById("favorites-container");
    const favorites = userPreferences.favorites; // Get the favorite crypto IDs

    favoritesContainer.innerHTML = ""; // Clear the existing list

    if (favorites.length === 0) {
        favoritesContainer.innerHTML = "<p>No favorites selected.</p>";
        return;
    }

    favorites.forEach((cryptoId) => {
        const cryptoData = cryptosData.find((crypto) => crypto.id === cryptoId);
        if (cryptoData) {
            const cryptoItem = document.createElement("div");
            cryptoItem.className = "crypto-item";
            cryptoItem.innerHTML = `
                <h3>${cryptoData.name} (${cryptoData.symbol.toUpperCase()})</h3>
                <p>Price: $${cryptoData.current_price.toFixed(2)}</p>
                <p>24h Change: ${cryptoData.price_change_percentage_24h.toFixed(2)}%</p>
                <p>Market Cap: $${cryptoData.market_cap.toLocaleString()}</p>
                <button onclick="removeFromFavorites('${cryptoData.id}')">Remove from Favorites</button>
            `;
            favoritesContainer.appendChild(cryptoItem);
        }
    });
}

// Remove a cryptocurrency from favorites
function removeFromFavorites(cryptoId) {
    const index = userPreferences.favorites.indexOf(cryptoId);
    if (index !== -1) {
        userPreferences.favorites.splice(index, 1);
    }
    saveUserPreferences();
    displayCryptos(cryptosData);  // Refresh the list of cryptos
    displayFavorites();  // Refresh the favorite section
}

// Save user preferences to local storage
function saveUserPreferences() {
    localStorage.setItem("userPreferences", JSON.stringify(userPreferences));
}

// Load user preferences and apply them
function loadPreferences() {
    const sortPreference = document.getElementById("sort-preference");
    sortPreference.value = userPreferences.sort;
    sortPreference.addEventListener("change", (e) => {
        userPreferences.sort = e.target.value;
        saveUserPreferences();
        displayCryptos(cryptosData);
    });

    const theme = document.getElementById("theme");
    theme.value = userPreferences.theme;
    theme.addEventListener("change", (e) => {
        userPreferences.theme = e.target.value;
        document.body.className = e.target.value;
        saveUserPreferences();
    });

    document.body.className = userPreferences.theme;
}

// Initialize application
function init() {
    loadPreferences();
    fetchCryptos();
    setInterval(fetchCryptos, 60000); // Fetch and update every minute
}

init();
