import { print } from '../../views/client';
type CheapPadState = {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
};

export interface StandardGamepadMapping {
  // Face buttons (right cluster)
  A: number; // Bottom button (index 0)
  B: number; // Right button (index 1)
  X: number; // Left button (index 2)
  Y: number; // Top button (index 3)

  // Shoulder buttons
  L1: number; // Left shoulder (index 4)
  R1: number; // Right shoulder (index 5)
  L2: number; // Left trigger (index 6)
  R2: number; // Right trigger (index 7)

  // Center buttons
  select: number; // Back/Select (index 8)
  start: number; // Start (index 9)

  // Stick buttons
  L3: number; // Left stick button (index 10)
  R3: number; // Right stick button (index 11)

  // D-pad
  up: number; // D-pad up (index 12)
  down: number; // D-pad down (index 13)
  left: number; // D-pad left (index 14)
  right: number; // D-pad right (index 15)

  // Center button
  home: number; // Home/Guide button (index 16)
}

export interface GamepadAxesMapping {
  leftStickX: number; // Left stick horizontal (index 0)
  leftStickY: number; // Left stick vertical (index 1)
  rightStickX: number; // Right stick horizontal (index 2)
  rightStickY: number; // Right stick vertical (index 3)
}

export interface GamepadConfig {
  deadZone: number;
  analogToDigitalThreshold: number;
  vibrationEnabled: boolean;
}

export interface ControllerMapping {
  name: string;
  buttons: Partial<StandardGamepadMapping>;
  axes: Partial<GamepadAxesMapping>;
  dpadMode: 'buttons' | 'axes' | 'hat';
  hatAxisIndex?: number;
}

export class GamepadManager {
  private cheapPadHidDevice: any | null = null;
  private cheapPadState: CheapPadState = {
    up: false,
    down: false,
    left: false,
    right: false,
  };

  private static instance: GamepadManager;
  private gamepads: Map<number, Gamepad> = new Map();
  private mappings: Map<string, ControllerMapping> = new Map();
  private config: GamepadConfig = {
    deadZone: 0.15,
    analogToDigitalThreshold: 0.5,
    vibrationEnabled: true,
  };

  private standardMapping: StandardGamepadMapping = {
    A: 0,
    B: 1,
    X: 2,
    Y: 3,
    L1: 4,
    R1: 5,
    L2: 6,
    R2: 7,
    select: 8,
    start: 9,
    L3: 10,
    R3: 11,
    up: 12,
    down: 13,
    left: 14,
    right: 15,
    home: 16,
  };

  private constructor() {
    this.initializeControllerMappings();
    this.setupEventListeners();

    if (navigator.platform.toLowerCase().includes('mac')) {
      this.initWebHidForCheapPad();
    }
  }

  private async initWebHidForCheapPad() {
    try {
      // @ts-ignore
      const [device] = await navigator.hid.requestDevice({
        filters: [{ vendorId: 0x0079, productId: 0x0011 }],
      });
      if (!device) return;
      this.cheapPadHidDevice = device;
      await device.open();

      device.addEventListener('inputreport', (e: any) =>
        this.handleCheapPadReport(e)
      );
      print('DEBUG → Cheap pad WebHID initialized');
    } catch (err) {
      print(`DEBUG → WebHID init failed: ${err}`);
    }
  }

  private handleCheapPadReport(event: any) {
    const data = event.data;
    // HID usage page 0x01, usages 0x30..0x33 for up/down/left/right:
    const dpadByte = data.getUint8(0); // adjust index if needed
    this.cheapPadState = {
      up: (dpadByte & 0x01) !== 0,
      down: (dpadByte & 0x02) !== 0,
      left: (dpadByte & 0x04) !== 0,
      right: (dpadByte & 0x08) !== 0,
    };
  }

  static getInstance(): GamepadManager {
    if (!GamepadManager.instance) {
      GamepadManager.instance = new GamepadManager();
    }
    return GamepadManager.instance;
  }

