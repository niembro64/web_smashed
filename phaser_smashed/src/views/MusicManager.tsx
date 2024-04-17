import { useRef } from 'react';
// @ts-ignore
import importedSmallTalk from '../sounds/niemo_audio_small_talk.ogg';
// @ts-ignore
import importedMonkeys from '../sounds/monkeys.ogg';

function MusicManager() {
  const smallTalk = new Audio(importedSmallTalk);
  smallTalk.volume = 0.2;
  const smallTalkRef = useRef<HTMLAudioElement>(smallTalk);

  const monkeys = new Audio(importedMonkeys);
  monkeys.volume = 0.3;
  const monkeysRef = useRef<HTMLAudioElement>(monkeys);

  return { smallTalkRef, monkeysRef };
}

export default MusicManager;
