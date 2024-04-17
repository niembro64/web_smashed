import { useSound } from 'use-sound';
// @ts-ignore
import importedWoah from '../sounds/BlackBetty_Woah.mp3';
// @ts-ignore
import importedBambalam from '../sounds/BlackBetty_Bambalam.mp3';
// @ts-ignore
import importedStartSound from '../sounds/start.wav';
// @ts-ignore
import importedBlipSound from '../sounds/game-start-liquid.wav';
// @ts-ignore
import importedMeleeReady from '../sounds/melee_ready.mp3';
// @ts-ignore
import importedMeleeGo from '../sounds/melee_go.mp3';
// @ts-ignore
import importedMeleeChoose from '../sounds/melee_choose.mp3';

function SoundManager() {
  const [woah] = useSound(importedWoah, { volume: 0.2 });
  const [bam] = useSound(importedBambalam, { volume: 0.2 });
  const [meleeReady] = useSound(importedMeleeReady, { volume: 0.2 });
  const [meleeGo] = useSound(importedMeleeGo, { volume: 0.2 });
  const [meleeChoose] = useSound(importedMeleeChoose, { volume: 0.2 });
  const [startSound] = useSound(importedStartSound, { volume: 0.4 });
  const [blipSound] = useSound(importedBlipSound, { volume: 0.2 });
  return {
    woah,
    bam,
    startSound,
    meleeReady,
    meleeGo,
    meleeChoose,
    blipSound,
  };
}

export default SoundManager;