  private initializeControllerMappings(): void {
    // Xbox controller mappings (most common, usually works as standard)
    this.mappings.set('xbox', {
      name: 'Xbox Controller',
      buttons: this.standardMapping,
      axes: { leftStickX: 0, leftStickY: 1, rightStickX: 2, rightStickY: 3 },
      dpadMode: 'buttons',
    });

    // PlayStation controller mappings
    this.mappings.set('playstation', {
      name: 'PlayStation Controller',
      buttons: {
        A: 1,
        B: 2,
        X: 0,
        Y: 3, // PlayStation uses different face button layout
        L1: 4,
        R1: 5,
        L2: 6,
        R2: 7,
        select: 8,
        start: 9,
        L3: 10,
        R3: 11,
        up: 12,
        down: 13,
        left: 14,
        right: 15,
        home: 16,
      },
      axes: { leftStickX: 0, leftStickY: 1, rightStickX: 2, rightStickY: 3 },
      dpadMode: 'buttons',
    });

    // Generic controller with HAT/POV for D-pad
    this.mappings.set('generic-hat', {
      name: 'Generic Controller (HAT D-pad)',
      buttons: this.standardMapping,
      axes: { leftStickX: 0, leftStickY: 1, rightStickX: 2, rightStickY: 3 },
      dpadMode: 'hat',
      hatAxisIndex: 9,
    });

    // Mac-specific fixes for common controllers
    this.mappings.set('mac-xbox', {
      name: 'Xbox Controller (Mac)',
      buttons: {
        A: 0,
        B: 1,
        X: 3,
        Y: 4, // Different mapping on Mac
        L1: 6,
        R1: 7,
        L2: 8,
        R2: 9,
        select: 10,
        start: 11,
        L3: 13,
        R3: 14,
        up: 15,
        down: 16,
        left: 17,
        right: 18,
        home: 12,
      },
      axes: { leftStickX: 0, leftStickY: 1, rightStickX: 2, rightStickY: 3 },
      dpadMode: 'buttons',
    });

    // Mac PlayStation controller
    this.mappings.set('mac-playstation', {
      name: 'PlayStation Controller (Mac)',
      buttons: {
        A: 2,
        B: 1,
        X: 3,
        Y: 0, // Different mapping on Mac
        L1: 4,
        R1: 5,
        L2: 6,
        R2: 7,
        select: 8,
        start: 9,
        L3: 10,
        R3: 11,
        up: 14,
        down: 15,
        left: 16,
        right: 17,
        home: 12,
      },
      axes: { leftStickX: 0, leftStickY: 1, rightStickX: 2, rightStickY: 3 },
      dpadMode: 'buttons',
    });

    // Nintendo Switch Pro Controller
    this.mappings.set('switch-pro', {
      name: 'Switch Pro Controller',
      buttons: {
        A: 1,
        B: 0,
        X: 3,
        Y: 2, // Nintendo button layout
        L1: 4,
        R1: 5,
        L2: 6,
        R2: 7,
        select: 8,
        start: 9,
        L3: 10,
        R3: 11,
        up: 12,
        down: 13,
        left: 14,
        right: 15,
        home: 16,
      },
      axes: { leftStickX: 0, leftStickY: 1, rightStickX: 2, rightStickY: 3 },
      dpadMode: 'buttons',
    });

    // 8BitDo controllers
    this.mappings.set('8bitdo', {
      name: '8BitDo Controller',
      buttons: {
        A: 1,
        B: 0,
        X: 4,
        Y: 3,
        L1: 6,
        R1: 7,
        L2: 8,
        R2: 9,
        select: 10,
        start: 11,
        L3: 13,
        R3: 14,
        up: -1,
        down: -1,
        left: -1,
        right: -1, // Uses HAT
      },
      axes: { leftStickX: 0, leftStickY: 1, rightStickX: 2, rightStickY: 3 },
      dpadMode: 'hat',
      hatAxisIndex: 9,
    });

    // Generic USB controllers (often cheap controllers)
    // this.mappings.set('generic-usb', {
    //   name: 'Generic USB Controller',
    //   buttons: {
    //     A: 2, B: 1, X: 3, Y: 0,
    //     L1: 4, R1: 5, L2: 6, R2: 7,
    //     select: 8, start: 9,
    //     L3: 10, R3: 11,
    //     up: -1, down: -1, left: -1, right: -1  // Often use axes/HAT
    //   },
    //   axes: { leftStickX: 0, leftStickY: 1, rightStickX: 3, rightStickY: 4 },
    //   dpadMode: 'hat',
    //   hatAxisIndex: 9
    // });
    this.mappings.set('generic-usb', {
      name: 'Generic USB Controller',
      buttons: this.standardMapping, // ← include up:12, down:13, left:14, right:15
      axes: { leftStickX: 0, leftStickY: 1, rightStickX: 3, rightStickY: 4 },
      dpadMode: 'buttons', // ← use the button indices
    });
  }

