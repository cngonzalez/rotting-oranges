/*
* DEFAULTS / GLOBAL VARS 
*/
var grid = [[1,0,2],[2,0,0],[1,1,0]];
var ROWS = 3;
var COLS = 3;
var freshOranges;

/*
* LISTENERS
*/
document.addEventListener("DOMContentLoaded", function() {
  const go = document.getElementById("go");
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
      else if (e.target.parentNode && e.target.parentNode.classList[0] == "item") {
        setOrange(e.target.parentNode);
      }
  });

  document.getElementById("go").addEventListener("click", passTime);

});


/*
* DOM MANIPULATION METHODS
*/

//when input is received, change vars and rebuild DOM
const setGrid = function (e, spec) {
  if (spec == 0) {COLS = e.target.value}
  else if (spec == 1) {ROWS = e.target.value}
  rebuildGrid();
}


//it's expensive to access the DOM for every orange val when you need it,
//so build both in mem and in DOM
const rebuildGrid = function() {
  let DOMgrid = document.getElementById("grid");
  DOMgrid.innerHTML="";

  for (var i=0;i<ROWS;i++) {
    let row = [];
    let DOMrow = "<tr>";
    for (var j=0;j<COLS;j++) {
      row.push(0);
      DOMrow += `<td class='item' id='${i}-${j}'></td>`;
    }
    DOMrow += "</tr>";
    DOMgrid.innerHTML += DOMrow;
    grid.push(row);
  }
}

// when space is clicked, cycle through values and change DOM
const setOrange = function (orangeLoc) {
  orangeLoc.innerHTML = "";
  let coord = orangeLoc.id.split("-");
  let item = grid[coord[0]][coord[1]];
  let newVal;
  let newImg;
  //we could also edit toRot and freshOranges here,
  //but it becomes a little cluttered
  switch(item) {
    case 0:
      newVal = 1;
      newImg = "./fresh-orange.png";
      break;
    case 1:
      newVal = 2;
      newImg = "./rotten-orange.png";
      break;
    default:
      newVal = 0;
      break;
  }
  grid[coord[0]][coord[1]] = newVal;
  if (newImg) {
    orangeLoc.innerHTML = `<img src="${newImg}" />`
  }
}


/*
 * ORANGE ROTTING / TIME PASSING LOGIC
 */

//main function -- async to allow time for coherent DOM update
const passTime = async function() {
    freshOranges = 0;
    let timeElapsed = 0;
    document.getElementById("timePassed").innerHTML = `${timeElapsed}m`;
    let toRot = [];
    for (var i=0;i<ROWS;i++) {
        for (var j=0;j<COLS;j++) {
            if (grid[i][j] == 2) {
                toRot = toRot.concat(determineCoords(i, j));
            }
            else if (grid[i][j] == 1) {
                freshOranges++;
            }
        }
    }
    
    toRot = toRot.filter((coord) => grid[coord[0]][coord[1]] == 1);
    while (toRot.length) {
      timeElapsed++;
      document.getElementById("timePassed").innerHTML = `${timeElapsed}m`;
      toRot = await rotOranges(toRot)
    }
    
    if (freshOranges != 0) {
      let warning = ", but it is impossible for all these oranges to rot!"
      document.getElementById("timePassed").innerHTML += warning
    }
}


//each minute, rot oranges for that minute, and find adjacent nodes to rot next minute
const rotOranges = function(toRot) {
  let nextRot = [];
  toRot.forEach(function(coord) {
    if (grid[coord[0]][coord[1]] == 1) {
        freshOranges--;
        setOrange(document.getElementById(`${coord[0]}-${coord[1]}`));
        nextRot = nextRot.concat(determineCoords(coord[0], coord[1]));
    }
  });

  return new Promise(resolve => {
    setTimeout(() => {
      resolve(nextRot.filter((coord) => grid[coord[0]][coord[1]] == 1));
      }, 750)
  });
}


//helper function -- get adjacent nodes
const determineCoords = function(i, j) {
    let coords = [];
    if (i > 0) {coords.push([i-1, j])}
    if (i < ROWS - 1) {coords.push([i+1, j])}
    if (j > 0) {coords.push([i, j-1])}
    if (j < COLS - 1) {coords.push([i, j+1])}
    return coords;
}
