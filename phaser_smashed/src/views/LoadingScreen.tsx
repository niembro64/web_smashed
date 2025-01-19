// LoadingScreen.tsx

import React from 'react';
import { Debug } from '../scenes/types';

interface LoadingScreenProps {
  debugState: Debug;
  quotesRandomNumber: number;
  quotes: { text: string; name: string }[];
}

function LoadingScreen({
  debugState,
  quotesRandomNumber,
  quotes,
}: LoadingScreenProps) {
  // Keep the same styling, comments, etc.
  if (!quotes || quotesRandomNumber < 0) return null;

  return (
    <div className="loader">
      <div className="spinner-box">
        <div className="spinner-rotate-x">
          <div className="spinner-rotate-y">
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
      <div className="loading-table-wrapper">
        <img className="loading-table" src="/images/table.png" alt="table" />
      </div>
      {!debugState.Typed_Loading_Text && (
        <p className="first-loader-p">{quotes[quotesRandomNumber].text}</p>
      )}
      <p className="second-loader-p">- {quotes[quotesRandomNumber].name}</p>
    </div>
  );
}

export default LoadingScreen;
