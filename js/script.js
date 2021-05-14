/* eslint no-param-reassign: ["error", { "props": false }] */
/* eslint no-console: ["error", { allow: ["warn", "error"] }] */
// eslint-disable-next-line func-names
const pokemonRepository = (function () {
  const pokemonList = [];
  const apiUrl = 'https://pokeapi.co/api/v2/pokemon/?limit=1118';

  function getAll() {
    return pokemonList;
  }

  function add(pokemon) {
    if (!pokemon || typeof pokemon !== 'object') {
      return;
    }
    pokemonList.push(pokemon);
  }

  function find(nameToFind) {
    return pokemonList.filter(({ name }) => name === nameToFind)[0];
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

  function createModal(pokemon) {
    const modalContainer = document.querySelector('#modal-container');
    modalContainer.innerHTML = '';
    modalContainer.addEventListener('click', (e) => {
      if (e.target === modalContainer) {
        hideModal();
      }
    });

    const modal = document.createElement('div');
    modal.classList.add('modal');

    const modalTitle = document.createElement('h1');
    modalTitle.classList.add('modal-title');
    modalTitle.innerText = pokemon.name;

    const modalClose = document.createElement('button');
    modalClose.innerText = 'x';
    modalClose.classList.add('modal-close');
    modalClose.addEventListener('click', hideModal);

    const modalImage = document.createElement('img');
    modalImage.classList.add('modal-img');
    modalImage.src = pokemon.imgUrl;

    const modalText = document.createElement('p');
    modalText.classList.add('modal-text');
    modalText.innerText = `Height: ${pokemon.height}\nWeight: ${pokemon.weight}`;

    modal.appendChild(modalTitle);
    modal.appendChild(modalClose);
    modal.appendChild(modalImage);
    modal.appendChild(modalText);

    modalContainer.appendChild(modal);
  }

  function showDetails(pokemon) {
    loadDetails(pokemon).then(() => {
      createModal(pokemon);
      showModal();
    });
  }

  function addListItem(pokemon) {
    const newButton = document.createElement('button');
    newButton.innerText = pokemon.name;
    newButton.classList.add('pokemon-button');
    newButton.addEventListener('click', () => showDetails(pokemon));

    const listItem = document.createElement('li');
    listItem.appendChild(newButton);

    const list = document.querySelector('.pokemon-list');
    list.appendChild(listItem);
  }

  function loadList() {
    showLoadingSpinner();

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

  window.addEventListener('keydown', (e) => {
    const modalContainer = document.querySelector('#modal-container');
    if (e.key === 'Escape' && modalContainer.classList.contains('is-visible')) {
      hideModal();
    }
  });

  return {
    getAll,
    add,
    find,
    addListItem,
    showDetails,
    loadList,
  };
}());

pokemonRepository.loadList()
  .then(() => {
    pokemonRepository.getAll().forEach((pokemon) => {
      pokemonRepository.addListItem(pokemon);
    });
  })
  .catch((e) => {
    console.error(e);
  });