  private setupEventListeners(): void {
    window.addEventListener('gamepadconnected', (e: GamepadEvent) => {
      print(`Gamepad connected: ${e.gamepad.id}`);
      this.gamepads.set(e.gamepad.index, e.gamepad);
    });

    window.addEventListener('gamepaddisconnected', (e: GamepadEvent) => {
      print(`Gamepad disconnected: ${e.gamepad.id}`);
      this.gamepads.delete(e.gamepad.index);
    });
  }

  private detectControllerType(gamepad: Gamepad): ControllerMapping {
    // DEBUG: Log raw button and axis data for diagnostics
    try {
      const pressedButtons = gamepad.buttons
        .map((btn, idx) => (btn.pressed ? idx : null))
        .filter((i) => i !== null);
      print(
        `DEBUG → Gamepad [${gamepad.index}]: id="${
          gamepad.id
        }", pressedButtons=${JSON.stringify(
          pressedButtons
        )}, axes=${JSON.stringify(gamepad.axes)}`
      );
    } catch (e) {
      print(`DEBUG → Failed to read raw gamepad data: ${e}`);
    }

    const id = gamepad.id.toLowerCase();
    const isMac = navigator.platform.toLowerCase().includes('mac');

    // 1) Trust the browser's W3C standard mapping when provided
    if (gamepad.mapping === 'standard') {
      return {
        name: 'Browser-standard mapping',
        buttons: this.standardMapping,
        axes: { leftStickX: 0, leftStickY: 1, rightStickX: 2, rightStickY: 3 },
        dpadMode: 'buttons',
      };
    }

    // 2) Specific cheap USB Gamepad (Vendor: 0079 Product: 0011)
    if (id.includes('vendor: 0079') && id.includes('product: 0011')) {
      return {
        name: 'Cheap USB SNES (Vendor:0079 Product:0011)',
        buttons: this.standardMapping,
        axes: { leftStickX: 0, leftStickY: 1, rightStickX: 2, rightStickY: 3 },
        dpadMode: 'buttons',
      };
    }

    // 3) Nintendo Switch Pro Controller on macOS/Chrome reports ABXY reversed
    if (id.includes('pro controller')) {
      return {
        name: 'Switch Pro (Mac raw)',
        buttons: {
          ...this.standardMapping,
          A: this.standardMapping.B,
          B: this.standardMapping.A,
          X: this.standardMapping.Y,
          Y: this.standardMapping.X,
        },
        axes: { leftStickX: 0, leftStickY: 1, rightStickX: 2, rightStickY: 3 },
        dpadMode: 'buttons',
      };
    }

    // 4) SNES-style USB clones: fallback
    if (
      id.includes('snes') ||
      id.includes('super nintendo') ||
      id.includes('usb gamepad')
    ) {
      return {
        name: 'SNES-style USB fallback',
        buttons: this.standardMapping,
        axes: { leftStickX: 0, leftStickY: 1, rightStickX: 2, rightStickY: 3 },
        dpadMode: 'buttons',
      };
    }

    // Standard Xbox / XInput
    if (
      id.includes('xbox') ||
      id.includes('xinput') ||
      id.includes('microsoft')
    ) {
      return this.mappings.get(isMac ? 'mac-xbox' : 'xbox')!;
    }

    // PlayStation
    if (
      id.includes('playstation') ||
      id.includes('dualshock') ||
      id.includes('sony') ||
      id.includes('wireless controller')
    ) {
      return this.mappings.get(isMac ? 'mac-playstation' : 'playstation')!;
    }

    // Dedicated Switch Pro (non-standard)
    if (id.includes('nintendo') && id.includes('switch')) {
      return this.mappings.get('switch-pro')!;
    }

    // 8BitDo
    if (id.includes('8bitdo')) {
      return this.mappings.get('8bitdo')!;
    }

    // Vendor/product fallbacks
    if (id.includes('054c-05c4')) {
      return this.mappings.get(isMac ? 'mac-playstation' : 'playstation')!;
    }
    if (id.includes('045e-02d1') || id.includes('045e-02dd')) {
      return this.mappings.get(isMac ? 'mac-xbox' : 'xbox')!;
    }

    // Heuristic fallback for hat-based D-pad
    if (gamepad.axes.length >= 4) {
      if (gamepad.axes.length > 9 && Math.abs(gamepad.axes[9]) > 0.1) {
        return this.mappings.get('generic-hat')!;
      }
      if (gamepad.buttons.length === 17) {
        return this.mappings.get('xbox')!;
      }
      if (gamepad.axes.length >= 5) {
        return this.mappings.get('generic-usb')!;
      }
      return this.mappings.get('xbox')!;
    }

    // Last resort: generic USB mapping
    return this.mappings.get('generic-usb')!;
  }

