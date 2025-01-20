// Popups.tsx

import moment from 'moment';
import { useEffect } from 'react';

import { momentStringToMoment } from '../scenes/helpers/time';
import {
  ButtonName,
  Debug,
  emoji,
  KeyboardGroup,
  SmashConfig,
} from '../scenes/types';
import DebugOptions from './DebugOptions';
import { SessionInfo, sumNumbersIn2DArrayString } from './client';
import { SoundManagerType } from './SoundManager';
import {
  characterMoves,
  keyboardGroups,
  smashConfigOptions,
  workingControllersAmazon,
} from './reactHelpers';

interface PopupsProps {
  showRulesN64: boolean;
  showControls: boolean;
  showControllers: boolean;
  showAbout: boolean;
  showHistory: boolean;
  showOptions: boolean;
  onClickPlayNavBody: (buttonName: ButtonName) => void;
  captureScreenshot: () => void;
  allSessions: SessionInfo[];
  hideNiemoIp: boolean;
  setHideNiemoIp: React.Dispatch<React.SetStateAction<boolean>>;
  scrollerRef: React.RefObject<HTMLDivElement>;
  tz: string;
  debugState: Debug;
  mainOptionsDebugShowState: Debug;
  setDebugState: React.Dispatch<React.SetStateAction<Debug>>;
  getMaxFromKey: (key: string) => number;
  setMainOptionsDebugShowState: React.Dispatch<React.SetStateAction<Debug>>;
  soundManager: SoundManagerType;
  smashConfig: SmashConfig;
}

/**
 * Popups for Controls, Controllers, Rules, About/History, Options, etc.
 */
