import SmashedGame from '../SmashedGame';
import { Player } from '../interfaces';

export function updatePadCurrKeyboard(player: Player, game: SmashedGame): void {
  if (player.keyboard) {
    const c = player.padCurr;
    const k = player.keyboard;

    c.up = k.up.isDown;
    c.down = k.down.isDown;
    c.left = k.left.isDown;
    c.right = k.right.isDown;

    c.A = k.A.isDown;
    c.B = k.B.isDown;
    c.X = k.X.isDown;
    c.Y = k.Y.isDown;

    c.L = k.L.isDown;
    c.R = k.R.isDown;

    c.start = k.start.isDown;
    c.select = k.select.isDown;
  }
}
