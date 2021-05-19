'use strict'

const MINE = '<img src="img/mine.png">';
const FLAG = '🚩';
const NORMAL_ICON = '😃';
const LOSE_ICON = '🤕';
const WIN_ICON = '😎';
const LIVE = '🖤';
const HINT = '💡 ';

var gBoard;
var gLives;
var gLevel;
var gGame;
var gTime;
var gScore;
var gHintsRemain;
var gNextTurnIsHint;
var gIntervalGameTime;

function init() {
    gHintsRemain = 3;
    gLives = 3;
    gTime = 0;
    gScore = 0;
    gBoard = buildBoard(getLevel().level);
    renderBoard(gBoard);
    upDateLives();
    upDateHints();
    renderGame()
    var elSmiley = document.querySelector('.restart span');
    elSmiley.innerText = NORMAL_ICON;

}

function renderGame(level, mine) {
    gLevel = {
        level,
        mine
    };
    gGame = {
        isOn: true,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0
    }
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

function renderBoard() {
    var strHTML = '<table border="5"> <tbody>';
    for (var i = 0; i < gBoard.length; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < gBoard[0].length; j++) {
            // var cell = mat[i][j]
            var cellItem = (gBoard[i][j].isShown) ? gBoard[i][j].minesAroundCount : '';
            var id = `cell-${i}-${j}`;
            strHTML += `<td class="cell" id="${id}" oncontextmenu="rightClick(this,${i},${j})"  onClick="cellClicked(this)"> ${cellItem} </td>`
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>';
    var elContainer = document.querySelector('.table-game');
    elContainer.innerHTML = strHTML;
}

function renderCell(i, j, value) {
    var elCell = getCellFromCoord({ i, j });
    elCell.innerHTML = value;
}

function setMine(count, clickCoord) {
    for (var i = 0; i < count; i++) {
        var rndCoordI = getRandomInt(0, gBoard.length - 1)
        var rndCoordj = getRandomInt(0, gBoard[0].length - 1)
        if (clickCoord.i === rndCoordI && clickCoord.j === rndCoordj ||
            gBoard[rndCoordI][rndCoordj].isMine === true) i--;
        else gBoard[rndCoordI][rndCoordj].isMine = true;
    }
}

function createCell() {
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

function getLevel() {
    var res = {};
    var elLevels = document.querySelectorAll('.choice');
    for (var i = 0; i < elLevels.length; i++) {
        var currLevel = elLevels[i]
        if (currLevel.checked) {
            res.level = currLevel.value;
            if (currLevel.value === '4') res.mine = 2;
            if (currLevel.value === '8') res.mine = 12;
            if (currLevel.value === '12') res.mine = 30;
        }
    }
    return res;
}

function cellClicked(elCell) {
    var coord = getCoordFromCell(elCell);
    if (checkFisrtClick()) {
        gIntervalGameTime = setInterval(stopwatch, 1000);
        var res = getLevel();
        renderGame(res.level, res.mine);
        setMine(parseInt(gLevel.mine), coord);
        setMinesNegsCount(gBoard);
    }
    if (gNextTurnIsHint) {
        playHint(coord);
        gNextTurnIsHint = false;
        return;
    }

    if (!gGame.isOn) return;
    var cell = gBoard[coord.i][coord.j];
    if (cell.isShown) return;
    if (cell.isMine) {
        elCell.classList.add('bomb');
        elCell.classList.remove('shown');
        elCell.innerHTML = MINE;
        gLives--;
        upDateLives();
        if (gLives === 0) {
            gameOver();
            return;
        }
        return;
    } else if (!cell.minesAroundCount) {
        for (var i = coord.i - 1; i <= coord.i + 1; i++) {
            if (i < 0 || i >= gBoard.length) continue;
            for (var j = coord.j - 1; j <= coord.j + 1; j++) {
                if (i === coord.i && j === coord.j) continue;
                if (j < 0 || j >= gBoard[i].length) continue;

                if (!gBoard[i][j].isMine && !gBoard[i][j].isShown) {
                    gBoard[i][j].isShown = true;
                    gGame.shownCount++;
                    gScore++;
                    elCell.innerText = cell.minesAroundCount;
                    var currCell = getCellFromCoord({ i, j });
                    currCell.innerText = gBoard[i][j].minesAroundCount;
                    currCell.classList.add('shown');
                }
            }
        }
        elCell.classList.add('shown');
    } else elCell.innerText = cell.minesAroundCount;
    cell.isShown = true;
    gGame.shownCount++;
    gScore++;
    elCell.classList.add('shown');

    printScore();
    if (isVictory()) gameOver();
}

function rightClick(elCell, i, j) {
    if (gBoard[i][j].isShown && !(elCell.innerText === FLAG)) return;
    if (elCell.innerText === FLAG) {
        elCell.innerText = '';
        gBoard[i][j].isMarked = false;
        gGame.markedCount--;
        renderCell(i, j, '');
    } else {
        elCell.innerText = FLAG;
        gBoard[i][j].isMarked = true;
        gGame.markedCount++;
    }
    window.oncontextmenu = function(e) {
        e.preventDefault()
    }
}

function getCoordFromCell(elCell) {
    var coord = {};
    var parts = elCell.id.split('-');
    coord.i = +parts[1]
    coord.j = +parts[2];
    return coord;
}

function getCellFromCoord(coord) {
    return document.querySelector(`#cell-${coord.i}-${coord.j}`);
}

function checkFisrtClick() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            if (gBoard[i][j].isShown) return false;
        }
    }
    return true;
}

