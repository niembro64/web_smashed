import { useSound } from 'use-sound';
// @ts-ignore
import importedWoah from '../sounds/BlackBetty_Woah.mp3';
// @ts-ignore
import importedBambalam from '../sounds/BlackBetty_Bambalam.mp3';
// @ts-ignore
import importedStartSound from '../sounds/start-reverb.wav';
// @ts-ignore
import importedBeeDee from '../sounds/beedee.wav';
// @ts-ignore
// import importedBlip2Sound from '../sounds/blip2.mp3';
// @ts-ignore
import importedBlip from '../sounds/blip.wav';
// @ts-ignore
import importedMeleeReady from '../sounds/melee_ready.mp3';
// @ts-ignore
import importedMeleeGo from '../sounds/melee_go.mp3';
// @ts-ignore
import importedMeleeChoose from '../sounds/melee_choose.mp3';
// @ts-ignore
import importedDice from '../sounds/dice_better.mp3';

export type SoundManagerType = {
  woah: () => void;
  bam: () => void;
  startSound: () => void;
  meleeReady: () => void;
  meleeGo: () => void;
  meleeChoose: () => void;
  beedeeSound: () => void;
  blipSoundSoft: () => void;
  blipBeedeeSound: () => void;
  dice: () => void;
};

export function SoundManager() {
  const [woah] = useSound(importedWoah, { volume: 0.2 });
  const [bam] = useSound(importedBambalam, { volume: 0.2 });
  const [meleeReady] = useSound(importedMeleeReady, { volume: 0.2 });
  const [meleeGo] = useSound(importedMeleeGo, { volume: 0.2 });
  const [meleeChoose] = useSound(importedMeleeChoose, { volume: 0.2 });
  const [startSound] = useSound(importedStartSound, { volume: 0.4 });
  const [blipSoundSoft] = useSound(importedBlip, { volume: 0.08 });
  const [blipSoundLoud] = useSound(importedBlip, { volume: 0.2 });
  const [beedeeSound] = useSound(importedBeeDee, { volume: 0.1 });

  const blipBeedeeSound = () => {
    blipSoundLoud();
    beedeeSound();
  };

  const [dice] = useSound(importedDice, { volume: 0.1 });
  return {
    woah,
    bam,
    startSound,
    meleeReady,
    meleeGo,
    meleeChoose,
    beedeeSound,
    blipSoundSoft,
    blipBeedeeSound,
    dice,
  };
}


