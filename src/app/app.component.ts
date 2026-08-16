import { Component, OnInit } from '@angular/core';

export interface Legend {
  mainColor: number[],
  secondColor: number[],
  resultColor: number[]
}

export interface SelectedColors {
  color: number[],
  position: number,
}

// CONFIG COLORS HERE. You can edit those colors from 130 to 255
const red = [255, 0, 0];
const green = [0, 255, 0];
const blue = [0, 0, 255];

import { ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  changeDetection: ChangeDetectionStrategy.Default,
  standalone: false
})
export class AppComponent implements OnInit {

  // DOM elements
  title = 'Game Of Colors';
  domMatrix: Array<number[]> = [];
  legend: Legend[] = [];
  moves: number = 0;
  extraTableBoard: boolean = false;

  // user selected colors
  firtItemClicked: SelectedColors;
  secondItemClicked: SelectedColors;



  // depend on rgb will calculate the final color
  private finalColor: number[];

  // add the colors to an array
  private colors: Array<number[]> = [red, green, blue];

  // Table board config
  private matrixSize: number = 9;
  private maxOftype: number = this.matrixSize / this.colors.length;


  ngOnInit() {
    this.setFinalColor();
    this.createMatrix();
    this.createLegend();
  }

  /**
   * Handler click event
   * @param position index of matrix
   */
  onClick(position): void {
    // disable click when the color is the final Color
    if (this.domMatrix[position].join() !== this.finalColor.join()) {
      this.saveColorClicked(position);

      // verifies if user has clicked 2 colors
      if (this.firtItemClicked && this.secondItemClicked) {
        const newColor = this.sumSelectedColors();
        const isValid = this.isValid(newColor);

        if (isValid) { this.updateColors(newColor); }
        this.deselectBoxes();
      } else {
        // wait for the second color
        return
      }
    }
  }

  /** 
   * Restart the Games
   */
  restartGame(): void {
    this.domMatrix = [];
    this.resetMovesCounter();
    this.deselectBoxes();
    this.createMatrix();
  }

  /**
   * Set the game Level
   * @param {String} value 
   */
  setLevel(value: string): void {
    this.matrixSize = 9 * parseInt(value);
    this.maxOftype = this.matrixSize / 3;
    this.restartGame();
    this.extraTableBoard = value !== "1" ? true : false;
  }

  /** 
   * Creates random tableBoard Array<number[]>
   * Each color is an Array<number> [255,0,0]
  */
  private createMatrix(): void {
    const tempColors = [red, green, blue];
    const counterColors = [];

    for (let i = 0; i < this.matrixSize; i++) {
      //choose a random color from the color list
      const randomNumber = Math.floor(Math.random() * tempColors.length);
      const color = tempColors[randomNumber];

      //add color to the game
      this.domMatrix.push(color);

      // count which color has being added to the game
      if (counterColors[randomNumber]) {
        counterColors[randomNumber] += 1;
      } else {
        counterColors[randomNumber] = 1;
      }

      // Remove the color from the random array when reach its max.
      if (counterColors[randomNumber] === this.maxOftype) {
        tempColors.splice(randomNumber, 1);
        counterColors.splice(randomNumber, 1);
      }
    }
  }

  /** 
   * Creates the Legend
  */
  private createLegend(): void {

    // creates legend for the sum of primary colors
    const posibleColors = [];
    for (let i = 0; i < this.colors.length; i++) {
      for (let j = i + 1; j < this.colors.length; j++) {
        const newColor = this.colors[i].map((num, index) => num + this.colors[j][index]);
        this.legend.push({
          mainColor: this.colors[i],
          secondColor: this.colors[j],
          resultColor: newColor
        });
        posibleColors.push(newColor);
      }
    }
    // Creates legend for the sum of secondary colors
    for (let i = 0; i < this.colors.length; i++) {
      let newColor
      for (let j = 0; j < posibleColors.length; j++) {
        let isPosible = 0;
        newColor = this.colors[i].map((value, index) => {
          return value + posibleColors[j][index];
        })

        let isValid = this.isValid(newColor);
        if (isValid) {
          this.legend.push({
            mainColor: this.colors[i],
            secondColor: posibleColors[j],
            resultColor: newColor,
          });
        }
      }
    }

    this.colors = this.colors.concat(posibleColors);
  }

  /** 
   * Deselect Boxes
  */
  private deselectBoxes(): void {
    this.firtItemClicked = undefined;
    this.secondItemClicked = undefined;
  }

  /**
   * Check is the sum of both color is correct
   * @param newColor 
   */
  private isValid(newColor): boolean {
    let isValid = true;
    newColor.some(num => {
      if (num > 255) isValid = false
    });
    return isValid;
  }

  /** 
   * Restart the moves Counter
   */
  private resetMovesCounter(): void {
    this.moves = 0;
  }

  /**
   * Save color clicked on a temp variable
   * @param {number} position 
   */
  private saveColorClicked(position): void {
    if (!this.firtItemClicked) {
      // add the first color clicked
      this.firtItemClicked = {
        color: this.domMatrix[position],
        position: position,
      };
      this.moves++;
    } else { // if user has already select the first color join here
      // If the first and second color are the same Deselect the color and dont not count a move
      if (this.firtItemClicked.color.join() === this.domMatrix[position].join()) {
        this.deselectBoxes();
      } else {
        // add the second color clicked
        this.secondItemClicked = {
          color: this.domMatrix[position],
          position: position,
        };
        this.moves++;
      }
    }
  }

  /** 
   * Set final Color with red green and blue tones
  */
  private setFinalColor(): void {
    this.finalColor = this.colors[0].map((item, index) => {
      return item + this.colors[1][index] + this.colors[2][index];
    })
  }

  /** 
   * Sums both colors selected by user
   */
  private sumSelectedColors(): Array<number> {
    return this.firtItemClicked.color.map((num, index) => {
      return num + this.secondItemClicked.color[index];
    });
  }

  /**
   * Update the matrix of colors
   * @param {Array<number>} newColor ie: [0,255,0]
   */
  private updateColors(newColor): void {
    this.domMatrix[this.firtItemClicked.position] = this.domMatrix[this.secondItemClicked.position] = newColor;
  }
}
