class SudokuGridGenerator {
  constructor() {
    this.grid = [];
  }

  static main() {
    let trials = 0;
    while (true) {
      const sudoku = new SudokuGridGenerator();
      trials++;
      const grid = sudoku.generateGrid();
      if (SudokuGridGenerator.isPerfect(grid)) {
        SudokuGridGenerator.puzzles = SudokuGridGenerator.printGrid(grid);
        console.log(SudokuGridGenerator.puzzles);
        break; // Exit the loop after finding a perfect grid
      }
    }
  }

  generateGrid() {
    const arr = Array.from({ length: 9 }, (_, i) => i + 1);
    this.grid = new Array(81);
    for (let i = 0; i < 81; i++) {
      if (i % 9 === 0) {
        arr.sort(() => Math.random() - 0.5);
      }
      const perBox =
        Math.floor((i / 3) % 3) * 9 +
        Math.floor((i % 27) / 9) * 3 +
        Math.floor(i / 27) * 27 +
        (i % 3);
      this.grid[perBox] = arr[i % 9];
    }
    const sorted = new Array(81).fill(false);
    for (let i = 0; i < 9; i++) {
      let backtrack = false;
      for (let a = 0; a < 2; a++) {
        const registered = new Array(10).fill(false);
        const rowOrigin = i * 9;
        const colOrigin = i;
        ROW_COL: for (let j = 0; j < 9; j++) {
          const step = a % 2 === 0 ? rowOrigin + j : colOrigin + j * 9;
          const num = this.grid[step];
          if (!registered[num]) {
            registered[num] = true;
          } else {
            for (let y = j; y >= 0; y--) {
              const scan = a % 2 === 0 ? i * 9 + y : i + 9 * y;
              if (this.grid[scan] === num) {
                for (let z = a % 2 === 0 ? ((i % 3) + 1) * 3 : 0; z < 9; z++) {
                  if (a % 2 === 1 && z % 3 <= i % 3) {
                    continue;
                  }
                  const boxOrigin =
                    Math.floor((scan % 9) / 3) * 3 + Math.floor(scan / 27) * 27;
                  const boxStep = boxOrigin + Math.floor(z / 3) * 9 + (z % 3);
                  const boxNum = this.grid[boxStep];
                  if (
                    (!sorted[scan] &&
                      !sorted[boxStep] &&
                      !registered[boxNum]) ||
                    (sorted[scan] &&
                      !registered[boxNum] &&
                      (a % 2 === 0
                        ? boxStep % 9 === scan % 9
                        : Math.floor(boxStep / 9) === Math.floor(scan / 9)))
                  ) {
                    this.grid[scan] = boxNum;
                    this.grid[boxStep] = num;
                    registered[boxNum] = true;
                    continue ROW_COL;
                  } else if (z === 8) {
                    let searchingNo = num;
                    const blindSwapIndex = new Array(81).fill(false);
                    for (let q = 0; q < 18; q++) {
                      SWAP: for (let b = 0; b <= j; b++) {
                        const pacing =
                          a % 2 === 0 ? rowOrigin + b : colOrigin + b * 9;
                        if (this.grid[pacing] === searchingNo) {
                          let adjacentCell = -1;
                          let adjacentNo = -1;
                          const decrement = a % 2 === 0 ? 9 : 1;
                          for (let c = 1; c < 3 - (i % 3); c++) {
                            adjacentCell =
                              pacing + (a % 2 === 0 ? (c + 1) * 9 : c + 1);
                            if (
                              (a % 2 === 0 && adjacentCell >= 81) ||
                              (a % 2 === 1 && adjacentCell % 9 === 0)
                            ) {
                              adjacentCell -= decrement;
                            } else {
                              adjacentNo = this.grid[adjacentCell];
                              if (
                                i % 3 !== 0 ||
                                c !== 1 ||
                                blindSwapIndex[adjacentCell] ||
                                registered[adjacentNo]
                              ) {
                                adjacentCell -= decrement;
                              }
                            }
                            adjacentNo = this.grid[adjacentCell];
                            if (!blindSwapIndex[adjacentCell]) {
                              blindSwapIndex[adjacentCell] = true;
                              this.grid[pacing] = adjacentNo;
                              this.grid[adjacentCell] = searchingNo;
                              searchingNo = adjacentNo;
                              if (!registered[adjacentNo]) {
                                registered[adjacentNo] = true;
                                continue ROW_COL;
                              }
                              break SWAP;
                            }
                          }
                        }
                      }
                    }
                    backtrack = true;
                    break ROW_COL;
                  }
                }
              }
            }
          }
        }
        if (a % 2 === 0) {
          for (let j = 0; j < 9; j++) {
            sorted[i * 9 + j] = true;
          }
        } else if (!backtrack) {
          for (let j = 0; j < 9; j++) {
            sorted[i + j * 9] = true;
          }
        } else {
          backtrack = false;
          for (let j = 0; j < 9; j++) {
            sorted[i * 9 + j] = false;
          }
          for (let j = 0; j < 9; j++) {
            sorted[(i - 1) * 9 + j] = false;
          }
          for (let j = 0; j < 9; j++) {
            sorted[i - 1 + j * 9] = false;
          }
          i -= 2;
        }
      }
    }
    if (!SudokuGridGenerator.isPerfect(this.grid)) {
      throw new Error("ERROR: Imperfect grid generated.");
    }
    return this.grid;
  }

