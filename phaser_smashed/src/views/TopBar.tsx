// TopBar.tsx

import { ButtonName } from '../scenes/types';
import { SoundManagerType } from './SoundManager';

interface TopBarProps {
  openEye: boolean;
  webStateCurr: string;
  onClickEye: () => void;
  onClickPlayNavButtons: (buttonName: ButtonName) => void;
  onClickBackButtonHandler: () => void;
  onClickStartStartButton: () => void;
  showControls: boolean;
  showControllers: boolean;
  showRulesN64: boolean;
  showAbout: boolean;
  showOptions: boolean;
  topBarDivExists: boolean;
  soundManager: SoundManagerType;
}

function TopBar({
  openEye,
  webStateCurr,
  onClickEye,
  onClickPlayNavButtons,
  onClickBackButtonHandler,
  onClickStartStartButton,
  showControls,
  showControllers,
  showRulesN64,
  showAbout,
  showOptions,
  topBarDivExists,
  soundManager,
}: TopBarProps) {
  if (!topBarDivExists) {
    return null;
  }

  return (
    <div
      onMouseEnter={() => {
        soundManager.blipSoundSoft();
      }}
      className={
        openEye
          ? 'top-bar-eye-open ' +
            (webStateCurr === 'web-state-game' ? 'bg-black' : 'bg-trans')
          : 'top-bar-eye-closed bg-trans'
      }
    >
      <img
        onMouseEnter={() => {
          soundManager.blipSoundSoft();
        }}
        className="eye-mark"
        src={
          !openEye ? '/images/eye-shut-trans.png' : '/images/eye-open-trans.png'
        }
        alt="question mark"
        onClick={onClickEye}
      />

      {webStateCurr === 'web-state-setup' && (
        <div
          onMouseEnter={() => {
            soundManager.blipSoundSoft();
          }}
          className="link-tag"
          onClick={() => {
            onClickPlayNavButtons('Options');
          }}
        >
          {showOptions && <span className="dark-span">OPTIONS</span>}
          {!showOptions && <span>OPTIONS</span>}
        </div>
      )}

      {webStateCurr === 'web-state-setup' && (
        <div
          onMouseEnter={() => {
            soundManager.blipSoundSoft();
          }}
          className="link-tag"
          onClick={() => {
            onClickPlayNavButtons('Controllers');
          }}
        >
          {showControllers && <span className="dark-span">CONTROLLERS</span>}
          {!showControllers && <span>CONTROLLERS</span>}
        </div>
      )}

      {webStateCurr !== 'web-state-setup' && (
        <div
          onMouseEnter={() => {
            soundManager.blipSoundSoft();
          }}
          className="link-tag"
          onClick={() => {
            onClickBackButtonHandler();
          }}
        >
          <span>BACK</span>
        </div>
      )}

      {webStateCurr !== 'web-state-setup' && (
        <div
          onMouseEnter={() => {
            soundManager.blipSoundSoft();
          }}
          className="link-tag"
          onClick={() => {
            onClickStartStartButton();
          }}
        >
          <span>RESTART</span>
        </div>
      )}

      <div
        onMouseEnter={() => {
          soundManager.blipSoundSoft();
        }}
        className="link-tag"
        onClick={() => {
          onClickPlayNavButtons('Controls');
        }}
      >
        {showControls && <span className="dark-span">CONTROLS</span>}
        {!showControls && <span>CONTROLS</span>}
      </div>

      <div
        onMouseEnter={() => {
          soundManager.blipSoundSoft();
        }}
        className="link-tag"
        onClick={() => {
          onClickPlayNavButtons('Rules-N64');
        }}
      >
        {showRulesN64 && <span className="dark-span">RULES</span>}
        {!showRulesN64 && <span>RULES</span>}
      </div>

      {webStateCurr === 'web-state-setup' && (
        <div
          onMouseEnter={() => {
            soundManager.blipSoundSoft();
          }}
          className="link-tag"
          onClick={() => {
            onClickPlayNavButtons('About');
          }}
        >
          {showAbout && <span className="dark-span">ABOUT</span>}
          {!showAbout && <span>ABOUT</span>}
        </div>
      )}
    </div>
  );
}

export default TopBar;
