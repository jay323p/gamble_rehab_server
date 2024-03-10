const express = require('express');
const router = express.Router();
const {
  saveUserGame,
  getAllGamesAndGraphs,
  deleteUserGameHistory,
} = require('../controllers/gameController');
const protect = require('../middleware/authMiddleware');

router.post('/saveGame', protect, saveUserGame);
router.post('/getGameData', protect, getAllGamesAndGraphs);
router.delete('/deleteGameHistory', protect, deleteUserGameHistory);

module.exports = router;
