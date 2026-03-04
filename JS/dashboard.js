document.addEventListener("DOMContentLoaded", () => {

  const loginScreen = document.getElementById("loginScreen");
  const app = document.getElementById("app");
  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  const cryptoContainer = document.getElementById("cryptoContainer");
  const favList = document.getElementById("favList");
  const clearBtn = document.getElementById("clearBtn");
  const themeBtn = document.getElementById("themeBtn");
  const portfolioContainer = document.getElementById("portfolioContainer");

  let portfolioChart;

  /* LOGIN SYSTEM */
  if (localStorage.getItem("user")) {
    loginScreen.style.display = "none";
    app.style.display = "block";
  }

  loginBtn.addEventListener("click", () => {
    const username = document.getElementById("username").value;
    if (username) {
      localStorage.setItem("user", username);
      location.reload();
    }
  });

  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("user");
    location.reload();
  });

  /* THEME */
  if (localStorage.getItem("theme") === "light") {
    document.body.classList.add("light-mode");
  }

  themeBtn.addEventListener("click", () => {
    document.body.classList.toggle("light-mode");
    localStorage.setItem("theme",
      document.body.classList.contains("light-mode") ? "light" : "dark"
    );
  });

  /* TRADINGVIEW */
  function loadChart(symbol) {
    document.getElementById("tradingview_chart").innerHTML = "";

    new TradingView.widget({
      autosize: true,
      symbol: symbol,
      interval: "60",
      theme: document.body.classList.contains("light-mode") ? "light" : "dark",
      container_id: "tradingview_chart"
    });
  }

  /* WISHLIST */
  function getWishlist() {
    return JSON.parse(localStorage.getItem("wishlist")) || [];
  }

  function saveWishlist(list) {
    localStorage.setItem("wishlist", JSON.stringify(list));
  }

  clearBtn.addEventListener("click", () => {
    localStorage.removeItem("wishlist");
    favList.innerHTML = "";
    refreshHearts();
  });

  function refreshHearts() {
    document.querySelectorAll(".heart").forEach(h => h.classList.remove("active"));
    getWishlist().forEach(id => {
      const el = document.querySelector(`[data-id="${id}"]`);
      if (el) el.classList.add("active");
    });
  }

  /* LIVE PRICE WEBSOCKET (BINANCE) */
  function startWebSocket(symbol) {
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}usdt@trade`);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const priceElement = document.getElementById(symbol);
      if (priceElement) {
        priceElement.textContent = `$${parseFloat(data.p).toFixed(2)}`;
      }
    };
  }

  /* LOAD COINS */
  async function loadCrypto() {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=6&page=1"
    );
    const data = await res.json();

    data.forEach(coin => {

      const card = document.createElement("div");
      card.className = "crypto-card";

      const wishlist = getWishlist();
      const isFav = wishlist.includes(coin.id);

      card.innerHTML = `
        <img src="${coin.image}" class="coin-img">
        ${coin.name} 
        <span id="${coin.symbol.toUpperCase()}">$${coin.current_price}</span>
        <span class="heart ${isFav ? "active" : ""}" data-id="${coin.id}">❤</span>
        <input type="number" placeholder="Qty" class="portfolio-input" data-symbol="${coin.symbol}">
      `;

      card.addEventListener("click", () => {
        loadChart(`BINANCE:${coin.symbol.toUpperCase()}USDT`);
      });

      const heart = card.querySelector(".heart");
      heart.addEventListener("click", (e) => {
        e.stopPropagation();
        let wishlist = getWishlist();

        if (wishlist.includes(coin.id)) {
          wishlist = wishlist.filter(c => c !== coin.id);
        } else {
          wishlist.push(coin.id);
        }

        saveWishlist(wishlist);
        refreshHearts();
        renderWishlist(data);
      });

      startWebSocket(coin.symbol);

      cryptoContainer.appendChild(card);
    });

    renderWishlist(data);
    createPortfolioChart();
  }

  function renderWishlist(coins) {
    favList.innerHTML = "";
    const wishlist = getWishlist();

    wishlist.forEach(id => {
      const coin = coins.find(c => c.id === id);
      if (!coin) return;

      const li = document.createElement("li");
      li.innerHTML = `
        ${coin.name}
        <button class="remove">❌</button>
      `;

      li.querySelector(".remove").addEventListener("click", () => {
        let updated = wishlist.filter(c => c !== id);
        saveWishlist(updated);
        renderWishlist(coins);
        refreshHearts();
      });

      favList.appendChild(li);
    });
  }

  function createPortfolioChart() {
    const ctx = document.getElementById("portfolioChart");

    portfolioChart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["BTC", "ETH", "Others"],
        datasets: [{
          data: [40, 35, 25]
        }]
      }
    });
  }

  loadCrypto();
  loadChart("BINANCE:BTCUSDT");

});
