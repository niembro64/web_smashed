import Game from '../Game';
import {
  AttackPhysical,
  AttackState,
  GameState,
  Player,
  PlayerState,
} from '../interfaces';
import {
  getIsAttackEnergyOffscreen,
  setAttackPhysicalOffscreen,
  setPhysicsAttackEnergyOn,
} from './attacks';
import {
  setEmitterHurtActiveFalse,
  setEmitterHurtActiveTrue,
  setEmitterHurtVisibleFalse,
  setEmitterHurtVisibleTrue,
  setEmitterPlayerOnFalse,
  setOnDeadUpdateMatrix,
  setResetDamage,
} from './damage';
import {
  getIsFirstBlood,
  getIsScreenClear,
  setAddShotsToMatrixFlagCaptured,
  setAddShotToMatrixFirstBlood,
  setAddToShotsMatrixScreenClear,
  setPlayerWinningPositions,
} from './drinking';
import { setFlagOwnerNullIfDead } from './flag';
import { setGravityFalse, setGravityTrue, setRespawn } from './movement';
import { setPhysicsPause, setPhysicsResume } from './physics';
import { setPlayerPowerState } from './powers';
import {
  setMusicPause,
  setMusicResume,
  setPauseAllReadySounds,
  setPauseWiiMusic,
  setSoundDiePlay,
  setSoundEnerjaPlay,
  setSoundFinishPlay,
  setSoundFirstBloodPlay,
  setSoundProfoundPlay,
  setSoundSquishPlay,
  setSoundStartPlay,
} from './sound';
import { setBlinkFalse, setBlinkTrue } from './sprites';
import {
  setRuleSplashOn,
  setSplashDataOff,
  setSplashDataOn,
  updateShotsOnPlayers,
} from './text';
import { axiosUpsertOne, print } from '../../views/client';
import { NNTrainLSTM, NNTrainNN, deleteLastNNObjects } from './nn';

export function setGameState(game: Game, state: GameState): void {
  game.gameState.namePrev = game.gameState.nameCurr;
  game.gameState.gameStampPrev = game.gameState.gameStampCurr;
  game.gameState.timeStampPrev = game.gameState.timeStampCurr;

  game.gameState.nameCurr = state;
  game.gameState.gameStampCurr = game.gameNanoseconds;
  game.gameState.timeStampCurr = game.timeNanoseconds;
  print('GAME STATE', game.gameState.nameCurr);

  let isDrinkingCurr = false;
  let isDrinkingPrev = false;

  window.dispatchEvent(
    new CustomEvent('gameState', { detail: game.gameState })
  );

  switch (game.gameState.nameCurr) {
    case 'game-state-start':
      break;
    case 'game-state-play':
      setRuleSplashOn(game, 'splash-none');
      setPauseWiiMusic(game);
      setPauseAllReadySounds(game);
      setMusicResume(game);
      setSoundStartPlay(game);
      setPhysicsResume(game);
      setSplashDataOff(game);
      break;
    case 'game-state-paused':
      setRuleSplashOn(game, 'splash-paused');
      setMusicPause(game);
      setSoundStartPlay(game);
      setPhysicsPause(game);
      setSplashDataOn(game);

      break;
    case 'game-state-first-blood':
      setRuleSplashOn(game, 'splash-first-blood');
      setMusicPause(game);
      setSoundProfoundPlay(game);
      setSoundFirstBloodPlay(game);
      setSoundSquishPlay(game);
      setPhysicsPause(game);
      setSplashDataOn(game);
      isDrinkingCurr = true;
      setPlayerWinningPositions(game);
      break;
    case 'game-state-screen-clear':
      setRuleSplashOn(game, 'splash-screen-clear');
      setMusicPause(game);
      setSoundEnerjaPlay(game);
      setSoundSquishPlay(game);
      setPhysicsPause(game);
      setSplashDataOn(game);
      isDrinkingCurr = true;
      setPlayerWinningPositions(game);
      break;
    case 'game-state-captured-flag':
      game.flag.firework.setAlpha(1);
      // game.POLE.setAlpha(0.5);
      // game.flag.sprite.setAlpha(0.5);
      game.flag.spriteFlagMover.setAlpha(0);
      game.flag.spriteFlagStationary.setAlpha(1);
      game.flag.spriteFlagChar.setAlpha(1);

      const tint =
        game.colorCircles[game.flag.ownerCurr.id ? game.flag.ownerCurr.id : 0]
          .colorNumber;
      game.flag.firework.setTint(tint);
      game.flag.firework.play('firework-active');
      setRuleSplashOn(game, 'splash-captured-flag');
      setMusicPause(game);
      // setSoundEnerjaPlay(game);
      // setSoundSquishPlay(game);
      game.flag.soundFlagComplete.play();
      game.ENERJA_UGH.play();
      setPhysicsPause(game);
      setSplashDataOn(game);
      isDrinkingCurr = true;
      setAddShotsToMatrixFlagCaptured(game);
      setPlayerWinningPositions(game);
      break;
    case 'game-state-finished':
      setPhysicsPause(game);
      setRuleSplashOn(game, 'splash-finished');
      setMusicPause(game);
      setSoundFinishPlay(game);
      setSplashDataOn(game);
      isDrinkingCurr = true;
      setPlayerWinningPositions(game);

      print('emitting');

      if (game.debug.NNIsLSTM) {
        NNTrainLSTM(game);
      } else {
        NNTrainNN(game);
      }

      break;
    default:
      print('BROKEN_____________________');
  }

  switch (game.gameState.namePrev) {
    case 'game-state-start':
      break;
    case 'game-state-play':
      break;
    case 'game-state-paused':
      break;
    case 'game-state-first-blood':
      isDrinkingPrev = true;
      break;
    case 'game-state-screen-clear':
      isDrinkingPrev = true;
      break;
    case 'game-state-captured-flag':
      isDrinkingPrev = true;
      break;
    case 'game-state-finished':
      isDrinkingPrev = true;
      break;
    default:
      print('BROKEN_____________________');
  }

  if (isDrinkingCurr && !isDrinkingPrev) {
    (async () => {
      // NNTrain(game);

      updateShotsOnPlayers(game);
      await axiosUpsertOne(
        game.sessionMoment,
        game.numberShotsTakenByMeMatrix,
        game.numberKilledByMatrix,
        game.numberHitByMatrix
      );
    })();
  }
}

