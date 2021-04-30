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

const bigBoiStr = ' - Wow, that\'s big!'; 
let gotBigBoi = false;

// Iterate over all pokemon in array and output to DOM
for (var i=0; i < pokemonList.length; i++) {
  const name = pokemonList[i].name;
  const height = pokemonList[i].height;

  // Add special suffix if pokemon is a big boi and it's the first one
  const suffixStr = (height > 1.0 && !gotBigBoi) ? bigBoiStr : '';
  gotBigBoi = suffixStr != '';

  document.write(`<h2>${name} (height:${height})${suffixStr}</h2>`)
}