  private applyDeadZone(value: number): number {
    return Math.abs(value) < this.config.deadZone ? 0 : value;
  }

  private getHatDirection(hatValue: number): {
    up: boolean;
    down: boolean;
    left: boolean;
    right: boolean;
  } {
    // HAT values can vary by controller and browser
    // Some use -1 to 1, others use 0 to 1, some use discrete values
    const directions = {
      up: false,
      down: false,
      left: false,
      right: false,
    };

    // Handle the case where HAT is not active (neutral position)
    if (
      Math.abs(hatValue) < 0.1 ||
      hatValue === null ||
      hatValue === undefined
    ) {
      return directions;
    }

    // For the classic 8-direction HAT that uses -1 to 1 range with 8 positions
    // This matches your original implementation more closely
    const hatThresholds = [
      -1 + 0.142857, // 0: Up
      -1 + 0.142857 * 3, // 1: Up-Right
      -1 + 0.142857 * 5, // 2: Right
      -1 + 0.142857 * 7, // 3: Down-Right
      -1 + 0.142857 * 9, // 4: Down
      -1 + 0.142857 * 11, // 5: Down-Left
      -1 + 0.142857 * 13, // 6: Left
      -1 + 0.142857 * 15, // 7: Up-Left
    ];

    if (hatValue < hatThresholds[0]) {
      // Up
      directions.up = true;
    } else if (hatValue < hatThresholds[1]) {
      // Up-Right
      directions.up = true;
      directions.right = true;
    } else if (hatValue < hatThresholds[2]) {
      // Right
      directions.right = true;
    } else if (hatValue < hatThresholds[3]) {
      // Down-Right
      directions.down = true;
      directions.right = true;
    } else if (hatValue < hatThresholds[4]) {
      // Down
      directions.down = true;
    } else if (hatValue < hatThresholds[5]) {
      // Down-Left
      directions.down = true;
      directions.left = true;
    } else if (hatValue < hatThresholds[6]) {
      // Left
      directions.left = true;
    } else if (hatValue < hatThresholds[7]) {
      // Up-Left
      directions.up = true;
      directions.left = true;
    }
    // Values above the last threshold are typically neutral

    return directions;
  }

