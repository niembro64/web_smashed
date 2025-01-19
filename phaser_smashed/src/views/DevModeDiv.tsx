// DevModeDiv.tsx

import { Debug } from '../scenes/types';

interface DevModeDivProps {
  debugState: Debug;
}

function DevModeDiv({ debugState }: DevModeDivProps) {
  if (
    !debugState.Dev_Mode &&
    !debugState.Auto_Restart &&
    !debugState.Auto_Start
  ) {
    return null;
  }
  return (
    <div className="dev-mode-div">
      {(debugState.Dev_Mode ? 'Dev_Mode' : '') +
        (debugState.Auto_Restart ? ' Auto_Restart' : '') +
        (debugState.Auto_Start ? ' Auto_Start' : '')}
    </div>
  );
}

export default DevModeDiv;
