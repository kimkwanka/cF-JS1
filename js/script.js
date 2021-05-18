/* eslint no-param-reassign: ["error", { "props": false }] */
/* eslint no-console: ["error", { allow: ["warn", "error"] }] */
// eslint-disable-next-line func-names
const pokemonRepository = (function () {
  const pokemonList = [];
  const apiUrl = 'https://pokeapi.co/api/v2/pokemon/?limit=151';
  let searchTerm = '';

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
    loadingSpinner.classList.add('loading-spinner');

    parent.appendChild(loadingSpinner);
    return loadingSpinner;
  }

  function hideLoadingSpinner(loadingSpinner) {
    loadingSpinner.remove();
  }

  function loadDetails(pokemon) {
    // Don't fetch details multiple times
    if (pokemon.height) {
      return Promise.resolve();
    }

    return fetch(pokemon.detailsUrl)
      .then((res) => res.json())
      .then((data) => {
        pokemon.id = data.id;
        pokemon.height = data.height;
        pokemon.weight = data.weight;
        pokemon.types = data.types;
        pokemon.imgUrl = data.sprites.front_default;
      })
      .catch((e) => {
        console.error(e);
      });
  }

  function updateModalWithData(pokemon) {
    const modalTitle = document.querySelector('.modal-title');
    modalTitle.innerText = pokemon.name;

    const modalImage = document.querySelector('.modal-img');
    modalImage.src = pokemon.imgUrl;

    const modalText = document.querySelector('.modal-text');
    modalText.innerText = `Height: ${pokemon.height}\nWeight: ${pokemon.weight}`;
  }

  function showModal() {
    const modalContainer = document.querySelector('#modal-container');
    modalContainer.classList.add('is-visible');

    // Force reflow to trigger the dynamically created modal's CSS transition
    setTimeout(() => {
      const modal = document.querySelector('.modal');
      modal.classList.add('is-visible');
    }, 0);
  }

  function hideModal() {
    const modalContainer = document.querySelector('#modal-container');
    modalContainer.classList.remove('is-visible');
    const modal = document.querySelector('.modal');
    modal.classList.remove('is-visible');
  }

  function showDetails(pokemon) {
    loadDetails(pokemon).then(() => {
      updateModalWithData(pokemon);
      // We need to manually trigger the modal to make sure data was correctly fetched
      // and applied before showing the modal.

      // If we used data-bs-toggle="modal" and data-bs-target="#pokemon-modal" as the trigger,
      // the modal would be shown instantly when hitting the button regardless of whether
      // we were done fetching the data or not.
      showModal();
    });
  }

  function addListItem(pokemon) {
    const newCard = document.createElement('div');
    newCard.classList.add('pokemon-card');
    newCard.addEventListener('click', () => showDetails(pokemon));

    const name = document.createElement('p');
    name.classList.add('card-name');
    name.innerText = pokemon.name;
    newCard.appendChild(name);

    const list = document.querySelector('.pokemon-list');
    list.appendChild(newCard);

    const loadingSpinner = showLoadingSpinner(newCard);

    loadDetails(pokemon)
      .then(() => {
        newCard.classList.add(pokemon.types[0].type.name);
        name.classList.add(pokemon.types[0].type.name);

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
        newCard.appendChild(img);

        const id = document.createElement('p');
        id.classList.add('card-id');
        id.innerText = `#${pokemon.id}`;
        newCard.appendChild(id);
      })
      .catch((e) => {
        console.error(e);
      });
  }

  function loadList() {
    const body = document.querySelector('body');
    const loadingSpinner = showLoadingSpinner(body);

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
