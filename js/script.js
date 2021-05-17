/* global bootstrap */
/* eslint no-param-reassign: ["error", { "props": false }] */
/* eslint no-console: ["error", { allow: ["warn", "error"] }] */
// eslint-disable-next-line func-names
const pokemonRepository = (function () {
  const pokemonList = [];
  const apiUrl = 'https://pokeapi.co/api/v2/pokemon/?limit=1118';
  let searchTerm = '';
  let pokemonModal;

  function getAll() {
    return pokemonList;
  }

  function add(pokemon) {
    if (!pokemon || typeof pokemon !== 'object') {
      return;
    }
    pokemonList.push(pokemon);
  }

  function showLoadingSpinner() {
    const loadingSpinner = document.createElement('div');
    loadingSpinner.classList.add('loading-spinner');

    const pList = document.querySelector('body');
    pList.appendChild(loadingSpinner);
  }

  function hideLoadingSpinner() {
    const loadingSpinner = document.querySelector('.loading-spinner');
    const pList = document.querySelector('body');

    pList.removeChild(loadingSpinner);
  }

  function loadDetails(pokemon) {
    // Don't fetch details multiple times
    if (pokemon.height) {
      return Promise.resolve();
    }

    showLoadingSpinner();

    return fetch(pokemon.detailsUrl)
      .then((res) => res.json())
      .then((data) => {
        pokemon.height = data.height;
        pokemon.weight = data.weight;
        pokemon.types = data.types;
        pokemon.imgUrl = data.sprites.front_default;
      })
      .catch((e) => {
        console.error(e);
      })
      .finally(() => {
        hideLoadingSpinner();
      });
  }

  function updateModalWithData(pokemon) {
    const modalTitle = document.querySelector('#modal-title');
    modalTitle.innerText = pokemon.name;

    const modalImage = document.querySelector('.modal-img');
    modalImage.src = pokemon.imgUrl;

    const modalText = document.querySelector('.modal-text');
    modalText.innerText = `Height: ${pokemon.height}\nWeight: ${pokemon.weight}`;
  }

  function showDetails(pokemon) {
    loadDetails(pokemon).then(() => {
      updateModalWithData(pokemon);
      // We need to manually trigger showing the modal to make sure data was correctly fetched
      // and applied before showing the modal.

      // If we used data-bs-toggle="modal" and data-bs-target="#pokemon-modal" as the trigger,
      // the modal would be shown instantly when hitting the button regardless of whether
      // we were done fetching the data or not.
      pokemonModal.show();
    });
  }

  function addListItem(pokemon) {
    const newButton = document.createElement('button');
    newButton.innerText = pokemon.name;
    newButton.classList.add('btn', 'btn-primary', 'w-100', 'text-capitalize');
    newButton.addEventListener('click', () => showDetails(pokemon));

    const listItem = document.createElement('li');
    listItem.classList.add('list-group-item');
    listItem.appendChild(newButton);

    const list = document.querySelector('.list-group');
    list.appendChild(listItem);
  }

  function loadList() {
    showLoadingSpinner();

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
        hideLoadingSpinner();
      });
  }

  function hideUnmatchedPokemon() {
    const listItems = document.querySelectorAll('.list-group-item');

    // Iterate over all pokemon and hide their corresponding list items in the DOM
    // if their names don't (at least partially) match the current search term
    pokemonList.forEach((pokemon, index) => {
      const isHidden = !pokemon.name.toUpperCase().includes(searchTerm.toUpperCase());
      listItems[index].classList.toggle('hidden', isHidden);
    });
  }

  function initModal() {
    // Create a bootstrap.Modal from our #pokemon-modal to give us greater
    // control over when to show it.
    const pokemonModalElement = document.querySelector('#pokemon-modal');
    pokemonModal = new bootstrap.Modal(pokemonModalElement, {});
  }

  function initSearchBar() {
    // Initialize the search bar by adding the event listener
    const searchBar = document.querySelector('#pokemon-search');
    searchBar.addEventListener('input', (e) => {
      searchTerm = e.target.value;
      hideUnmatchedPokemon();
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
