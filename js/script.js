// eslint-disable-next-line func-names
const pokemonRepository = (function () {
  const pokemonList = [];

  pokemonList[0] = {
    name: 'Bulbasaur',
    height: 0.7,
    types: ['grass', 'poison'],
  };

  pokemonList.push({
    name: 'Charizard',
    height: 1.7,
    types: ['fire', 'flying'],
  });

  function getAll() {
    return pokemonList;
  }

  function add(pokemon) {
    if (!pokemon || typeof pokemon !== 'object') {
      return;
    }
    const expectedKeys = ['name', 'height', 'types'];

    // Filter out all [key, value] pairs that are not expected
    const filteredEntries = Object.entries(pokemon).filter(([k, _]) => expectedKeys.includes(k));

    // Don't add the pokemon if the number of keys after filtering differs from expectation
    if (filteredEntries.length !== expectedKeys.length) {
      return;
    }

    // Reconstruct the pokemon from the filtered entries
    const filteredPokemon = Object.fromEntries(filteredEntries);

    pokemonList.push(filteredPokemon);
  }

  function find(nameToFind) {
    return pokemonList.filter(({ name }) => name === nameToFind)[0];
  }

  function addListItem(pokemon) {
    const newButton = document.createElement('button');
    newButton.innerText = pokemon.name;
    newButton.classList.add('pokemon-button');
    newButton.addEventListener('click', () => this.showDetails(pokemon));

    const listItem = document.createElement('li');
    listItem.appendChild(newButton);

    const list = document.querySelector('.pokemon-list');
    list.appendChild(listItem);
  }

  function showDetails(pokemon) {
    // eslint-disable-next-line no-console
    console.log(pokemon);
  }

  return {
    getAll,
    add,
    find,
    addListItem,
    showDetails,
  };
}());

// Try to add pokemon with invalid keys
pokemonRepository.add({
  name: 'Squirtle',
  height: 1.5,
  types: ['water'],
  invalidKey1: '',
  invalidKey2: 123123,
});

// Try to add pokemon with no height
pokemonRepository.add({
  name: 'Squirtle2',
  types: ['water'],
  invalidKey1: '',
  invalidKey2: 123123,
});

pokemonRepository.add(null);

pokemonRepository.getAll().forEach((pokemon) => {
  pokemonRepository.addListItem(pokemon);
});
