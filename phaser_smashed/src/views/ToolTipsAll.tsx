// TooltipsAll.tsx

import { Tooltip } from 'react-tooltip';
import { toolTipStyle, tooltipDelay } from '../scenes/types';

function TooltipsAll() {
  // We simply export these as a single block of identical <Tooltip> usage
  return (
    <>
      <Tooltip
        opacity={1}
        anchorSelect=".b-all-bots"
        place="top"
        delayHide={tooltipDelay}
        delayShow={tooltipDelay}
        style={toolTipStyle}
      />
      <Tooltip
        opacity={1}
        anchorSelect=".b-dark"
        place="top"
        delayHide={tooltipDelay}
        delayShow={tooltipDelay}
        style={toolTipStyle}
      />
      <Tooltip
        opacity={1}
        anchorSelect=".b-start"
        place="top"
        delayHide={tooltipDelay}
        delayShow={tooltipDelay}
        style={toolTipStyle}
      />
      <Tooltip
        opacity={1}
        anchorSelect=".player-char"
        place="top"
        delayHide={tooltipDelay}
        delayShow={tooltipDelay}
        style={toolTipStyle}
      />
      <Tooltip
        opacity={1}
        anchorSelect=".debug-class"
        place="top"
        delayHide={tooltipDelay}
        delayShow={tooltipDelay}
        style={toolTipStyle}
      />
    </>
  );
}

export default TooltipsAll;
