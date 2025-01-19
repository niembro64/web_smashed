// NeuralNetworkTrainStatus.tsx

import React from 'react';
import { SoundManagerType } from './SoundManager';
import { Debug } from '../scenes/types';
import { nnNumTrainingBarTicks } from '../scenes/helpers/nn';

interface Props {
  nnProgress: number | null;
  nnErrorCurr: number | null;
  nnErrInit: number | null;
  nnNumIter: number | null;
  nnNumObj: number | null;
  nnJson: string | null;
  nnRatios: number[] | null;
  soundManager: SoundManagerType;
  debugState: Debug;
}

const NeuralNetworkTrainStatus: React.FC<Props> = ({
  nnProgress,
  nnErrorCurr,
  nnErrInit,
  nnNumIter,
  nnNumObj,
  nnJson,
  nnRatios,
  soundManager,
}) => {
  
  const percentDoneBar = (n: number): string => {
    const incomplete = '-';
    const complete = '|';

    let str = '';
    for (let i = 0; i < nnNumTrainingBarTicks; i++) {
      if (i < n * nnNumTrainingBarTicks) {
        str += complete;
      } else {
        str += incomplete;
      }
    }

    return str;
  };

  
  if (nnProgress === null) {
    // no training status to show
    return null;
  }



  return (
    <div className="neural-network-train-status">
      <span>AI Training</span>
      <div className="neural-network-train-top">
        <span>
          {percentDoneBar(nnProgress)} {Math.floor((nnProgress || 0) * 100)}%
        </span>
        <span> Error Init {nnErrInit || 0}</span>
        <span> Error Curr {nnErrorCurr || 0}</span>
        <span>
          {' '}
          ITER {nnNumIter || 0} | OBJ {nnNumObj || 0}
        </span>
      </div>

      <div className="neural-network-train-bottom">
        <div
          onMouseEnter={() => {
            soundManager.blipSoundSoft();
          }}
          className={nnJson === null ? ' b-start-inactive' : 'b-start'}
          onClick={() => {
            if (nnJson !== null && navigator.clipboard !== undefined) {
              navigator.clipboard.writeText(nnJson);
              soundManager.blipBeedeeSound();
            }
          }}
        >
          <span>Copy Weights</span>
        </div>
        <div
          onMouseEnter={() => {
            soundManager.blipSoundSoft();
          }}
          className={nnRatios === null ? ' b-start-inactive' : 'b-start'}
          onClick={() => {
            if (nnRatios !== null && navigator.clipboard !== undefined) {
              navigator.clipboard.writeText(nnRatios.toString());
              soundManager.blipBeedeeSound();
            }
          }}
        >
          <span>Copy Ratios</span>
        </div>
      </div>
    </div>
  );
};

export default NeuralNetworkTrainStatus;
