import SmashedGame from '../SmashedGame';
import {
  setBGMusicPause,
  setBGMusicResume,
  setMusicBoxPause,
  setMusicBoxResume,
  setMusicBulletBillButtonPause,
  setMusicBulletBillButtonPlay,
  setMusicChompSheepPause,
  setMusicChompSheepResume,
  setPauseSoundPowerup,
  setResumeSoundPowerup,
} from './sound';
import { setAnimationsOff, setAnimationsOn } from './sprites';

export function setPhysicsAndMusicPause(game: SmashedGame): void {
  game.physics.pause();
  game.players.forEach((player, playerIndex) => {
    player.emitterPlayer.active = false;
    player.emitterDark.active = false;
  });
  game.chomp.emitterDark.active = false;
  setAnimationsOff(game);

  if (!game.debug.NN_Train_P1) {
    if (game.chomp.soundSheep.isPlaying) {
      setMusicChompSheepPause(game);
      game.chomp.afterPauseResumeSoundSheep = true;
    } else {
      game.chomp.afterPauseResumeSoundSheep = false;
    }
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

  // BULLET BILL BUTTON MUSIC
  if (game.bulletBillCombo.button.sound.isPlaying) {
    game.bulletBillCombo.button.afterPauseResumeButtonSound = true;
    setMusicBulletBillButtonPause(game);
  } else {
    game.bulletBillCombo.button.afterPauseResumeButtonSound = false;
  }
}

export function setPhysicsAndMusicResume(game: SmashedGame): void {
  game.physics.resume();
  game.players.forEach((player, playerIndex) => {
    player.emitterPlayer.active = true;
    player.emitterDark.active = true;
  });
  game.chomp.emitterDark.active = true;
  setAnimationsOn(game);

  if (!game.debug.NN_Train_P1 && game.chomp.afterPauseResumeSoundSheep) {
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

  // BULLET BILL BUTTON MUSIC
  if (game.bulletBillCombo.button.afterPauseResumeButtonSound) {
    setMusicBulletBillButtonPlay(game);
  }
}
