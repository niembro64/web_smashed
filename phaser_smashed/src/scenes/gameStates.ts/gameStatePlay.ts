import SmashedGame from '../SmashedGame';
import {
  updateAttackEnergyOffscreen,
  updateRemoveAttackPhysicalsIfNotNearPlayer,
} from '../helpers/attacks';
import { updateBulletBill } from '../helpers/bulletBill';
import { updateCamera } from '../helpers/camera';
import { updateAtThreeShots, updateChomp } from '../helpers/chomp';
import {
  updateDamagePrev,
  updateDeathsAndKillsMatrices,
  updateEmitterPlayerSuicide,
  updateSuicide,
  updateTableGiveHealth,
} from '../helpers/damage';
import { updateFireFlowerShooting } from '../helpers/fireFlower';
import {
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
  updatePlayerControllerCountersAndPositionCounters,
  updatePlayerPositionIfUndefined,
  updateTable,
  updateWallTouchArray,
} from '../helpers/movement';
import { addToNNTrainingArray } from '../helpers/nn';
import {
  updateAttackEnergyFrictionGroundMovement,
  updateAttackEnergyFrictionGroundRotation,
  updateAttackEnergyFrictionWall,
  updatePadPreviousAndDebounced,
} from '../helpers/pad';
import {
  updateChompFilterState,
  updateChompStateLightIfHasBeenLongEnough,
} from '../helpers/powers';
import {
  updateAllSpriteFilters,
  updateSpritesFlipX,
  updateSpritesheets,
} from '../helpers/sprites';
import { updateResetAllHitboxesAttackEnergy } from '../helpers/state';
import { updateTimeSlowdown } from '../helpers/time';
import { updatePlayers } from '../update';

export function updateGameStatePlay(
  game: SmashedGame,
  time: number,
  delta: number
): void {
  // BEFORE PLAYERS
  updateAttackEnergyFollow(game);
  updateWallTouchArray(game);
  updateCamera(game);
  updateAllSpriteFilters(game);
  updateDamagePrev(game);
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
  updateFireFlowerShooting(game);
  updateTable(game);
  updateSpritesheets(game);
  updateTimeSlowdown(game);
  updateAtThreeShots(game);
  updateChompFilterState(game);
  updateChompStateLightIfHasBeenLongEnough(game);
  updateFlagToucher(game);
  updateFlagOwner(game);
  updateFlagMovement(game);
  updateFlagColor(game);
  updateSuicide(game);
  updateEmitterPlayerSuicide(game);
  updateRemoveAttackPhysicalsIfNotNearPlayer(game);
  updateTableGiveHealth(game);
  updateBulletBill(game);

  // UPDATE PLAYERS
  updatePlayers(game);
  // updatePlayerControllerButtonsPressedCounters(game);

  // updatePhysicalAttackFollowPlayers(game);

  // AFTER PLAYERS
  updatePadPreviousAndDebounced(game);
  updateResetAllHitboxesAttackEnergy(game);
  // updateDamagePrev(game);

  addToNNTrainingArray(game);
  // NNSetPlayer2Output(game);
  updatePlayerPositionIfUndefined(game);
}
