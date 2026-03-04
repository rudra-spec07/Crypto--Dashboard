// Apply saved theme when page loads
document.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("theme");

  if (savedTheme === "light") {
    document.body.classList.add("light-theme");
  }
});

// Toggle Theme Function
function toggleTheme() {
  document.body.classList.toggle("light-theme");

  // Save theme
  if (document.body.classList.contains("light-theme")) {
    localStorage.setItem("theme", "light");
  } else {
    localStorage.setItem("theme", "dark");
  }
}
