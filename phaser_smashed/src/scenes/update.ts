import { print } from '../views/client';
import SmashedGame from './SmashedGame';
import { updateGameStatePlay } from './gameStates.ts/updateGameStatePlay';
import {
  updateAirDodge,
  updatePhysicalAttackFollowsPlayer,
} from './helpers/attacks';
import {
  getIsFirstBlood,
  getIsScreenClear,
  updateNumShotsLeft,
} from './helpers/drinking';
import { getIsFlagShots } from './helpers/flag';
import {
  isPlayerInGameBoundary,
  willPlayerBeInBoundaryNextFrame,
} from './helpers/math';
import {
  getIsPlayerOffscreen,
  setRespawn,
  updateFrictionAirX,
  updateFrictionAirY,
  updateFrictionGroundX,
  updateFrictionWallY,
  updateJumpFloat,
  updateJumpPhysical,
  updateJumpPhysicalOnWall,
  updateLastDirectionTouched,
  updatePlayerControllerCountersAndPositionCounters,
} from './helpers/movement';
import {
  debugUpdateControllersPrintConnected,
  debugUpdatePrintAllControllerButtonsWhenActive,
  getIsAllPlayersReady,
  getIsAnyPlayerPausing,
  updateAttackEnergy,
  updateControllerMovement,
  updateGamePadsMaster,
} from './helpers/pad';
import { updatePlayerDarknessEvents } from './helpers/powers';
import {
  playWiiMusic,
  setBGMusicPlay,
  setBGMusicSpeedNormal,
  setMusicBoxPause,
  setMusicBoxPlay,
  setMusicBulletBillButtonPause,
  setMusicBulletBillButtonPlay,
  setMusicChompSheepPause,
  setMusicChompSheepPlay,
  setPauseSoundPowerup,
  setPlaySoundPowerup,
  updatePlayWiiMusicWaitLong,
} from './helpers/sound';
import {
  getHasGameDurationPassedAttack,
  getHasGameDurationPassedPlayer,
  getHasNumDeadIncreased,
  getIsPlayerHitAttackEnergy,
  getLongEnoughTimeDuration,
  setAttackPhysicalState,
  setGameState,
  setPlayerState,
  updateGameTime,
  updateNumCurrentlyDead,
  updateTimeTime,
} from './helpers/state';
import { updateText } from './helpers/text';
import { Player, inputTypeNNClient, inputTypeNNExpress } from './types';

export function setPreUpdate(game: SmashedGame): void {
  setBGMusicPlay(game);
  setGameState(game, 'game-state-play');
  game.loaded = true;
  print('players', game.players);
  setBGMusicSpeedNormal(game);

  setPlaySoundPowerup(game);
  setPauseSoundPowerup(game);

  if (!game.debug.Simple_Stage) {
    setMusicBoxPlay(game);
    setMusicBoxPause(game);
    setMusicChompSheepPlay(game);
    setMusicChompSheepPause(game);
    setMusicBulletBillButtonPlay(game);
    setMusicBulletBillButtonPause(game);
  }
}

