import { debugInit } from './debugInit';
import { DebugDescriptions } from './scenes/types';

export const debugDescriptions: DebugDescriptions = {
  Nintendo_Sprites: 'Whether to use Nintendo sprites',
  Force_Pixelated: 'Force pixelated graphics',
  Allow_Mobile: 'Whether to allow mobile devices to play the game',
  NN_Reset_Evolving:
    "Replace the saved neural network weights in the database with the default weights from the client's neural network weights",
  NN_Train_Evolving:
    'This button sets up all options for the optimal automatic neural network training session',
  Auto_Restart: 'Automatically restart the game after a game over',
  Super_Speed: 'Increase the game speed',
  Dev_Mode: 'Developer mode',
  Dur_Seconds: 'Game duration expressed in seconds',
  Dev_Zoom: 'Game camera zoom level',
  Stage: 'Game stage - most older stages will be pretty broken',
  Mode_Infinity: 'Game mode - play until shots are exhausted',
  Minutes: 'Game duration expressed in minutes',
  Shots: 'Number of shots players have to take before the game ends',
  Game_Music: 'Which music to play during the game',
  Music_Active: 'Whether to play music during the game',
  Update_Loops_Skip: 'Number of update loops to skip for debugging purposes',
  Friction_Air_Active: 'Whether to apply air friction to the characters',
  Use_Camera: 'Whether to use the camera system',
  Cameras_Visible: 'Whether to show the camera system positions',
  Colliders_P_v_P: 'Whether player-to-player colliders are active',
  Colliders_P_v_AP: 'Whether player-to-attack-physical colliders are active',
  Colliders_P_v_AE: 'Whether player-to-attack-energy colliders are active',
  Colliders_AE_v_AE:
    'Whether attack-energy-to-attack-energy colliders are active',
  Colliders_AE_v_AP:
    'Whether attack-energy-to-attack-physical colliders are active',
  Colliders_AB_v_AE:
    'Whether attack-bullet-to-attack-energy colliders are active',
  Colliders_AB_v_AP:
    'Whether attack-bullet-to-attack-physical colliders are active',
  AE_Wrap_Screen: 'Whether attack-energy objects wrap around the screen',
  Title_Screws: 'Whether to show screws on the title screen',
  Show_Helper_Keyboard:
    'Show the keyboard helper when the game starts for keyboard users',
  Player_ID_Visible: 'Show player ID circles above the player',
  Chars_Colored: 'Whether to paint the characters in color',
  Wall_Jumps_Active: 'Activate wall jumps',
  Default_Damage: 'Use default damage values for attacks',
  Default_Hitback: 'Use default hitback values for attacks',
  Ready_Sound_Active:
    'Whether to play the ready sound when game is paused and a player presses a button',
  Health_Inverted: 'Invert the health percentage values',
  Matrices_Always: 'Show the shots-deaths-hits matrices on the screen',
  Auto_Start: 'Automatically start the game',
  Console_Log_Buttons: 'Log button presses to the console',
  Console_Log_Connected: 'Log connected gamepads to the console',
  Load_Time_Extra: 'Add extra load time to the game',
  Allow_Chez: 'Allow Chez to be used in the game',
  Allow_BlackChez: 'Allow BlackChez to be used in the game',
  Allow_Shell_Chars:
    (debugInit.Nintendo_Sprites ? 'Allow Koopas' : 'Allow Snails') +
    ' to be used in the game',
  Allow_SlowMo: 'Allow slow motion to be used in the game',
  Char_Override: 'Override the character selection',
  Char_Override_ID: 'Character ID to override the character selection with',
  Bullets_Allow_Groups: 'Allow bullets to be grouped together',
  Trophies_On_Shots: 'Show trophies on the screen when a player takes a shot',
  Trophies_Always:
    'Show trophies on the screen at all times to show real-time hierarchy',
  NN_Train_Static:
    'Train the normal neural network, print the weights to the console (I think thats where it goes?)',
  Simple_Stage: 'Remove all stage elements',
  NN_Help_Screen: 'Prevent the neural network from going off the screen',
  NN_Help_Pit: 'Prevent the neural network from going into the pit',
  NN_Brand_New: 'Create a new neural network',
  NN_Help_Wall: 'Help the neural network jump on the walls',
  NN_Help_Centerize: 'Help the neural network centerize on the map',
  Chomp_Explosion: 'Use the chomp explosions',
  Chomp_Velocities: 'Use the chomp velocities',
  Inst_Replay: 'Instant replay: 0 - off, 1 - on, 2 - high quality',
  Replay_FastSlow:
    'Instant replay plays back fast rate to catch up to the last four seconds of game play',
  Flower_Rapid_Fire: 'Fire flower rapid fires',
  Flower_On_Init: 'Fire flower is able to shoot at the start of the game',
  Flower_Full_Screen: 'Fire flower can shoot at any distance',
  Flower_Gravity: 'Fire flower bullets are affected by gravity',
  Flower_Bounce_Wall: 'Fire flower bullets bounce off walls',
  Flower_1000_Balls: 'Fire flower shoots basically unlimited bullets',
  Flower_ShootRndAmt: 'Fire flower shoots at random duraitons (I think?)',
  Flower_HighTrajectory: 'Fire flower shoots at a high trajectory (ballistics)',
};