export function setAttackPhysicalState(
  attackPhysical: AttackPhysical,
  player: Player,
  playerIndex: number,
  state: AttackState,
  game: Game
): void {
  attackPhysical.state.name = state;
  attackPhysical.state.gameStamp = game.gameNanoseconds;
  attackPhysical.state.timeStamp = game.timeNanoseconds;

  // print(
  //   playerIndex,
  //   "ATTACK PHYSICAL STATE",
  //   attackPhysical.srcImage,
  //   attackPhysical.state
  // );

  switch (attackPhysical.state.name) {
    case 'attackphysical-state-on':
      // attackPhysical.sprite.setActive(true).setVisible(true);

      if (
        player.char.attackEnergy.ON_SCREEN_PREVENT_ATTACK_PHYSICAL &&
        !getIsAttackEnergyOffscreen(player.char.attackEnergy)
      ) {
        player.char.attackPhysical.sprite.setActive(false).setVisible(false);
        break;
      }
      player.char.attackPhysical.sprite.setActive(true).setVisible(true);
      attackPhysical.audio.play();
      break;
    case 'attackphysical-state-cooldown':
      setAttackPhysicalOffscreen(player, game);
      player.char.attackPhysical.sprite.setActive(false).setVisible(false);
      // attackPhysical.sprite.setActive(false).setVisible(false);
      break;
    case 'attackphysical-state-off':
      player.char.attackPhysical.sprite.setActive(false).setVisible(false);
      setAttackPhysicalOffscreen(player, game);
      // attackPhysical.sprite.setActive(false).setVisible(false);
      break;
  }
}

export function setPlayerState(
  player: Player,
  playerIndex: number,
  state: PlayerState,
  game: Game
): void {
  player.state.name = state;
  player.state.gameStamp = game.gameNanoseconds;
  player.state.timeStamp = game.timeNanoseconds;
  // print('PLAYER STATE', player.char.name, player.state);

  switch (player.state.name) {
    case 'player-state-start':
      break;
    case 'player-state-alive':
      setEmitterHurtActiveTrue(player);
      setEmitterHurtVisibleFalse(player);
      setGravityTrue(player);
      setBlinkFalse(player);
      break;
    case 'player-state-dead':
      deleteLastNNObjects(player, playerIndex, 40, game);
      setFlagOwnerNullIfDead(player, game);
      setEmitterPlayerOnFalse(player);
      setEmitterHurtActiveFalse(player);
      setEmitterHurtVisibleTrue(player);
      setOnDeadUpdateMatrix(playerIndex, game);
      setPlayerPowerState('none', player, game);
      if (getIsFirstBlood(game)) {
        setAddShotToMatrixFirstBlood(player, playerIndex, game);
      }
      if (getIsScreenClear(game)) {
        setAddToShotsMatrixScreenClear(player, playerIndex, game);
      }
      setSoundDiePlay(game);
      if (!getIsAttackEnergyOffscreen(player.char.attackEnergy)) {
        player.char.attackEnergy.timestampThrow = game.gameNanoseconds;
        player.char.attackEnergy.state = 'released';
        setPhysicsAttackEnergyOn(player);
      }
      setBlinkTrue(player);
      setGravityFalse(player);
      setResetDamage(player);
      setRespawn(player, game);
      break;
    case 'player-state-hurt':
      deleteLastNNObjects(player, playerIndex, 40, game);
      setEmitterHurtActiveTrue(player);
      setEmitterHurtVisibleTrue(player);
      if (!getIsAttackEnergyOffscreen(player.char.attackEnergy)) {
        player.char.attackEnergy.timestampThrow = game.gameNanoseconds;
        player.char.attackEnergy.state = 'released';
        setPhysicsAttackEnergyOn(player);
      }
      setBlinkTrue(player);
      setGravityTrue(player);
      game.SOUND_HIT.play();
      break;
  }
}

