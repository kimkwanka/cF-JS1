/* eslint no-param-reassign: ["error", { "props": false }] */
/* eslint no-console: ["error", { allow: ["warn", "error"] }] */

// Lookup table for type weakness and strength
const TYPE_LUT = {
  normal: { weak: ['fighting'], strong: ['ghost'] },
  fire: { weak: ['ground', 'rock', 'water'], strong: ['bug', 'steel', 'fire', 'grass', 'ice', 'fairy'] },
  water: { weak: ['grass', 'electric'], strong: ['steel', 'fire', 'water', 'ice'] },
  grass: { weak: ['flying', 'poison', 'bug', 'fire', 'ice'], strong: ['ground', 'water', 'grass', 'electric'] },
  electric: { weak: ['ground'], strong: ['flying', 'steel', 'electric'] },
  ice: { weak: ['fighting', 'rock', 'steel', 'fire'], strong: ['ice'] },
  fighting: { weak: ['flying', 'psychic', 'fairy'], strong: ['rock', 'bug', 'dark'] },
  poison: { weak: ['ground', 'psychic'], strong: ['fighting', 'poison', 'bug', 'grass', 'fairy'] },
  ground: { weak: ['water', 'grass', 'ice'], strong: ['poison', 'rock', 'electric'] },
  flying: { weak: ['rock', 'electric', 'ice'], strong: ['fighting', 'bug', 'grass', 'ground'] },
  psychic: { weak: ['bug', 'ghost', 'dark'], strong: ['fighting', 'psychic'] },
  bug: { weak: ['flying', 'rock', 'fire'], strong: ['fighting', 'ground', 'grass'] },
  rock: { weak: ['fighting', 'ground', 'steel', 'water', 'grass'], strong: ['normal', 'flying', 'poison', 'fire'] },
  ghost: { weak: ['ghost', 'dark'], strong: ['poison', 'bug', 'normal', 'fighting'] },
  dark: { weak: ['fighting', 'bug', 'fairy'], strong: ['ghost', 'dark', 'psychic'] },
  dragon: { weak: ['ice', 'dragon', 'fairy'], strong: ['fire', 'water', 'grass', 'electric'] },
  steel: { weak: ['fighting', 'ground', 'fire'], strong: ['normal', 'flying', 'rock', 'bug', 'steel', 'grass', 'psychic', 'ice', 'dragon', 'fairy', 'poison'] },
  fairy: { weak: ['poison', 'steel'], strong: ['fighting', 'bug', 'dark', 'dragon'] },
};

