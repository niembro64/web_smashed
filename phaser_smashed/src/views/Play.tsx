import '@fontsource/press-start-2p';
import html2canvas from 'html2canvas';
import Phaser from 'phaser';
import ShakePositionPlugin from 'phaser3-rex-plugins/plugins/shakeposition-plugin.js';
import { useEffect, useRef, useState } from 'react';
import useSound from 'use-sound';
import '../App.css';
import Game from '../scenes/Game';
import { setGameState } from '../scenes/helpers/state';
// @ts-ignore
import importedWoah from '../sounds/BlackBetty_Woah.mp3';
// @ts-ignore
import importedBambalam from '../sounds/BlackBetty_Bambalam.mp3';
// @ts-ignore
import importedTrance from '../sounds/trance-loop.ogg';
// @ts-ignore
import importedStartSound from '../sounds/start.wav';
// @ts-ignore
import importedBlipSound from '../sounds/game-start-liquid.wav';
// @ts-ignore
import importedGarage from '../sounds/garage.ogg';
// @ts-ignore
import importedMonkeys from '../sounds/monkeys.ogg';
// @ts-ignore
import importedMeleeReady from '../sounds/melee_ready.mp3';
// @ts-ignore
import importedMeleeGo from '../sounds/melee_go.mp3';
// @ts-ignore
import importedMeleeChoose from '../sounds/melee_choose.mp3';
import moment from 'moment';
import { debugInit, debugMax, mainOptionsDebugShow } from '../debugOptions';
import { momentStringToMoment } from '../scenes/helpers/time';
import {
  bar,
  ButtonName,
  CharacterId,
  CharacterMove,
  Debug,
  emoji,
  GameStateWithTime,
  InputType,
  inputTypeNum,
  KeyboardGroup,
  PlayChezState,
  PlayerConfig,
  PlayerConfigSmall,
  Quote,
  SmashConfig,
  WebState,
  WorkingController,
} from '../scenes/interfaces';
import {
  axiosSaveOne,
  ClientInformation,
  fetchClientData,
  getAllAxios,
  print,
  SessionInfo,
  sumNumbersIn2DArrayString,
} from './client';