  getGamepadState(index: number): any {
    // Update gamepad state (required for Chrome)
    const gamepads = navigator.getGamepads();
    const gamepad = gamepads[index];

    if (!gamepad || !gamepad.connected) {
      return null;
    }

    const mapping = this.detectControllerType(gamepad);
    const state: any = {
      connected: true,
      id: gamepad.id,
      mapping: mapping.name,

      // Face buttons
      A: false,
      B: false,
      X: false,
      Y: false,

      // Shoulders/Triggers
      L: false,
      R: false,
      L2: false,
      R2: false,

      // Center buttons
      start: false,
      select: false,

      // D-pad
      up: false,
      down: false,
      left: false,
      right: false,

      // Analog sticks (digital)
      leftStickUp: false,
      leftStickDown: false,
      leftStickLeft: false,
      leftStickRight: false,
      rightStickUp: false,
      rightStickDown: false,
      rightStickLeft: false,
      rightStickRight: false,

      // Raw analog values
      leftStickX: 0,
      leftStickY: 0,
      rightStickX: 0,
      rightStickY: 0,
    };

    // Map buttons with bounds checking
    if (
      mapping.buttons.A !== undefined &&
      mapping.buttons.A >= 0 &&
      mapping.buttons.A < gamepad.buttons.length &&
      gamepad.buttons[mapping.buttons.A]
    ) {
      state.A = gamepad.buttons[mapping.buttons.A].pressed;
    }
    if (
      mapping.buttons.B !== undefined &&
      mapping.buttons.B >= 0 &&
      mapping.buttons.B < gamepad.buttons.length &&
      gamepad.buttons[mapping.buttons.B]
    ) {
      state.B = gamepad.buttons[mapping.buttons.B].pressed;
    }
    if (
      mapping.buttons.X !== undefined &&
      mapping.buttons.X >= 0 &&
      mapping.buttons.X < gamepad.buttons.length &&
      gamepad.buttons[mapping.buttons.X]
    ) {
      state.X = gamepad.buttons[mapping.buttons.X].pressed;
    }
    if (
      mapping.buttons.Y !== undefined &&
      mapping.buttons.Y >= 0 &&
      mapping.buttons.Y < gamepad.buttons.length &&
      gamepad.buttons[mapping.buttons.Y]
    ) {
      state.Y = gamepad.buttons[mapping.buttons.Y].pressed;
    }

    if (
      mapping.buttons.L1 !== undefined &&
      mapping.buttons.L1 >= 0 &&
      mapping.buttons.L1 < gamepad.buttons.length &&
      gamepad.buttons[mapping.buttons.L1]
    ) {
      state.L = gamepad.buttons[mapping.buttons.L1].pressed;
    }
    if (
      mapping.buttons.R1 !== undefined &&
      mapping.buttons.R1 >= 0 &&
      mapping.buttons.R1 < gamepad.buttons.length &&
      gamepad.buttons[mapping.buttons.R1]
    ) {
      state.R = gamepad.buttons[mapping.buttons.R1].pressed;
    }

    if (
      mapping.buttons.start !== undefined &&
      mapping.buttons.start >= 0 &&
      mapping.buttons.start < gamepad.buttons.length &&
      gamepad.buttons[mapping.buttons.start]
    ) {
      state.start = gamepad.buttons[mapping.buttons.start].pressed;
    }
    if (
      mapping.buttons.select !== undefined &&
      mapping.buttons.select >= 0 &&
      mapping.buttons.select < gamepad.buttons.length &&
      gamepad.buttons[mapping.buttons.select]
    ) {
      state.select = gamepad.buttons[mapping.buttons.select].pressed;
    }

    // Handle D-pad based on mode
    if (mapping.dpadMode === 'buttons') {
      if (
        mapping.buttons.up !== undefined &&
        mapping.buttons.up >= 0 &&
        mapping.buttons.up < gamepad.buttons.length &&
        gamepad.buttons[mapping.buttons.up]
      ) {
        state.up = gamepad.buttons[mapping.buttons.up].pressed;
      }
      if (
        mapping.buttons.down !== undefined &&
        mapping.buttons.down >= 0 &&
        mapping.buttons.down < gamepad.buttons.length &&
        gamepad.buttons[mapping.buttons.down]
      ) {
        state.down = gamepad.buttons[mapping.buttons.down].pressed;
      }
      if (
        mapping.buttons.left !== undefined &&
        mapping.buttons.left >= 0 &&
        mapping.buttons.left < gamepad.buttons.length &&
        gamepad.buttons[mapping.buttons.left]
      ) {
        state.left = gamepad.buttons[mapping.buttons.left].pressed;
      }
      if (
        mapping.buttons.right !== undefined &&
        mapping.buttons.right >= 0 &&
        mapping.buttons.right < gamepad.buttons.length &&
        gamepad.buttons[mapping.buttons.right]
      ) {
        state.right = gamepad.buttons[mapping.buttons.right].pressed;
      }
    } else if (
      mapping.dpadMode === 'hat' &&
      mapping.hatAxisIndex !== undefined &&
      mapping.hatAxisIndex < gamepad.axes.length
    ) {
      const hatValue = gamepad.axes[mapping.hatAxisIndex];
      if (hatValue !== undefined) {
        const hatDirections = this.getHatDirection(hatValue);
        state.up = hatDirections.up;
        state.down = hatDirections.down;
        state.left = hatDirections.left;
        state.right = hatDirections.right;
      }
    }

    // Handle analog sticks with bounds checking
    if (
      mapping.axes.leftStickX !== undefined &&
      mapping.axes.leftStickX < gamepad.axes.length
    ) {
      state.leftStickX = this.applyDeadZone(
        gamepad.axes[mapping.axes.leftStickX]
      );
    }
    if (
      mapping.axes.leftStickY !== undefined &&
      mapping.axes.leftStickY < gamepad.axes.length
    ) {
      state.leftStickY = this.applyDeadZone(
        gamepad.axes[mapping.axes.leftStickY]
      );
    }
    if (
      mapping.axes.rightStickX !== undefined &&
      mapping.axes.rightStickX < gamepad.axes.length
    ) {
      state.rightStickX = this.applyDeadZone(
        gamepad.axes[mapping.axes.rightStickX]
      );
    }
    if (
      mapping.axes.rightStickY !== undefined &&
      mapping.axes.rightStickY < gamepad.axes.length
    ) {
      state.rightStickY = this.applyDeadZone(
        gamepad.axes[mapping.axes.rightStickY]
      );
    }

    // Convert analog to digital for sticks
    const threshold = this.config.analogToDigitalThreshold;
    state.leftStickLeft = state.leftStickX < -threshold;
    state.leftStickRight = state.leftStickX > threshold;
    state.leftStickUp = state.leftStickY < -threshold;
    state.leftStickDown = state.leftStickY > threshold;

    // Only use left stick as D-pad if controller doesn't have D-pad buttons AND there's actual stick input
    const hasActualStickInput =
      Math.abs(state.leftStickX) > threshold ||
      Math.abs(state.leftStickY) > threshold;
    const hasDpadButtons =
      mapping.dpadMode === 'buttons' &&
      mapping.buttons.up !== undefined &&
      mapping.buttons.up >= 0;

    if (
      !hasDpadButtons &&
      !state.up &&
      !state.down &&
      !state.left &&
      !state.right &&
      hasActualStickInput
    ) {
      state.up = state.leftStickUp;
      state.down = state.leftStickDown;
      state.left = state.leftStickLeft;
      state.right = state.leftStickRight;
    }

    if (
      mapping.name === 'Cheap USB SNES (Vendor:0079 Product:0011)' &&
      this.cheapPadHidDevice
    ) {
      state.up = this.cheapPadState.up;
      state.down = this.cheapPadState.down;
      state.left = this.cheapPadState.left;
      state.right = this.cheapPadState.right;
      return state;
    }

    return state;
  }

