import { ask } from "./utils";

export const emptySpace = "-";
export const filledSpace = "█";

export const shapes = [
  [
    [filledSpace, filledSpace],
    [filledSpace, filledSpace],
  ],
  [[filledSpace, filledSpace, filledSpace, filledSpace]],
  [[filledSpace], [filledSpace, filledSpace, filledSpace]],
  [
    [filledSpace, filledSpace],
    [emptySpace, filledSpace, filledSpace],
  ],
  [[filledSpace], [filledSpace, filledSpace], [filledSpace]],
] as const;

type Shape = typeof shapes[number];
type RawBoard = string[][];

const mergeRawBoard = (board: RawBoard, obj: GravityObject) => {
  const merged = [...board.map((line) => [...line])];

  for (let i = 0; i < obj.shape.length; i++) {
    for (let j = 0; j < obj.shape[i].length; j++) {
      const value = obj.shape[i][j];

      if (value === filledSpace) {
        merged[obj.y + i][obj.x + j] = filledSpace;
      }
    }
  }

  return merged;
};

class GravityObject {
  static intersectsWithBoardAt(
    board: RawBoard,
    shape: Shape,
    x: number,
    y: number
  ) {
    if (shape.length + y > board.length) {
      console.log("bottom");
      return true;
    }

    for (let y2 = 0; y2 < shape.length; y2++) {
      for (let x2 = 0; x2 < shape[y2].length; x2++) {
        const element = shape[y2][x2];

        if (element === filledSpace && board[y2 + y][x2 + x] === filledSpace) {
          console.log(y2, x2, x, y);
          console.log(board[y2 + y]);
          return true;
        }
      }
    }

    return false;
  }

  x = 0;
  y = 0;
  constructor(public shape: Shape) {}

  intersectsBoard(board: RawBoard) {
    return GravityObject.intersectsWithBoardAt(
      board,
      this.shape,
      this.x,
      this.y
    );
  }

  intersectsBoardIfMovedBy(board: RawBoard, x: number, y: number) {
    return GravityObject.intersectsWithBoardAt(
      board,
      this.shape,
      this.x + x,
      this.y + y
    );
  }

  moveBy(x: number, y: number) {
    this.x += x;
    this.y += y;
  }

  isXBoundedByBoard(rawBoard: RawBoard, x: number) {
    const newX = this.x + x;
    return newX < 0 || newX > rawBoard[0].length;
  }

  isYBoundedByBoard(rawBoard: RawBoard, y: number) {
    return this.y + y > rawBoard.length;
  }
}

export class Board {
  board: RawBoard = [];
  object: GravityObject = this.randomShape();

  constructor(public width: number, public height: number) {
    this.board = Array(height)
      .fill(null)
      .map(() => [...emptySpace.repeat(width)]);
  }

  render() {
    for (const line of mergeRawBoard(this.board, this.object)) {
      console.log(line.join(""));
    }
  }

  randomShape() {
    const i = Math.floor(Math.random() * shapes.length);

    return new GravityObject(shapes[i]);
  }

  moveShapeBy(x: number, y: number) {
    if (this.object.intersectsBoardIfMovedBy(this.board, x, y)) {
      this.board = mergeRawBoard(this.board, this.object);
      this.object = this.randomShape();
    } else {
      this.object.moveBy(x, y);
    }
  }

  doNothing() {
    this.moveShapeBy(0, 1);
  }

  moveShapesLeft() {
    this.moveShapeBy(-1, 1);
  }

  moveShapesRight() {
    this.moveShapeBy(1, 1);
  }

  rotateLeft() {}

  rotateRight() {}

  async command(command: string) {
    switch (command) {
      case "l":
        return this.moveShapesLeft();
      case "r":
        return this.moveShapesRight();
      case "cw":
        return this.rotateRight();
      case "ccw":
        return this.rotateLeft();

      case "":
        return this.doNothing();

      default:
        console.error("Sorry I didn't understand that");
        return this.doNothing();
    }
  }

  async run() {
    while (true) {
      this.render();
      const command = await ask("");

      await this.command(command);
    }
  }
}
