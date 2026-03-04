// 🌙 Theme Toggle Function (Global)
function toggleTheme() {
  document.body.classList.toggle("light-mode");

  const isLight = document.body.classList.contains("light-mode");

  // Save theme
  localStorage.setItem("theme", isLight ? "light" : "dark");
}


document.addEventListener("DOMContentLoaded", () => {
  // Load Saved Theme on Refresh
  const savedTheme = localStorage.getItem("theme");

  if (savedTheme === "light") {
    document.body.classList.add("light-mode");
  }

  const cryptoContainer = document.getElementById("cryptoContainer");
  const favList = document.getElementById("favList");
  const searchInput = document.getElementById("search");
  const ctx = document.getElementById("priceChart");
  const clearBtn = document.getElementById("clearBtn");

  let chart;
  let allCoins = [];

  function getWishlist() {
    return JSON.parse(localStorage.getItem("wishlist")) || [];
  }

  function saveWishlist(list) {
    localStorage.setItem("wishlist", JSON.stringify(list));
  }

  async function loadCrypto() {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&price_change_percentage=24h"
    );

    const data = await res.json();
    allCoins = data;
    displayCoins(data);
  }

  function displayCoins(coins) {
    cryptoContainer.innerHTML = "";

    const wishlist = getWishlist();

    coins.forEach(coin => {

      const isFav = wishlist.includes(coin.id);

      const card = document.createElement("div");
      card.className = "crypto-card";

      card.innerHTML = `
        <span class="heart ${isFav ? "active" : ""}">❤</span>
        <h3>${coin.name}</h3>
        <p>Price: $${coin.current_price}</p>
        <p class="${coin.price_change_percentage_24h >= 0 ? "profit" : "loss"}">
          24h: ${coin.price_change_percentage_24h.toFixed(2)}%
        </p>
        <button class="chart-btn">Chart</button>
      `;

      // ❤️ Heart Toggle
      const heart = card.querySelector(".heart");
      heart.addEventListener("click", () => {
        toggleWishlist(coin.id);
        heart.classList.toggle("active");
      });

      // Chart
      card.querySelector(".chart-btn").addEventListener("click", () => {
        showChart(coin.id);
      });

      cryptoContainer.appendChild(card);
    });
  }

  function toggleWishlist(id) {
    let wishlist = getWishlist();

    if (wishlist.includes(id)) {
      wishlist = wishlist.filter(c => c !== id);
    } else {
      wishlist.push(id);
    }

    saveWishlist(wishlist);
    renderWishlist();
  }

  function clearWishlist() {
    localStorage.removeItem("wishlist");
    renderWishlist();
    displayCoins(allCoins);
  }

  function renderWishlist() {
    favList.innerHTML = "";
    const wishlist = getWishlist();

    wishlist.forEach(id => {

      const coin = allCoins.find(c => c.id === id);
      if (!coin) return;

      const li = document.createElement("li");

      li.innerHTML = `
        <span>
          ${coin.name} - $${coin.current_price}
          <small class="${coin.price_change_percentage_24h >= 0 ? "profit" : "loss"}">
            (${coin.price_change_percentage_24h.toFixed(2)}%)
          </small>
        </span>
        <button class="remove-btn">❌</button>
      `;

      // Remove with animation
      li.querySelector(".remove-btn").addEventListener("click", () => {
        li.classList.add("removing");

        setTimeout(() => {
          toggleWishlist(id);
          displayCoins(allCoins);
        }, 300);
      });

      favList.appendChild(li);
    });
  }

  async function showChart(id) {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=7`
    );

    const data = await res.json();

    const prices = data.prices.map(p => p[1]);
    const labels = data.prices.map(p =>
      new Date(p[0]).toLocaleDateString()
    );

    if (chart) chart.destroy();

    chart = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [{
          label: "7 Day Price (USD)",
          data: prices,
          borderWidth: 2
        }]
      }
    });
  }

  function filterCoins() {
    const value = searchInput.value.toLowerCase();
    const filtered = allCoins.filter(c =>
      c.name.toLowerCase().includes(value)
    );

    displayCoins(filtered);
  }

  if (searchInput) {
    searchInput.addEventListener("keyup", filterCoins);
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", clearWishlist);
  }

  loadCrypto();
});
