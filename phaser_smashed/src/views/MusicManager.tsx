import { useRef } from 'react';
// @ts-ignore
// import importedSmallTalk from '../sounds/niemo_audio_small_talk.ogg';
// @ts-ignore
import importedMonkeys from '../sounds/monkeys.ogg';
// @ts-ignore
import importedGarage from '../sounds/garage.ogg';

function MusicManager() {
  const setupMusic = new Audio(importedGarage);
  // const setupMusic = new Audio(importedSmallTalk);
  setupMusic.volume = 0.2;
  setupMusic.loop = true;
  const musicSetupScreenRef = useRef<HTMLAudioElement>(setupMusic);

  const loadingMusic = new Audio(importedMonkeys);
  loadingMusic.volume = 0.3;
  loadingMusic.loop = true;
  const musicLoadingScreenRef = useRef<HTMLAudioElement>(loadingMusic);




  return { musicSetupScreenRef, musicLoadingScreenRef };
}

export default MusicManager;
