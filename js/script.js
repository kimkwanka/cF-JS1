// eslint-disable-next-line func-names
const pokemonRepository = (function () {
  let pokemonList = [];

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

  pokemonList = pokemonList.concat([{
    name: 'Squirtle',
    height: 1.5,
    types: ['water'],
  }]);

  return {
    getAll() {
      return pokemonList;
    },
    add(pokemon) {
      if (typeof pokemon !== 'object') {
        return;
      }
      pokemonList.push(pokemon);
    },
  };
}());

const bigBoiStr = ' - Wow, that\'s big!';
let gotBigBoi = false;

pokemonRepository.getAll().forEach((pokemon) => {
  const { name, height } = pokemon;

  // Add special suffix if pokemon is a big boi and it's the first one
  const suffixStr = (height > 1.0 && !gotBigBoi) ? bigBoiStr : '';
  gotBigBoi = gotBigBoi || suffixStr !== '';

  document.write(`<h2>${name} (height:${height})${suffixStr}</h2>`);
});
