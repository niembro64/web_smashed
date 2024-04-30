import { print } from '../../views/client';
import Game from '../Game';
import { Player } from '../interfaces';
import { getLongEnoughTimeDuration } from './state';

export function setSoundDiePlay(game: Game): void {
  game.SOUND_DIE.play();
}
export function setSoundFinishPlay(game: Game): void {
  game.ENERJA_FINISH.play();
}
export function setSoundFirstBloodPlay(game: Game): void {
  game.SOUND_FIRST_BLOOD.play();
}
export function setSoundProfoundPlay(game: Game): void {
  game.SOUND_INTRO.play();
}
export function setSoundSquishPlay(game: Game): void {
  game.SOUND_SQUISH.play();
}
export function setSoundEnerjaPlay(game: Game): void {
  game.ENERJA_SMASHED.play();
}
export function setSoundStartPlayLiquid(game: Game): void {
  game.SOUND_START_LIQUID.play();
}
export function setSoundStartPlay(game: Game): void {
  if (game.timeSecondsClock > 0) {
    game.SOUND_START.play();
  }
}
export function setPauseWiiMusic(game: Game): void {
  if (!game.SOUND_PAUSED.isPlaying) {
    return;
  }

  game.SOUND_PAUSED.pause();
}

export function playGarageRepeat(game: Game): void {
  if (game.SOUND_GARAGE_REPEAT.isPlaying) {
    return;
  }
  game.SOUND_GARAGE_REPEAT.play();
}
export function playWiiMusic(game: Game): void {
  if (game.SOUND_PAUSED.isPlaying) {
    return;
  }
  game.SOUND_PAUSED.play();
}
export function setPlayWiiMusicWaitShort(game: Game): void {
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
export function setPlayWiiMusicWaitLong(game: Game): void {
  if (game.SOUND_PAUSED.isPlaying) {
    return;
  }

  if (getLongEnoughTimeDuration(game.DURATION_GAME_PAUSE_MUSIC_LONG, game)) {
    game.SOUND_PAUSED.play();
  }
}
export function setBGMusicPause(game: Game): void {
  if (!game.SOUND_BGM.isPlaying) {
    return;
  }

  game.SOUND_BGM.pause();
}
export function setBGMusicPlay(game: Game): void {
  if (game.SOUND_BGM.isPlaying) {
    return;
  }

  game.SOUND_BGM.play();
}
export function setBGMusicResume(game: Game): void {
  if (game.SOUND_BGM.isPlaying) {
    return;
  }
  game.SOUND_BGM.resume();
}
export function setBGMusicSpeedFaster(game: Game): void {
  game.SOUND_BGM.setRate(increaseSemitones(1, 2));
}
export function setBGMusicSpeedNormal(game: Game): void {
  game.SOUND_BGM.setRate(1);
}
function increaseSemitones(frequency: number, semitones: number): number {
  return frequency * Math.pow(2, semitones / 12);
}

export function setMusicBoxPlay(game: Game): void {
  if (game.flag.soundFlagMusicBox.isPlaying) {
    return;
  }
  game.flag.soundFlagMusicBox.play();
}
export function setMusicBoxResume(game: Game): void {
  if (game.flag.soundFlagMusicBox.isPlaying) {
    return;
  }

  game.flag.soundFlagMusicBox.resume();
}
export function setMusicBoxPause(game: Game): void {
  if (!game.flag.soundFlagMusicBox.isPlaying) {
    return;
  }

  game.flag.soundFlagMusicBox.pause();
}
export function setMusicBoxStop(game: Game): void {
  if (!game.flag.soundFlagMusicBox.isPlaying) {
    return;
  }

  game.flag.soundFlagMusicBox.stop();
}

export function setMusicChompSheepPlay(game: Game): void {
  if (game.chomp.soundSheep.isPlaying) {
    return;
  }

  game.chomp.soundSheep.play();
}
export function setMusicChompSheepPause(game: Game): void {
  if (!game.chomp.soundSheep.isPlaying) {
    return;
  }

  game.chomp.soundSheep.pause();
}
export function setMusicChompSheepResume(game: Game): void {
  if (game.chomp.soundSheep.isPlaying) {
    return;
  }

  game.chomp.soundSheep.resume();
}
export function setMusicChompSheepStop(game: Game): void {
  if (!game.chomp.soundSheep.isPlaying) {
    return;
  }

  game.chomp.soundSheep.stop();
}

export function playReadySound(game: Game): void {
  if (!game.SOUND_READY_REPEAT.isPlaying) {
    game.SOUND_READY_REPEAT.play();
  }
}

export function pauseReadySound(game: Game): void {
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

export function setPauseAllReadySounds(game: Game): void {
  game.players.forEach((player, playerIndex) => {
    pauseReadySoundPlayer(player);
  });
}
