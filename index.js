document.addEventListener("DOMContentLoaded", function () {
  const checkbox = document.getElementById("check-5");

  // Set initial mode based on localStorage or default to dark mode
  if (localStorage.getItem("mode") === "light") {
    document.body.classList.remove("dark-mode");
    document.body.classList.add("light-mode");
    checkbox.checked = false;
  } else {
    document.body.classList.remove("light-mode");
    document.body.classList.add("dark-mode");
    checkbox.checked = true;
  }

  // Add an event listener to toggle the mode
  checkbox.addEventListener("change", function () {
    if (this.checked) {
      document.body.classList.remove("light-mode");
      document.body.classList.add("dark-mode");
      localStorage.setItem("mode", "dark"); // Save preference
    } else {
      document.body.classList.remove("dark-mode");
      document.body.classList.add("light-mode");
      localStorage.setItem("mode", "light"); // Save preference
    }
  });
});

// Variables and constants
const API_KEY = "b60cc08e6973462ca389c6c1488c6ebc";
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const forbiddenKeywords = [
  "sex",
  "porn",
  "hentai",
  "erotic",
  "XXX",
  "incest",
  "rape",
  "milf",
  "lewd",
  "smut",
  "orgy",
  "masturbation",
  "voyeur",
  "penetration",
  "thrust",
];

// Remove HTML tags from a string
function removeHTMLTags(str) {
  let doc = new DOMParser().parseFromString(str, "text/html");
  return doc.body.textContent || "";
}

// Filter games that contain forbidden keywords in their title or description
function filterGamesByKeywords(game) {
  const title = game.name.toLowerCase();
  const description = game.description
    ? removeHTMLTags(game.description).toLowerCase()
    : "";
  return !forbiddenKeywords.some(
    (keyword) => title.includes(keyword) || description.includes(keyword)
  );
}

// Fetch games by month and display them in the calendar
function getGamesByMonth(year, month) {
  const formattedMonth = (month + 1).toString().padStart(2, "0");
  const startDate = `${year}-${formattedMonth}-01`;
  const endDate = `${year}-${formattedMonth}-${new Date(
    year,
    month + 1,
    0
  ).getDate()}`;

  fetch(
    `https://api.rawg.io/api/games?dates=${startDate},${endDate}&key=${API_KEY}`
  )
    .then((response) => {
      if (!response.ok)
        throw new Error("Network response was not ok: " + response.statusText);
      return response.json();
    })
    .then((data) => {
      let htmlContent = "";
      // Loop through each day of the month
      for (let i = 1; i <= new Date(year, month + 1, 0).getDate(); i++) {
        // Filter games that were released on that day and have a background image and don't contain forbidden keywords
        let gamesForDay = data.results.filter(
          (game) =>
            game.background_image &&
            new Date(game.released).getDate() === i &&
            new Date(game.released).getMonth() === month &&
            filterGamesByKeywords(game)
        );
        // Display the games in the calendar if there are any for that day
        if (gamesForDay.length > 0) {
          htmlContent += `
            <div class="date">
              <strong>${i}</strong>
              ${gamesForDay
                .map(
                  (game) => `
                <div class="game" data-id="${game.id}">
                  <img src="${game.background_image}" alt="${game.name} Thumbnail"/>
                  <div class="game-details">${game.name}</div>
                </div>
              `
                )
                .join("")}
            </div>
          `;
        }
      }
      // Display the games in the calendar
      document.getElementById("calendar").innerHTML = htmlContent;
      document.getElementById(
        "currentMonthYear"
      ).innerText = `${monthNames[month]} ${year}`;

      // Show or hide the back to current month button
      if (
        currentMonth !== new Date().getMonth() ||
        currentYear !== new Date().getFullYear()
      ) {
        document.getElementById("backToCurrentMonth").style.display = "block";
      } else {
        document.getElementById("backToCurrentMonth").style.display = "none";
      }
    })
    .catch((error) => console.error("Failed to fetch games:", error));
}

// Previous month
document.getElementById("prevMonth").addEventListener("click", () => {
  currentMonth--;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  getGamesByMonth(currentYear, currentMonth);
});

// Next month
document.getElementById("nextMonth").addEventListener("click", () => {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  getGamesByMonth(currentYear, currentMonth);
});

function formatDescription(description) {
  // Remove any existing HTML tags except for <br> to keep the line breaks
  const cleanedDescription = description.replace(/<\/?[^>]+(>|$)/g, (match) =>
    match.includes("<br") ? match : ""
  );

  // Split the description by <br> tags, accounting for multiple <br> in a row
  const paragraphs = cleanedDescription.split(/<br\s*\/?>/i);

  // Wrap each segment in a <p> or <h5> tag based on word count, and filter out any empty segments
  return paragraphs
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0)
    .map((paragraph) => {
      const words = paragraph.split(/\s+/).filter((word) => word.length > 0);
      if (words.length <= 10) {
        return `<h5 style="font-weight: bold;">${paragraph}</h5>`;
      } else {
        return `<p>${paragraph}</p>`;
      }
    })
    .join("");
}

// Event listener to open game details modal
document.getElementById("calendar").addEventListener("click", function (event) {
  let gameEl = event.target.closest(".game");
  if (gameEl) {
    const gameId = gameEl.getAttribute("data-id");
    fetch(`https://api.rawg.io/api/games/${gameId}?key=${API_KEY}`)
      .then((response) => {
        if (!response.ok)
          throw new Error(
            "Failed to fetch game details: " + response.statusText
          );
        return response.json();
      })
      .then((gameDetails) => {
        document.getElementById("gameTitle").innerText = gameDetails.name;
        document.getElementById("gameImage").src = gameDetails.background_image;
        document.getElementById("gameDescription").innerHTML =
          formatDescription(
            gameDetails.description || "No description available for this game."
          );
        const releaseDate = new Date(gameDetails.released);
        document.getElementById(
          "gameReleaseDate"
        ).innerText = `${releaseDate.getDate()} ${
          monthNames[releaseDate.getMonth()]
        } ${releaseDate.getFullYear()}`;
        document.getElementById("gameRating").innerText = gameDetails.rating;
        document.getElementById("gamePlatforms").innerText =
          gameDetails.platforms.map((p) => p.platform.name).join(", ");
        document.getElementById("gameModal").style.display = "block";
      })
      .catch((error) => console.error("Error loading game details:", error));
  }
});

// Close the game modal when the user clicks on the close button
document.querySelectorAll(".close").forEach((closeButton) => {
  closeButton.addEventListener("click", () => {
    closeButton.closest(".modal").style.display = "none";
  });
});

// Close the modal when the user clicks outside the modal
window.addEventListener("click", (event) => {
  if (event.target.classList.contains("modal")) {
    event.target.style.display = "none";
  }
});

// Back to current month
document.getElementById("backToCurrentMonth").addEventListener("click", () => {
  currentMonth = new Date().getMonth();
  currentYear = new Date().getFullYear();
  getGamesByMonth(currentYear, currentMonth);
});

// Open the About Modal
document.getElementById("button-about").addEventListener("click", () => {
  document.getElementById("about-modal").style.display = "block";
});

// Initialize the calendar
getGamesByMonth(currentYear, currentMonth);
