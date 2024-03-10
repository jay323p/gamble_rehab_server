const mongoose = require('mongoose');

const gameSchema = mongoose.Schema({
  userEmail: { type: String },
  savedGames: {
    type: Array,
  },
  savedGraphs: {
    type: Object,
    default: {
      line: [],
      pie: [],
      bar: [],
    },
  },
  cumulativeMoneyStats: {
    type: Object,
  },
});

const Game = mongoose.model('Game', gameSchema);

module.exports = Game;
