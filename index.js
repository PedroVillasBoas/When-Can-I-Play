// Chave da API para acessar a API de jogos
const API_KEY = "b60cc08e6973462ca389c6c1488c6ebc";
// Mês e ano atual para carregar os jogos
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

// Função para remover tags HTML de uma string, útil para limpar descrições
function removeHTMLTags(str) {
  let doc = new DOMParser().parseFromString(str, "text/html");
  return doc.body.textContent || "";
}

// Função principal para buscar e exibir jogos de um mês específico
function getGamesByMonth(year, month) {
  // Formatação do mês para garantir dois dígitos (necessário para a API)
  const formattedMonth = (month + 1).toString().padStart(2, "0");
  // Constrói datas de início e fim do mês para a consulta API
  const startDate = `${year}-${formattedMonth}-01`;
  const endDate = `${year}-${formattedMonth}-${new Date(
    year,
    month + 1,
    0
  ).getDate()}`;

  // Exibe ou oculta botões de navegação dependendo se é o mês corrente
  document.getElementById("prevMonth").style.display =
    month <= new Date().getMonth() - 1 && year === new Date().getFullYear()
      ? "none"
      : "block";
  document.getElementById("nextMonth").style.display =
    month >= new Date().getMonth() + 1 && year === new Date().getFullYear()
      ? "none"
      : "block";

  // Requisição à API para buscar jogos do mês
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
      // Itera sobre cada dia do mês e adiciona jogos lançados naquele dia
      for (let i = 1; i <= new Date(year, month + 1, 0).getDate(); i++) {
        let gamesForDay = data.results.filter(
          (game) =>
            game.background_image &&
            new Date(game.released).getDate() === i &&
            new Date(game.released).getMonth() === month
        );
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
      document.getElementById("calendar").innerHTML = htmlContent;
      document.getElementById(
        "currentMonthYear"
      ).innerText = `${monthNames[month]} ${year}`;
    })
    .catch((error) => console.error("Failed to fetch games:", error));
}

// Lista de nomes de meses para exibição
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

// Adiciona interatividade aos botões de navegação mensal
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

// lida com cliques em jogos dinamicamente adicionados
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
        // Atualiza o modal com detalhes do jogo
        document.getElementById("gameTitle").innerText = gameDetails.name;
        document.getElementById("gameImage").src = gameDetails.background_image;
        document.getElementById("gameDescription").textContent = removeHTMLTags(
          gameDetails.description || "No description available for this game."
        );
        document.getElementById("gameReleaseDate").innerText =
          gameDetails.released;
        document.getElementById("gameRating").innerText = gameDetails.rating;
        document.getElementById("gamePlatforms").innerText =
          gameDetails.platforms.map((p) => p.platform.name).join(", ");
        document.getElementById("gameModal").style.display = "block";
      })
      .catch((error) => console.error("Error loading game details:", error));
  }
});

// Fecha o modal
document.querySelector(".close").addEventListener("click", () => {
  document.getElementById("gameModal").style.display = "none";
});

window.addEventListener("click", (event) => {
  if (event.target === document.getElementById("gameModal")) {
    document.getElementById("gameModal").style.display = "none";
  }
});

// Carrega os jogos do mês atual ao iniciar
getGamesByMonth(currentYear, currentMonth);