// eslint-disable-next-line func-names
const pokemonRepository = (function () {
  const pokemonList = [];
  const apiUrl = 'https://pokeapi.co/api/v2/pokemon/?limit=151';
  let searchTerm = '';
  let isModalOpen = false;

  function getAll() {
    return pokemonList;
  }

  function add(pokemon) {
    if (!pokemon || typeof pokemon !== 'object') {
      return;
    }
    pokemonList.push(pokemon);
  }

  function showLoadingSpinner(parent) {
    const loadingSpinner = document.createElement('div');
    const loadingSpinnerClass = parent ? 'loading-spinner' : 'loading-spinner solo-spinner';
    loadingSpinner.className = loadingSpinnerClass;

    const loadingSpinnerParent = parent || document.querySelector('body');

    loadingSpinnerParent.appendChild(loadingSpinner);
    return loadingSpinner;
  }

  function hideLoadingSpinner(loadingSpinner) {
    loadingSpinner.remove();
  }

  function fetchBasicInfo(pokemon) {
    return fetch(pokemon.detailsUrl)
      .then((res) => res.json())
      .then((data) => {
        pokemon.id = data.id;
        pokemon.speciesUrl = data.species.url;
        pokemon.height = data.height;
        pokemon.weight = data.weight;
        pokemon.types = data.types;
        pokemon.imgUrl = data.sprites.front_default;
      })
      .catch((e) => {
        console.error(e);
      });
  }

  function fetchDetails(pokemon) {
    // Don't fetch details multiple times
    if (pokemon.flavorText) {
      return Promise.resolve();
    }

    return fetch(pokemon.speciesUrl)
      .then((res) => res.json())
      .then((data) => {
        pokemon.flavorText = data.flavor_text_entries[0].flavor_text;
        // Filter out linebreaks and other weird characters that the API spits out
        pokemon.flavorText = pokemon.flavorText.replace(/[^a-zA-Z é.!?,]/g, ' ');
      })
      .catch((e) => {
        console.error(e);
      });
  }

  function updateModalWithData(pokemon) {
    const modalId = document.querySelector('.modal-id');
    modalId.innerText = `#${pokemon.id}`;

    const modalName = document.querySelector('.modal-name');
    modalName.innerText = pokemon.name;

    const modalTypes = document.querySelector('.modal-types');
    // Remove all children by replacing them with a single text node.
    // textContent has much better performance than innerHTML because
    // its value is not parsed as HTML.
    // (check https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent)
    modalTypes.textContent = null;
    pokemon.types.forEach((t) => {
      const typeTag = document.createElement('p');
      typeTag.classList.add('modal-tag', t.type.name);
      typeTag.innerText = t.type.name;
      modalTypes.appendChild(typeTag);
    });

    const mainType = pokemon.types[0].type.name;

    const modalImage = document.querySelector('.modal-img');
    modalImage.src = pokemon.imgUrl;
    modalImage.alt = pokemon.name;
    modalImage.className = `modal-img gradient--${mainType}`;

    const modalHeight = document.querySelector('#modal-height');
    modalHeight.innerText = `${pokemon.height * 10}cm`;

    const modalWeight = document.querySelector('#modal-weight');
    modalWeight.innerText = `${pokemon.weight / 10}kg`;

    const modalFlavorText = document.querySelector('.modal-flavor-text');
    modalFlavorText.innerText = pokemon.flavorText;

    const modalWeaknesses = document.querySelector('.modal-weaknesses');
    // Remove all children by replacing them with a single text node.
    modalWeaknesses.textContent = null;

    let weakAgainst = [];
    let strongAgainst = [];

    pokemon.types.forEach((type) => {
      const typeName = type.type.name;
      weakAgainst = weakAgainst.concat(TYPE_LUT[typeName].weak);
      strongAgainst = strongAgainst.concat(TYPE_LUT[typeName].strong);
    });

    const filteredWeaknesses = weakAgainst.filter((weakness, index) => {
      const isNotNullified = !strongAgainst.includes(weakness);
      const isNoDuplicate = index === weakAgainst.indexOf(weakness);

      return isNotNullified && isNoDuplicate;
    });

    filteredWeaknesses.forEach((weakness) => {
      const weaknessTag = document.createElement('p');
      weaknessTag.classList.add('modal-tag', weakness);
      weaknessTag.innerText = weakness;
      modalWeaknesses.appendChild(weaknessTag);
    });
  }

  function showModal() {
    const modalContainer = document.querySelector('#modal-container');
    modalContainer.classList.add('is-visible');

    const modal = document.querySelector('.modal');
    modal.classList.add('is-visible');

    isModalOpen = true;
  }

  function hideModal() {
    const modalContainer = document.querySelector('#modal-container');
    modalContainer.classList.remove('is-visible');
    const modal = document.querySelector('.modal');
    modal.classList.remove('is-visible');
    isModalOpen = false;
  }

  function showDetails(pokemon) {
    if (isModalOpen) {
      return;
    }

    const loadingSpinner = showLoadingSpinner();

    fetchDetails(pokemon)
      .then(() => {
        updateModalWithData(pokemon);
        // We need to manually trigger the modal to make sure data was correctly fetched
        // and applied before showing the modal.

        // If we used data-bs-toggle="modal" and data-bs-target="#pokemon-modal" as the trigger,
        // the modal would be shown instantly when hitting the button regardless of whether
        // we were done fetching the data or not.
        showModal();
      })
      .finally(() => {
        hideLoadingSpinner(loadingSpinner);
      });
  }

  function addListItem(pokemon) {
    const newCard = document.createElement('li');
    newCard.classList.add('pokemon-card');
    newCard.addEventListener('click', () => showDetails(pokemon));
    newCard.addEventListener('keydown', (e) => {
      if (e.keyCode === 13) {
        showDetails(pokemon);
      }
    });
    newCard.tabIndex = '0';

    const name = document.createElement('h2');
    name.classList.add('card-name');
    name.innerText = pokemon.name;
    newCard.appendChild(name);

    const list = document.querySelector('.pokemon-list');
    list.appendChild(newCard);

    const loadingSpinner = showLoadingSpinner(newCard);

    fetchBasicInfo(pokemon)
      .then(() => {
        const mainType = pokemon.types[0].type.name;
        newCard.classList.add(`gradient--${mainType}`);
        name.classList.add(mainType);

        pokemon.types.forEach((t) => {
          const typeTag = document.createElement('p');
          typeTag.classList.add('card-tag', t.type.name);
          typeTag.innerText = t.type.name;
          newCard.appendChild(typeTag);
        });

        const img = document.createElement('img');
        img.classList.add('card-img');
        img.onload = () => {
          hideLoadingSpinner(loadingSpinner);
        };
        img.onerror = () => {
          hideLoadingSpinner(loadingSpinner);
        };
        img.src = pokemon.imgUrl;
        img.alt = pokemon.name;
        newCard.appendChild(img);

        const id = document.createElement('h3');
        id.classList.add('card-id');
        id.innerText = `#${pokemon.id}`;
        newCard.appendChild(id);
      })
      .catch((e) => {
        console.error(e);
      });
  }

  function loadList() {
    const loadingSpinner = showLoadingSpinner();

    // Try to fetch the list of pokemon from the given apiURL
    return fetch(apiUrl)
      .then((res) => res.json())
      .then((data) => {
        data.results.forEach(({ name, url }) => add({ name, detailsUrl: url }));
      })
      .catch((e) => {
        console.error(e);
      })
      .finally(() => {
        hideLoadingSpinner(loadingSpinner);
      });
  }

  function hideUnmatchedPokemon() {
    const listItems = document.querySelectorAll('.pokemon-card');

    // Iterate over all pokemon and hide their corresponding list items in the DOM
    // if their names don't (at least partially) match the current search term
    pokemonList.forEach((pokemon, index) => {
      const isHidden = !pokemon.name.toUpperCase().includes(searchTerm.toUpperCase());
      listItems[index].classList.toggle('hidden', isHidden);
    });
  }

  function initModal() {
    // Initialize modal by adding the event listeners
    const modalContainer = document.querySelector('#modal-container');
    modalContainer.addEventListener('click', (e) => {
      if (e.target === modalContainer) {
        hideModal();
      }
    });

    const modalCloseButton = document.querySelector('.modal-close');
    modalCloseButton.addEventListener('click', hideModal);
  }

  function initSearchBar() {
    // Initialize the search bar by adding the event listener
    const searchBar = document.querySelector('#pokemon-search');
    searchBar.addEventListener('input', (e) => {
      searchTerm = e.target.value;
      hideUnmatchedPokemon();
    });
  }

  function initWindow() {
    // Initialize the search bar by adding the event listener
    window.addEventListener('keydown', (e) => {
      const modalContainer = document.querySelector('#modal-container');
      if (e.key === 'Escape' && modalContainer.classList.contains('is-visible')) {
        hideModal();
      }
    });
  }

  function initialize() {
    return loadList()
      .then(() => {
        getAll().forEach((pokemon) => {
          addListItem(pokemon);
        });
        initModal();
        initSearchBar();
        initWindow();
      })
      .catch((e) => {
        console.error(e);
      });
  }

  return {
    initialize,
  };
}());

pokemonRepository.initialize();