function cleanBoard() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            gBoard[i][j].isShown = false;
            gBoard[i][j].isMine = false;
            gBoard[i][j].isMarked = false;
            gBoard[i][j].minesAroundCount = 0;
        }
    }
}

function upDateLives() {
    var elSpanLives = document.querySelector('.lives span');
    var lives = LIVE.repeat(gLives);
    elSpanLives.innerText = lives;
}

function upDateHints() {
    var elHint = document.querySelector('.hints');
    elHint.innerHTML = '';
    var strHtml = '';
    for (var i = 0; i < gHintsRemain; i++) {
        strHtml += `<span onClick="hintClick()">${HINT}</span>`;
        elHint.innerHTML += strHtml;
        strHtml = '';
    }
}

function hintClick() {
    if (checkFisrtClick()) return;
    gHintsRemain--;
    upDateHints();
    gNextTurnIsHint = true;
}

function playHint(coord) {
    console.log(gBoard);
    for (var i = coord.i - 1; i <= coord.i + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = coord.j - 1; j <= coord.j + 1; j++) {
            if (j < 0 || j >= gBoard[i].length) continue;
            var elCell = getCellFromCoord({ i, j });
            if (gBoard[i][j].isMine) {
                elCell.innerHTML = MINE;
            } else {
                elCell.innerHTML = gBoard[i][j].minesAroundCount;
            }
            if (!gBoard[i][j].isShown) {
                elCell.classList.add('hint-cell');
                gBoard[i][j].isShown = true;
                renderCell(i, j, elCell.innerHTML);
            }
        }
    }
    setTimeout(function() {
        for (var i = coord.i - 1; i <= coord.i + 1; i++) {
            if (i < 0 || i >= gBoard.length) continue;
            for (var j = coord.j - 1; j <= coord.j + 1; j++) {
                if (j < 0 || j >= gBoard[i].length) continue;
                var elCell = getCellFromCoord({ i, j });
                elCell.classList.remove('hint-cell');
                if (!elCell.classList.contains('shown')) {
                    gBoard[i][j].isShown = false;
                    renderCell(i, j, '');
                }
            }
        }
    }, 1000 * 2);
}

function printScore() {
    gScore = +gScore;
    var elScore = document.querySelector('.score span');
    gScore += '';
    elScore.innerText = gScore.padStart(2, '0');
}

function stopwatch() {
    gTime = +gTime;
    gTime++;
    var elTime = document.querySelector('.time span');
    gTime += '';
    elTime.innerText = gTime.padStart(2, '0');
}

function setAllMineShown() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            if (gBoard[i][j].isMine) {
                var elCell = getCellFromCoord({ i, j });
                elCell.classList.add('bomb');

                elCell.innerHTML = MINE;
            }
        }
    }
}

function restart() {
    cleanBoard();
    var elTime = document.querySelector('.time span');
    elTime.innerText = '00';
    clearInterval(gIntervalGameTime);
    init();
    printScore();
    gGame.shownCount = 0;
    gGame.markedCount = 0;
    gGame.secsPassed = 0;
}

function gameOver() {
    gGame.isOn = false;
    var elSmiley = document.querySelector('.restart span');
    if (!gLives) {
        elSmiley.innerText = LOSE_ICON;
        setAllMineShown();
    } else elSmiley.innerText = WIN_ICON
    clearInterval(gIntervalGameTime);

}

function isVictory() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            if (!gBoard[i][j].isMine && !gBoard[i][j].isShown) return false;
        }
    }
    return true;
}