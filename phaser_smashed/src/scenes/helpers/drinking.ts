import { debug } from 'console';
import SmashedGame from '../SmashedGame';
import { Player } from '../types';
import { gamepadManager } from './pad';

export function getIsScreenClear(game: SmashedGame): boolean {
  if (game.players.length < 2) {
    return false;
  }
  // is there three people currently dead
  let numPlayersDead: number = 0;
  for (let i = 0; i < game.players.length; i++) {
    if (game.players[i].state.name === 'player-state-dead') {
      numPlayersDead++;
    }
  }

  if (numPlayersDead === game.players.length - 1) {
    return true;
  }

  return false;
}
export function getIsFirstBlood(game: SmashedGame): boolean {
  if (game.players.length < 3) {
    return false;
  }
  // is there only one player who has died
  let numPlayersDied = 0;
  let temp = 0;
  for (let i = 0; i < game.players.length; i++) {
    for (let j = 0; j < game.players.length; j++) {
      temp += game.numberKilledByMatrix[i][j];
    }
    if (temp > 0) {
      numPlayersDied++;
    }
    temp = 0;
  }

  if (
    numPlayersDied === 1 &&
    getIsAnyPlayerCurrentlyDead(game)
    // && isAnyPlayerOffscreen(game)
  ) {
    return true;
  }

  return false;
}

export function getIsAnyPlayerCurrentlyDead(game: SmashedGame): boolean {
  for (let i = 0; i < game.players.length; i++) {
    if (game.players[i].state.name === 'player-state-dead') {
      return true;
    }
  }
  return false;
}

export function setAddShotToMatrixFirstBlood(
  player: Player,
  playerIndex: number,
  game: SmashedGame
): void {
  if (player.state.name !== 'player-state-dead') {
    return;
  }

  gamepadManager.vibrateShot(playerIndex);

  let hit: boolean = false;

  game.players.forEach((pj, j) => {
    if (game.wasLastHitByMatrix[playerIndex][j]) {
      game.numberShotsTakenByMeMatrix[playerIndex][j]++;
      hit = true;
    }
  });
  if (!hit) {
    game.numberShotsTakenByMeMatrix[playerIndex][playerIndex]++;
  }
}

export function setAddToShotsMatrixScreenClear(
  player: Player,
  playerIndex: number,
  game: SmashedGame
): void {
  // add shots for each that isn't alive
  // if dead add shot by last touched

  let hit = false;

  for (let i = 0; i < game.players.length; i++) {
    if (game.players[i].state.name === 'player-state-dead') {
      gamepadManager.vibrateShot(i);

      for (let j = 0; j < game.players.length; j++) {
        if (game.wasLastHitByMatrix[i][j]) {
          hit = true;
          game.numberShotsTakenByMeMatrix[i][j]++;
        }
      }
      if (!hit) {
        game.numberShotsTakenByMeMatrix[i][i]++;
        hit = false;
      }
    }
  }
}

export function setAddShotsToMatrixFlagCaptured(game: SmashedGame): void {
  let ownerIndex = game.flag.ownerCurr.id;

  if (ownerIndex === null) {
    return;
  }

  game.players.forEach((player, playerIndex) => {
    if (ownerIndex !== null && ownerIndex !== playerIndex) {
      gamepadManager.vibrateShot(playerIndex);

      game.numberShotsTakenByMeMatrix[playerIndex][ownerIndex]++;
    }
  });
}

export function updateNumShotsLeft(game: SmashedGame): void {
  if (!game.debug.Mode_Infinity) {
    return;
  }

  game.shotsLeftPrev = game.shotsLeftCurr;

  let shots = 0;
  game.players.forEach((player, playerIndex) => {
    for (let i = 0; i < game.players.length; i++) {
      shots += game.numberShotsTakenByMeMatrix[playerIndex][i];
    }
  });
  game.shotsLeftCurr = game.debug.Shots - shots;
}

export interface PositionEndGame {
  id: number;
  input: number;
  shots: number;
  deaths: number;
  hits: number;
}

export function getSortedPositionsEndGame(p: PositionEndGame[]): number[] {
  let orderedPlayers = [...p];
  orderedPlayers.sort((a: PositionEndGame, b: PositionEndGame) => {
    if (a.shots > b.shots) {
      return 1;
    } else if (a.shots < b.shots) {
      return -1;
    } else {
      if (a.deaths > b.deaths) {
        return 1;
      } else if (a.deaths < b.deaths) {
        return -1;
      } else {
        if (a.hits > b.hits) {
          return 1;
        } else if (a.hits < b.hits) {
          return -1;
        } else {
          if (a.id > b.id) {
            return 1;
          } else if (a.id < b.id) {
            return -1;
          } else {
            return 1;
          }
        }
      }
    }
  });

  let playerPositions: number[] = [];
  orderedPlayers.forEach((pNew, i) => {
    playerPositions.push(-1);
  });
  orderedPlayers.forEach((pNew, i) => {
    playerPositions[pNew.id] = i;
  });

  return playerPositions;
}

export function getEndGame(game: SmashedGame): number[] {
  let indexes: number[] = [];

  game.players.forEach((player, playerIndex) => {
    indexes.push(playerIndex);
  });

  let s = game.numberShotsTakenByMeMatrix;
  let d = game.numberKilledByMatrix;
  let h = game.numberHitByMatrix;
  let i = game.playerChoicesInputType;

  let positionsEndGame: PositionEndGame[] = [];

  indexes.forEach((index) => {
    let shots = 0;
    let deaths = 0;
    let hits = 0;
    let input = i[index];

    for (let j = 0; j < game.players.length; j++) {
      shots += s[index][j];
      deaths += d[index][j];
      hits += h[index][j];
    }

    positionsEndGame.push({ id: index, input, shots, deaths, hits });
  });

  let z = getSortedPositionsEndGame(positionsEndGame);

  return z;
}

export function updatePlayerWinningPositions(game: SmashedGame): void {
  let positions: number[] = getEndGame(game);

  game.players.forEach((player, playerIndex) => {
    player.endPlace = positions[playerIndex];
  });
}
export function setPlayerWinningPositions(game: SmashedGame): void {
  let positions: number[] = getEndGame(game);

  game.players.forEach((player, playerIndex) => {
    player.endPlace = positions[playerIndex];
  });
}
