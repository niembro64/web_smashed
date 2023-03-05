import Game from '../Game';
import {
  updateAttackEnergyOffscreen,
  updateRemoveAttackPhysicalsIfNotNearPlayer,
} from '../helpers/attacks';
import { updateCamera } from '../helpers/camera';
import { updateAtThreeShots, updateChomp } from '../helpers/chomp';
import { updateDeathsAndKillsMatrices, updateSuicide } from '../helpers/damage';
import {
  printFlagOwnerAndToucher,
  updateFlagColor,
  updateFlagMovement,
  updateFlagOwner,
  updateFlagToucher,
} from '../helpers/flag';
import {
  updateAttackEnergyFlipXVel,
  updateAttackEnergyFollow,
  updateAttackEnergyVelPrev,
  updateAttackEnergyWrapScreen,
  updateCirclesLocations,
  updateKeepObjectsFromFallingLikeCrazy,
  updateTable,
  updateWallTouchArray,
} from '../helpers/movement';
import { addPlayerOneNNObjects, NNSetPlayerPad } from '../helpers/nn';
import {
  updateAttackEnergyFrictionGroundMovement,
  updateAttackEnergyFrictionGroundRotation,
  updateAttackEnergyFrictionWall,
  updatePadPreviousAndDebounced,
} from '../helpers/pad';
import { updateChompFilterState } from '../helpers/powers';
import {
  updateAllSpriteFilters,
  updateSpritesFlipX,
  updateSpritesheets,
} from '../helpers/sprites';
import { updateResetAllHitboxesAttackEnergy } from '../helpers/state';
import { updateTimeSlowdown } from '../helpers/time';
import { updatePlayers } from '../update';

export function updateGameStatePlay(
  game: Game,
  time: number,
  delta: number
): void {
  // BEFORE PLAYERS
  updateAttackEnergyFollow(game);
  updateWallTouchArray(game);
  updateCamera(game);
  updateAllSpriteFilters(game);
  updateSpritesFlipX(game);
  updateAttackEnergyFrictionGroundRotation(game);
  updateAttackEnergyFrictionGroundMovement(game);
  updateAttackEnergyFrictionWall(game);
  updateAttackEnergyWrapScreen(game);
  updateAttackEnergyFlipXVel(game);
  updateAttackEnergyOffscreen(game);
  updateAttackEnergyVelPrev(game);
  updateDeathsAndKillsMatrices(game);
  updateKeepObjectsFromFallingLikeCrazy(game);
  updateCirclesLocations(game);
  updateChomp(game);
  updateTable(game);
  updateSpritesheets(game);
  updateTimeSlowdown(game);
  updateAtThreeShots(game);
  game.players.forEach((player, playerIndex) => {
    updateChompFilterState(player, 0, game);
  });
  // updateBulletsFloat(game);
  updateFlagToucher(game);
  updateFlagOwner(game);
  updateFlagMovement(game);
  updateFlagColor(game);
  printFlagOwnerAndToucher(game);
  updateSuicide(game);
  updateRemoveAttackPhysicalsIfNotNearPlayer(game);

  // UPDATE PLAYERS
  updatePlayers(game);
  // updatePhysicalAttackFollowPlayers(game);

  // AFTER PLAYERS
  updatePadPreviousAndDebounced(game);
  updateResetAllHitboxesAttackEnergy(game);

  addPlayerOneNNObjects(game);
  // NNSetPlayer2Output(game);
}
