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
  let modalIsOpen = false;
  let modalWasOpenedByKeyboard = false;
  let lastFocusedElement = null;
  let observer = null;

  // Return the list of all pokemon
  function getAll() {
    return pokemonList;
  }

  // Add a pokemon to the list
  function add(pokemon) {
    if (!pokemon || typeof pokemon !== 'object') {
      return;
    }
    pokemonList.push(pokemon);
  }

  // Show a loading spinner.
  // If a parent node is provided, the spinner will be attached to it,
  // if not - we attach to <body> instead.
  function showLoadingSpinner(parent) {
    const loadingSpinner = document.createElement('div');
    // If we have no parent and therefore attach to <body>, we add an additional
    // CSS class that scales the spinner 3x and uses position: fixed, instead of absolute.
    const loadingSpinnerClass = parent ? 'loading-spinner' : 'loading-spinner solo-spinner';
    loadingSpinner.className = loadingSpinnerClass;

    const loadingSpinnerParent = parent || document.querySelector('body');

    loadingSpinnerParent.appendChild(loadingSpinner);
    return loadingSpinner;
  }

  // Hide a loading spinner
  function hideLoadingSpinner(loadingSpinner) {
    loadingSpinner.remove();
  }

  // Fetch basic information about a given pokemon.
  // (Needed for displaying a pokemon-card)
  // This will be lazy-ly called by the observer, once
  // a card becomes visible on the screen.
  function fetchBasicInfo(pokemon) {
    return fetch(pokemon.detailsUrl)
      .then((res) => res.json())
      .then((data) => {
        pokemon.id = data.id;
        pokemon.speciesUrl = data.species.url;
        pokemon.height = data.height;
        pokemon.weight = data.weight;
        pokemon.types = data.types;
        pokemon.mainType = pokemon.types[0].type.name;
        pokemon.imgUrl = data.sprites.front_default;
      })
      .catch((e) => {
        console.error(e);
      });
  }

  // Fetch detailed information about a given pokemon.
  // (Needed for modal display)
  // This will be called when trying to show the details modal.
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

  // Update the modal's elements with data for a given pokemon.
  function updateModalWithData(pokemon) {
    // Id (= Pokédex index)
    const modalId = document.querySelector('.modal-id');
    modalId.innerText = `#${pokemon.id}`;

    // Name
    const modalName = document.querySelector('.modal-name');
    modalName.innerText = pokemon.name;

    // Type(s)
    const modalTypes = document.querySelector('.modal-types');
    // Remove all children by replacing them with a single text node.
    // textContent has much better performance than innerHTML because
    // its value is not parsed as HTML.
    // (check https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent)
    modalTypes.textContent = null;

    // Add a tag for each type a pokemon possesses
    pokemon.types.forEach((t) => {
      const typeTag = document.createElement('p');
      typeTag.classList.add('modal-tag', t.type.name);
      typeTag.innerText = t.type.name;
      modalTypes.appendChild(typeTag);
    });

    // Image
    const modalImage = document.querySelector('.modal-img');
    modalImage.src = pokemon.imgUrl;
    modalImage.alt = pokemon.name;
    modalImage.className = `modal-img gradient--${pokemon.mainType}`;

    // Height and weight
    const modalHeight = document.querySelector('#modal-height');
    modalHeight.innerText = `${pokemon.height * 10}cm`;

    const modalWeight = document.querySelector('#modal-weight');
    modalWeight.innerText = `${pokemon.weight / 10}kg`;

    // Flavor text
    const modalFlavorText = document.querySelector('.modal-flavor-text');
    modalFlavorText.innerText = pokemon.flavorText;

    // Type weaknesses
    const modalWeaknesses = document.querySelector('.modal-weaknesses');
    // Remove all children by replacing them with a single text node.
    modalWeaknesses.textContent = null;

    let weakAgainst = [];
    let strongAgainst = [];

    // Gather all weaknesses and strengths of each of the pokemon's types
    // from our look up table TYPE_LUT.
    pokemon.types.forEach((type) => {
      const typeName = type.type.name;
      weakAgainst = weakAgainst.concat(TYPE_LUT[typeName].weak);
      strongAgainst = strongAgainst.concat(TYPE_LUT[typeName].strong);
    });

    // Remove a type weakness if it is nullified
    // (the pokemon is simultaneously weak and strong against it)
    // or if it's a duplicate.
    const filteredWeaknesses = weakAgainst.filter((weakness, index) => {
      const isNotNullified = !strongAgainst.includes(weakness);
      const isNoDuplicate = index === weakAgainst.indexOf(weakness);

      return isNotNullified && isNoDuplicate;
    });

    // Add a tag for each of the remaining weaknesses
    filteredWeaknesses.forEach((weakness) => {
      const weaknessTag = document.createElement('p');
      weaknessTag.classList.add('modal-tag', weakness);
      weaknessTag.innerText = weakness;
      modalWeaknesses.appendChild(weaknessTag);
    });
  }

  // Show the modal
  function showModal() {
    const modalContainer = document.querySelector('#modal-container');
    modalContainer.classList.add('is-visible');

    modalIsOpen = true;

    if (modalWasOpenedByKeyboard) {
      // Save the currently focused element for later and focus the modal's close button
      lastFocusedElement = document.activeElement;
      const modalCloseButton = document.querySelector('.modal-close');
      modalCloseButton.focus();
    }
  }

  // Hide the modal
  function hideModal() {
    const modalContainer = document.querySelector('#modal-container');
    modalContainer.classList.remove('is-visible');

    modalIsOpen = false;

    if (modalWasOpenedByKeyboard) {
      modalWasOpenedByKeyboard = false;
      // Return focus to the element that was focused before opening the modal
      lastFocusedElement.focus();
    }
  }

  // Fetches pokemon details and presents them
  // in a modal.
  function showDetails(pokemon) {
    // Do nothing if the modal is already open
    if (modalIsOpen) {
      return;
    }

    // Show a loading spinner as while we're
    // fetching the pokemon details
    const loadingSpinner = showLoadingSpinner();

    fetchDetails(pokemon)
      .then(() => {
        // Once we're done loading, prepare the modal
        // and show it
        updateModalWithData(pokemon);
        showModal();
      })
      .finally(() => {
        // Hide the loading spinner
        hideLoadingSpinner(loadingSpinner);
      });
  }

  // Fill out a blank card with a given pokemon's data
  function fillPokemonCardWithData(newCard, pokemon) {
    // Add the pokemon's name
    const name = document.createElement('h2');
    name.classList.add('card-name');
    name.innerText = pokemon.name;
    newCard.appendChild(name);

    // Color the card itself and the name text background according to
    // the pokemon's type
    newCard.classList.add(`gradient--${pokemon.mainType}`);
    name.classList.add(pokemon.mainType);

    // Add a tag for each type
    pokemon.types.forEach((t) => {
      const typeTag = document.createElement('p');
      typeTag.classList.add('card-tag', t.type.name);
      typeTag.innerText = t.type.name;
      newCard.appendChild(typeTag);
    });

    // Add the pokemon's image and hide the loading spinner
    // once it is done loading
    const img = document.createElement('img');
    img.classList.add('card-img');
    img.onload = () => {
      hideLoadingSpinner(newCard.loadingSpinner);
    };
    img.onerror = () => {
      hideLoadingSpinner(newCard.loadingSpinner);
    };
    img.src = pokemon.imgUrl;
    img.alt = pokemon.name;
    newCard.appendChild(img);

    // Add the pokemon's id (= Pokédex index)
    const id = document.createElement('h3');
    id.classList.add('card-id');
    id.innerText = `#${pokemon.id}`;
    newCard.appendChild(id);
  }

  // Create a blank pokemon-card that will lazy-ly load
  // its data when it becomes visible on the screen
  function createPokemonCard(pokemon) {
    const newCard = document.createElement('li');
    newCard.classList.add('pokemon-card');

    // Attach event listeners to showDetails() on click or key input
    newCard.addEventListener('click', () => showDetails(pokemon));
    newCard.addEventListener('keydown', (e) => {
      // [ENTER] or [SPACE] key
      if (e.keyCode === 13 || e.keyCode === 32) {
        // We need to preventDefault() to stop this event from also triggering
        // the modal-close button's click handler
        e.preventDefault();
        modalWasOpenedByKeyboard = true;
        showDetails(pokemon);
      }
    });

    // Make the card tabbable
    newCard.tabIndex = '0';

    // Create a function that will later be called by the observer
    // to load the pokemon data once the card is visible on screen.
    newCard.lazyLoad = () => {
      fetchBasicInfo(pokemon)
        .then(() => {
          // Fill the card with the pokemon's information
          fillPokemonCardWithData(newCard, pokemon);
        })
        .catch((e) => {
          console.error(e);
        });
    };
    // Add the card to the observer's list of observed entries, so
    // that it can call lazyLoad() once the card is visible.
    observer.observe(newCard);

    // Show a loading spinner as long as we're not done
    // loading the data and image
    newCard.loadingSpinner = showLoadingSpinner(newCard);

    return newCard;
  }

  // Adds a list item (pokemon-card) to our pokemon-list element
  function addListItem(pokemon) {
    // Create a blank card and add it to the list
    const newCard = createPokemonCard(pokemon);

    const list = document.querySelector('.pokemon-list');
    list.appendChild(newCard);
  }

  // Fetches the list of pokemon from the API
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

  // Hide pokemon-cards for pokemon that don't match the search term
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
    // Initialize modal by adding event listeners
    const modalContainer = document.querySelector('#modal-container');
    modalContainer.addEventListener('click', (e) => {
      if (e.target === modalContainer && modalIsOpen) {
        hideModal();
      }
    });

    const modalCloseButton = document.querySelector('.modal-close');
    modalCloseButton.addEventListener('click', () => {
      hideModal();
    });
  }

  // Initialize the search bar by adding the event listener
  function initSearchBar() {
    const searchBar = document.querySelector('#pokemon-search');
    searchBar.addEventListener('input', (e) => {
      searchTerm = e.target.value;
      hideUnmatchedPokemon();
    });
  }

  // Create an IntersectionObserver to lazy load the pokemon-cards.
  function createObserver() {
    observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Once a pokemon-card is visible on screen load the pokemon's data
          // and stop observing that card.
          entry.target.lazyLoad();
          observer.unobserve(entry.target);
        }
      });
    });
    return observer;
  }

  // Initialize the global window object by adding event listeners
  function initWindow() {
    window.addEventListener('keydown', (e) => {
      // [ESCAPE] key
      if (e.keyCode === 27 && modalIsOpen) {
        // Close the modal on hitting [ESCAPE]
        hideModal();
      }
      // [TAB] key
      if (e.keyCode === 9 && modalWasOpenedByKeyboard) {
        // Trap focus inside the modal as long as it is open but only when it was opened by keyboard
        if (e.preventDefault) {
          e.preventDefault();
        }
      }
    });
  }

  function initialize() {
    // Create the IntersectionObserver
    createObserver();
    // Load the list of pokemon from the API
    return loadList()
      .then(() => {
        // Create DOM elements for each pokemon
        getAll().forEach((pokemon) => {
          addListItem(pokemon);
        });
        // Initialization
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

// Initialize the app
pokemonRepository.initialize();