export function update(game: SmashedGame, time: number, delta: number): void {
  game.updateIndex++;

  // print('best index 4', getNeuralNetworkBestInstanceIndex(game, 4));

  if (game.debug.Update_Loops_Skip > 0) {
    game.debug.Update_Loops_Skip--;
    return;
  }

  updateTimeTime(game, time, delta);
  updateGameTime(game, time, delta);
  updateText(game);
  updateNumShotsLeft(game);
  updateNumCurrentlyDead(game);
  updateGamePadsMaster(game);
  debugUpdatePrintAllControllerButtonsWhenActive(game);
  debugUpdateControllersPrintConnected(game);

  switch (game.gameState.nameCurr) {
    case 'game-state-start':
      break;
    case 'game-state-play':
      ////////////////////////////////
      ///////// WHILE IN LOOP
      ////////////////////////////////
      updateGameStatePlay(game, time, delta);

      if (getIsAnyPlayerPausing(game)) {
        ////////////////////////////////
        ///////// pausing => pause
        ////////////////////////////////
        setGameState(game, 'game-state-paused');
      } else if (
        getIsScreenClear(game) &&
        getHasNumDeadIncreased(game)
        // longEnoughGame(game.DURATION_PLAYER_DEAD, game)
      ) {
        ////////////////////////////////
        ///////// screenclear & deads++ => play
        ////////////////////////////////
        setGameState(game, 'game-state-screen-clear');
      } else if (
        getIsFirstBlood(game) &&
        getHasNumDeadIncreased(game) &&
        game.players.length > 2
        // longEnoughGame(game.DURATION_PLAYER_DEAD, game)
      ) {
        ////////////////////////////////
        ///////// firstblood & deads++ => play
        ////////////////////////////////
        setGameState(game, 'game-state-first-blood');
      } else if (getIsFlagShots(game)) {
        ////////////////////////////////
        ///////// flag up => flag shot
        ////////////////////////////////
        setGameState(game, 'game-state-captured-flag');
      } else if (game.debug.Mode_Infinity && game.shotsLeftCurr < 1) {
        ////////////////////////////////
        ///////// GAME ENDING CONDITIONS
        ////////////////////////////////
        ///////// done shots => finished
        ///////// time => finished
        ////////////////////////////////
        setGameState(game, 'game-state-finished');
      } else if (!game.debug.Mode_Infinity && game.gameSecondsClock < 1) {
        setGameState(game, 'game-state-finished');
      }

      break;
    case 'game-state-first-blood':
      ////////////////////////////////
      ///////// WHILE IN LOOP
      ////////////////////////////////
      updatePlayWiiMusicWaitLong(game);

      if (
        getLongEnoughTimeDuration(game.DURATION_GAME_SHOT, game) &&
        getIsAllPlayersReady(game)
      ) {
        ////////////////////////////////
        ///////// ready & duration => play
        ////////////////////////////////
        setGameState(game, 'game-state-play');
      }

      break;
    case 'game-state-screen-clear':
      ////////////////////////////////
      ///////// WHILE IN LOOP
      ////////////////////////////////
      updatePlayWiiMusicWaitLong(game);

      if (
        getLongEnoughTimeDuration(game.DURATION_GAME_SHOT, game) &&
        getIsAllPlayersReady(game)
      ) {
        ////////////////////////////////
        ///////// ready & duration => play
        ////////////////////////////////
        setGameState(game, 'game-state-play');
      }
      break;
    case 'game-state-captured-flag':
      ////////////////////////////////
      ///////// WHILE IN LOOP
      ////////////////////////////////
      updatePlayWiiMusicWaitLong(game);

      if (
        getLongEnoughTimeDuration(game.DURATION_GAME_SHOT, game) &&
        getIsAllPlayersReady(game)
      ) {
        ////////////////////////////////
        ///////// ready & duration => play
        ////////////////////////////////
        setGameState(game, 'game-state-play');
      }
      break;
    case 'game-state-finished':
      ////////////////////////////////
      ///////// WHILE IN LOOP
      ////////////////////////////////

      break;
    case 'game-state-paused':
      playWiiMusic(game);

      if (
        getLongEnoughTimeDuration(game.DURATION_GAME_SHOT, game) &&
        getIsAllPlayersReady(game)
      ) {
        ////////////////////////////////
        ///////// ready & duration => play
        ////////////////////////////////
        setGameState(game, 'game-state-play');
      }
      break;
    default:
      ////////////////////////////////
      ///////// WHILE IN LOOP
      ////////////////////////////////

      break;
  }
}

export function updatePlayers(game: SmashedGame): void {
  game.players.forEach((player, playerIndex) => {
    switch (player.state.name) {
      case 'player-state-start':
        ////////////////////////////////
        ///////// WHILE IN LOOP
        ////////////////////////////////

        if (
          getHasGameDurationPassedPlayer(player, game.DURATION_GAME_START, game)
        ) {
          ////////////////////////////////
          ///////// duration => alive
          ////////////////////////////////
          setPlayerState(player, playerIndex, 'player-state-alive', game);
        }

        break;
      case 'player-state-alive':
        ////////////////////////////////
        ///////// WHILE IN LOOP
        ////////////////////////////////
        updateAttackEnergy(player, game);
        updateLastDirectionTouched(player);
        updateFrictionGroundX(player, game);
        updateFrictionAirX(player, game);
        updateFrictionWallY(player, game);
        updateFrictionAirY(player, game);
        updateJumpPhysicalOnWall(player, game);
        updateJumpPhysical(player, game);
        updateJumpFloat(player, game);
        updateControllerMovement(player, game);
        updateAirDodge(player, game);
        updatePlayerDarknessEvents(game);

        const isPlayerNN: boolean =
          player.inputType === inputTypeNNExpress ||
          player.inputType === inputTypeNNClient;

        if (!isPlayerNN) {
          updatePlayerControllerCountersAndPositionCounters(player);
        }

        // UPDATE ATTACK PHYSICAL
        updateAttackPhysicals(player, playerIndex, game);

        ////////////////////////////////
        ///////// attackPhysical hit => hurt
        ///////// NOTE: handled in onHitHandlerAttackPhysical()
        ////////////////////////////////

        if (getIsPlayerHitAttackEnergy(playerIndex, game)) {
          ////////////////////////////////
          ///////// attackEnergy hit => hurt
          ////////////////////////////////
          setPlayerState(player, playerIndex, 'player-state-hurt', game);
          // } else if (!willPlayerBeInBoundaryNextFrame(player, game)) {
        } else if (!isPlayerInGameBoundary(player, game)) {
          ////////////////////////////////
          ///////// offscreen => dead
          ////////////////////////////////
          setPlayerState(player, playerIndex, 'player-state-dead', game);
        }
        // } else if (getIsPlayerOffscreen(player, game)) {
        //   ////////////////////////////////
        //   ///////// offscreen => dead
        //   ////////////////////////////////
        //   setPlayerState(player, playerIndex, 'player-state-dead', game);
        // }

        // resetMyHitByMatrix(player, playerIndex, game);
        break;
      case 'player-state-hurt':
        ////////////////////////////////
        ///////// WHILE IN LOOP
        ////////////////////////////////
        updateLastDirectionTouched(player);
        updateFrictionGroundX(player, game);
        updateFrictionWallY(player, game);
        updateFrictionAirX(player, game);
        updateFrictionAirY(player, game);
        updateJumpPhysical(player, game);
        updateControllerMovement(player, game);
        updateAirDodge(player, game);

        if (
          !getIsPlayerOffscreen(player, game) &&
          getHasGameDurationPassedPlayer(
            player,
            game.DURATION_PLAYER_HURT,
            game
          )
        ) {
          ////////////////////////////////
          ///////// !offscreen && duration => alive
          ////////////////////////////////
          setPlayerState(player, playerIndex, 'player-state-alive', game);
        } else if (getIsPlayerOffscreen(player, game)) {
          ////////////////////////////////
          ///////// offscreen => dead
          ////////////////////////////////
          setPlayerState(player, playerIndex, 'player-state-dead', game);
        }

        break;
      case 'player-state-dead':
        ////////////////////////////////
        ///////// WHILE IN LOOP
        ////////////////////////////////
        setRespawn(player, game);
        updateAirDodge(player, game);

        ////////////////////////////////
        ///////// duration => alive
        ////////////////////////////////
        if (
          getHasGameDurationPassedPlayer(
            player,
            game.debug.Simple_Stage ? 0 : game.durationPlayerDeadInCloud || 0,
            game
          )
        ) {
          setPlayerState(player, playerIndex, 'player-state-alive', game);
        }

        break;
    }
  });
}

