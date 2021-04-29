let pokemonList = [];

pokemonList[0] = {
  name: 'Bulbasaur',
  height: 0.7,
  type: ['grass', 'poison'],
};

pokemonList.push({
  name: 'Charmander',
  height: 0.6,
  type: ['fire'],
});

pokemonList = pokemonList.concat([{
  name: 'Squirtle',
  height: 0.5,
  type: ['water'],
}]);