  isRealController(gamepad: Gamepad): boolean {
    const id = gamepad.id.toLowerCase();

    // Filter out known non-gaming devices
    const nonGamingDevices = [
      'jabra',
      'headset',
      'audio',
      'microphone',
      'webcam',
    ];
    for (const device of nonGamingDevices) {
      if (id.includes(device)) {
        return false;
      }
    }

    return true;
  }

  getConnectedGamepads(): Gamepad[] {
    const gamepads = navigator.getGamepads();
    const connected: Gamepad[] = [];

    for (let i = 0; i < gamepads.length; i++) {
      const gamepad = gamepads[i];
      if (gamepad && this.isRealController(gamepad)) {
        connected.push(gamepad);
      }
    }

    return connected;
  }

  setConfig(config: Partial<GamepadConfig>): void {
    this.config = { ...this.config, ...config };
  }

  getConfig(): GamepadConfig {
    return { ...this.config };
  }

  /**
   * Trigger a dual-rumble effect on the given gamepad index.
   */
  public async vibrateGamepad(params: {
    index: number;
    duration: number; // ms
    weakMagnitude: number; // 0.0–1.0
    strongMagnitude: number; // 0.0–1.0
  }): Promise<void> {
    const { index, duration, weakMagnitude, strongMagnitude } = params;

    const gamepad = navigator.getGamepads()[index];
    if (!gamepad || !gamepad.connected) {
      return;
    }

    // Standard W3C hapticActuators (Chrome 94+)
    const actuators = (gamepad as any).hapticActuators as
      | GamepadHapticActuator[]
      | undefined;
    if (actuators && actuators.length) {
      const act = actuators[0];
      if (typeof act.playEffect === 'function') {
        await act.playEffect('dual-rumble', {
          startDelay: 0,
          duration,
          weakMagnitude,
          strongMagnitude,
        });
        return;
      }
    }

    // Fallback for older Chromium (`vibrationActuator`) or Firefox `pulse()`
    const va = (gamepad as any).vibrationActuator as
      | GamepadHapticActuator
      | undefined;
    if (va) {
      if (typeof va.playEffect === 'function') {
        await va.playEffect('dual-rumble', {
          startDelay: 0,
          duration,
          weakMagnitude,
          strongMagnitude,
        });
      } else if (typeof (va as any).pulse === 'function') {
        // Firefox-style pulse
        await (va as any).pulse(
          Math.max(weakMagnitude, strongMagnitude),
          duration
        );
      }
    }
  }

  public vibrateHit(index: number): Promise<void> {
    return this.vibrateGamepad({
      index,
      duration: 100,
      weakMagnitude: 1,
      strongMagnitude: 1,
    });
  }

  public vibrateDeath(index: number): Promise<void> {
    return this.vibrateGamepad({
      index,
      duration: 500,
      weakMagnitude: 1,
      strongMagnitude: 1,
    });
  }

  public vibrateShot(index: number): Promise<void> {
    return this.vibrateGamepad({
      index,
      duration: 2000,
      weakMagnitude: 1,
      strongMagnitude: 1,
    });
  }
}
