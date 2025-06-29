// src/types/gamepad.d.ts

export {}; // mark as a module

declare global {
  interface GamepadHapticActuator {
    /**
     * Causes the hardware to play a specific vibration effect.
     * Mirror of MDN GamepadHapticActuator.playEffect().
     */
    playEffect(
      type: 'dual-rumble' | 'trigger-rumble',
      params: {
        startDelay?: number;
        duration: number;
        weakMagnitude?: number;
        strongMagnitude?: number;
        leftTrigger?: number; // for trigger-rumble
        rightTrigger?: number; // for trigger-rumble
      }
    ): Promise<boolean>;
  }

  interface Gamepad {
    /** Array of all supported haptic actuators */
    readonly hapticActuators?: GamepadHapticActuator[]; // compatible with Chrome :contentReference[oaicite:10]{index=10}
    /** Shortcut to the first actuator */
    readonly vibrationActuator?: GamepadHapticActuator;
  }
}