  static printGrid(grid) {
    if (grid.length !== 81) {
      throw new Error("The grid must be a single-dimension grid of length 81");
    }
    let Gstring = "";
    for (let i = 0; i < 81; i++) {
      // console.log(`[${grid[i]}] ${i % 9 === 8 ? "\n" : ""}`);
      Gstring += grid[i];
    }
    return Gstring;
  }

  static isPerfect(grid) {
    if (grid.length !== 81) {
      throw new Error("The grid must be a single-dimension grid of length 81");
    }
    for (let i = 0; i < 9; i++) {
      const registered = new Array(10).fill(false);
      registered[0] = true;
      const boxOrigin = ((i * 3) % 9) + Math.floor((i * 3) / 9) * 27;
      for (let j = 0; j < 9; j++) {
        const boxStep = boxOrigin + Math.floor(j / 3) * 9 + (j % 3);
        const boxNum = grid[boxStep];
        registered[boxNum] = true;
      }
      for (const b of registered) {
        if (!b) {
          return false;
        }
      }
    }
    for (let i = 0; i < 9; i++) {
      const registered = new Array(10).fill(false);
      registered[0] = true;
      const rowOrigin = i * 9;
      for (let j = 0; j < 9; j++) {
        const rowStep = rowOrigin + j;
        const rowNum = grid[rowStep];
        registered[rowNum] = true;
      }
      for (const b of registered) {
        if (!b) {
          return false;
        }
      }
    }
    for (let i = 0; i < 9; i++) {
      const registered = new Array(10).fill(false);
      registered[0] = true;
      const colOrigin = i;
      for (let j = 0; j < 9; j++) {
        const colStep = colOrigin + j * 9;
        const colNum = grid[colStep];
        registered[colNum] = true;
      }
      for (const b of registered) {
        if (!b) {
          return false;
        }
      }
    }
    return true;
  }
}

var solvestatus = "submitable";
SudokuGridGenerator.main();
var solution = SudokuGridGenerator.puzzles;
var puzzle = puzzlify(solution);
console.log(puzzle);
var currentSelected = "";

function puzzlify(solution) {
  let puzzle = solution.split("");

  function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }
  let count = 0;
  for (let i = 0; i < 81; i++) {
    if (getRandomInt(10) <= 1) {
      puzzle[i] = ".";
      count++;
    }
  }
  console.log(count);
  puzzle = puzzle.join("");

  return puzzle;
}

function setup() {
  generate();
  setListeners();
}
function setListeners() {
  var selcells = document.querySelectorAll(".sell");
  for (var i = 0; i < selcells.length; i++) {
    selcells[i].addEventListener("click", function () {
      currentSelected = this.textContent;
      console.log(currentSelected);
    });
  }
  console.log("sells done");

  var cells = document.querySelectorAll(".cell");
  for (var i = 0; i < cells.length; i++) {
    cells[i].addEventListener("click", function () {
      console.log("this works!!!!");
      console.log(this.className);
      if (this.className.indexOf("iniFilled") == -1) {
        this.innerHTML = currentSelected;
      }
    });
  }
  console.log("cells done");
}

function generate() {
  const cells = document.querySelectorAll(".cell");
  for (let i = 0; i < 81; i++) {
    if (puzzle.charAt(i) == ".") {
      num = "";
    } else {
      num = puzzle.charAt(i);
      cells[i].className += " iniFilled";
    }

    cells[i].textContent = num;
  }
  console.log("generated");
}
function erase() {
  currentSelected = null;
}

function solve() {
  try {
    var temp = document.querySelector(".submitable");
    temp.className = "notsubmitable";
    solvestatus = "notsubmitable";
  } catch (e) {
  } finally {
    const cells = document.querySelectorAll(".cell");
    for (let i = 0; i < 81; i++) {
      num = solution.charAt(i);
      cells[i].textContent = num;
    }
    console.log("solved");
  }
}

function check() {
  if (solvestatus == "submitable") {
    const cells = document.querySelectorAll(".cell");
    var ans = "";
    for (let i = 0; i < 81; i++) {
      ans += cells[i].textContent;
    }
    if (ans == solution) {
      alert("Solution is valid");
    } else {
      alert("Solution is invalid");
    }
  } else {
    alert("Could not submit\nStart a new game");
  }
}
function reload() {
  window.location.reload();
}

window.onload = setup;
