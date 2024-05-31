import { print } from '../../views/client';
import SmashedGame from '../SmashedGame';
import { Player } from '../types';
import { getLongEnoughTimeDuration } from './state';

function increaseSemitones(frequency: number, semitones: number): number {
  return frequency * Math.pow(2, semitones / 12);
}

export function setSoundDiePlay(game: SmashedGame): void {
  game.SOUND_DIE.play();
}
export function setSoundFinishPlay(game: SmashedGame): void {
  game.ENERJA_FINISH.play();
}
export function setSoundFirstBloodPlay(game: SmashedGame): void {
  game.SOUND_FIRST_BLOOD.play();
}
export function setSoundProfoundPlay(game: SmashedGame): void {
  game.SOUND_INTRO.play();
}
export function setSoundSquishPlay(game: SmashedGame): void {
  game.SOUND_SQUISH.play();
}
export function setSoundEnerjaPlay(game: SmashedGame): void {
  game.ENERJA_SMASHED.play();
}
export function setSoundStartPlayLiquid(game: SmashedGame): void {
  game.SOUND_START_LIQUID.play();
}
export function setSoundStartPlay(game: SmashedGame): void {
  if (game.timeSecondsClock > 0) {
    game.SOUND_START.play();
  }
}
export function setPauseWiiMusic(game: SmashedGame): void {
  if (!game.SOUND_PAUSED.isPlaying) {
    return;
  }

  game.SOUND_PAUSED.pause();
}

export function playGarageRepeat(game: SmashedGame): void {
  if (game.SOUND_GARAGE_REPEAT.isPlaying) {
    return;
  }

  setBGMusicStop(game);
  setMusicBoxStop(game);
  setMusicChompSheepStop(game);
  setMusicBulletBillButtonStop(game);

  game.SOUND_GARAGE_REPEAT.play();
}
export function playWiiMusic(game: SmashedGame): void {
  if (game.SOUND_PAUSED.isPlaying) {
    return;
  }
  game.SOUND_PAUSED.play();
}
export function setPlayWiiMusicWaitShort(game: SmashedGame): void {
  if (game.SOUND_PAUSED.isPlaying) {
    return;
  }
  print(
    'ENOUGH TIME',
    getLongEnoughTimeDuration(game.DURATION_GAME_PAUSE_MUSIC_SHORT, game)
  );
  if (getLongEnoughTimeDuration(game.DURATION_GAME_PAUSE_MUSIC_SHORT, game)) {
    game.SOUND_PAUSED.play();
  }
}
export function setPlayWiiMusicWaitLong(game: SmashedGame): void {
  if (game.SOUND_PAUSED.isPlaying) {
    return;
  }

  if (getLongEnoughTimeDuration(game.DURATION_GAME_PAUSE_MUSIC_LONG, game)) {
    game.SOUND_PAUSED.play();
  }
}

////////////////////////////////////////
// BACKGROUND MUSIC
////////////////////////////////////////
export function setBGMusicPause(game: SmashedGame): void {
  if (!game.soundBGM.isPlaying) {
    return;
  }

  game.soundBGM.pause();
}
export function setBGMusicPlay(game: SmashedGame): void {
  if (game.soundBGM.isPlaying) {
    return;
  }

  game.soundBGM.play();
}
export function setBGMusicResume(game: SmashedGame): void {
  if (game.soundBGM.isPlaying) {
    return;
  }
  game.soundBGM.resume();
}
export function setBGMusicSpeedSlower(game: SmashedGame): void {
  game.soundBGM.setRate(increaseSemitones(1, -17));
}
export function setBGMusicSpeedNormal(game: SmashedGame): void {
  game.soundBGM.setRate(1);
}
export function setBGMusicStop(game: SmashedGame): void {
  if (!game.soundBGM.isPlaying) {
    return;
  }

  game.soundBGM.stop();
}

////////////////////////////////////////
// MUSIC BOX MUSIC
////////////////////////////////////////
export function setMusicBoxPlay(game: SmashedGame): void {
  if (game.flag.soundFlagMusicBox.isPlaying) {
    return;
  }
  game.flag.soundFlagMusicBox.play();
}
export function setMusicBoxResume(game: SmashedGame): void {
  if (game.flag.soundFlagMusicBox.isPlaying) {
    return;
  }

  setMusicBulletBillButtonPause(game);
  setBGMusicPause(game);

  game.flag.soundFlagMusicBox.resume();
}
export function setMusicBoxPause(game: SmashedGame): void {
  if (!game.flag.soundFlagMusicBox.isPlaying) {
    return;
  }

  setBGMusicResume(game);

  game.flag.soundFlagMusicBox.pause();
}
export function setMusicBoxStop(game: SmashedGame): void {
  if (!game.flag.soundFlagMusicBox.isPlaying) {
    return;
  }

  game.flag.soundFlagMusicBox.stop();
}

