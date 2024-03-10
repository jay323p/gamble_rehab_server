const asyncHandler = require('express-async-handler');
const Game = require('../models/gameModel');
const jwt = require('jsonwebtoken');
const { tempPieData } = require('../data/graphData');

// SAVE GAME  -------------------------------------------------------------------------------------------
const saveUserGame = asyncHandler(async (req, res) => {
  const { game, history, moneyStats, userEmail } = req.body;

  if (!game || history.length === 0 || !userEmail) {
    res.status(400);
    throw new Error(
      'Unable to save game session! Please make sure you are logged in and have some history playing the game before saving.'
    );
  }

  // find user-game-db-entry ? update db-entry : create new one
  const userGameHistory = await Game.findOne({ userEmail });

  if (!userGameHistory) {
    //   init savedGames start
    const savedGames = [];
    const gameObj = {
      game,
      history,
      moneyStats,
    };
    savedGames.push(gameObj);
    //   init savedGames end

    const cumulativeMoneyStats = moneyStats;

    //   INIT SAVEDGRAPHS START --------------------------------------------------------------------------
    // line graph *****************************
    const savedGraphs = [];
    const gameNumber = 1;
    let type = 'Line';
    let lineData = [];
    for (let i = 0; i < history.length; i++) {
      let obj = { x: 0, y: 0 };
      obj.x = i;
      obj.y = history[i].payout;
      lineData.push(obj);
    }
    const lineGraphObj = {
      game,
      type,
      id: `Game-${gameNumber}`,
      lineData,
      color: 'hsl(335, 70%, 50%)',
    };
    const line = [lineGraphObj];
    // line graph *****************************
    //   bar graph %%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    const initBarGraph = [];
    let barGraphObj = {
      gameType: game,
      gameNumber: 1,
      won: moneyStats.won,
      wonColor: 'hsl(150, 70%, 50%)',
      wagered: moneyStats.wagered,
      wageredColor: 'hsl(272, 70%, 50%)',
      profit: moneyStats.profit,
      profitColor: 'hsl(236, 70%, 50%)',
    };
    initBarGraph.push(barGraphObj);
    const bar = [initBarGraph];
    //   bar graph %%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    //   INIT SAVEDGRAPHS END ------------------------------------------------------------------------------

    //   CREATE
    const newUserGameHistory = await Game.create({
      userEmail,
      savedGames,
      savedGraphs: {
        line,
        bar,
        pie: [],
      },
      cumulativeMoneyStats,
    });
  } else {
    // UPDATE
    // line graph *****************************
    const matchingGameHistories = userGameHistory.savedGames.filter(
      (gameHistory) => gameHistory.game === game
    );
    const gameNumber = matchingGameHistories.length + 1;
    let type = 'Line';
    let lineData = [];
    for (let i = 0; i < history.length; i++) {
      let obj = { x: 0, y: 0 };
      obj.x = i;
      obj.y = history[i].payout;
      lineData.push(obj);
    }
    const lineGraphObj = {
      game,
      type,
      id: `Game-${gameNumber}`,
      lineData,
      color: 'hsl(335, 70%, 50%)',
    };

    userGameHistory.savedGraphs.line.push(lineGraphObj);
    // line graph *****************************
    //   game history ------------------------------
    const savedGames = userGameHistory.savedGames;
    const gameObj = { game, history, moneyStats };
    savedGames.push(gameObj);
    userGameHistory.savedGames = savedGames;
    const newWagered =
      userGameHistory.cumulativeMoneyStats.wagered + moneyStats.wagered;
    const newWon = userGameHistory.cumulativeMoneyStats.won + moneyStats.won;
    const newProfit =
      userGameHistory.cumulativeMoneyStats.profit + moneyStats.profit;
    const updatedMoneyStats = {
      wagered: newWagered,
      won: newWon,
      profit: newProfit,
    };
    userGameHistory.cumulativeMoneyStats = updatedMoneyStats;

    //   game history ------------------------------
    //   find pie graphs if any
    const pieGraph = userGameHistory.savedGraphs.pie;
    // create new pie graph **********************************
    if (pieGraph.length === 0) {
      const allSavedGames = userGameHistory.savedGames;
      for (let i = 0; i < allSavedGames.length; i++) {
        let matchingPieDataObj = tempPieData.find(
          (game, i) => game.id === allSavedGames[i].game
        );
        for (let j = 0; j < tempPieData.length; j++) {
          if (tempPieData[j].id === matchingPieDataObj.id) {
            tempPieData[j].value += allSavedGames[i].moneyStats.won;
          } else {
            continue;
          }
        }
      }
      // create new pie graph **********************************

      // SAVE
      userGameHistory.savedGraphs.pie.push(tempPieData);
      userGameHistory.markModified('savedGraphs');
      userGameHistory.markModified('savedGames');
      userGameHistory.markModified('cumulativeMoneyStats');
      await userGameHistory.save();
    } else {
      // update pie graph **********************************
      let pieGraph = userGameHistory.savedGraphs.pie[0];
      for (let i = 0; i < pieGraph.length; i++) {
        if (pieGraph[i].id === game) {
          pieGraph[i].value += moneyStats.won;
          userGameHistory.savedGraphs.pie = [];
          userGameHistory.savedGraphs.pie.push(pieGraph);
        }
      }
      // update pie graph **********************************
      console.log('update pie graph done');
    }
    // bar graph **********************************
    let barGraph = userGameHistory.savedGraphs.bar;
    let matchFound = false;
    for (let i = 0; i < barGraph.length; i++) {
      if (barGraph[i][0].gameType === game) {
        matchFound = true;
      }
    }

    if (matchFound) {
      for (let i = 0; i < barGraph.length; i++) {
        if (barGraph[i][0].gameType === game) {
          const gameNumber = barGraph[i].length + 1;
          let barGraphObj = {
            gameType: game,
            gameNumber,
            won: moneyStats.won,
            wonColor: 'hsl(150, 70%, 50%)',
            wagered: moneyStats.wagered,
            wageredColor: 'hsl(272, 70%, 50%)',
            profit: moneyStats.profit,
            profitColor: 'hsl(236, 70%, 50%)',
          };
          barGraph[i].push(barGraphObj);
        }
      }
    } else {
      const newBarGraphArray = [];
      const gameNumber = 1;
      let barGraphObject = {
        gameType: game,
        gameNumber,
        won: moneyStats.won,
        wonColor: 'hsl(150, 70%, 50%)',
        wagered: moneyStats.wagered,
        wageredColor: 'hsl(272, 70%, 50%)',
        profit: moneyStats.profit,
        profitColor: 'hsl(236, 70%, 50%)',
      };
      newBarGraphArray.push(barGraphObject);
      userGameHistory.savedGraphs.bar.push(newBarGraphArray);
      // bar graph **********************************
    }

    userGameHistory.markModified('savedGraphs');
    userGameHistory.markModified('savedGames');
    userGameHistory.markModified('cumulativeMoneyStats');
    await userGameHistory.save();
  }

  res.status(200).json(userGameHistory);
});

const getAllGamesAndGraphs = asyncHandler(async (req, res) => {
  const { email } = req.body;
  console.log('req.user -------------------');
  console.log(email);

  if (!email) {
    res.status(404);
    throw new Error(
      'Unable to locate user game data. Please refresh the page or log in again!'
    );
  }

  const userGameHistory = await Game.findOne({ userEmail: email });

  if (!userGameHistory) {
    res.status(400);
    throw new Error(
      "No game data found! Please ensure you have played and saved game history through resetting the respective game's history!"
    );
  }

  const sendObj = {
    savedGames: userGameHistory.savedGames,
    savedGraphs: userGameHistory.savedGraphs,
    cumulativeMoneyStats: userGameHistory.cumulativeMoneyStats,
  };

  res.status(200).json(sendObj);
});

const deleteUserGameHistory = asyncHandler(async (req, res) => {
  const { userEmail } = req.body;
  const deletedGameHistory = await Game.findOneAndDelete({ userEmail });

  if (deletedGameHistory) {
    res.send(200).json(deleteUserGameHistory);
  } else {
    res.status(400);
    throw new Error('Unable to delete game sessions!');
  }
});
module.exports = {
  saveUserGame,
  getAllGamesAndGraphs,
  deleteUserGameHistory,
};