export function getHasNumDeadIncreased(game: Game): boolean {
  if (game.numDead <= game.numDeadPrev) {
    return false;
  }
  return true;
}

export function updateNumCurrentlyDead(game: Game): void {
  game.numDeadPrev = game.numDead;
  game.numDead = 0;
  for (let i = 0; i < game.players.length; i++) {
    game.numDead += game.players[i].state.name === 'player-state-dead' ? 1 : 0;
  }
}

export function updateResetAllHitboxesAttackPhysical(game: Game): void {
  game.players.forEach((player, playerIndex) => {
    game.players.forEach((p, i) => {
      game.overlappingPlayerIAttackPhysicalJ[playerIndex][i] = false;
    });
  });
}

export function getIsPlayerHitAttackPhysical(
  playerIndex: number,
  game: Game
): boolean {
  for (let j = 0; j < game.players.length; j++) {
    if (game.overlappingPlayerIAttackPhysicalJ[playerIndex][j]) {
      return true;
    }
  }
  return false;
}
export function updateResetAllHitboxesAttackEnergy(game: Game): void {
  game.players.forEach((player, playerIndex) => {
    game.players.forEach((p, i) => {
      game.overlappingPlayerIAttackEnergyJ[playerIndex][i] = false;
    });
  });
}

export function getIsPlayerHitAttackEnergy(
  playerIndex: number,
  game: Game
): boolean {
  for (let j = 0; j < game.players.length; j++) {
    if (game.overlappingPlayerIAttackEnergyJ[playerIndex][j]) {
      return true;
    }
  }
  return false;
}

export function getLongEnoughGameDuration(
  duration: number,
  game: Game
): boolean {
  if (game.gameNanoseconds > game.gameState.gameStampCurr + duration + 20) {
    return true;
  }
  return false;
}
export function getLongEnoughTimeDuration(
  duration: number,
  game: Game
): boolean {
  if (game.timeNanoseconds > game.gameState.timeStampCurr + duration + 20) {
    return true;
  }
  return false;
}

export function updateGameTime(game: Game, time: number, delta: number): void {
  if (game.gameState.nameCurr !== 'game-state-play') {
    return;
  }
  game.gameNanoseconds += delta;
  game.gameSecondsPrev = game.gameSeconds;
  game.gameSeconds = Math.floor(game.gameNanoseconds / 1000);
  if (game.gameSeconds !== game.gameSecondsPrev) {
    game.gameSecondsClock--;
  }

  game.gameClock.minutes = Math.floor(game.gameSecondsClock / 60);
  game.gameClock.seconds = Math.floor(game.gameSecondsClock % 60);
}

export function updateTimeTime(game: Game, time: number, delta: number): void {
  game.timeNanoseconds += delta;
  game.timeSecondsPrev = game.timeSeconds;
  game.timeSeconds = Math.floor(game.timeNanoseconds / 1000);
  if (game.timeSeconds !== game.timeSecondsPrev) {
    game.timeSecondsClock++;
  }

  game.timeClock.minutes = Math.floor(game.timeSecondsClock / 60);
  game.timeClock.seconds = Math.floor(game.timeSecondsClock % 60);
}

export function getHasGameDurationPassedPlayer(
  player: Player,
  duration: number,
  game: Game
): boolean {
  if (game.gameNanoseconds > player.state.gameStamp + duration) {
    return true;
  }
  return false;
}
export function getHasGameDurationPassedAttack(
  attack: AttackPhysical,
  duration: number,
  game: Game
): boolean {
  if (game.gameNanoseconds > attack.state.gameStamp + duration) {
    return true;
  }
  return false;
}