export default function Popups(props: PopupsProps) {
  const {
    showRulesN64,
    showControls,
    showControllers,
    showAbout,
    showHistory,
    showOptions,
    onClickPlayNavBody,
    captureScreenshot,
    allSessions,
    hideNiemoIp,
    setHideNiemoIp,
    scrollerRef,
    tz,
    debugState,
    mainOptionsDebugShowState,
    setDebugState,
    getMaxFromKey,
    setMainOptionsDebugShowState,
    soundManager,
  } = props;

  // useEffect just as an example if we want to fetch data on About or History:
  useEffect(() => {
    // if (showAbout || showHistory) { ... }
  }, [showAbout, showHistory]);

  return (
    <>
      {/* ////////////////////////////////// */}
      {/* PLAY OPTIONS (DebugOptions) */}
      {/* ////////////////////////////////// */}
      {showOptions && (
        <div className="over-div">
          <div
            className="popup"
            onClick={() => {
              onClickPlayNavBody('Options');
            }}
          >
            <h1>Debug Options</h1>
            <div className="player-choices-left">
              <DebugOptions
                showHomeList={false}
                soundManager={soundManager}
                debugState={debugState}
                mainOptionsDebugShowState={mainOptionsDebugShowState}
                setDebugState={setDebugState}
                getMaxFromKey={getMaxFromKey}
                setMainOptionsDebugShowState={setMainOptionsDebugShowState}
              />
            </div>
          </div>
        </div>
      )}

      {/* ////////////////////////////////// */}
      {/* SHOW CONTROLS */}
      {/* ////////////////////////////////// */}
      {showControls && (
        <div className="over-div">
          <div className="popup" onClick={() => onClickPlayNavBody('Controls')}>
            <h1>Controls</h1>

            {/* MAIN WRAPPER */}
            <div className="controls-wrapper">
              {/* LEFT COLUMN */}
              <div className="controls-left">
                <img
                  className="snes"
                  src="images/snes.png"
                  alt="SNES Controller"
                />
                <div className="moves-list">
                  {characterMoves.map((charMove, index) => (
                    <div className="move" key={index}>
                      <h5>{charMove.move}</h5>
                      <h5>{charMove.button}</h5>
                    </div>
                  ))}
                </div>
              </div>

              {/* RIGHT COLUMN */}
              <div className="controls-right">
                <img
                  className="snes"
                  src="images/keyboard_colors.png"
                  alt="Keyboard"
                />
                {keyboardGroups.map((group, groupIndex) => (
                  <div className="keyboard-group" key={groupIndex}>
                    <div className="keyboard-group-header">
                      Keyboard {group[0].right}
                    </div>
                    {group.map((kItem, kItemIndex) => (
                      <div className="keyboard-row" key={kItemIndex}>
                        <h5>{kItem.left}</h5>
                        <h5>{kItem.right}</h5>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ////////////////////////////////// */}
      {/* SHOW RULES (N64 + Web) */}
      {/* ////////////////////////////////// */}
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
                <div className="rules-outline-web">
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
                      <p className="rules-small rules-end">You take 1 shot.</p>
                    </div>
                    <div className="rules-li">
                      <div className="rules-big">Screen Clear</div>
                      <p className="rules-small">
                        If someone else just died...
                      </p>
                      <p className="rules-small">And all are dead but you...</p>
                      <p className="rules-small rules-end">
                        They each take 1 shot.
                      </p>
                    </div>
                    <div className="rules-li">
                      <div className="rules-big">Capture The Flag</div>
                      <p className="rules-small">If you raised the flag...</p>
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

      {/* ////////////////////////////////// */}
      {/* SHOW CONTROLLERS */}
      {/* ////////////////////////////////// */}
      {showControllers && (
        <div>
          <div
            className="popup"
            onClick={() => {
              onClickPlayNavBody('Controllers');
            }}
          >
            <h1>Controllers</h1>
            <img className="snes" src="images/snes.png" alt="SNES Controller" />
            <div id="wcl">
              <h2>Controllers Suggested: </h2>
              {workingControllersAmazon.map((controller) => {
                return (
                  <a
                    key={controller.name}
                    onMouseEnter={() => {
                      soundManager.blipSoundSoft();
                    }}
                    className="working-controller"
                    href={controller.url}
                  >
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
                onMouseEnter={() => {
                  soundManager.blipSoundSoft();
                }}
                className="working-controller"
                href="https://www.amazon.com/dp/B01MYUDDCV?ref=ppx_yo2ov_dt_b_product_details&th=1/"
              >
                <span>{emoji.greenCheck} &nbsp;USB-A Extension Cord</span>
              </a>
              <a
                onMouseEnter={() => {
                  soundManager.blipSoundSoft();
                }}
                className="working-controller"
                href="https://www.amazon.com/gp/product/B01N5KGBGQ/ref=ppx_yo_dt_b_search_asin_title?ie=UTF8&psc=1"
              >
                <span>{emoji.greenCheck} &nbsp;USB-C Splitter</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ////////////////////////////////// */}
      {/* SHOW ABOUT (and session table) */}
      {/* ////////////////////////////////// */}
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
              <div
                className="horiz-item-big"
                onClick={(x) => {
                  x.stopPropagation();
                }}
              >
                <p>
                  This game is a tribute to "Smashed Bros", a drinking game
                  invented in St. Louis in late 2009 at the Chemon House.
                </p>
                <p>niemeyer.eric@gmail.com</p>
              </div>
              <div className="horiz-item-small">
                <div className="about-image-wrapper">
                  <img
                    className="about-image about-image-pixelated"
                    src="./images/character_3_cropped.png"
                    alt="kirby"
                    onMouseDown={() => {
                      // do nothing
                    }}
                  />
                </div>
                <a
                  onMouseEnter={() => {
                    soundManager.blipSoundSoft();
                  }}
                  className="btn btn-dark text-light"
                  href="https://niemo.io/"
                >
                  <span className="text-white small">Website</span>
                </a>
              </div>
              <div className="horiz-item-small">
                <div className="about-image-wrapper">
                  <img
                    className="about-image"
                    src="./images/NA_new.png"
                    alt="Niemo Audio"
                    onMouseDown={() => {
                      // do nothing
                    }}
                  />
                </div>
                <a
                  onMouseEnter={() => {
                    soundManager.blipSoundSoft();
                  }}
                  className="btn btn-dark text-light"
                  href="https://soundcloud.com/niemoaudio/ars-niemo-small-talk-build-iv"
                >
                  <span className="text-white small">Music</span>
                </a>
              </div>
              <div className="horiz-item-small">
                <div className="about-image-wrapper">
                  <img
                    className="about-image about-image-pixelated"
                    src="./images/blockcracked.png"
                    alt="Niemo Audio"
                    onMouseDown={() => {
                      // do nothing
                    }}
                  />
                </div>
                <a
                  onMouseEnter={() => {
                    soundManager.blipSoundSoft();
                  }}
                  className="btn btn-dark text-light"
                  href="https://resume.niemo.io/"
                >
                  <span className="text-white small">Resume</span>
                </a>
              </div>
            </div>
            <div
              id="show-all"
              onMouseEnter={() => {
                soundManager.blipSoundSoft();
              }}
              className={hideNiemoIp ? ' show-all-hide' : ' show-all-show'}
              onClick={(e) => {
                e.stopPropagation();
                soundManager.blipBeedeeSound();
                props.setHideNiemoIp((x) => !x);
              }}
            >
              Filter
            </div>

            <div className="scroller" ref={scrollerRef}>
              <table>
                <thead>
                  <tr id="tr-header">
                    <td id="title" className="td-left">
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
                  {allSessions.map((s: SessionInfo, sIndex: number) => {
                    // We keep the logic the same:
                    if (
                      hideNiemoIp &&
                      (s.ip === '69.124.166.109' ||
                        s.ip === '169.254.225.231' ||
                        s.ip === '24.186.254.151' ||
                        s.ip === '69.115.173.120' ||
                        s.ip === '' ||
                        s.ip === 'null' ||
                        s?.ip === null)
                    ) {
                      return null;
                    }

                    let gameViewTop: string = '';
                    let gameViewBottom: string = '';
                    let sc: SmashConfig | null = null;
                    try {
                      sc = JSON.parse(s.smashConfig);
                    } catch (e) {
                      // do nothing
                    }

                    if (sc !== null) {
                      sc.players.forEach((sessionPlayer: any) => {
                        gameViewTop +=
                          smashConfigOptions[sessionPlayer.characterId]
                            .nameShort + ' ';

                        switch (sessionPlayer.input) {
                          case 0:
                            gameViewBottom += sessionPlayer.input + ' ';
                            break;
                          case 1:
                            gameViewBottom += '' + emoji.gamepad + ' ';
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
                          case 5:
                            gameViewBottom += '' + emoji.dna + ' ';
                            break;
                          default:
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
                      Intl.DateTimeFormat().resolvedOptions().timeZone;
                    const formattedDate = mTZ
                      .tz(moment(sessionMomentObject), clientTimezone)
                      .format('YYYY-MM-DD HH:mm');

                    let totalShots: number = 0;
                    if (
                      s.matrixShotsUnto !== null &&
                      s.matrixShotsUnto !== 'null'
                    ) {
                      totalShots = sumNumbersIn2DArrayString(s.matrixShotsUnto);
                    }

                    let totalDeaths: number = 0;
                    if (
                      s.matrixDeathsUnto !== null &&
                      s.matrixDeathsUnto !== 'null'
                    ) {
                      totalDeaths = sumNumbersIn2DArrayString(
                        s.matrixDeathsUnto
                      );
                    }

                    let totalHits: number = 0;
                    if (
                      s.matrixHitsUnto !== null &&
                      s.matrixHitsUnto !== 'null'
                    ) {
                      totalHits = sumNumbersIn2DArrayString(s.matrixHitsUnto);
                    }

                    return (
                      <tr id={sIndex % 2 ? 'td-odd' : 'td-even'} key={sIndex}>
                        <td className="td-left">
                          <div id="td-info">
                            {paddedIndex} {formattedDate} {s.ip}
                          </div>
                          <div id="td-info">
                            {s.country} {s.region} {s.city}
                          </div>
                        </td>

                        <td className="td-left">
                          <div>{gameViewTop ? gameViewTop : ' '}</div>
                          <div>{gameViewBottom ? gameViewBottom : ' '}</div>
                        </td>
                        <td className="td-right">{totalShots || ' '}</td>
                        <td className="td-right">{totalDeaths || ' '}</td>
                        <td className="td-right">{totalHits || ' '}</td>
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

      {/* If you want showHistory as a separate popup, put it here */}
      {showHistory && (
        <div>
          <div
            className="popup"
            onClick={() => {
              onClickPlayNavBody('History');
            }}
          >
            <h1>History Coming Soon? Or same as About ...</h1>
          </div>
        </div>
      )}
    </>
  );
}
