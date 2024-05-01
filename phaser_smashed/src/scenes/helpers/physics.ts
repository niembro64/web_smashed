import Game from '../Game';
import {
  setBGMusicPause,
  setBGMusicResume,
  setMusicBoxPause,
  setMusicBoxResume,
  setMusicChompSheepPause,
  setMusicChompSheepResume,
  setPauseSoundPowerup,
  setResumeSoundPowerup,
} from './sound';
import { setAnimationsOff, setAnimationsOn } from './sprites';

export function setPhysicsAndMusicPause(game: Game): void {
  game.physics.pause();
  game.players.forEach((player, playerIndex) => {
    player.emitterPlayer.active = false;
    player.emitterDark.active = false;
  });
  game.chomp.emitterDark.active = false;
  setAnimationsOff(game);

  if (game.chomp.soundSheep.isPlaying) {
    setMusicChompSheepPause(game);
    game.chomp.afterPauseResumeSoundSheep = true;
  } else {
    game.chomp.afterPauseResumeSoundSheep = false;
  }

  if (game.flag.soundFlagMusicBox.isPlaying) {
    setMusicBoxPause(game);
    game.flag.afterPauseResumeMusicFlagMusicBox = true;
  } else {
    game.flag.afterPauseResumeMusicFlagMusicBox = false;
  }

  if (game.soundBGM.isPlaying) {
    game.afterPauseResumeMusicBGM = true;
    setBGMusicPause(game);
  } else {
    game.afterPauseResumeMusicBGM = false;
  }

  if (game.soundPowerup.isPlaying) {
    game.afterPauseResumePowerup = true;
    setPauseSoundPowerup(game);
  } else {
    game.afterPauseResumePowerup = false;
  }
}

export function setPhysicsAndMusicResume(game: Game): void {
  game.physics.resume();
  game.players.forEach((player, playerIndex) => {
    player.emitterPlayer.active = true;
    player.emitterDark.active = true;
  });
  game.chomp.emitterDark.active = true;
  setAnimationsOn(game);
  if (game.chomp.afterPauseResumeSoundSheep) {
    setMusicChompSheepResume(game);
  }
  if (game.flag.afterPauseResumeMusicFlagMusicBox) {
    setMusicBoxResume(game);
  }
  if (game.afterPauseResumeMusicBGM) {
    setBGMusicResume(game);
  }
  if (game.afterPauseResumePowerup) {
    setResumeSoundPowerup(game);
  }
}
