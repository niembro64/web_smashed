import Game from '../Game';
import { Player } from '../interfaces';

export function updatePadCurrKeyboard(player: Player, game: Game): void {
  if (player.keyboard) {
    // player.padCurr.up = player.keyboard.up

    let c = player.padCurr;
    let k = player.keyboard;

    // set all to isDown

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

    // set all to !isUp

    // c.up = !k.up.isUp;
    // c.down = !k.down.isUp;
    // c.left = !k.left.isUp;
    // c.right = !k.right.isUp;

    // c.A = !k.A.isUp;
    // c.B = !k.B.isUp;
    // c.X = !k.X.isUp;
    // c.Y = !k.Y.isUp;

    // c.L = !k.L.isUp;
    // c.R = !k.R.isUp;

    // c.start = !k.start.isUp;
    // c.select = !k.select.isUp;
  }
}
