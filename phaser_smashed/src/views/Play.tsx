import { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import Game from '../scenes/Game';
import '../App.css';
import '@fontsource/press-start-2p';
import { setGameState } from '../scenes/helpers/state';
import useSound from 'use-sound';
import html2canvas from 'html2canvas';
import ShakePositionPlugin from 'phaser3-rex-plugins/plugins/shakeposition-plugin.js';
// @ts-ignore
import importedWoah from '../sounds/BlackBetty_Woah.mp3';
// @ts-ignore
import importedBambalam from '../sounds/BlackBetty_Bambalam.mp3';
// @ts-ignore
import importedTrance from '../sounds/trance.wav';
// @ts-ignore
import importedStartSound from '../sounds/start.wav';
// @ts-ignore
import importedBlipSound from '../sounds/game-start-liquid.wav';
import {
  CharacterId,
  Debug,
  PlayerConfig,
  Quote,
  WebState,
  InputType,
  SmashConfig,
  ButtonName,
  CharacterMove,
  emoji,
  KeyboardGroup,
  WorkingController,
  PlayerConfigSmall,
  PlayChezStateName,
  PlayerState,
  PlayChezState,
} from '../scenes/interfaces';
import { debugInit, debugMax } from '../debugOptions';
import {
  ClientInformation,
  getAllAxios,
  fetchClientData,
  axiosSaveOne,
  SessionInfo,
} from './client';
import moment from 'moment';
import { momentToDate } from '../scenes/helpers/time';
// import { useParams } from 'react-router-dom';

function Play() {
  let myPhaser: any = useRef(null);
  // const { _id } = useParams();

  const [session, setSession] = useState<SessionInfo | null>(null);
  const [allSessions, setAllSessions] = useState<SessionInfo[]>([]);

  useEffect(() => {
    console.log('sessionInfo', session);
  }, [session]);

  useEffect(() => {
    if (allSessions === null) {
      return;
    }
    // console.log('allSesssions', allSessions);
  }, [allSessions]);

  // const space: string = '&nbsp';

  function captureScreenshot() {
    console.log('Capture Screenshot');

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

  const [debug, setDebug] = useState<Debug>(debugInit);

  const trance = new Audio(importedTrance);
  trance.volume = 0.3;

  const tranceRef = useRef<HTMLAudioElement>(trance);
  tranceRef.current.volume = 0.3;
  const [woah] = useSound(importedWoah, { volume: 0.2 });
  const [bam] = useSound(importedBambalam, { volume: 0.2 });
  const [startSound] = useSound(importedStartSound, { volume: 0.4 });
  const [blipSound] = useSound(importedBlipSound, { volume: 0.2 });
  const [numClicks, setNumClicks] = useState<number>(0);
  const [webState, setWebState] = useState<WebState>('start');
  const [showLoader, setShowLoader] = useState<boolean>(false);
  const [openEye, setOpenEye] = useState<boolean>(true);
  const [topBarDivExists, setTopBarDivExists] = useState<boolean>(false);

  const scrollerRef = useRef<HTMLDivElement>(null);

  const [playChezState, setPlayChezState] = useState<PlayChezState>({
    name: 'up',
    moment: moment(),
  });
  const [playChezStatePrev, setPlayChezStatePrev] = useState<PlayChezState>({
    name: 'up',
    moment: moment(),
  });

  useEffect(() => {
    const handleTranceEnded = (): void => {
      setFirstCharacterSlot(4);
      setPlayChezState({ name: 'chez', moment: moment() });
    };

    console.log('playChezState', playChezState.name);

    switch (playChezState.name) {
      case 'up':
        tranceRef.current.pause();
        tranceRef.current.removeEventListener('ended', handleTranceEnded);
        break;
      case 'down':
        tranceRef.current.play();
        tranceRef.current.addEventListener('ended', handleTranceEnded, {
          once: true,
        });
        break;
      case 'chez':
        break;
    }
    setPlayChezStatePrev(JSON.parse(JSON.stringify(playChezState)));
  }, [playChezState]);

  const onClickEye = () => {
    setOpenEye(!openEye);
  };

  useEffect(() => {
    console.log('webState', webState);
    switch (webState) {
      case 'start':
        setTopBarDivExists(false);
        setTimeout(() => {
          setTopBarDivExists(true);
        }, 7000);
        (async () => {
          let allSessions: SessionInfo[] = await getAllAxios();
          setAllSessions(allSessions);
        })();
        break;
      case 'play':
        setTopBarDivExists(true);
        break;
      default:
        break;
    }
  }, [webState]);

  const keyboardGroups: KeyboardGroup[][] = [
    [
      { left: 'D-Pad', right: 'W A S D' },
      { left: 'A X B Y', right: 'F G H Space' },
      { left: 'L Select Start R', right: 'R T Y U' },
    ],
    [
      { left: 'ArrowKeys', right: 'D-Pad' },
      { left: 'A X B Y', right: '4 5 6 Enter' },
      { left: 'L Select Start R', right: '7 8 9 +' },
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
  // 3 -> bot
  const [inputArray, setInputArray] = useState<InputType[]>([2, 0, 0, 2]);
  const [smashConfig, setSmashConfig] = useState<SmashConfig>({
    players: [
      {
        characterId: 0,
        input: 0, // don't set this here
      },
      {
        characterId: 2,
        input: 0, // don't set this here
      },
      {
        characterId: 3,
        input: 0, // don't set this here
      },
      {
        characterId: 1,
        input: 0, // don't set this here
      },
    ],
  });

  useEffect(() => {
    console.log('smashConfig', smashConfig);
    // setPlayChezState({ name: 'up', moment: moment() });
  }, [smashConfig]);

  // always keep Chez and BlackChez at positions 4 and 5
  const smashConfigOptions: PlayerConfig[] = [
    { characterId: 0, scale: 0.9, name: 'Mario' },
    { characterId: 1, scale: 0.9, name: 'Link' },
    { characterId: 2, scale: 1, name: 'Pikachu' },
    { characterId: 3, scale: 0.7, name: 'Kirby' },
    { characterId: 4, scale: 1.2, name: 'Chez' },
    { characterId: 5, scale: 1.2, name: 'BlackChez' },
    { characterId: 6, scale: 0.6, name: 'GreenKoopa' },
    { characterId: 7, scale: 0.6, name: 'RedKoopa' },
    { characterId: 8, scale: 0.6, name: 'BlueKoopa' },
  ];
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
        gravity: { y: 3000 },
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
    { name: 'TR3', text: 'Smashed.' },
    { name: 'Chadams', text: 'Two shots... two shots.' },
    { name: 'Eddie-Z', text: "He'll do it again, yeah!" },
    {
      name: 'TR3',
      text: 'How am I supposed to make more than that... shit... happen?',
    },
    {
      name: 'DDj',
      text: "It's safe to say we're not going to the bars tonite.",
    },
    {
      name: 'DDj',
      text: '...yes you are.',
    },
    // { name: 'Chadams', text: 'AAAYYYUUUGGGGHHHH!!' },
    // { name: 'Chadams', text: 'Spike Enerjeaoah.' },
    // { name: 'Chadams', text: "Stop breakin' shit." },
    // { name: 'Chadams', text: 'Is there no one else?' },
    // { name: 'Deen Davis Jr.', text: 'VIDEOTAPE MA-SELF FUCKIN YOU UP!' },
    // { name: 'Breezy', text: 'Oh, is it? Oh cool. Ur soo cool.' },
    // { name: 'Lau', text: "I'm sorry, I didn't know it was gonna happen." },
    // { name: "Gin", text: "Clean it up, and we'll do it again." },
    // { name: 'Ginman', text: "Set it up... and we'll do it... again." },
    // { name: 'Gin', text: 'Shitty, shitty-fuckin-ass.' },
    // {
    //   name: 'DDj',
    //   text: 'I can fight you one-handed.',
    // },
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
    setShowControls(false);
    setShowControllers(false);
    setShowRulesN64(false);
    setShowAbout(false);
    setShowHistory(false);
    setShowOptions(false);

    setPlayChezState({ name: 'up', moment: moment() });
    // trance.pause();
    startSound();
    setWebState('play');

    let players = [...smashConfig.players];
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
        default:
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
    setTimeout(() => {
      myPhaser.current = new Phaser.Game(config);
      myPhaser.current.registry.set('parentContext', Play);
      myPhaser.current.registry.set('smashConfig', newSmashConfig);
      myPhaser.current.registry.set('debug', debug);
      myPhaser.current.registry.set('myMoment', myMoment);
    }, setTimeoutQuotesLengthStart);

    setShowLoaderIntervalFunction();

    let c: ClientInformation = await fetchClientData();
    let s: SessionInfo = await axiosSaveOne(myMoment, c, newSmashConfig, debug);
    setSession(s);
  };

  const setShowLoaderIntervalFunction = () => {
    setShowLoader(true);
    const myInterval = setInterval(() => {
      console.log(
        'myPhaser.current?.scene?.keys?.game?.loaded',
        myPhaser?.current?.scene?.keys?.game?.loaded
      );
      if (myPhaser?.current?.scene?.keys?.game?.loaded) {
        setTimeout(
          () => {
            setShowLoader(false);
          },
          debug.DevMode ? 0 : 1
        );
        clearInterval(myInterval);
      }
    }, 1);
  };

  // const onClickRotateInput = (index: number): void => {
  //   let newPlayers = [...smashConfig.players];
  //   newPlayers[index].inputIndex + 1 > inputTypeConfig.length - 1
  //     ? (newPlayers[index].inputIndex = 0)
  //     : newPlayers[index].inputIndex++;
  //   newPlayers[index].inputType = inputTypeConfig[newPlayers[index].inputIndex];
  //   newPlayers[index].inputEmoji =
  //     inputEmojiConfig[newPlayers[index].inputIndex];
  //   setSmashConfig({ players: [...newPlayers] });
  // };

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
    // console.log('newInputArray', newInputArray);
  };

  const bamPlay = (): void => {
    bam();
  };
  const woahPlay = (): void => {
    woah();
  };

  let playNumber = useRef(0);

  // const trancePlay = (): void => {
  //   if (playNumber.current === 0) {
  //     playNumber.current += 1;
  //     trance.play();
  //     trance.addEventListener(
  //       'ended',
  //       () => {
  //         setFirstCharacterSlot(4);
  //       },
  //       { once: true }
  //     );
  //   }
  // };

  const setFirstCharacterSlot = (charId: CharacterId): void => {
    if (debug.AllowCharsChez || webState === 'play') {
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

    // choice.scale = tempScale;

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
    let choices = [...smashConfig.players];
    let choice = choices[playerIndex];

    let newCharacterId = choice.characterId + 1;

    // player cannot directly select Chez or BlackChez
    if (!debug.DevMode && !debug.AllowCharsChez) {
      while (newCharacterId === 4 || newCharacterId === 5) {
        newCharacterId++;
      }
    }

    if (newCharacterId > smashConfigOptions.length - 1) {
      newCharacterId = 0;
    }

    if (!debug.DevMode && !debug.AllowCharsExtended && newCharacterId > 5) {
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
    if (webState === 'play') {
      if (
        !(
          myPhaser.current.scene.keys.game.gameState.name ===
            'game-state-paused' ||
          myPhaser.current?.scene?.keys?.game.gameState.name ===
            'game-state-first-blood' ||
          myPhaser.current?.scene?.keys?.game.gameState.name ===
            'game-state-screen-clear'
        )
      ) {
        setGameState(myPhaser.current?.scene?.keys?.game, 'game-state-paused');
      }
    }
  };

  // useEffect(() => {
  //   if (scrollerRef.current) {
  //     const handleScroll = () => {
  //       if (scrollerRef.current) {
  //         console.log(scrollerRef.current.scrollTop);
  //       }
  //     };

  //     scrollerRef.current.addEventListener('scroll', handleScroll);

  //     return () => {
  //       if (scrollerRef.current) {
  //         scrollerRef.current.removeEventListener('scroll', handleScroll);
  //       }
  //     };
  //   }
  // }, []);

  // useEffect(() => {
  //   setTimeout(() => {
  //     if (scrollerRef.current) {
  //       console.log(
  //         'scrollerRef.current.scrollHeight',
  //         scrollerRef.current.scrollHeight,
  //         'scrollerRef.current.clientHeight',
  //         scrollerRef.current.clientHeight
  //       );

  //       // scrollerRef.current.scrollTop = -400;

  //       scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight;
  //       // scrollerRef.current.scrollIntoView({ behavior: 'smooth' });
  //     }
  //   }, 300);
  // }, [showAbout, scrollerRef]);

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
      inputArray[index] + 1 > 3
        ? (0 as InputType)
        : ((inputArray[index] + 1) as InputType)
    );
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
          onClickReStartEventHandler();
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

  const onClickReStartEventHandler = () => {
    if (myPhaser?.current?.scene?.keys?.game?.loaded) {
      startSound();
      myPhaser.current.scene.keys.game.loaded = false;
      setShowLoaderIntervalFunction();
      onClickPlayNavButtons('ReStart');
      setQuotesRandomNumber(Math.floor(Math.random() * quotes.length));

      let newSmashConfig = JSON.parse(
        JSON.stringify(myPhaser.current?.scene?.keys?.game.smashConfig)
      );
      let newDebug = JSON.parse(
        JSON.stringify(myPhaser.current?.scene?.keys?.game.debug)
      );
      clearInterval(intervalClock.current);
      intervalClock.current = null;
      componentPseudoLoad.current = true;
      myPhaser.current.destroy(true);

      if (!debug.LoadTimeExtra || debug.DevMode) {
        setTimeoutQuotesLengthReStart = 0;
      }
      setTimeout(() => {
        myPhaser.current = new Phaser.Game(config);
        myPhaser.current.registry.set('parentContext', Play);
        myPhaser.current.registry.set('smashConfig', newSmashConfig);
        myPhaser.current.registry.set('debug', newDebug);
      }, setTimeoutQuotesLengthReStart);
    }
  };

  const getNumControllersExistLower = (myI: number): number => {
    let num: number = 0;

    inputArray.forEach((ia: number, iaIndex: number) => {
      if (ia === 1 && iaIndex < myI) {
        num++;
      }
    });

    return num;
  };

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
    setWebState('start');
    setNumClicks(numClicks + 1);
    clearInterval(intervalClock.current);
    intervalClock.current = null;
    componentPseudoLoad.current = true;
    myPhaser.current.destroy(true);

    setP1KeysTouched(false);
    setP2KeysTouched(false);
  };

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
    console.log('getInitFromKey', key);

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
            {!p1KeysTouched && (
              <div className="keyboard-left-checkmark">
                <span>Awaiting</span>
                <div className="small-spinner ss-red"></div>
                <span>WASD</span>
              </div>
            )}
          </div>
        )}
      {webState !== 'start' && showLoader && (
        // {true && (
        <div className="loader">
          {quotesRandomNumber % 2 === 0 && (
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
          )}
          {quotesRandomNumber % 2 !== 0 && (
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
          )}
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
          <p className="third-loader-p">Loading can take a few seconds.</p>
          {/* {debug.TypedLoadingText && (
          )} */}
        </div>
      )}
      <div className="phaser-container" id="phaser-container"></div>
      {webState === 'start' && (
        <div className="start-class-div">
          {!debug.DevMode && <div className="black-hiding-div"></div>}
          <div
            className={
              'startTitleWrapper2' +
              (playChezState.name === 'down' ? ' startTitleWrapper2Active' : '')
            }
          >
            <div
              className={
                'startTitleWrapper1' +
                (playChezState.name === 'down'
                  ? ' startTitleWrapper1Active'
                  : '')
              }
            >
              <div
                className={
                  'startTitle' +
                  (playChezState.name === 'down' ? ' startTitleActive' : '')
                }
                onMouseDown={() => {
                  if (playChezState.name === 'up') {
                    let newPlayChezState: PlayChezState = {
                      name: 'down',
                      moment: moment(),
                    };
                    setPlayChezState(newPlayChezState);
                  }
                }}
                onMouseUp={() => {
                  if (playChezState.name === 'down') {
                    let newPlayChezState: PlayChezState = {
                      name: 'up',
                      moment: moment(),
                    };
                    setPlayChezState(newPlayChezState);
                  }
                }}
              >
                <img src="images/smashed_x10_gif.gif" alt="smash title" />
                {/* <img src="images/smashed-gif-cropped.gif" alt="smash title" /> */}
                <h1>SMASHED</h1>
              </div>
            </div>
          </div>
          {/* {!debug.DevMode && <div className="black-hiding-div"></div>} */}
          <div className="player-choices">
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
                        {(inputArray[pIndex] === 1 ||
                          inputArray[pIndex] === 2 ||
                          inputArray[pIndex] === 3) && (
                          <img
                            className={
                              'startImage' + (pIndex > 1 ? 'Inverse' : 'Normal')
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
                  {(inputArray[pIndex] === 1 ||
                    inputArray[pIndex] === 2 ||
                    inputArray[pIndex] === 3) && (
                    <div
                      className="player-char"
                      onClick={() => {
                        onClickRotateSelection(pIndex);
                        setPlayChezState({ name: 'up', moment: moment() });
                      }}
                    >
                      <div className="startImageWrapper">
                        {(inputArray[pIndex] === 1 ||
                          inputArray[pIndex] === 2 ||
                          inputArray[pIndex] === 3) && (
                          <img
                            className={
                              'startImage' + (pIndex > 1 ? 'Inverse' : 'Normal')
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
                      {getNumControllersExistLower(pIndex) === 0 && (
                        <span id="input-sub">1</span>
                      )}
                      {getNumControllersExistLower(pIndex) === 1 && (
                        <span id="input-sub">2</span>
                      )}
                      {getNumControllersExistLower(pIndex) === 2 && (
                        <span id="input-sub">3</span>
                      )}
                      {getNumControllersExistLower(pIndex) === 3 && (
                        <span id="input-sub">4</span>
                      )}
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
                        // setPlayChezState({ name: 'up', moment: moment() });
                        // onClickSetInputArrayElement(
                        //   cPlayerIndex,
                        //   inputArray[cPlayerIndex] + 1 > 2
                        //     ? (0 as InputType)
                        //     : ((inputArray[cPlayerIndex] + 1) as InputType)
                        // );
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
                        // setPlayChezState({ name: 'up', moment: moment() });
                      }}
                    >
                      <span>Bot</span>
                      {/* <span id="input-sub">In Progress</span> */}
                      <div className="button-input-emoji">{emoji.bot}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="bottom-zone">
            <div
              className="b-all-bots"
              onClick={() => {
                setInputArray([2, 0, 0, 3]);
                blipSound();
              }}
            >
              <span>KB vs Bot</span>
            </div>
            <div
              className="b-all-bots"
              onClick={() => {
                setInputArray([2, 0, 0, 2]);
                blipSound();
              }}
            >
              <span>2 KBs</span>
            </div>
            <div
              className="b-all-bots"
              onClick={() => {
                setInputArray([1, 1, 1, 1]);
                blipSound();
              }}
            >
              <span>4 Pads</span>
            </div>
            <div
              className="b-all-bots"
              onClick={() => {
                setInputArray([3, 3, 3, 3]);
                blipSound();
              }}
            >
              <span>4 Bots</span>
            </div>
            <div className="b-start" onClick={onClickStartStartButton}>
              <span>START</span>
            </div>
          </div>
        </div>
      )}
      <div className="over-div">
        {/* {!debug.DevMode && <div className="black-hiding-div"></div>} */}

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
              <div className="link-tag" onClick={onClickReStartEventHandler}>
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
                  return (
                    <div
                      id="option"
                      key={index}
                      onClick={(e) => {
                        blipSound();
                        e.stopPropagation();
                        if (typeof value === 'number') {
                          setDebug((prevState) => ({
                            ...prevState,
                            [key]:
                              value - 1 < 0
                                ? getMaxFromKey(key as keyof Debug)
                                : value - 1,
                          }));
                          console.log(index, key, value);
                        }

                        if (typeof value === 'boolean') {
                          setDebug((prevState) => ({
                            ...prevState,
                            [key]: !value,
                          }));
                          console.log(index, key, value);
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
                    onClick={() => {
                      captureScreenshot();
                    }}
                  >
                    <img
                      id="rules-web-gif"
                      src="images/smashed_x10_gif.gif"
                      alt="smash title"
                    />
                    <p className="rules-web-since">Since 2022</p>
                    <ul>
                      <li>
                        <p>
                          1. If you died and no others have died yet, you take a
                          shot.
                        </p>
                        <p>
                          2. If all are dead but you, they each take a shot.{' '}
                        </p>
                        <p>
                          3. If you rase the flag, all others each take a shot.{' '}
                        </p>
                      </li>
                    </ul>
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
              <p>
                As referenced on the Rules-N64 sheet, (Chemon) Smashed was
                invented in Glen Carbon, Illinois (near St. Louis) some time in
                late 2009 by a group of college kids at the "Chemon" House. From
                2013 to 2018, "The Young Boys" have been keeping it alive in St.
                Louis. It's normally played with the N64 Smash Bros game on the
                N64, Wii, or Emulation, but this is my attempt at recreating it
                with the rules baked in. Since the inception, niembro64 has been
                actively persuing the fundamental polished essense of Smashed;
                both as an exercise of logic, and such that one day it could be
                realized as a fully functional, independent game. Assets &
                sounds that you don't immediately recognize are probably OC.
              </p>
              <div className="horiz">
                <div className="horiz-item-center">
                  <h4>Tech Used</h4>
                  <ul>
                    <li>Phaser 3</li>
                    <li>ReactTS 17</li>
                    <li>Bootstrap 5</li>
                    <li
                      onMouseDown={() => {
                        console.log('MOUSE ENTER');
                        setFirstCharacterSlot(5);
                      }}
                    >
                      Press Start 2P
                    </li>
                  </ul>

                  <img
                    className="kirbyNiembro"
                    src="./images/character_3_cropped.png"
                    alt="kirby"
                    onMouseDown={() => {
                      console.log('MOUSE DOWN');
                      setFirstCharacterSlot(5);
                    }}
                  />
                  <p>by niembro64</p>
                  <a
                    className="link-tag btn btn-dark text-light"
                    href="http://niembro64.com/"
                  >
                    <span className="text-white">See Other Projects</span>
                  </a>
                </div>
                <div className="horiz-item-start">
                  <h4>Recently Played Games</h4>
                  <div className="scroller" ref={scrollerRef}>
                    {allSessions.map((session: SessionInfo, index: number) => {
                      const allSessionsLength: number = allSessions.length;
                      const totalDigits = allSessionsLength.toString().length;
                      const paddedIndex = (allSessionsLength - index)
                        .toString()
                        .padStart(totalDigits, '\u00a0');

                      return (
                        <p className="text-small" key={index}>
                          {paddedIndex}{' '}
                          {moment(session.momentCreated).format(
                            'YYYY-MM-DD HH:mm'
                          )}{' '}
                          {session.country} {session.region} {session.city}
                          {/* {session.ip}{" "} */}
                        </p>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {debug.DevMode && <div className="dev-mode-div">Dev Mode</div>}
      {/* {!debug.DevMode && <div className="black-hiding-div"></div>} */}
    </div>
  );
}

export default Play;
