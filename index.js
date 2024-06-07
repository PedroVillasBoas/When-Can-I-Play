const API_KEY = "b60cc08e6973462ca389c6c1488c6ebc";

let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

// Funcao para remover html as tags da string
function removeHTMLTags(str) {
  let doc = new DOMParser().parseFromString(input, "text/html");
  return doc.body.textContent || "";
}

// Funcao para pegar os jogos para um determinado mes e ano da API
function getGamesByMonth(year, month) {
  // Update do display style dos botoes de navegacao baseado na data atual
  document.getElementById("prevMonth").style.display =
    month <= new Date().getMonth() - 1 && year === new Date().getFullYear()
      ? "none"
      : "block";
  document.getElementById("nextMonth").style.display =
    month >= new Date().getMonth() + 1 && year === new Date().getFullYear()
      ? "none"
      : "block";

  // Fetch dos jogos da API
  fetch(
    `https://api.rawg.io/api/games?dates=${year}-${month + 1}-01,${year}-${
      month + 1
    }-30&key=${API_KEY}`
  )
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      // Filtro para incluir apenas os jogos que possuem alguma imagem
      let games = data.results.filter((game) => game.background_image);

      // Calcula a quantidade de dias no mes
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      let htmlContent = "";
      for (let i = 1; i <= daysInMonth; i++) {
        let gamesForday = games.filter(
          (game) => new Date(game.released).getDate() === i
        );

        htmlContent += `
                    <div class="date">
                        <strong>${i}</strong>
                        ${gamesForday
                          .map(
                            (game) => `
                            <div class="game" data-id="${game.id}">
                                <img src="${game.background_image}" alt="${game.name} Thumbnail"/>
                                <div class="game-details">${game.name}</div>
                        `
                          )
                          .join("")}
                    </div>
                `;
      }

      document.getElementById("calendar").innerHTML = htmlContent;
      document.getElementById(
        "currentMonthYear"
      ).innerText = `${monthNames[month]} ${year}`;

      // Listener para cada jogo abrir seu modal
      document.querySelectorAll(".game").forEach((gameEl) => {
        gameEl.addEventListener("click", () => {
          const gameId = gameEl.getAttribute("data-id");
          // Fetch dos detalhes do jogo
          fetch(`https://api.rawg.io/api/games/${gameId}?key=${API_KEY}`)
            .then((response) => {
              return response.json();
            })
            .then((gameDetails) => {
              document.getElementById("gameTitle").innerText = gameDetails.name;
              document.getElementById("gameImage").src =
                gameDetails.background_image;

              const descriptionElement = document.querySelector(
                ".modal-content p strong"
              );
              descriptionElement.nextSibling.nodeValue =
                " " +
                stripHtmlTags(
                  gameDetails.description ||
                    "No description available for this game."
                );

              document.getElementById("gameReleaseDate").innerText =
                gameDetails.released;
              document.getElementById("gameRating").innerText =
                gameDetails.rating;
              document.getElementById("gamePlatforms").innerText =
                gameDetails.platforms
                  .map((platform) => platform.platform.name)
                  .join(", ");
              document.getElementById("gameModal").style.display = "block";
            });
        });
      });
    });
}

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

document.getElementById("prevMonth").addEventListener("click", () => {
  currentMonth--;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  getGamesByMonth(currentYear, currentMonth);
});

document.getElementById("nextMonth").addEventListener("click", () => {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  getGamesByMonth(currentYear, currentMonth);
});

// Funcao para fechar o modal
document.querySelector(".close").addEventListener("click", () => {
  document.getElementById("gameModal").style.display = "none";
});

window.addEventListener("click", (event) => {
  if (event.target === document.getElementById("gameModal")) {
    document.getElementById("gameModal").style.display = "none";
  }
});

getGamesByMonth(currentYear, currentMonth);
