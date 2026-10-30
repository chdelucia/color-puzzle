import { Component, ChangeDetectionStrategy, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Legend {
  mainColor: number[];
  secondColor: number[];
  resultColor: number[];
}

export interface SelectedColors {
  color: number[];
  position: number;
}

// CONFIG COLORS HERE. You can edit those colors from 130 to 255
const red = [255, 0, 0];
const green = [0, 255, 0];
const blue = [0, 0, 255];

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {

  // DOM elements
  readonly title = 'Game Of Colors';

  // State managed via Signals
  readonly domMatrix = signal<Array<number[]>>([]);
  readonly legend = signal<Legend[]>([]);
  readonly moves = signal<number>(0);
  readonly extraTableBoard = signal<boolean>(false);

  // user selected colors
  readonly firstItemClicked = signal<SelectedColors | undefined>(undefined);
  readonly secondItemClicked = signal<SelectedColors | undefined>(undefined);

  // Computed / Configuration properties
  private matrixSize = signal<number>(9);
  private maxOfType = computed(() => this.matrixSize() / this.colors().length);

  // base colors
  private colors = signal<Array<number[]>>([red, green, blue]);

  // depend on rgb will calculate the final color
  private finalColor = computed(() => {
    const cols = this.colors();
    if (cols.length < 3) return [0, 0, 0];
    return cols[0].map((item, index) => item + cols[1][index] + cols[2][index]);
  });

  // Backward compatibility getter/setter for typo `firtItemClicked` if accessed externally
  get firtItemClicked(): SelectedColors | undefined {
    return this.firstItemClicked();
  }
  set firtItemClicked(val: SelectedColors | undefined) {
    this.firstItemClicked.set(val);
  }

  ngOnInit() {
    this.createLegend();
    this.createMatrix();
  }

  /**
   * Handler click event
   * @param position index of matrix
   */
  onClick(position: number): void {
    const currentMatrix = this.domMatrix();
    const finalCol = this.finalColor();

    // disable click when the color is the final Color
    if (currentMatrix[position]?.join() !== finalCol.join()) {
      this.saveColorClicked(position);

      // verifies if user has clicked 2 colors
      const first = this.firstItemClicked();
      const second = this.secondItemClicked();

      if (first && second) {
        const newColor = this.sumSelectedColors(first, second);
        const isValid = this.isValid(newColor);

        if (isValid) {
          this.updateColors(first.position, second.position, newColor);
        }
        this.deselectBoxes();
      }
    }
  }

  /** 
   * Restart the Game
   */
  restartGame(): void {
    this.domMatrix.set([]);
    this.resetMovesCounter();
    this.deselectBoxes();
    this.createMatrix();
  }

  /**
   * Set the game Level
   * @param value level factor ("1", "2", "4")
   */
  setLevel(value: string): void {
    const factor = parseInt(value, 10);
    const size = 9 * factor;
    this.matrixSize.set(size);
    this.extraTableBoard.set(value !== '1');
    this.restartGame();
  }

  /** 
   * Creates random tableBoard Array<number[]>
   * Each color is an Array<number> [255,0,0]
  */
  private createMatrix(): void {
    const size = this.matrixSize();
    const max = this.maxOfType();
    const tempColors = [red, green, blue];
    const counterColors: number[] = [];
    const newMatrix: Array<number[]> = [];

    for (let i = 0; i < size; i++) {
      // choose a random color from the color list
      const randomNumber = Math.floor(Math.random() * tempColors.length);
      const color = tempColors[randomNumber];

      // add color to the game
      newMatrix.push(color);

      // count which color has been added
      counterColors[randomNumber] = (counterColors[randomNumber] || 0) + 1;

      // Remove the color from the random array when reaching its max.
      if (counterColors[randomNumber] === max) {
        tempColors.splice(randomNumber, 1);
        counterColors.splice(randomNumber, 1);
      }
    }

    this.domMatrix.set(newMatrix);
  }

  /** 
   * Creates the Legend
  */
  private createLegend(): void {
    const legendList: Legend[] = [];
    const baseColors = [red, green, blue];

    // creates legend for the sum of primary colors
    const possibleColors: Array<number[]> = [];
    for (let i = 0; i < baseColors.length; i++) {
      for (let j = i + 1; j < baseColors.length; j++) {
        const newColor = baseColors[i].map((num, index) => num + baseColors[j][index]);
        legendList.push({
          mainColor: baseColors[i],
          secondColor: baseColors[j],
          resultColor: newColor
        });
        possibleColors.push(newColor);
      }
    }

    // Creates legend for the sum of secondary colors
    for (let i = 0; i < baseColors.length; i++) {
      for (let j = 0; j < possibleColors.length; j++) {
        const newColor = baseColors[i].map((value, index) => value + possibleColors[j][index]);
        if (this.isValid(newColor)) {
          legendList.push({
            mainColor: baseColors[i],
            secondColor: possibleColors[j],
            resultColor: newColor,
          });
        }
      }
    }

    this.colors.set(baseColors.concat(possibleColors));
    this.legend.set(legendList);
  }

  /** 
   * Deselect Boxes
  */
  private deselectBoxes(): void {
    this.firstItemClicked.set(undefined);
    this.secondItemClicked.set(undefined);
  }

  /**
   * Check if the sum of both colors is correct
   * @param newColor 
   */
  private isValid(newColor: number[]): boolean {
    return !newColor.some(num => num > 255);
  }

  /** 
   * Restart the moves Counter
   */
  private resetMovesCounter(): void {
    this.moves.set(0);
  }

  /**
   * Save color clicked on a temp variable
   * @param position
   */
  private saveColorClicked(position: number): void {
    const currentMatrix = this.domMatrix();
    const first = this.firstItemClicked();

    if (!first) {
      // add the first color clicked
      this.firstItemClicked.set({
        color: currentMatrix[position],
        position: position,
      });
      this.moves.update(m => m + 1);
    } else {
      // If the first and second color are the same, deselect and do not count a move
      if (first.color.join() === currentMatrix[position].join()) {
        this.deselectBoxes();
      } else {
        // add the second color clicked
        this.secondItemClicked.set({
          color: currentMatrix[position],
          position: position,
        });
        this.moves.update(m => m + 1);
      }
    }
  }

  /** 
   * Sums both colors selected by user
   */
  private sumSelectedColors(first: SelectedColors, second: SelectedColors): Array<number> {
    return first.color.map((num, index) => num + second.color[index]);
  }

  /**
   * Update the matrix of colors
   */
  private updateColors(pos1: number, pos2: number, newColor: number[]): void {
    this.domMatrix.update(matrix => {
      const updated = [...matrix];
      updated[pos1] = newColor;
      updated[pos2] = newColor;
      return updated;
    });
  }
}
