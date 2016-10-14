window.fakeStorage = {
  _data: {},

  setItem: function (id, val) {
    return this._data[id] = String(val);
  },

  getItem: function (id) {
    return this._data.hasOwnProperty(id) ? this._data[id] : undefined;
  },

  removeItem: function (id) {
    return delete this._data[id];
  },

  clear: function () {
    return this._data = {};
  }
};

function LocalStorageManager() {
  this.bestScoreKey     = "bestScore";
  this.gameStateKey     = "gameState";
  this.undoBuffer       = 5;

  var supported = this.localStorageSupported();
  this.storage = supported ? window.localStorage : window.fakeStorage;
}

LocalStorageManager.prototype.localStorageSupported = function () {
  var testKey = "test";
  var storage = window.localStorage;

  try {
    storage.setItem(testKey, "1");
    storage.removeItem(testKey);
    return true;
  } catch (error) {
    return false;
  }
};

// Best score getters/setters
LocalStorageManager.prototype.getBestScore = function () {
  return this.storage.getItem(this.bestScoreKey) || 0;
};

LocalStorageManager.prototype.setBestScore = function (score) {
  this.storage.setItem(this.bestScoreKey, score);
};

// Game state getters/setters and clearing
LocalStorageManager.prototype.getGameState = function () {
  var statesJSON = this.storage.getItem(this.gameStateKey);
  var states = statesJSON ? JSON.parse(statesJSON) : null;
  if (states && states.length) {
    return states[0];
  }

  return null;
};

LocalStorageManager.prototype.setGameState = function (gameState) {
  var states = this.getGameStates();
  if (states && states.length) {
    gameState.ver = states[0].ver + 1;
    states.unshift(gameState);
    if (states.length > this.undoBuffer) {
      states = states.slice(0, this.undoBuffer);
    }
  } else {
    gameState.ver = 0;
    states = [gameState];
  }

  this.storage.setItem(this.gameStateKey, JSON.stringify(states));
};

LocalStorageManager.prototype.getGameStates = function () {
  var statesJSON = this.storage.getItem(this.gameStateKey);
  return statesJSON ? JSON.parse(statesJSON) : null;
};

LocalStorageManager.prototype.setGameStates = function (states) {
  this.storage.setItem(this.gameStateKey, JSON.stringify(states));
};

LocalStorageManager.prototype.clearGameState = function () {
  this.storage.removeItem(this.gameStateKey);
};

LocalStorageManager.prototype.undoGameState = function () {
  var states = this.getGameStates();
  if (states && states.length > 1) {
    states.shift();
    this.setGameStates(states);
  }
};

LocalStorageManager.prototype.undoAvailable = function () {
  var states = this.getGameStates();
  return states && states.length > 1;
};