export function updateAttackPhysicals(
  player: Player,
  playerIndex: number,
  game: SmashedGame
): void {
  let ap = player.char.attackPhysical;

  switch (ap.state.name) {
    case 'attackphysical-state-on':
      ////////////////////////////////
      ///////// WHILE IN LOOP
      ////////////////////////////////
      updatePhysicalAttackFollowsPlayer(player, game);

      if (getHasGameDurationPassedAttack(ap, ap.durationAttack, game)) {
        ////////////////////////////////
        ///////// duration => cooldown
        ////////////////////////////////
        setAttackPhysicalState(
          ap,
          player,
          playerIndex,
          'attackphysical-state-cooldown',
          game
        );
      }
      break;
    case 'attackphysical-state-cooldown':
      ////////////////////////////////
      ///////// WHILE IN LOOP
      ////////////////////////////////

      if (getHasGameDurationPassedAttack(ap, ap.durationCooldown, game)) {
        ////////////////////////////////
        ///////// duration => off
        ////////////////////////////////
        // restore neutral punch values after any smash
        if (ap.baseDamage !== undefined && ap.baseHitback) {
          ap.damage = ap.baseDamage;
          ap.hitback = { x: ap.baseHitback.x, y: ap.baseHitback.y };
          ap.smashActive = false;
        }
        setAttackPhysicalState(
          ap,
          player,
          playerIndex,
          'attackphysical-state-off',
          game
        );
      }
      break;
    case 'attackphysical-state-off':
      ////////////////////////////////
      ///////// WHILE IN LOOP
      ////////////////////////////////

      if (player.padCurr.A && !player.padPrev.A) {
        ////////////////////////////////
        ///////// button => on
        ///////// direction + punch => SMASH attack
        ////////////////////////////////
        if (ap.baseDamage === undefined || !ap.baseHitback) {
          ap.baseDamage = ap.damage;
          ap.baseHitback = { x: ap.hitback.x, y: ap.hitback.y };
        }

        const sprite = player.char.sprite;
        const pad = player.padCurr;
        const facing = sprite.flipX ? -1 : 1;

        ap.smashActive = false;
        ap.damage = ap.baseDamage;
        ap.hitback = { x: ap.baseHitback.x, y: ap.baseHitback.y };

        if (pad.left || pad.right) {
          // FORWARD SMASH: the character lunges into the blow —
          // the body itself is the attack, no floating fist
          ap.smashActive = true;
          ap.damage = ap.baseDamage * 1.8;
          ap.hitback = {
            x: ap.baseHitback.x * 1.7,
            y: ap.baseHitback.y,
          };
          sprite.body.setVelocityX(sprite.body.velocity.x + facing * 700);
          sprite.body.setVelocityY(sprite.body.velocity.y - 120);
        } else if (pad.up) {
          // UP SMASH: rising uppercut, launches victims skyward
          ap.smashActive = true;
          ap.damage = ap.baseDamage * 1.6;
          ap.hitback = {
            x: ap.baseHitback.x * 0.6,
            y: ap.baseHitback.y * 2.2,
          };
          sprite.body.setVelocityY(sprite.body.velocity.y - 550);
        } else if (pad.down) {
          // DOWN SMASH: heavy close-range swat
          ap.smashActive = true;
          ap.damage = ap.baseDamage * 1.5;
          ap.hitback = {
            x: ap.baseHitback.x * 1.3,
            y: ap.baseHitback.y * 0.5,
          };
        }

        setAttackPhysicalState(
          ap,
          player,
          playerIndex,
          'attackphysical-state-on',
          game
        );
      }
  }
}
