document.addEventListener("DOMContentLoaded", function () {
  const caughtSection = document.getElementById("caught-section");
  const pokemonGrid = document.getElementById("pokemon-grid");
  const modal = document.getElementById("modal");
  const modalContent = document.getElementById("modal-content");
  const loadMoreBtn = document.getElementById("load-more-btn");
  let offset = 0;

  async function fetchPokemon() {
    const response = await fetch(
      `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=20`
    );
    const data = await response.json();
    return data.results;
  }

  function displayPokemon(pokemonList) {
    pokemonList.forEach((pokemon) => {
      const pokemonCard = createPokemonCard(pokemon);
      pokemonGrid.appendChild(pokemonCard);
    });
  }

  function createPokemonCard(pokemon) {
    const pokemonCard = document.createElement("div");
    pokemonCard.classList.add("pokemon-card");
    pokemonCard.innerHTML = `
          <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${extractIdFromUrl(
            pokemon.url
          )}.png" alt="${pokemon.name}">
          <p>${pokemon.name}</p>
      `;
    pokemonCard.addEventListener("click", () => showPokemonDetails(pokemon));
    return pokemonCard;
  }

  loadMoreBtn.addEventListener("click", async () => {
    offset += 20;
    const morePokemon = await fetchPokemon();
    displayPokemon(morePokemon);
  });

  async function showPokemonDetails(pokemon) {
    const response = await fetch(pokemon.url);
    const data = await response.json();
    modalContent.innerHTML = `
          <h2>${pokemon.name}</h2>
          <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${extractIdFromUrl(
            pokemon.url
          )}.png" alt="${pokemon.name}">
          <button class="catch-btn" data-pokemon-name="${pokemon.name}">Catch</button>
          <p><strong>Abilities:</strong> ${data.abilities
            .map((ability) => ability.ability.name)
            .join(", ")}</p>
          <p><strong>Types:</strong> ${data.types
            .map((type) => type.type.name)
            .join(", ")}</p>
          <!-- Add more details here as needed -->
      `;
    modal.style.display = "block";
    overlay.style.display = "block";

    const catchBtn = modalContent.querySelector(".catch-btn");
    const pokemonName = catchBtn.dataset.pokemonName;
    const isCaught = isPokemonCaught(pokemonName);
    if (isCaught) {
      catchBtn.disabled = true;
    } else {
      catchBtn.disabled = false;
    }

    catchBtn.addEventListener("click", () => catchPokemon(pokemon));
  }

  function catchPokemon(pokemon) {
    const caughtPokemonCard = createPokemonCard(pokemon);
    const pokemonName = pokemon.name;
    const catchBtn = modalContent.querySelector(".catch-btn");

    catchBtn.disabled = true;

    savePokemonCaughtStatus(pokemonName, true);

    const removeButton = document.createElement("button");
    removeButton.textContent = "Remove";
    removeButton.classList.add("remove-btn");
    removeButton.addEventListener("click", function() {
      caughtSection.removeChild(caughtPokemonCard);
      savePokemonCaughtStatus(pokemonName, false);
    });
    
    caughtPokemonCard.appendChild(removeButton);
    
    caughtSection.appendChild(caughtPokemonCard);
    
    saveToLocalStorage();
  }

  function isPokemonCaught(pokemonName) {
    const caughtPokemonData = JSON.parse(localStorage.getItem("caughtPokemon")) || [];
    return caughtPokemonData.some(pokemon => pokemon.name === pokemonName);
  }

  function savePokemonCaughtStatus(pokemonName, isCaught) {
    let caughtPokemonData = JSON.parse(localStorage.getItem("caughtPokemon")) || [];
    if (isCaught) {
      caughtPokemonData.push({ name: pokemonName });
    } else {
      caughtPokemonData = caughtPokemonData.filter(pokemon => pokemon.name !== pokemonName);
    }
    localStorage.setItem("caughtPokemon", JSON.stringify(caughtPokemonData));
  }

  function closeModal() {
    modal.style.display = "none";
    overlay.style.display = "none";
  }

  modal.addEventListener("click", function (event) {
    if (
      event.target === modal ||
      event.target.classList.contains("close-btn")
    ) {
      closeModal();
    }
  });

  function extractIdFromUrl(url) {
    const id = url.split("/").reverse()[1];
    return id;
  }

  overlay.addEventListener("click", function () {
    closeModal();
  });

  function saveToLocalStorage() {
    const caughtPokemonCards = caughtSection.querySelectorAll(".pokemon-card");
    const caughtPokemonData = Array.from(caughtPokemonCards).map(card => {
      return {
        name: card.querySelector("p").textContent,
        imageUrl: card.querySelector("img").src
      };
    });
    localStorage.setItem("caughtPokemon", JSON.stringify(caughtPokemonData));
  }

  function loadFromLocalStorage() {
    const caughtPokemonData = JSON.parse(localStorage.getItem("caughtPokemon"));
    if (caughtPokemonData) {
      caughtPokemonData.forEach(pokemon => {
        const pokemonCard = document.createElement("div");
        pokemonCard.classList.add("pokemon-card");
        pokemonCard.innerHTML = `
          <img src="${pokemon.imageUrl}" alt="${pokemon.name}">
          <p>${pokemon.name}</p>
        `;
        
        const removeButton = document.createElement("button");
        removeButton.textContent = "Remove";
        removeButton.classList.add("remove-btn");
        removeButton.addEventListener("click", function() {
          caughtSection.removeChild(pokemonCard);
          saveToLocalStorage();
        });
        
        pokemonCard.appendChild(removeButton);
        
        caughtSection.appendChild(pokemonCard);
      });
    }
  }

  loadFromLocalStorage();

  fetchPokemon().then((pokemonList) => displayPokemon(pokemonList));
});
