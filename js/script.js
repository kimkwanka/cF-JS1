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

  return {
    getAll,
    add,
    find,
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

const bigBoiStr = ' - Wow, that\'s big!';
let gotBigBoi = false;

pokemonRepository.getAll().forEach((pokemon) => {
  const { name, height } = pokemon;

  // Add special suffix if pokemon is a big boi and it's the first one
  const suffixStr = (height > 1.0 && !gotBigBoi) ? bigBoiStr : '';
  gotBigBoi = gotBigBoi || suffixStr !== '';

  document.write(`<h2>${name} (height:${height})${suffixStr}</h2>`);
});
