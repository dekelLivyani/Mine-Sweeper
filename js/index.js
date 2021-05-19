'use strict'
const MINE = '💣';

var gBoard;

function init() {
    gBoard = buildBoard(6);
    console.log(gBoard);
    setMine(2);
    setMinesNegsCount(gBoard);
    renderBoard(gBoard);
}

function buildBoard(size) {
    var board = [];
    for (var i = 0; i < size; i++) {
        board.push([]);
        for (var j = 0; j < size; j++) {
            board[i][j] = createCell(i, j);
        }
    }
    return board;
}

function setMine(count) {
    for (var i = 0; i < count; i++) {
        var rndCoordI = getRandomInt(0, gBoard.length - 1)
        var rndCoordj = getRandomInt(0, gBoard[0].length - 1)
        gBoard[rndCoordI][rndCoordj].isMine = true;
    }
}

function createCell(i, j) {
    var cell = {
        minesAroundCount: 0,
        isShown: false,
        isMine: false,
        isMarked: false
    };
    return cell;
}

function setMinesNegsCount(mat) {
    for (var boardI = 0; boardI < mat.length; boardI++) {
        for (var boardJ = 0; boardJ < mat.length; boardJ++) {
            var negsCount = 0;
            for (var i = boardI - 1; i <= boardI + 1; i++) {
                if (i < 0 || i >= mat.length) continue;
                for (var j = boardJ - 1; j <= boardJ + 1; j++) {
                    if (i === boardI && j === boardJ) continue;
                    if (j < 0 || j >= mat[i].length) continue;
                    if (mat[i][j].isMine) negsCount++;
                }
            }
            if (!negsCount) negsCount = '';
            gBoard[boardI][boardJ].minesAroundCount = negsCount;
        }
    }
}

function cellClicked(elCell) {
    var coord = getCellCoord(elCell);
    var Cell = gBoard[coord.i][coord.j];
    if (Cell.isMine) {
        elCell.innerText = MINE;
    } else if (!Cell.minesAroundCount) {
        for (var i = coord.i - 1; i <= coord.i + 1; i++) {
            if (i < 0 || i >= gBoard.length) continue;
            for (var j = coord.j - 1; j <= coord.j + 1; j++) {
                if (i === coord.i && j === coord.j) continue;
                if (j < 0 || j >= gBoard[i].length) continue;
                if (!gBoard[i][j].isMine && !gBoard[i][j].isShown) {
                    gBoard[i][j].isShown = true;
                    elCell.innerText = gBoard[coord.i][coord.j].minesAroundCount;
                    var currCell = document.querySelector(`#cell-${i}-${j}`);
                    currCell.innerText = gBoard[i][j].minesAroundCount;
                    console.log(currCell);
                    currCell.classList.add('shown');
                }
            }
        }
        gBoard[coord.i][coord.j].isShown = true;
        elCell.classList.add('shown');
    } else elCell.innerText = gBoard[coord.i][coord.j].minesAroundCount;
    gBoard[coord.i][coord.j].isShown = true;
    elCell.classList.add('shown');
}

function getCellCoord(elCell) {
    var coord = {};
    var parts = elCell.id.split('-');
    coord.i = +parts[1]
    coord.j = +parts[2];
    return coord;
}