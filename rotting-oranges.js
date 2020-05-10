/*
* CLASS DECLARATION
*/

class Grid {

  constructor(rows, cols) {
    this.rows = rows;
    this.cols = cols;
    this.grid = [];
    this.htmlGrid = "";
    this.freshOranges = 0;
    this.rebuildGrid();
  }

  rebuildGrid() {
    for (let i=0;i<this.rows;i+=1) {
      let row = [];
      let DOMrow = "<tr>";
      for (let j=0;j<this.cols;j+=1) {
        row.push(0);
        DOMrow += `<td class='item' id='${i}-${j}'></td>`;
      }
      DOMrow += "</tr>";
      this.htmlGrid += DOMrow;
      this.grid.push(row);
    }
  }
  
  get(x, y) {
    return this.grid[x][y];
  }

  set(x,y,val) {
    if (this.grid[x][y] == 1 && val != 1) {
      this.freshOranges--;
    } else if (this.grid[x][y] != 1 && val == 1) {
      this.freshOranges++;
    }
    this.grid[x][y] = val;
  }

  defaultGrid() {
    this.grid = [[1,0,2],[2,0,0],[1,1,0]];
    this.freshOranges = 3;
  }

}

//global var
let grid;

/*
* LISTENERS
*/
document.addEventListener("DOMContentLoaded", function() {
  grid = new Grid(3, 3);
  grid.defaultGrid();
  
  document.getElementById("width").addEventListener(
    "change", (e) => setGrid(e, 0));
  document.getElementById("height").addEventListener(
    "change", (e) => setGrid(e, 1));

  document.addEventListener("click", function(e){
      //click <td> directly
      if(e.target && e.target.classList[0] == "item"){
        setOrange(e.target);
      }
      //click <img> in <td>, so go to parent
      else if (e.target.parentNode
      && e.target.parentNode.classList[0] == "item") {
        setOrange(e.target.parentNode);
      }
  });

  document.getElementById("go").addEventListener("click", passTime);
  document.getElementById("random").addEventListener("click", randomOranges);

});


/*
* DOM MANIPULATION METHODS
*/

function setGrid(e, spec) {
  if (spec == 0) {
    grid = new Grid(e.target.value, grid.cols);
  } else if (spec == 1) {
    grid = new Grid(grid.rows, e.target.value);
  }
  document.getElementById("grid").innerHTML = grid.htmlGrid;
}


function setOrange(orangeLoc) {
  let coord = orangeLoc.id.split("-");
  let newVal = grid.get(coord[0], coord[1]) + 1;
  let newImg = "";

  //roll over back to zero
  if (newVal > 2) {newVal = 0;}
  else if (newVal == 1) {newImg = "<img src='./fresh-orange.png'/>";}
  else if (newVal == 2) {newImg = "<img src='./rotten-orange.png'/>";}

  grid.set(coord[0], coord[1], newVal);
  orangeLoc.innerHTML = newImg;
}


/*
 * ORANGE ROTTING / TIME PASSING LOGIC
 */

//main function -- async to allow time for coherent DOM update
async function passTime() {
    let timeElapsed = 0;
    document.getElementById("timePassed").innerHTML = `${timeElapsed}m`;
    let toRot = [];

    for (i=0;i<grid.rows;i+=1) {
        for (j=0;j<grid.cols;j+=1) {
            if (grid.get(i, j) == 2) {
                toRot = toRot.concat(determineCoords(i, j));
            }
        }
    }

    toRot = toRot.filter((coord) => grid.get(coord[0], coord[1]) == 1);
    while (toRot.length) {
      timeElapsed++;
      document.getElementById("timePassed").innerHTML = `${timeElapsed}m`;
      toRot = await rotOranges(toRot);
    }

    if (grid.freshOranges != 0) {
      let warning = ", but it is impossible for all these oranges to rot!";
      document.getElementById("timePassed").innerHTML += warning;
    }
}


//each minute, rot oranges for that minute, and find adjacent nodes to rot next minute
function rotOranges(toRot) {
  let nextRot = [];
  toRot.forEach(function(coord) {
    if (grid.get(coord[0], coord[1]) == 1) {
        setOrange(document.getElementById(`${coord[0]}-${coord[1]}`));
        nextRot = nextRot.concat(determineCoords(coord[0], coord[1]));
    }
  });

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(nextRot.filter((coord) => grid.get(coord[0], coord[1]) == 1));
      }, 750)
  });
}

//helper function -- get adjacent nodes
function determineCoords(i, j) {
    let coords = [];
    if (i > 0) {coords.push([i-1, j]);}
    if (i < grid.rows - 1) {coords.push([i+1, j]);}
    if (j > 0) {coords.push([i, j-1]);}
    if (j < grid.cols - 1) {coords.push([i, j+1]);}
    return coords;
}


/*
 * EXTRA: MAKE FILLING THE BOXES EASIER FOR A USER
 */
function randomOranges() {
  //clear grid first
  grid = new Grid(grid.rows, grid.cols);
  htmlGrid = document.getElementById("grid");
  htmlGrid.innerHTML = grid.htmlGrid;

  let orangeAmt = Math.floor(.75 * (grid.rows * grid.cols));
  let i = 0;
  let coords = [[Math.floor(Math.random() * grid.rows),
              Math.floor(Math.random() * grid.cols)]]
  while (i < orangeAmt) {
    let coord = coords[0];
    let neighbors = determineCoords(coord[0], coord[1])
    coords.unshift(neighbors[Math.floor(Math.random() * neighbors.length)]);
    i++;
  }
  coords.forEach((coord) => 
    setOrange(document.getElementById(`${coord[0]}-${coord[1]}`))
  );
}

