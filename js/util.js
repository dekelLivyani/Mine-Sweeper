'use strict'

function renderBoard(mat) {
    var strHTML = '<table border="5"> <tbody>';
    for (var i = 0; i < mat.length; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < mat[0].length; j++) {
            // var cell = mat[i][j]
            var cellItem = (mat[i][j].isShown) ? mat[i][j].minesAroundCount : '';
            var classes = 'cell';
            var id = `cell-${i}-${j}`;
            strHTML += `<td class="${classes}" id="${id}" onClick="cellClicked(this)"> ${cellItem} </td>`
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>';
    var elContainer = document.querySelector('.table-game');
    elContainer.innerHTML = strHTML;
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}