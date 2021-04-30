let pokemonList = [];

pokemonList[0] = {
  name: 'Bulbasaur',
  height: 0.7,
  types: ['grass', 'poison'],
};

pokemonList.push({
  name: 'Charmander',
  height: 0.6,
  types: ['fire'],
});

pokemonList = pokemonList.concat([{
  name: 'Squirtle',
  height: 0.5,
  types: ['water'],
}]);