////////////////////////////////////////
// CHOMP SHEEP MUSIC
////////////////////////////////////////
export function setMusicChompSheepPlay(game: SmashedGame): void {
  if (game.debug.NN_Train_Easy || game.chomp.soundSheep.isPlaying) {
    return;
  }
  game.chomp.soundSheep.play();
}

export function setMusicChompSheepRate(
  game: SmashedGame,
  semitones: number
): void {
  game.chomp.soundSheep.setRate(increaseSemitones(1, semitones));
}

export function setMusicChompSheepPause(game: SmashedGame): void {
  if (game.debug.NN_Train_Easy || !game.chomp.soundSheep.isPlaying) {
    return;
  }

  game.chomp.soundSheep.pause();
}
export function setMusicChompSheepResume(game: SmashedGame): void {
  if (game.debug.NN_Train_Easy || game.chomp.soundSheep.isPlaying) {
    return;
  }

  game.chomp.soundSheep.resume();
}
export function setMusicChompSheepStop(game: SmashedGame): void {
  if (game.debug.NN_Train_Easy || !game.chomp.soundSheep.isPlaying) {
    return;
  }

  game.chomp.soundSheep.stop();
}

////////////////////////////////////////
// BULLET BILL BUTTON MUSIC
////////////////////////////////////////
export function setMusicBulletBillButtonPlay(game: SmashedGame): void {
  if (game.bulletBillCombo.button.sound.isPlaying) {
    return;
  }

  game.bulletBillCombo.button.sound.play();
}

export function setMusicBulletBillButtonRate(
  game: SmashedGame,
  semitones: number
): void {
  game.bulletBillCombo.button.sound.setRate(increaseSemitones(1, semitones));
}

export function setMusicBulletBillButtonPause(game: SmashedGame): void {
  if (!game.bulletBillCombo.button.sound.isPlaying) {
    return;
  }

  setBGMusicResume(game);

  game.bulletBillCombo.button.sound.pause();
}

export function setMusicBulletBillButtonResume(game: SmashedGame): void {
  if (game.bulletBillCombo.button.sound.isPlaying) {
    return;
  }

  setMusicBoxPause(game);
  setBGMusicPause(game);

  game.bulletBillCombo.button.sound.resume();
}

export function setMusicBulletBillButtonStop(game: SmashedGame): void {
  if (!game.bulletBillCombo.button.sound.isPlaying) {
    return;
  }

  game.bulletBillCombo.button.sound.stop();
}

export function playReadySound(game: SmashedGame): void {
  if (!game.SOUND_READY_REPEAT.isPlaying) {
    game.SOUND_READY_REPEAT.play();
  }
}

export function pauseReadySound(game: SmashedGame): void {
  if (game.SOUND_READY_REPEAT.isPlaying) {
    game.SOUND_READY_REPEAT.pause();
  }
}
export function playReadySoundPlayer(player: Player): void {
  if (!player.playerReadySound.isPlaying) {
    player.playerReadySound.play();
  }
}

export function pauseReadySoundPlayer(player: Player): void {
  if (player.playerReadySound.isPlaying) {
    player.playerReadySound.pause();
  }
}

export function setPauseAllReadySounds(game: SmashedGame): void {
  game.players.forEach((player, playerIndex) => {
    pauseReadySoundPlayer(player);
  });
}

export function setPlaySoundFireBall(game: SmashedGame): void {
  const i = game.fireFlower.fireBallSoundsIndexCurr;

  game.fireFlower.fireBallSounds[i].play();

  game.fireFlower.fireBallSoundsIndexCurr =
    (i + 1) % game.fireFlower.fireBallSounds.length;
}

export function setPlaySoundPowerup(game: SmashedGame): void {
  if (game.soundPowerup.isPlaying) {
    return;
  }

  const newRate = increaseSemitones(1, 5);
  game.soundPowerup.setRate(newRate);
  game.soundPowerup.play();
}
export function setStopSoundPowerup(game: SmashedGame): void {
  if (!game.soundPowerup.isPlaying) {
    return;
  }
  game.soundPowerup.stop();
}
export function setResumeSoundPowerup(game: SmashedGame): void {
  if (game.soundPowerup.isPlaying) {
    return;
  }
  game.soundPowerup.resume();
}
export function setPauseSoundPowerup(game: SmashedGame): void {
  if (!game.soundPowerup.isPlaying) {
    return;
  }
  game.soundPowerup.pause();
}