function Play() {
  const myPhaser: any = useRef(null);

  const [debug, setDebug] = useState<Debug>(debugInit);

  const [isReplayHidden, setIsReplayHidden] = useState(false);
  let videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const [videoGray, setVideoGray] = useState(false);

  useEffect(() => {
    // Define a function to update state on interaction
    const handleUserInteraction = () => {
      setWebState('start');

      // Optionally, remove event listeners if you only need the first interaction
      window.removeEventListener('click', handleUserInteraction);
      window.removeEventListener('keydown', handleUserInteraction);
    };

    // Add event listeners for various types of user interaction
    window.addEventListener('click', handleUserInteraction);
    window.addEventListener('keydown', handleUserInteraction);

    // Cleanup function to remove event listeners
    return () => {
      window.removeEventListener('click', handleUserInteraction);
      window.removeEventListener('keydown', handleUserInteraction);
    };
  }, []);

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (video === null || video === undefined || video.duration === Infinity) {
      videoRef.current!.playbackRate = 16;
      setVideoGray(true);
      return;
    }
    setVideoGray(false);

    let s = 5;
    let m = 2;
    let duration = video.duration;

    let pStart = duration - s > 0 ? duration - s : 0;
    let pMid = duration - m > 0 ? duration - m : 0;
    let pEnd = duration;
    let current = video.currentTime;

    if (debug.ReplayFastSlow) {
      if (current >= pStart && current < pMid) {
        // video.playbackRate = 2;
        // video.play();
        return;
      }

      if (current >= pMid && current < pEnd) {
        video.playbackRate = 0.5;
        // video.play();
        return;
      }
    }

    if (current >= pEnd) {
      current = pStart;
      video.currentTime = current;
      if (debug.ReplayFastSlow) {
        video.playbackRate = 2;
      } else {
        video.playbackRate = 1;
      }
      video.play();
      return;
    }
  };

  useEffect(() => {
    if (!debug.ReplayOn) {
      setIsReplayHidden(true);
      return;
    }

    const startRecording = () => {
      setIsReplayHidden(true);

      const canvas = myPhaser.current?.canvas;

      if (!canvas) {
        return;
      }

      const stream = canvas.captureStream();
      const mediaRecorder = new MediaRecorder(
        stream,
        debug.ReplayFullQuality
          ? {}
          : {
              videoBitsPerSecond: 1000000,
              // videoBitsPerSecond: 1000000
            }
      );

      mediaRecorder.ondataavailable = (e) => {
        chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        setIsReplayHidden(false);
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        videoRef.current!.controls = false;
        // videoRef.current!.controls = debug.ReplayControls
        videoRef.current!.src = url;
        videoRef.current!.play();
      };

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      mediaRecorderRef.current.start();
    };

    const stopRecording = () => {
      const mediaRecorder = mediaRecorderRef.current;

      if (mediaRecorder) {
        setTimeout(() => {
          mediaRecorder.stop();
        }, 1000);
      }
    };

    const handlePowerUpCollected = (event: any) => {
      const gameStateReact: GameStateWithTime = event.detail;
      bar();
      print('REACT PRINTING', gameStateReact);
      bar();

      let s = gameStateReact.nameCurr;

      switch (s) {
        case 'game-state-start':
          break;
        case 'game-state-play':
          startRecording();
          break;
        case 'game-state-paused':
          stopRecording();
          break;
        case 'game-state-first-blood':
          stopRecording();
          break;
        case 'game-state-screen-clear':
          stopRecording();
          break;
        case 'game-state-captured-flag':
          stopRecording();
          break;
        case 'game-state-finished':
          stopRecording();
          break;
        default:
          print('BROKEN_____________________');
      }
    };

    window.addEventListener('gameState', handlePowerUpCollected);

    return () => {
      window.removeEventListener('gameState', handlePowerUpCollected);
    };
  }, [debug.ReplayFullQuality, debug.ReplayOn]);

  const [session, setSession] = useState<SessionInfo | null>(null);
  const [allSessions, setAllSessions] = useState<SessionInfo[]>([]);

  // const [canPlayAudio, setCanPlayAudio] = useState<boolean>(false);
  const garage = new Audio(importedGarage);
  garage.volume = 0.05;
  const garageRef = useRef<HTMLAudioElement>(garage);
  const monkeys = new Audio(importedMonkeys);
  monkeys.volume = 0.05;
  const monkeysRef = useRef<HTMLAudioElement>(monkeys);

  // const [hasRunOnce, setHasRunOnce] = useState<boolean>(false);

  const [hideNiemoIp, setHideNiemoIp] = useState<boolean>(false);

  // useEffect(() => {
  //   print('canPlayAudio', canPlayAudio);

  //   if (canPlayAudio) {
  //     garageRef.current.play();
  //     garageRef.current.addEventListener('ended', () => {
  //       garageRef.current.play();
  //     });

  //     monkeysRef.current.addEventListener('ended', () => {
  //       monkeysRef.current.play();
  //     });
  //   }
  // }, [canPlayAudio]);

  // useEffect(() => {
  //   const handleInteraction = () => {
  //     setCanPlayAudio(true);
  //     // document.removeEventListener('click', handleInteractionReturn);
  //     // document.removeEventListener('keydown', handleInteractionReturn);
  //     document.removeEventListener('touchstart', handleInteractionReturn);
  //     print('An interaction has occurred!');
  //   };
  //   const handleInteractionReturn = () => {
  //     // setCanPlayAudio(false);
  //     print('An interaction has occurred!');
  //   };

  //   // Add event listener to document object for any user interaction
  //   // document.addEventListener('click', handleInteraction, { once: true });
  //   // document.addEventListener('keydown', handleInteraction, { once: true });
  //   document.addEventListener('touchstart', handleInteraction, { once: true });

  //   // Clean up event listener on unmount
  //   return () => {
  //     // document.removeEventListener('click', handleInteractionReturn);
  //     // document.removeEventListener('keydown', handleInteractionReturn);
  //     document.removeEventListener('touchstart', handleInteractionReturn);
  //   };
  // }, []);

  useEffect(() => {
    print('sessionInfo', session);
  }, [session]);

  useEffect(() => {
    if (allSessions === null) {
      return;
    }
    print('allSessions Updated');
    // print('allSessions', allSessions);
  }, [allSessions]);

  // const space: string = '&nbsp';

  function captureScreenshot() {
    print('Capture Screenshot');

    // Select the element that you want to capture a screenshot of
    const element = document.querySelector('#top-level');

    // Use html2canvas to capture a screenshot of the element
    html2canvas(element as HTMLElement).then((canvas) => {
      // Get a data URL representing the image
      const dataUrl = canvas.toDataURL();

      // Create an anchor element
      const link = document.createElement('a');

      // Set the href of the anchor element to the data URL
      link.href = dataUrl;

      // Set the download attribute of the anchor element
      let m = moment();
      let mFormatted = m.format('YYYY-MM-DD-HH-mm-ss');
      let fileName = `Smashed_Rules_${mFormatted}.png`;
      link.download = fileName;

      // Click the anchor element to trigger the download
      link.click();
    });
  }

  const trance = new Audio(importedTrance);
  trance.volume = 0.3;

  const tranceRef = useRef<HTMLAudioElement>(trance);
  tranceRef.current.volume = 0.3;
  const [woah] = useSound(importedWoah, { volume: 0.2 });
  const [bam] = useSound(importedBambalam, { volume: 0.2 });
  const [meleeReady] = useSound(importedMeleeReady, { volume: 0.2 });
  const [meleeGo] = useSound(importedMeleeGo, { volume: 0.2 });
  const [meleeChoose] = useSound(importedMeleeChoose, { volume: 0.2 });
  const [startSound] = useSound(importedStartSound, { volume: 0.4 });
  const [blipSound] = useSound(importedBlipSound, { volume: 0.2 });
  const [numClicks, setNumClicks] = useState<number>(0);
  const [webState, setWebState] = useState<WebState>('init');
  const [openEye, setOpenEye] = useState<boolean>(false);
  const [topBarDivExists, setTopBarDivExists] = useState<boolean>(false);

  const scrollerRef = useRef<HTMLDivElement>(null);

  const [playChezState, setPlayChezState] = useState<PlayChezState>({
    name: 'up',
    moment: moment(),
  });

  useEffect(() => {
    const handleTranceEnded = (): void => {
      setFirstCharacterSlot(4);
      setPlayChezState({ name: 'chez', moment: moment() });
    };

    print('playChezState', playChezState.name);

    switch (playChezState.name) {
      case 'up':
        tranceRef.current.pause();
        garageRef.current.play();
        tranceRef.current.removeEventListener('ended', handleTranceEnded);
        break;
      case 'down':
        tranceRef.current.play();
        garageRef.current.pause();
        tranceRef.current.addEventListener('ended', handleTranceEnded, {
          once: true,
        });
        break;
      case 'chez':
        garageRef.current.play();
        break;
    }
  }, [playChezState]);

  const onClickEye = () => {
    setOpenEye(!openEye);
  };

  useEffect(() => {
    const setShowLoaderIntervalFunction = () => {
      const myInterval = setInterval(() => {
        print(
          'myPhaser.current?.scene?.keys?.game?.loaded',
          myPhaser?.current?.scene?.keys?.game?.loaded
        );
        if (myPhaser?.current?.scene?.keys?.game?.loaded) {
          setTimeout(
            () => {
              setWebState('play');
            },
            debug.DevMode ? 0 : 1
          );
          clearInterval(myInterval);
        }
      }, 1);
    };

    print('webState', webState);
    switch (webState) {
      case 'init':
        print('init');
        break;
      case 'start':
        choosePlay();
        startSound();
        garageRef.current.play();
        monkeysRef.current.pause();
        setTopBarDivExists(false);
        setTimeout(() => {
          setTopBarDivExists(true);
        }, 4000);
        (async () => {
          const allSessions: SessionInfo[] = await getAllAxios();
          setAllSessions(allSessions);
        })();
        break;
      case 'loader':
        readyPlay();
        startSound();
        garageRef.current.pause();
        monkeysRef.current.play();
        setShowLoaderIntervalFunction();
        break;
      case 'play':
        goPlay();
        garageRef.current.pause();
        monkeysRef.current.pause();
        setTopBarDivExists(true);
        break;
      default:
        break;
    }
  }, [debug.DevMode, webState]);

  const keyboardGroups: KeyboardGroup[][] = [
    [
      { left: 'D-Pad:', right: 'W A S D' },
      { left: 'A X B Y:', right: 'F G H Space' },
      { left: 'L Select Start R:', right: 'R T Y U' },
    ],
    [
      { left: 'D-Pad:', right: 'ArrowKeys' },
      { left: 'A X B Y:', right: '4 5 6 Enter' },
      { left: 'L Select Start R:', right: '7 8 9 +' },
    ],
  ];

  const [workingControllers, setWorkingControllers] = useState<
    WorkingController[]
  >([
    {
      name: 'Wired SNES iNNEXT',
      url: 'https://www.amazon.com/dp/B01MYUDDCV?ref=ppx_yo2ov_dt_b_product_details&th=1/',
    },
    {
      name: 'Wired N64 KIWITATA',
      url: 'https://www.amazon.com/gp/product/B08X677HR4/ref=ppx_yo_dt_b_search_asin_title?ie=UTF8&psc=1',
    },
    {
      name: 'Wired GameCube Mekela NGC',
      url: 'https://www.amazon.com/Mekela-5-8-foot-classic-controller-Windows/dp/B07GSSXS84/ref=sr_1_5?crid=3N3MSRPF8INFK&keywords=Mekela+5.8+feet+Classic+USB+wired+NGC+Controller&qid=1673335159&sprefix=mekela+5.8+feet+classic+usb+wired+ngc+controller%2Caps%2C68&sr=8-5',
    },
    {
      name: 'Wired Switch PowerA Nintendo',
      url: 'https://www.amazon.com/gp/product/B07PDJ45BT/ref=ppx_yo_dt_b_search_asin_title?ie=UTF8&psc=1',
    },
    {
      name: 'Wireless Switch Pro Nintendo',
      url: 'https://www.amazon.com/gp/product/B01NAWKYZ0/ref=ppx_yo_dt_b_search_asin_title?ie=UTF8&psc=1',
    },
  ]);

  // set initial inputs in inputArray
  // 0 -> none
  // 1 -> gamepad
  // 2 -> keyboard
  // 3 -> bot Rules-Based
  // 4 -> bot Neural-Network
  const [inputArray, setInputArray] = useState<InputType[]>([3, 4, 4, 4]);
  const [smashConfig, setSmashConfig] = useState<SmashConfig>({
    players: [
      {
        characterId: 0,
        input: 0, // don't set this here
      },
      {
        characterId: 7,
        input: 0, // don't set this here
      },
      {
        characterId: 6,
        input: 0, // don't set this here
      },
      {
        characterId: 8,
        input: 0, // don't set this here
      },
    ],
  });

  const getNumActiveBeforeMe = (index: number): number => {
    let numActiveBeforeMe = 0;
    for (let i = 0; i < index; i++) {
      if (inputArray[i] !== 0) {
        numActiveBeforeMe++;
      }
    }
    return numActiveBeforeMe;
  };
  const idColors: string[] = ['id-red', 'id-blue', 'id-yellow', 'id-green'];

  useEffect(() => {
    print('smashConfig', smashConfig);
    // setPlayChezState({ name: 'up', moment: moment() });
  }, [smashConfig]);

  // always keep Chez and BlackChez at positions 4 and 5
  const smashConfigOptions: PlayerConfig[] = [
    { characterId: 0, scale: 0.9, name: 'Mario', nameShort: 'MAR' },
    { characterId: 1, scale: 0.9, name: 'Link', nameShort: 'LNK' },
    { characterId: 2, scale: 1, name: 'Pikachu', nameShort: 'PKA' },
    { characterId: 3, scale: 0.7, name: 'Kirby', nameShort: 'KRB' },
    { characterId: 4, scale: 1.2, name: 'Chez', nameShort: 'CHZ' },
    { characterId: 5, scale: 1.2, name: 'Black Chez', nameShort: 'BCZ' },
    { characterId: 6, scale: 0.6, name: 'G. Koopa', nameShort: 'GKP' },
    { characterId: 7, scale: 0.6, name: 'R. Koopa', nameShort: 'RKP' },
    { characterId: 8, scale: 0.6, name: 'B. Koopa', nameShort: 'BKP' },
  ];

  const randomizeCharacters = () => {
    const numBase: number = 4;
    const numChez: number = debug.UseChez ? 2 : 0;
    const numKoopas: number = debug.UseKoopas ? 3 : 0;
    const numTotal: number = numBase + numChez + numKoopas;

    const ratioBase: number = numBase / numTotal;
    const ratioChez: number = numChez / numTotal;

    const baseUpperLimit: number = ratioBase;
    const chezUpperLimit: number = baseUpperLimit + ratioChez;

    const newPlayers: PlayerConfigSmall[] = [];

    for (let i = 0; i < 4; i++) {
      const rand: number = Math.random();
      let newId: number | null = null;

      if (rand < baseUpperLimit) {
        newId = Math.floor(Math.random() * 4);
      } else if (rand < chezUpperLimit) {
        newId = 4 + Math.floor(Math.random() * 2);
      } else {
        newId = 6 + Math.floor(Math.random() * 3);
      }

      newPlayers.push({
        characterId: newId as CharacterId,
        input: 0,
      });
    }

    setSmashConfig({ players: newPlayers });
  };
  let config: Phaser.Types.Core.GameConfig = {
    plugins: {
      global: [
        {
          key: 'rexShakePosition',
          plugin: ShakePositionPlugin,
          start: true,
        },
      ],
    },
    transparent: true,
    title: 'Smashed',
    antialias: true,
    pixelArt: false,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: 1920,
      height: 1080,
    },
    type: Phaser.AUTO,
    parent: 'phaser-container',
    backgroundColor: '#00000055',
    input: {
      gamepad: true,
    },
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 3000 * (debug.GravityLight ? 0.5 : 1) },
        debug: debug.DevMode,
      },
    },
    scene: [Game],
  };
  let setTimeoutQuotesLengthStart: number = 3000;
  let setTimeoutQuotesLengthReStart: number = 1500;
  const [quotesRandomNumber, setQuotesRandomNumber] = useState(0);
  const quotes: Quote[] = [
    { name: 'Breezy', text: 'The turtle will die.' },
    { name: 'TR3', text: 'SMASHED!!!' },
    { name: 'Chadams', text: 'Two shots... two shots.' },
    { name: 'Eddie-Z', text: "He'll do it again, yeah!" },
    {
      name: 'TR3',
      text: 'How am I supposed to make more than that... $#!&... happen?',
    },
    {
      name: 'DDj',
      text: "It's safe to say we're not going to the bars tonite.",
    },
    {
      name: 'Deen Davis Jr.',
      text: '...yes you are.',
    },
    // { name: 'Chadams', text: 'AAAYYYUUUGGGGHHHH!!' },
    // { name: 'Chadams', text: 'Spike Enerjeaoah.' },
    // { name: 'Chadams', text: "Stop breakin' shit." },
    // { name: 'Chadams', text: 'Is there no one else?' },
    // { name: 'Deen Davis Jr.', text: 'VIDEOTAPE MA-SELF FUCKIN YOU UP!' },
    // { name: 'Breezy', text: 'Oh, is it? Oh cool. Ur soo cool.' },
    { name: 'Lau', text: "I'm sorry, I didn't know it was gonna happen." },
    // { name: "Gin", text: "Clean it up, and we'll do it again." },
    { name: 'Ginman', text: "Set it up... and we'll do it... again." },
    // { name: 'Gin', text: 'Shitty, shitty-fuckin-ass.' },
    {
      name: 'Deen Davis Jr.',
      text: 'I can fight you one-handed.',
    },
    // {
    //   name: 'DDj',
    //   text: 'I thought you put Spike in there.',
    // },
  ];
  const componentPseudoLoad = useRef(true);
  const intervalClock: any = useRef(null);

  const p1Keys: string[] = ['w', 'a', 's', 'd'];
  const p2Keys: string[] = ['ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight'];

  const [p1KeysTouched, setP1KeysTouched] = useState<boolean>(false);
  const [p2KeysTouched, setP2KeysTouched] = useState<boolean>(false);
  const [bothKeysTouched, setBothKeysTouched] = useState<boolean>(false);
  const [anyKeyWasPressed, setAnyKeyWasPressed] = useState<boolean>(false);
  const [numKeyboards, setNumKeyboards] = useState<number>(0);

  const onClickStartStartButton = async () => {
    // if (myPhaser?.current?.scene?.keys?.game?.loaded) {
    if (myPhaser?.current?.scene?.keys?.game) {
      myPhaser.current.scene.keys.game.loaded = false;
      myPhaser.current.destroy(true);
    }

    setShowControls(false);
    setShowControllers(false);
    setShowRulesN64(false);
    setShowAbout(false);
    setShowHistory(false);
    setShowOptions(false);

    setPlayChezState({ name: 'up', moment: moment() });
    // startSound();
    // setWebState('loader');

    let players = JSON.parse(JSON.stringify(smashConfig.players));
    // let newPlayers: {
    //   name: CharacterName;
    //   characterId: CharacterId;
    //   scale: number;
    // }[] = [];
    let newPlayers: PlayerConfigSmall[] = [];
    inputArray.forEach((input, inputIndex) => {
      switch (input) {
        case 0:
          break;
        case 1:
          newPlayers.push({
            // name: players[inputIndex].name,
            // name: smashConfigOptions[players[inputIndex].characterId].name,
            characterId: players[inputIndex].characterId,
            // scale: players[inputIndex].scale,
            // scale: smashConfigOptions[players[inputIndex].characterId].scale,
            input: inputArray[inputIndex],
          });
          break;
        case 2:
          newPlayers.push({
            // name: players[inputIndex].name
            // name: smashConfigOptions[players[inputIndex].characterId].name,
            characterId: players[inputIndex].characterId,
            // scale: players[inputIndex].scale,
            // scale: smashConfigOptions[players[inputIndex].characterId].scale,
            input: inputArray[inputIndex],
          });
          break;
        case 3:
          newPlayers.push({
            // name: players[inputIndex].name,
            // name: smashConfigOptions[players[inputIndex].characterId].name,
            characterId: players[inputIndex].characterId,
            // scale: players[inputIndex].scale,
            // scale: smashConfigOptions[players[inputIndex].characterId].scale,
            input: inputArray[inputIndex],
          });
          break;
        case 4:
          newPlayers.push({
            // name: players[inputIndex].name,
            // name: smashConfigOptions[players[inputIndex].characterId].name,
            characterId: players[inputIndex].characterId,
            // scale: players[inputIndex].scale,
            // scale: smashConfigOptions[players[inputIndex].characterId].scale,
            input: inputArray[inputIndex],
          });
          break;
        default:
          print("inputArray[inputIndex] didn't match any cases");
          break;
      }
      // if (input.state) {
      //   newPlayers.push({
      //     name: players[inputIndex].name as CharacterName,
      //     characterId: players[inputIndex].characterId as CharacterId,
      //     scale: players[inputIndex].scale,
      //   });
      // }
    });
    let newSmashConfig: SmashConfig = { players: [...newPlayers] };
    setQuotesRandomNumber(Math.floor(Math.random() * quotes.length));

    if (!debug.LoadTimeExtra || debug.DevMode) {
      setTimeoutQuotesLengthStart = 0;
    }
    let myMoment = moment();
    // let myDate = momentToDate(myMoment);

    // setShowLoader(true);
    setWebState('loader');

    setTimeout(() => {
      myPhaser.current = new Phaser.Game(config);
      myPhaser.current.registry.set('parentContext', Play);
      myPhaser.current.registry.set('smashConfig', newSmashConfig);
      myPhaser.current.registry.set('debug', debug);
      myPhaser.current.registry.set('myMoment', myMoment);
    }, setTimeoutQuotesLengthStart);

    let c: ClientInformation = await fetchClientData();
    let s: SessionInfo = await axiosSaveOne(myMoment, c, newSmashConfig, debug);
    setSession(s);
  };

  const getNumKeyboardsInUse = (): number => {
    let numKeyboardsInUse = 0;
    inputArray.forEach((input) => {
      if (input === 2) {
        numKeyboardsInUse++;
      }
    });
    return numKeyboardsInUse;
  };

  const onClickSetInputArrayElement = (
    playerIndex: number,
    newInput: InputType
  ): void => {
    blipSound();
    let i = newInput;
    let k = getNumKeyboardsInUse();
    if (i === 2 && k >= 2) {
      i++;
    }
    let newInputArray = [...inputArray];
    newInputArray[playerIndex] = i as InputType;
    setInputArray([...newInputArray]);
    print('i', i, 'newInputArray', newInputArray);
  };

  const bamPlay = (): void => {
    bam();
  };
  const woahPlay = (): void => {
    woah();
  };
  const readyPlay = (): void => {
    meleeReady();
  };
  const goPlay = (): void => {
    meleeGo();
  };
  const choosePlay = (): void => {
    meleeChoose();
  };

  const setFirstCharacterSlot = (charId: CharacterId): void => {
    if (debug.UseChez || webState === 'play') {
      return;
    }
    if (charId === 4) {
      bamPlay();
      // onClickSetInputArrayElement(0, 2);
      // onClickSetInputArrayElement(1, 0);
      // onClickSetInputArrayElement(2, 0);
      // onClickSetInputArrayElement(3, 0);
      // onClickSetChez();
      setInputArray([2, 0, 0, 0]);
    }
    if (charId === 5) {
      woahPlay();
      // onClickSetInputArrayElement(0, 2);
      // onClickSetInputArrayElement(1, 0);
      // onClickSetInputArrayElement(2, 0);
      // onClickSetInputArrayElement(3, 0);
      // onClickSetBlackChez();
      setInputArray([2, 0, 0, 0]);
    }

    let choices = [...smashConfig.players];
    let choice = choices[0];
    choice.characterId = charId;
    let tempScale = ensureTypeCharacterId(
      smashConfigOptions.find((s, sIndex) => {
        return s.characterId === choice.characterId;
      })
    ).scale;
    let tempName = ensureTypeCharacterName(
      smashConfigOptions.find((s) => {
        return s.characterId === choice.characterId;
      })
    ).name;

    setSmashConfig({ players: [...choices] });
  };

  function ensureTypeCharacterId<CharacterId>(
    argument: CharacterId | undefined | null,
    message: string = 'This value was promised to be there.'
  ): CharacterId {
    if (argument === undefined || argument === null) {
      throw new TypeError(message);
    }

    return argument;
  }

  function ensureTypeCharacterName<CharacterName>(
    argument: CharacterName | undefined | null,
    message: string = 'This value was promised to be there.'
  ): CharacterName {
    if (argument === undefined || argument === null) {
      throw new TypeError(message);
    }

    return argument;
  }

  const onClickRotateSelection = (playerIndex: number): void => {
    blipSound();
    const choices = [...smashConfig.players];
    const choice = choices[playerIndex];

    let newCharacterId = choice.characterId + 1;

    // player cannot directly select Chez or BlackChez
    if (!debug.DevMode && !debug.UseChez) {
      while (newCharacterId === 4 || newCharacterId === 5) {
        newCharacterId++;
      }
    }

    if (newCharacterId > smashConfigOptions.length - 1) {
      newCharacterId = 0;
    }

    if (!debug.DevMode && !debug.UseKoopas && newCharacterId > 5) {
      newCharacterId = 0;
    }

    choice.characterId = newCharacterId as CharacterId;

    let tempScale = smashConfigOptions.find((s, sIndex) => {
      return s.characterId === choice.characterId;
    })?.scale;
    let tempName = ensureTypeCharacterName(
      smashConfigOptions.find((s, sIndex) => {
        return s.characterId === choice.characterId;
      })
    ).name;

    // choice.scale = tempScale ? tempScale : 1;
    // choice.name = tempName;
    setSmashConfig({ players: [...choices] });
  };

  // ✔️🚧❌🚫🛑🔜📄📋⚙️🚪⛔⌚🕹️🎮☠️👾💣🔥​➡️​⌨️​⌨🧊🌑🌒🌙⭐🌞☁☁☁
  // 🏴‍☠️🏳️🏁🏴
  // 🔴🟠🟡🟢🔵🟣🟤⚫⚪
  // ⌨🎮

  const [showRulesN64, setShowRulesN64] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [showControllers, setShowControllers] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const characterMoves: CharacterMove[] = [
    { button: 'D-Pad', move: 'Move', status: emoji.greenCheck },
    { button: 'Ground + X', move: 'Jump', status: emoji.greenCheck },
    { button: 'Air + X', move: 'Double Jump', status: emoji.greenCheck },
    { button: 'Air + D-Pad + A', move: 'Air Dodge', status: emoji.caution },
    { button: 'B', move: 'Physical Attack', status: emoji.caution },
    { button: 'Y', move: 'Energy Attack', status: emoji.greenCheck },
    { button: 'Forward + B', move: 'Smash Attack', status: emoji.redX },
    {
      button: 'Air + Wall + Forward',
      move: 'Wall Slide',
      status: emoji.greenCheck,
    },
    {
      button: 'L + R for 5 Seconds',
      move: 'Suicide',
      status: emoji.greenCheck,
    },
    { button: 'Start', move: 'Pause', status: emoji.greenCheck },
    { button: 'Paused + Any Button', move: 'Ready', status: emoji.greenCheck },
    { button: 'Paused + All Ready', move: 'UnPause', status: emoji.greenCheck },
  ];

  const clickPauseParent = () => {
    print('GAME STATE', myPhaser.current?.scene?.keys?.game.gameState.nameCurr);
    if (webState === 'play') {
      if (
        myPhaser.current?.scene?.keys?.game.gameState.nameCurr !==
          'game-state-start' &&
        myPhaser.current?.scene?.keys?.game.gameState.nameCurr !==
          'game-state-paused' &&
        myPhaser.current?.scene?.keys?.game.gameState.nameCurr !==
          'game-state-first-blood' &&
        myPhaser.current?.scene?.keys?.game.gameState.nameCurr !==
          'game-state-screen-clear' &&
        myPhaser.current?.scene?.keys?.game.gameState.nameCurr !==
          'game-state-captured-flag' &&
        myPhaser.current?.scene?.keys?.game.gameState.nameCurr !==
          'game-state-finished'
      ) {
        print('CLICK AND PAUSING');
        setGameState(myPhaser.current?.scene?.keys?.game, 'game-state-paused');
      }
    }
  };

  const onClickPlayNavBody = (buttonName: ButtonName) => {
    blipSound();

    setShowControls(false);
    setShowControllers(false);
    setShowRulesN64(false);
    setShowAbout(false);
    setShowHistory(false);
    setShowOptions(false);
  };

  const onClickPlayNavButtons = (buttonName: ButtonName) => {
    blipSound();
    clickPauseParent();

    switch (buttonName) {
      case 'Back':
        setShowControls(false);
        setShowControllers(false);
        setShowRulesN64(false);
        setShowAbout(false);
        setShowHistory(false);
        setShowOptions(false);
        break;
      case 'ReStart':
        setShowControls(false);
        setShowControllers(false);
        setShowRulesN64(false);
        setShowAbout(false);
        setShowHistory(false);
        setShowOptions(false);
        break;
      case 'Controls':
        setShowControls(!showControls);
        setShowControllers(false);
        setShowRulesN64(false);
        setShowAbout(false);
        setShowHistory(false);
        setShowOptions(false);
        break;
      case 'Controllers':
        setShowControls(false);
        setShowControllers(!showControllers);
        setShowRulesN64(false);
        setShowAbout(false);
        setShowHistory(false);
        setShowOptions(false);
        break;
      case 'Rules-N64':
        setShowControls(false);
        setShowControllers(false);
        setShowRulesN64(!showRulesN64);
        setShowAbout(false);
        setShowHistory(false);
        setShowOptions(false);
        break;
      case 'About':
        setShowControls(false);
        setShowControllers(false);
        setShowRulesN64(false);
        setShowAbout(!showAbout);
        setShowHistory(false);
        setShowOptions(false);
        break;
      case 'History':
        setShowControls(false);
        setShowControllers(false);
        setShowRulesN64(false);
        setShowAbout(false);
        setShowHistory(!showHistory);
        setShowOptions(false);
        break;
      case 'Options':
        setShowControls(false);
        setShowControllers(false);
        setShowRulesN64(false);
        setShowAbout(false);
        setShowHistory(false);
        setShowOptions(!showOptions);
        break;
      default:
        setShowControls(false);
        setShowControllers(false);
        setShowRulesN64(false);
        setShowAbout(false);
        setShowHistory(false);
        setShowOptions(false);
    }
  };

  const onClickOscura = (index: number) => {
    onClickSetInputArrayElement(
      index,
      inputArray[index] + 1 >= inputTypeNum
        ? (0 as InputType)
        : ((inputArray[index] + 1) as InputType)
    );
  };

  const xxx = () => {
    onClickStartStartButton();
  };

  const onEventKeyboard = (event: any) => {
    let k = event.key;

    if (webState === 'start') {
      let pIndex;
      switch (k) {
        case 'Enter':
          onClickStartStartButton();
          break;
        // case 'a':
        //   pIndex = 0;
        //   if (inputArray[pIndex] !== 0) {
        //     onClickRotateSelection(pIndex);
        //   }
        //   break;
        // case 's':
        //   pIndex = 1;
        //   if (inputArray[pIndex] !== 0) {
        //     onClickRotateSelection(pIndex);
        //   }
        //   break;
        // case 'd':
        //   pIndex = 2;
        //   if (inputArray[pIndex] !== 0) {
        //     onClickRotateSelection(pIndex);
        //   }
        //   break;
        // case 'f':
        //   pIndex = 3;
        //   if (inputArray[pIndex] !== 0) {
        //     onClickRotateSelection(pIndex);
        //   }
        //   break;
        case 'j':
          onClickOscura(0);
          break;
        case 'k':
          onClickOscura(1);
          break;
        case 'l':
          onClickOscura(2);
          break;
        case ';':
          onClickOscura(3);
          break;
        case 'u':
          pIndex = 0;
          if (inputArray[pIndex] !== 0) {
            onClickRotateSelection(pIndex);
          }
          break;
        case 'i':
          pIndex = 1;
          if (inputArray[pIndex] !== 0) {
            onClickRotateSelection(pIndex);
          }
          break;
        case 'o':
          pIndex = 2;
          if (inputArray[pIndex] !== 0) {
            onClickRotateSelection(pIndex);
          }
          break;
        case 'p':
          pIndex = 3;
          if (inputArray[pIndex] !== 0) {
            onClickRotateSelection(pIndex);
          }
          break;
      }
    }

    if (webState === 'play') {
      if (p1Keys.includes(k)) {
        setP1KeysTouched(true);
      }
      if (p2Keys.includes(k)) {
        setP2KeysTouched(true);
      }
      switch (k) {
        case 'Backspace':
          // onClickReStartEventHandler();
          xxx();
          // onClickStartStartButton();
          break;
        case 'Escape':
          onClickBackEventHandler();
          break;
      }
    }
  };

  const cb = (event: any) => {
    onEventKeyboard(event);
    setAnyKeyWasPressed(!anyKeyWasPressed);
  };

  useEffect(() => {
    window.addEventListener<'keydown'>('keydown', cb, { once: true });
  }, [anyKeyWasPressed]);

  const getNumControllersExistLower = (myI: number): number => {
    let num: number = 0;

    inputArray.forEach((ia: number, iaIndex: number) => {
      if (ia === 1 && iaIndex < myI) {
        num++;
      }
    });

    return num;
  };

  const [tz, setTz] = useState('');
  useEffect(() => {
    const clientTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone; // get client's local timezone
    setTz(clientTimezone);
  }, []);

  const getDoesKeyboardExistLower = (myI: number): boolean => {
    let exists: boolean = false;

    inputArray.forEach((ia: number, iaIndex: number) => {
      if (ia === 2 && iaIndex < myI) {
        exists = true;
      }
    });

    return exists;
  };

  const onClickBackEventHandler = () => {
    if (myPhaser?.current?.scene?.keys?.game) {
      myPhaser.current.scene.keys.game.loaded = false;
    }
    onClickPlayNavButtons('Back');
    setNumClicks(numClicks + 1);
    clearInterval(intervalClock.current);
    intervalClock.current = null;
    componentPseudoLoad.current = true;
    myPhaser.current.destroy(true);
    // setP1KeysTouched(false);
    // setP2KeysTouched(false);
    // setWebState('init');
    // setTimeout(() => {
    //   setWebState('start');
    // }, 1);
    setWebState('start');
  };

  useEffect(() => {
    if (webState === 'init') {
      setP1KeysTouched(true);
      setP2KeysTouched(true);
    }
    if (webState === 'start') {
      setP1KeysTouched(true);
      setP2KeysTouched(true);
    }
    if (webState === 'play') {
      let numKeyboards = getNumKeyboardsInUse();
      switch (numKeyboards) {
        case 0:
          setP1KeysTouched(true);
          setP2KeysTouched(true);
          break;
        case 1:
          setP1KeysTouched(false);
          setP2KeysTouched(true);
          break;
        case 2:
          setP1KeysTouched(false);
          setP2KeysTouched(false);
          break;
      }
    }
  }, [webState]);

  useEffect(() => {
    // setPlayChezState({ name: 'up', moment: moment() });
    let numK = 0;
    inputArray.forEach((input) => {
      if (input === 2) {
        numK++;
      }
    });
    setNumKeyboards(numK);
  }, [inputArray]);

  useEffect(() => {
    if (p1KeysTouched && p2KeysTouched) {
      setBothKeysTouched(true);
    } else {
      setBothKeysTouched(false);
    }
  }, [p1KeysTouched, p2KeysTouched]);

  const getMaxFromKey = (key: string) => {
    print('getInitFromKey', key);

    let newVal = debugMax[key as keyof Debug];
    return newVal;
  };

  const [text, setText] = useState('');
  const interval: any = useRef(null);
  // const [quoteCss, setQuoteCss] = useState<boolean>(false);

  useEffect(
    function () {
      if (!debug.TypedLoadingText) {
        return;
      }

      if (interval.current !== null) {
        clearInterval(interval.current);
      }

      let tempIndex = 0;
      let tempText = '';
      interval.current = setInterval(function () {
        tempText = quotes[quotesRandomNumber].text.substring(0, tempIndex + 1);
        setText(tempText);

        if (tempIndex === quotes[quotesRandomNumber].text.length - 1) {
          clearInterval(interval.current);
          interval.current = null;
        }

        tempIndex++;
      }, 1700 / quotes[quotesRandomNumber].text.length);
    },
    [quotesRandomNumber, webState]
  );

  return (
    <div id="top-level" className="over-div">
      {/* <div className="download-screenshot">Download Screenshot</div> */}
      {!debug.DevMode &&
        webState !== 'start' &&
        numKeyboards === 2 &&
        !bothKeysTouched && (
          <div
            className="keyboard-explainer-double"
            onClick={() => {
              onClickPlayNavButtons('Controls');
            }}
          >
            {!p1KeysTouched && (
              <div className="keyboard-left-checkmark">
                <span>Awaiting</span>
                <div className="small-spinner ss-red"></div>
                <span>WASD</span>
              </div>
            )}
            {!p2KeysTouched && (
              <div className="keyboard-right-checkmark">
                <span>Awaiting</span>
                <div className="small-spinner ss-blue"></div>
                <span>Arrows</span>
              </div>
            )}
          </div>
        )}
      {!debug.DevMode &&
        webState !== 'start' &&
        numKeyboards === 1 &&
        !p1KeysTouched && (
          <div
            className="keyboard-explainer-single"
            onClick={() => {
              onClickPlayNavButtons('Controls');
            }}
          >
            <div className="keyboard-left-checkmark">
              <span>Awaiting</span>
              <div className="small-spinner ss-red"></div>
              <span>WASD</span>
            </div>
          </div>
        )}
      {webState === 'loader' && (
        // {true && (
        <div className="loader">
          {/* {quotesRandomNumber % 2 === 0 && (
            <div className="loader-inner">
              <div className="loader-line-wrap">
                <div className="loader-line"></div>
              </div>
              <div className="loader-line-wrap">
                <div className="loader-line"></div>
              </div>
              <div className="loader-line-wrap">
                <div className="loader-line"></div>
              </div>
              <div className="loader-line-wrap">
                <div className="loader-line"></div>
              </div>
            </div>
          )} */}
          {/* {quotesRandomNumber % 2 !== 0 && ( */}
          <div className="spinnerShrink">
            <div className="spinnerOuterOuter">
              <div className="spinnerOuter">
                <div className="spinner">
                  <div className="cube_side">
                    <div className="cube_side_inside"></div>
                  </div>
                  <div className="cube_side">
                    <div className="cube_side_inside"></div>
                  </div>
                  <div className="cube_side">
                    <div className="cube_side_inside"></div>
                  </div>
                  <div className="cube_side">
                    <div className="cube_side_inside"></div>
                  </div>
                  <div className="cube_side">
                    <div className="cube_side_inside"></div>
                  </div>
                  <div className="cube_side">
                    <div className="cube_side_inside"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* )} */}
          <div className="loading-table-wrapper">
            <img
              className="loading-table"
              src="/images/table.png"
              alt="table"
            />
          </div>
          {debug.TypedLoadingText && (
            <p className={'.first-loader-p'}>{text}</p>
          )}
          {!debug.TypedLoadingText && (
            <p className="first-loader-p">{quotes[quotesRandomNumber].text}</p>
          )}
          <p className="second-loader-p">- {quotes[quotesRandomNumber].name}</p>
        </div>
      )}
      <div className="phaser-container" id="phaser-container"></div>
      {(webState === 'start' || webState === 'init') && (
        <div className="start-class-div">
          {!debug.DevMode && (
            <div
              className={
                'black-hiding-div' +
                (webState === 'init'
                  ? ' black-hiding-div-init'
                  : ' black-hiding-div-start')
              }
            />
          )}
          <div className={'startTitleWrapper'}>
            <div
              className={
                'startTitle' +
                (webState === 'start' ? ' startTitleStart' : ' startTitleInit')
              }
              onMouseDown={() => {
                console.log('mouse down');
                // setWebState('start');
              }}
              onMouseUp={() => {
                console.log('mouse up');
              }}
            >
              <div>
                <img src="images/smashed_x10_gif.gif" alt="Smashed Title Gif" />
              </div>
              <h1>{webState === 'init' ? 'CLICK ME!' : 'SMASHED BROS'}</h1>
            </div>
          </div>

          <div className="player-choices">
            <div className="player-choices-left">
              {Object.entries(debug).map(([key, value], index: number) => {
                if (!mainOptionsDebugShow[key]) {
                  return null;
                }

                return (
                  <div
                    id="optionStart"
                    key={index}
                    onClick={(e) => {
                      blipSound();
                      e.stopPropagation();
                      if (typeof value === 'number') {
                        setDebug((prevState) => ({
                          ...prevState,
                          [key]:
                            value - 1 < 0
                              ? getMaxFromKey(key)
                              : // ? getMaxFromKey(key as keyof Debug)
                                value - 1,
                        }));
                        print(index, key, value);
                      }

                      if (typeof value === 'boolean') {
                        setDebug((prevState) => ({
                          ...prevState,
                          [key]: !value,
                        }));
                        print(index, key, value);
                      }
                    }}
                  >
                    {key === 'MusicTrack' && (
                      <p className="key-start">
                        Music{' '}
                        {(() => {
                          switch (value) {
                            case 0:
                              return 'Dreamland';
                            case 1:
                              return 'NA-Monkey';
                            case 2:
                              return 'NA-Royksopp';
                            case 3:
                              return '1200 Micro';
                            default:
                              return 'Off';
                          }
                        })()}
                      </p>
                    )}
                    {key !== 'MusicTrack' && (
                      <div className="debug-value">
                        <p>
                          {typeof value !== 'boolean'
                            ? value
                            : value
                            ? emoji.greenCheck
                            : emoji.redX}
                        </p>
                      </div>
                    )}
                    {key !== 'MusicTrack' && <p className="key-start">{key}</p>}
                  </div>
                );
              })}
            </div>
            <div className="player-choices-right">
              {smashConfig.players.map((p, pIndex) => {
                return (
                  <div className="player-choice" key={pIndex}>
                    {inputArray[pIndex] === 0 && (
                      <div
                        className="player-char-blank"
                        onClick={() => {
                          onClickRotateSelection(pIndex);
                          setPlayChezState({ name: 'up', moment: moment() });
                        }}
                      >
                        <div className="startImageWrapper">
                          {inputArray[pIndex] !== 0 &&
                            inputArray[pIndex] < inputTypeNum && (
                              <img
                                className={
                                  'startImage' +
                                  (pIndex > 1 ? 'Inverse' : 'Normal')
                                }
                                src={
                                  'images/character_' +
                                  p.characterId.toString() +
                                  '_cropped.png'
                                }
                                // width={(55 * p.scale).toString() + '%'}
                                width={
                                  (
                                    55 * smashConfigOptions[p.characterId].scale
                                  ).toString() + '%'
                                }
                                alt="char"
                              />
                            )}
                          {/* <p className="player-char-image-name">{p.name}</p> */}
                          <p className="player-char-image-name">
                            {smashConfigOptions[p.characterId].name}
                          </p>
                        </div>
                      </div>
                    )}
                    {inputArray[pIndex] !== 0 &&
                      inputArray[pIndex] < inputTypeNum && (
                        <div
                          className="player-char"
                          onClick={() => {
                            onClickRotateSelection(pIndex);
                            setPlayChezState({
                              name: 'up',
                              moment: moment(),
                            });
                          }}
                        >
                          <div className="startImageWrapper">
                            <div
                              className={
                                'id-circle ' +
                                idColors[getNumActiveBeforeMe(pIndex)]
                              }
                            ></div>
                            {inputArray[pIndex] !== 0 &&
                              inputArray[pIndex] < inputTypeNum && (
                                <img
                                  className={
                                    'startImage' +
                                    (pIndex > 1 ? 'Inverse' : 'Normal')
                                  }
                                  src={
                                    'images/character_' +
                                    p.characterId.toString() +
                                    '_cropped.png'
                                  }
                                  // width={(55 * p.scale).toString() + '%'}
                                  width={
                                    (
                                      55 *
                                      smashConfigOptions[p.characterId].scale
                                    ).toString() + '%'
                                  }
                                  alt="char"
                                />
                              )}
                            {/* <p className="player-char-image-name">{p.name}</p> */}
                            <p className="player-char-image-name">
                              {smashConfigOptions[p.characterId].name}
                            </p>
                          </div>
                        </div>
                      )}
                    {inputArray[pIndex] === 0 && (
                      <div
                        className="b-oscuro b-black"
                        onClick={() => {
                          onClickOscura(pIndex);
                          // setPlayChezState({ name: 'up', moment: moment() });
                          // onClickSetInputArrayElement(
                          //   cPlayerIndex,
                          //   inputArray[cPlayerIndex] + 1 > 2
                          //     ? (0 as InputType)
                          //     : ((inputArray[cPlayerIndex] + 1) as InputType)
                          // );
                        }}
                      >
                        <span>Off</span>
                        <div className="button-input-emoji">
                          {emoji.cloudWhite}
                        </div>
                      </div>
                    )}
                    {inputArray[pIndex] === 1 && (
                      <div
                        className="b-oscuro b-dark"
                        onClick={() => {
                          onClickOscura(pIndex);
                          // setPlayChezState({ name: 'up', moment: moment() });
                          // onClickSetInputArrayElement(
                          //   cPlayerIndex,
                          //   inputArray[cPlayerIndex] + 1 > 2
                          //     ? (0 as InputType)
                          //     : ((inputArray[cPlayerIndex] + 1) as InputType)
                          // );
                        }}
                      >
                        <span>Gamepad</span>
                        <span id="input-sub">
                          {getNumControllersExistLower(pIndex) + 1}
                        </span>
                        {pIndex < 2 && (
                          <div className="button-input-emoji">
                            {emoji.gamepad}
                          </div>
                        )}
                        {!(pIndex < 2) && (
                          <div className="button-input-emoji">
                            {emoji.gamepad}
                          </div>
                        )}
                      </div>
                    )}
                    {inputArray[pIndex] === 2 && (
                      <div
                        className="b-oscuro b-dark"
                        onClick={() => {
                          onClickOscura(pIndex);
                        }}
                      >
                        <span>Keyboard</span>
                        {getDoesKeyboardExistLower(pIndex) && (
                          <span id="input-sub">Arrows</span>
                        )}
                        {!getDoesKeyboardExistLower(pIndex) && (
                          <span id="input-sub">WASD</span>
                        )}
                        {pIndex < 2 && (
                          <div className="button-input-emoji">
                            {emoji.keyboardWhite}
                          </div>
                        )}
                        {!(pIndex < 2) && (
                          <div className="button-input-emoji">
                            {emoji.keyboardWhite}​
                          </div>
                        )}
                      </div>
                    )}
                    {inputArray[pIndex] === 3 && (
                      <div
                        className="b-oscuro b-dark"
                        onClick={() => {
                          onClickOscura(pIndex);
                        }}
                      >
                        <span>Bot</span>
                        <div className="button-input-emoji">{emoji.bot}</div>
                      </div>
                    )}
                    {inputArray[pIndex] === 4 && (
                      <div
                        className="b-oscuro b-dark"
                        onClick={() => {
                          onClickOscura(pIndex);
                        }}
                      >
                        <span>Bot</span>
                        <span id="input-sub">Neural Network</span>
                        <div className="button-input-emoji">{emoji.brain}</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="bottom-zone">
            <div className="input-group">
              <div
                className="b-all-bots"
                onClick={() => {
                  setInputArray([2, 0, 0, 2]);
                  blipSound();
                }}
              >
                <span className={'vs-span'}>
                  {emoji.keyboardWhite + emoji.keyboardWhite}
                </span>
              </div>
              <div
                className="b-all-bots"
                onClick={() => {
                  setInputArray([2, 0, 0, 3]);
                  blipSound();
                }}
              >
                <span className={'vs-span'}>
                  {emoji.keyboardWhite + emoji.bot}
                </span>
              </div>
              <div
                className="b-all-bots"
                onClick={() => {
                  setInputArray([2, 0, 0, 4]);
                  blipSound();
                }}
              >
                <span className={'vs-span'}>
                  {emoji.keyboardWhite + emoji.brain}
                </span>
              </div>
              <div
                className="b-all-bots"
                onClick={() => {
                  setInputArray([1, 0, 0, 1]);
                  blipSound();
                }}
              >
                <span className={'vs-span'}>
                  {emoji.gamepad + emoji.gamepad}
                </span>
              </div>

              <div
                className="b-all-bots"
                onClick={() => {
                  setInputArray([2, 0, 3, 4]);
                  blipSound();
                }}
              >
                <span className={'vs-span'}>{emoji.keyboardWhite}</span>
                <span className={'vs-span'}>{emoji.bot + emoji.brain}</span>
              </div>
              <div
                className="b-all-bots"
                onClick={() => {
                  setInputArray([1, 0, 3, 4]);
                  blipSound();
                }}
              >
                <span className={'vs-span'}>{emoji.gamepad}</span>
                <span className={'vs-span'}>{emoji.bot + emoji.brain}</span>
              </div>
              <div
                className="b-all-bots"
                onClick={() => {
                  setInputArray([1, 1, 1, 1]);
                  blipSound();
                }}
              >
                <span className={'vs-span'}>
                  {emoji.gamepad + emoji.gamepad}
                </span>
                <span className={'vs-span'}>
                  {emoji.gamepad + emoji.gamepad}
                </span>
              </div>
              <div
                className="b-all-bots"
                onClick={() => {
                  setInputArray([3, 3, 3, 3]);
                  blipSound();
                }}
              >
                <span className={'vs-span'}>{emoji.bot + emoji.bot}</span>
                <span className={'vs-span'}>{emoji.bot + emoji.bot}</span>
              </div>
              <div
                className="b-all-bots"
                onClick={() => {
                  setInputArray([4, 4, 4, 4]);
                  blipSound();
                }}
              >
                <span className={'vs-span'}>{emoji.brain + emoji.brain}</span>
                <span className={'vs-span'}>{emoji.brain + emoji.brain}</span>
              </div>
              <div
                className="b-all-bots"
                onClick={() => {
                  setInputArray([3, 4, 3, 4]);
                  blipSound();
                }}
              >
                <span className={'vs-span'}>{emoji.bot + emoji.brain}</span>
                <span className={'vs-span'}>{emoji.bot + emoji.brain}</span>
              </div>
            </div>
            <div
              className="b-all-bots"
              id="dice"
              onClick={() => {
                randomizeCharacters();
                blipSound();
                setPlayChezState({ name: 'up', moment: moment() });
              }}
            >
              {emoji.dice}
            </div>
            <div className="b-start" onClick={onClickStartStartButton}>
              <span>START</span>
            </div>
          </div>
        </div>
      )}
      <div className="over-div">
        {topBarDivExists && (
          <div className={openEye ? 'top-bar-eye-open' : 'top-bar-eye-closed'}>
            {!openEye && (
              <img
                className="question-mark"
                src="/images/eye-shut-trans.png"
                alt="question mark"
                // onClick={captureScreenshot}
                onClick={onClickEye}
              />
            )}
            {openEye && (
              <img
                className="question-mark"
                src="/images/eye-open-trans.png"
                alt="question mark"
                // onClick={captureScreenshot}
                onClick={onClickEye}
              />
            )}
            {webState === 'start' && (
              <div
                className="link-tag"
                onClick={() => {
                  onClickPlayNavButtons('Options');
                }}
              >
                {showOptions && <span className="dark-span">Options</span>}
                {!showOptions && <span>Options</span>}
              </div>
            )}
            {webState === 'start' && (
              <div
                className="link-tag"
                onClick={() => {
                  onClickPlayNavButtons('Controllers');
                }}
              >
                {showControllers && <span className="dark-span">Pads</span>}
                {!showControllers && <span>Pads</span>}
              </div>
            )}
            {webState !== 'start' && (
              <div className="link-tag" onClick={onClickBackEventHandler}>
                <span>Back</span>
              </div>
            )}
            {webState !== 'start' && (
              // <div className="link-tag" onClick={onClickReStartEventHandler}>
              <div
                className="link-tag"
                onClick={() => {
                  xxx();

                  // onClickStartStartButton();
                }}
              >
                <span>ReStart</span>
              </div>
            )}

            <div
              className="link-tag"
              onClick={() => {
                onClickPlayNavButtons('Controls');
              }}
            >
              {showControls && <span className="dark-span">Buttons</span>}
              {!showControls && <span>Buttons</span>}
            </div>
            <div
              className="link-tag"
              onClick={() => {
                onClickPlayNavButtons('Rules-N64');
              }}
            >
              {showRulesN64 && <span className="dark-span">Rules</span>}
              {!showRulesN64 && <span>Rules</span>}
            </div>
            {webState === 'start' && (
              <div
                className="link-tag"
                onClick={() => {
                  onClickPlayNavButtons('About');
                }}
              >
                {showAbout && <span className="dark-span">About</span>}
                {!showAbout && <span>About</span>}
              </div>
            )}
          </div>
        )}
        {showOptions && (
          <div className="over-div">
            <div
              className="popup"
              onClick={() => {
                onClickPlayNavBody('Options');
              }}
            >
              <h1>Debug Options</h1>
              <div id="debug-col">
                {Object.entries(debug).map(([key, value], index: number) => {
                  if (!!mainOptionsDebugShow[key]) {
                    return null;
                  }

                  return (
                    <div
                      id="optionDebug"
                      key={index}
                      onClick={(e) => {
                        blipSound();
                        e.stopPropagation();
                        if (typeof value === 'number') {
                          setDebug((prevState) => ({
                            ...prevState,
                            [key]:
                              value - 1 < 0
                                ? getMaxFromKey(key)
                                : // ? getMaxFromKey(key as keyof Debug)
                                  value - 1,
                          }));
                          print(index, key, value);
                        }

                        if (typeof value === 'boolean') {
                          setDebug((prevState) => ({
                            ...prevState,
                            [key]: !value,
                          }));
                          print(index, key, value);
                        }
                      }}
                    >
                      <div className="debug-value">
                        <p>
                          {typeof value !== 'boolean'
                            ? value
                            : value
                            ? emoji.greenCheck
                            : emoji.redX}
                        </p>
                      </div>
                      <p className="key">{key}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
        {showControls && (
          <div className="over-div">
            <div
              className="popup"
              onClick={() => {
                onClickPlayNavBody('Controls');
              }}
            >
              <h1>Buttons</h1>
              <div id="controls-col">
                {characterMoves.map((charMove, charMoveIndex) => {
                  return (
                    <div id="move" key={charMoveIndex}>
                      <h5>{charMove.move}</h5>
                      <h5>
                        {charMove.button} {charMove.status}
                      </h5>
                    </div>
                  );
                })}
                {keyboardGroups.map((kGroup: KeyboardGroup[], kIndex) => {
                  return (
                    <div id="keyboard" key={kIndex}>
                      <div id="keyboard-top">
                        <h3>Keyboard {kGroup[0].right}</h3>
                      </div>
                      {kGroup.map((kItem, kItemIndex) => {
                        return (
                          <div id="keyboard-bottom" key={kItemIndex}>
                            <div id="keyboard-left">{kItem.left}</div>
                            <div id="keyboard-right">{kItem.right}</div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
                <div className="keyboard-buttons"></div>
              </div>
            </div>
          </div>
        )}
        {showRulesN64 && (
          <div>
            <div
              className="popup"
              onClick={() => {
                onClickPlayNavBody('Rules-N64');
              }}
            >
              <div className="rules-top">
                <div className="rules-col">
                  <h1>Web Rules</h1>
                  <div
                    className="rules-outline-web"
                    // onClick={() => {
                    //   captureScreenshot();
                    // }}
                  >
                    <img
                      id="rules-web-gif"
                      src="images/smashed_x10_gif.gif"
                      alt="smash title"
                    />
                    <p className="rules-web-since rules-small rules-italic">
                      ★ ★ ★ Since 2022 ★ ★ ★
                    </p>
                    <div className="rules-ul">
                      <div className="rules-li">
                        <div className="rules-big">First Blood</div>
                        <p className="rules-small">
                          If others have never died...
                        </p>
                        <p className="rules-small">And you just died...</p>
                        <p className="rules-small rules-end">
                          You take 1 shot.
                        </p>
                        {/* <p className="rules-small">
                          If you died and no others have died yet, you take a
                          shot.
                        </p> */}
                      </div>
                      <div className="rules-li">
                        <div className="rules-big">Screen Clear</div>
                        <p className="rules-small">
                          If someone else just died...
                        </p>
                        <p className="rules-small">
                          And all are dead but you...
                        </p>
                        <p className="rules-small rules-end">
                          They each take 1 shot.
                        </p>
                      </div>
                      <div className="rules-li">
                        <div className="rules-big">Capture The Flag</div>
                        <p className="rules-small">If you rased the flag...</p>
                        <p className="rules-small rules-end">
                          All others each take a shot.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="rules-col">
                  <h1>N64 Rules</h1>
                  <div
                    className="rules-outline-n64"
                    onClick={() => {
                      captureScreenshot();
                    }}
                  >
                    <img
                      id="RulesN64Image"
                      src="images/smashRulesGimp01.png"
                      alt="Smashed Rules-N64"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {showControllers && (
          <div>
            <div
              className="popup"
              onClick={() => {
                onClickPlayNavBody('Controllers');
              }}
            >
              <h1>GamePads</h1>
              {/* className="link-tag btn btn-dark" */}
              {/* <a
                className="working-controller"
                href="https://www.amazon.com/dp/B01MYUDDCV?ref=ppx_yo2ov_dt_b_product_details&th=1/"
              >
                <span>USB Extension Cord $13</span>
              </a> */}
              {/* These work: */}
              <div id="wcl">
                <h2>GamePads Suggested: </h2>
                {workingControllers.map((controller) => {
                  return (
                    <a className="working-controller" href={controller.url}>
                      <span>
                        {emoji.greenCheck} &nbsp;
                        {controller.name}
                      </span>
                    </a>
                  );
                })}
              </div>
              <div id="wcl">
                <h2>Accessories Suggested: </h2>
                <a
                  className="working-controller"
                  href="https://www.amazon.com/dp/B01MYUDDCV?ref=ppx_yo2ov_dt_b_product_details&th=1/"
                >
                  <span>{emoji.greenCheck} &nbsp;USB-A Extension Cord</span>
                </a>
                <a
                  className="working-controller"
                  href="https://www.amazon.com/gp/product/B01N5KGBGQ/ref=ppx_yo_dt_b_search_asin_title?ie=UTF8&psc=1"
                >
                  <span>{emoji.greenCheck} &nbsp;USB-C Splitter</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {showAbout && (
          <div>
            <div
              className="popup"
              onClick={() => {
                onClickPlayNavBody('About');
              }}
            >
              <h1>About</h1>
              <div className="horiz">
                <div className="horiz-item-left">
                  <img
                    className="kirbyNiembro"
                    src="./images/character_3_cropped.png"
                    alt="kirby"
                    onMouseDown={() => {
                      print('MOUSE DOWN');
                      setFirstCharacterSlot(5);
                    }}
                  />
                  <a
                    className="btn btn-dark text-light"
                    href="https://niemo.io/"
                  >
                    <span className="text-white small">niemo.io</span>
                  </a>
                </div>
                <div className="horiz-item-right">
                  As referenced on the Rules-N64 sheet, (Chemon) Smashed was
                  invented in Glen Carbon, Illinois (near St. Louis) some time
                  in late 2009 by a group of college kids at the "Chemon" House.
                  From 2013 to 2018, "The Young Boys" have been keeping it alive
                  in St. Louis. It's normally played with the N64 Smash Bros
                  game on the N64, Wii, or Emulation, but this is my attempt at
                  recreating it with the rules baked in. Since the inception,
                  niembro64 has been actively persuing the fundamental polished
                  essense of Smashed; both as an exercise of logic, and such
                  that one day it could be realized as a fully functional,
                  independent game. Assets & sounds that you don't immediately
                  recognize are probably OC.
                  {/* <h4 id="recent-games">Recent Games z:{tz}</h4> */}
                </div>
              </div>
              <div
                id="show-all"
                className={hideNiemoIp ? ' show-all-hide' : ' show-all-show'}
                onClick={(e) => {
                  e.stopPropagation();
                  blipSound();
                  setHideNiemoIp(!hideNiemoIp);
                }}
              >
                FILTER
              </div>
              <div className="scroller" ref={scrollerRef}>
                <table>
                  <thead>
                    <tr id="tr-header">
                      <td id="title" className="td-left">
                        {' '}
                        GAMES TZ:{tz}
                      </td>
                      <th id="title" className="td-left">
                        CONFIG
                      </th>
                      <th id="title" className="td-right">
                        SHOTS
                      </th>
                      <th id="title" className="td-right">
                        DEATHS
                      </th>
                      <th id="title" className="td-right">
                        HITS
                      </th>
                      <th> </th>
                    </tr>
                  </thead>

                  <tbody>
                    {/* <p className="text-small">ID DATE</p> */}
                    {allSessions.map((s: SessionInfo, sIndex: number) => {
                      if (
                        hideNiemoIp &&
                        (s.ip === '69.124.166.109' ||
                          s.ip === '69.115.173.120' ||
                          s.ip === '' ||
                          s.ip === 'null' ||
                          s.ip === null ||
                          s?.ip === null)
                      ) {
                        return null;
                      }
                      let gameViewTop: string = '';
                      let gameViewBottom: string = '';
                      let sc: SmashConfig | null = null;
                      try {
                        sc = JSON.parse(s.smashConfig);
                        print('smashConfig', sc);
                      } catch (e) {
                        print('error parsing smashConfigString', e);
                      }
                      if (sc !== null) {
                        sc.players.forEach((sessionPlayer: any) => {
                          gameViewTop +=
                            smashConfigOptions[sessionPlayer.characterId]
                              .nameShort + ' ';
                          print('sessionPlayer.input', sessionPlayer.input);

                          switch (sessionPlayer.input) {
                            case 0:
                              gameViewBottom += sessionPlayer.input + ' ';
                              break;
                            case 1:
                              gameViewBottom += '' + emoji.gamepad + ' ';
                              // gameViewBottom += 'PD ';
                              break;
                            case 2:
                              gameViewBottom += '' + emoji.keyboardWhite + ' ';
                              break;
                            case 3:
                              gameViewBottom += '' + emoji.bot + ' ';
                              break;
                            case 4:
                              gameViewBottom += '' + emoji.brain + ' ';
                              break;
                            default:
                              gameViewBottom += '?? ';
                              break;
                          }
                        });
                      }
                      const allSessionsLength: number = allSessions.length;
                      const totalDigits = allSessionsLength.toString().length;
                      const paddedIndex = (allSessionsLength - sIndex)
                        .toString()
                        .padStart(totalDigits, '\u00a0');
                      const sessionMomentObject = momentStringToMoment(
                        s.momentCreated
                      );
                      const mTZ = require('moment-timezone');
                      const clientTimezone =
                        Intl.DateTimeFormat().resolvedOptions().timeZone; // get client's local timezone
                      const formattedDate = mTZ
                        .tz(moment(sessionMomentObject), clientTimezone)
                        .format('YYYY-MM-DD HH:mm');
                      let totalShots: number = 0;
                      if (
                        s.matrixShotsUnto === null ||
                        s.matrixShotsUnto === 'null'
                      ) {
                      } else {
                        totalShots = sumNumbersIn2DArrayString(
                          s.matrixShotsUnto
                        );
                      }
                      let totalDeaths: number = 0;
                      if (
                        s.matrixDeathsUnto === null ||
                        s.matrixDeathsUnto === 'null'
                      ) {
                      } else {
                        totalDeaths = sumNumbersIn2DArrayString(
                          s.matrixDeathsUnto
                        );
                      }
                      let totalHits: number = 0;
                      if (
                        s.matrixHitsUnto === null ||
                        s.matrixHitsUnto === 'null'
                      ) {
                      } else {
                        totalHits = sumNumbersIn2DArrayString(s.matrixHitsUnto);
                      }
                      return (
                        <tr id={sIndex % 2 ? 'td-odd' : 'td-even'} key={sIndex}>
                          <td id="title" className="td-left">
                            {paddedIndex} {formattedDate} {s.country} {s.region}{' '}
                            {s.city}
                          </td>
                          <td className="td-left">
                            <div>{gameViewTop ? gameViewTop : ' '}</div>
                            <div>{gameViewBottom ? gameViewBottom : ' '}</div>
                            {/* {totalShots < 10
                                    ? '_' + totalShots
                                    : totalShots} */}
                          </td>
                          <td className="td-right">
                            {totalShots ? totalShots : ' '}
                            {/* {totalShots < 10
                                    ? '_' + totalShots
                                    : totalShots} */}
                          </td>
                          <td className="td-right">
                            {totalDeaths ? totalDeaths : ' '}
                            {/* {totalDeaths < 10
                                    ? '_' + totalDeaths
                                    : totalDeaths} */}
                          </td>
                          <td className="td-right">
                            {totalHits ? totalHits : ' '}
                            {/* {totalHits < 100
                                    ? '_' +
                                      (totalHits < 10
                                        ? '_' + totalHits
                                        : totalHits)
                                    : totalHits} */}
                          </td>
                          <td> </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
      {debug.DevMode && <div className="dev-mode-div">Dev Mode</div>}
      {webState === 'play' && !isReplayHidden && (
        <div className="video-playback-container">
          <div className="video-playback-super">
            {videoGray && <p className="replay">FAST FORWARD</p>}
            {!videoGray && <p className="replay">INSTANT REPLAY</p>}
            <video
              className={
                videoGray
                  ? 'video-playback video-playback-gray'
                  : 'video-playback video-playback-normal'
              }
              ref={videoRef}
              // controls={debug.ReplayControls}
              onTimeUpdate={() => {
                print('onTimeUpdate');
                handleTimeUpdate();
              }}
              onLoadedMetadata={() => {
                print('onLoadedMetadata');
                handleTimeUpdate();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default Play;
