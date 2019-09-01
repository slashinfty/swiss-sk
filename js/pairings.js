//global var & classes
class Match {
  constructor(matchID, pOneID, pTwoID, pOneName, pTwoName) {
    this.matchNumber = matchID;
    this.playerOne = pOneID;
    this.playerTwo = pTwoID;
    this.active = true;
    this.playerOneWins = 0;
    this.playerTwoWins = 0;
    this.draws = 0;
    this.playerOneName = pOneName; //placeholder
    this.playerTwoName = pTwoName; //placeholder
    this.result = false; //placeholder
  }
}

var pairings = [];
var lastMatchNumber = 0;
var unusedMatchNumbers = [];

//interface functions
//filter when inputting search
function filterPairingsText() {
  let textFilter = $('#pairingsTableFilter').val();
  if ($('#filterActivePairings').prop('checked')) {
    pairingsTable.setFilter([
      {field: "active", type: "=", value: true},
      [
        {field: "matchNumber", type: "=", value: textFilter},
        {field: "playerOneName", type: "like", value: textFilter},
        {field: "playerTwoName", type: "like", value: textFilter}
      ]
    ]);
  } else {
    pairingsTable.setFilter([
      [
        {field: "matchNumber", type: "=", value: textFilter},
        {field: "playerOneName", type: "like", value: textFilter},
        {field: "playerTwoName", type: "like", value: textFilter}
      ]
    ]);
  }
}

$('#displayedRound').change(function() {
  let round = pairings.find(r => r.round == $('#displayedRound').val());
  pairingsTable.setData(round.pairings);
});

$('#editPairingsButton').change(function() {
  if ($('#editPairingsButton').prop('checked')) {
    $('#dropPlayerOne').prop('checked', false);
    $('#dropPlayerTwo').prop('checked', false);
    document.getElementById("matchIDHolder").dataset.match = 0;
    $('#selectedMatchNumber').val('');
    $('#playerOneWins').val('');
    $('#playerTwoWins').val('');
    $('#numberOfDraws').val('');
    $('#playerOneAlias').text('');
    $('#playerTwoAlias').text('');
    $('.pairings-left').css('display', 'none');
    let activePlayers = players.filter(p => p.active === true);
    let unpairedPlayers = activePlayers.filter(a => a.paired === false);
    editTable.setData(unpairedPlayers);
    $('.edit-pairings').css('display', 'inline-block');
  } else {
    $('.edit-pairings').css('display', 'none');
    $('.pairings-left').css('display', 'inline-block');
  }
});

//filter when pressing all/active matches
$('#filterActivePairings').change(function() {
  let textFilter = $('#pairingsTableFilter').val();
  if (textFilter === '' || textFilter === undefined) {
    if ($('#filterActivePairings').prop('checked')) {
      pairingsTable.setFilter([
        {field: "active", type: "=", value: true}
      ]);
    } else {
      pairingsTable.clearFilter();
    }
  } else {
    if ($('#filterActivePairings').prop('checked')) {
      pairingsTable.setFilter([
        {field: "active", type: "=", value: true},
        [
          {field: "matchNumber", type: "=", value: textFilter},
          {field: "playerOneName", type: "like", value: textFilter},
          {field: "playerTwoName", type: "like", value: textFilter}
        ]
      ]);
    } else {
      pairingsTable.setFilter([
        [
          {field: "matchNumber", type: "=", value: textFilter},
          {field: "playerOneName", type: "like", value: textFilter},
          {field: "playerTwoName", type: "like", value: textFilter}
        ]
      ]);
    }
  }
  let updateLabel = $('#filterActivePairings').prop('checked') ? 'Only Active' : 'All Matches';
  $('label[for="filterActivePairings"]').text(updateLabel);
});

//load match by match number
$('#selectedMatchNumber').keyup(function(e) {
  let matchID = $('#selectedMatchNumber').val();
  if (e.keyCode === 13 && matchID != 0) { //TODO load existing results
    let round = pairings.find(r => r.round == $('#displayedRound').val());
    let match = round.pairings.find(m => m.matchNumber == matchID);
    if (match === undefined) return;
    document.getElementById("matchIDHolder").dataset.match = matchID;
    if (match.active === false) {
      $('#playerOneWins').val(match.playerOneWins);
      $('#playerTwoWins').val(match.playerTwoWins);
      $('#numberOfDraws').val(match.draws);
    } else {
      $('#playerOneWins').val('');
      $('#playerTwoWins').val('');
      $('#numberOfDraws').val('');
    }
    $('#playerOneAlias').text(match.playerOneName);
    $('#playerTwoAlias').text(match.playerTwoName);
    $('#playerOneWins').focus();
  }
});

//manual entry methods
$('#playerOneWins').keyup(function(e) {
  if (e.keyCode === 13 && document.getElementById("matchIDHolder").dataset.match != '0') {
    let verify = new RegExp('^d?[0-' + Math.ceil(bestOf / 2).toString() + ']d?$');
    if ($('#playerOneWins').val() === '' || $('#playerOneWins').val() === undefined) return;
    else if (!(verify.test($('#playerOneWins').val()))) {
      $('#playerOneWins').val('');
      return;
    } else $('#playerTwoWins').focus();
  } else return;
});

$('#playerTwoWins').keyup(function(e) {
  if (e.keyCode === 13 && document.getElementById("matchIDHolder").dataset.match != '0') {
    let verify = new RegExp('^d?[0-' + Math.ceil(bestOf / 2).toString() + ']d?$');
    if (!(verify.test($('#playerTwoWins').val()))) {
      $('#playerTwoWins').val('');
      return;
    }
    else $('#submitResult').trigger('click');
  } else return;
});

$('#numberOfDraws').keyup(function(e) {
  if (e.keyCode === 13 && document.getElementById("matchIDHolder").dataset.match != '0') {
    if (!(/^[0-3]$/.test($('#numberOfDraws').val()))) {
      $('#numberOfDraws').val('');
      return;
    }
    else $('#submitResult').trigger('click');
  } else return;
});

//enter result
$('#submitResult').click(function() {
  let pOneResult = $('#playerOneWins').val();
  let pTwoResult = $('#playerTwoWins').val();
  let numberDraws = $('#numberOfDraws').val();
  let draws = numberDraws === '' || numberDraws === undefined ? 0 : parseInt(numberDraws);
  if (pOneResult === '' || pOneResult === undefined || pTwoResult === '' || pTwoResult === undefined || document.getElementById("matchIDHolder").dataset.match == '0') return;
  let verify = new RegExp('^d?[0-' + Math.ceil(bestOf / 2).toString() + ']d?$');
  if (!(verify.test(pOneResult)) || !(verify.test(pTwoResult)) || !(/^[0-3]$/.test(draws))) {
    $('#playerOneWins').val('');
    $('#playerTwoWins').val('');
    $('#numberOfDraws').val('');
    $('#playerOneWins').focus();
    return;
  }
  let round = pairings.find(r => r.round == $('#displayedRound').val());
  let match = round.pairings.find(m => m.matchNumber == document.getElementById("matchIDHolder").dataset.match);
  if (match.active === false) {
    matchResult(match.playerOne, match.playerTwo, match.playerOneWins, match.playerTwoWins, match.draws, false);
  }
  let dropCheck = new RegExp('.?d.?');
  if (dropCheck.test(pOneResult)) {
    pOneResult.replace('d', '');
    let player = players.find(p => p.playerID == match.playerOne);
    player.paired = false;
    player.active = false;
    playersTable.setData(players);
  }
  if (dropCheck.test(pTwoResult)) {
    pTwoResult.replace('d', '');
    let player = players.find(p => p.playerID == match.playerTwo);
    player.paired = false;
    player.active = false;
    playersTable.setData(players);
  }
  match.draws = draws;
  match.playerOneWins = parseInt(pOneResult);
  match.playerTwoWins = parseInt(pTwoResult);
  matchResult(match.playerOne, match.playerTwo, match.playerOneWins, match.playerTwoWins, draws);
  match.active = false;
  if ($('#dropPlayerOne').prop('checked')) {
    let player = players.find(p => p.playerID == match.playerOne);
    player.paired = false;
    player.active = false;
    playersTable.setData(players);
  }
  if ($('#dropPlayerTwo').prop('checked')) {
    let player = players.find(p => p.playerID == match.playerTwo);
    player.paired = false;
    player.active = false;
    playersTable.setData(players);
  }
  $('#dropPlayerOne').prop('checked', false);
  $('#dropPlayerTwo').prop('checked', false);
  document.getElementById("matchIDHolder").dataset.match = 0;
  $('#selectedMatchNumber').val('');
  $('#playerOneWins').val('');
  $('#playerTwoWins').val('');
  $('#numberOfDraws').val('');
  $('#playerOneAlias').text('');
  $('#playerTwoAlias').text('');
  pairingsTable.setData(round.pairings);
  updatePairingsFooter();
  $('#selectedMatchNumber').focus();
  computeTiebreakers();
  updateStandings();
  let checkActive = round.pairings.filter(m => m.active === true);
  if (checkActive.length === 0) $('#createNewRound').prop('disabled', false);
});

$('#clearResult').click(function() {
  let matchNo = document.getElementById("matchIDHolder").dataset.match;
  if (matchNo == '0') return;
  let round = pairings.find(r => r.round == $('#displayedRound').val());
  let match = round.pairings.find(m => m.matchNumber == matchNo);
  if (match.active === true) return;
  matchResult(match.playerOne, match.playerTwo, match.playerOneWins, match.playerTwoWins, match.draws, false);
  match.active = true;
  match.playerOneWins = 0;
  match.playerTwoWins = 0;
  match.draws = 0;
  document.getElementById("matchIDHolder").dataset.match = 0;
  $('#selectedMatchNumber').val('');
  $('#playerOneWins').val('');
  $('#playerTwoWins').val('');
  $('#numberOfDraws').val('');
  $('#playerOneAlias').text('');
  $('#playerTwoAlias').text('');
  pairingsTable.setData(round.pairings);
  updatePairingsFooter();
  $('#selectedMatchNumber').focus();
  computeTiebreakers();
  updateStandings();
  let checkActive = round.pairings.filter(m => m.active === true);
  if (checkActive.length !== 0) $('#createNewRound').prop('disabled', true);
});

$('#createNewRound').click(function() {
  let activePlayers = players.filter(player => player.active === true);
  if ($('#createNewRound').text === 'End Tournament') endTournament();
  else {
    activePlayers.forEach(p => p.paired = false);
    createPairings();
    if (currentRound === 2) {
      $('#addPlayer').prop('disabled', true);
    }
    if (currentRound === numberOfRounds) {
      $('#numberOfRounds').prop('disabled', true);
      $('#numberOfTop').prop('disabled', true);
      numberOfRounds = parseInt($('#numberOfRounds').val());
      cutToTop = parseInt($('#numberOfTop').val());
    }
    $('#displayedRound').append('<option value="' + currentRound + '">' +
                             currentRound + '</option>').val(currentRound.toString());
    if (activePlayers.length === 2 || (currentRound === numberOfRounds && cutToTop === 0))  $('#createNewRound').text('End Tournament');
    bestOf = $('#bestOfNumber').val();
  }
});

$('#assignBye').click(function() {
  let player = players.find(p => p.playerID == document.getElementById("editPOne").dataset.poneid);
  const bye = new Match(0, player.playerID, 0, player.alias, 'Bye');
  assignBye(player);
  player.paired = true;
  bye.active = false;
  bye.playerOneWins = 2;
  let currPairings = pairings.find(p => p.round == currentRound).pairings;
  currPairings.push(bye);
  pairingsTable.setData(currPairings);
  $('#editPlayerOne').text('');
  document.getElementById("editPOne").dataset.poneid = '0';
  $("#assignBye").prop("disabled", true);
  $("#assignLoss").prop("disabled", true);
  $("#removePlayer").prop("disabled", true);
  let activePlayers = players.filter(p => p.active === true);
  let unpairedPlayers = activePlayers.filter(a => a.paired === false);
  if (unpairedPlayers.length === 0) $('#editPairingsButton').prop('disabled', false);
  editTable.setData(unpairedPlayers);
});

$('#assignLoss').click(function() {
  let player = players.find(p => p.playerID == document.getElementById("editPOne").dataset.poneid);
  const loss = new Match(0, player.playerID, 0, player.alias, 'Loss');
  assignLoss(player);
  player.paired = true;
  loss.active = false;
  let currPairings = pairings.find(p => p.round == currentRound).pairings;
  currPairings.push(loss);
  pairingsTable.setData(currPairings);
  $('#editPlayerOne').text('');
  document.getElementById("editPOne").dataset.poneid = '0';
  $("#assignBye").prop("disabled", true);
  $("#assignLoss").prop("disabled", true);
  $("#removePlayer").prop("disabled", true);
  let activePlayers = players.filter(p => p.active === true);
  let unpairedPlayers = activePlayers.filter(a => a.paired === false);
  if (unpairedPlayers.length === 0) $('#editPairingsButton').prop('disabled', false);
  editTable.setData(unpairedPlayers);
});

$('#removePlayer').click(function() {
  $('#editPlayerOne').text('');
  document.getElementById("editPOne").dataset.poneid = '0';
  $("#assignBye").prop("disabled", true);
  $("#assignLoss").prop("disabled", true);
  $("#removePlayer").prop("disabled", true);
});

$('#pairPlayers').click(function() {
  let player = players.find(p => p.playerID == document.getElementById("editPOne").dataset.poneid);
  let opponent = players.find(o => o.playerID == document.getElementById("editPTwo").dataset.ptwoid);
  let matchNumber;
  if (unusedMatchNumbers.length > 0) {
    matchNumber = unusedMatchNumbers[0];
    unusedMatchNumbers.splice(0, 1);
  } else matchNumber = lastMatchNumber + 1;
  const pairing = new Match(matchNumber, player.playerID, opponent.playerID, player.alias, opponent.alias);
  player.paired = true;
  opponent.paired = true;
  let currPairings = pairings.find(r => r.round == currentRound).pairings;
  currPairings.push(pairing);
  pairingsTable.setData(currPairings);
  $('#editPlayerOne').text('');
  $('#editPlayerTwo').text('');
  document.getElementById("editPOne").dataset.poneid = '0';
  document.getElementById("editPTwo").dataset.ptwoid = '0';
  $("#pairPlayers").prop("disabled", true);
  $("#removePlayers").prop("disabled", true);
  let activePlayers = players.filter(a => a.active === true);
  let unpairedPlayers = activePlayers.filter(u => u.paired === false);
  if (unpairedPlayers.length === 0) $('#editPairingsButton').prop('disabled', false);
  editTable.setData(unpairedPlayers);
});

$('#removePlayers').click(function() {
  $('#editPlayerOne').text('');
  $('#editPlayerTwo').text('');
  document.getElementById("editPOne").dataset.poneid = '0';
  document.getElementById("editPTwo").dataset.ptwoid = '0';
  $("#pairPlayers").prop("disabled", true);
  $("#removePlayers").prop("disabled", true);
});

//other functions
//swiss pairing algorithm
function createPairings() {
  let currPairings = [];
  let currentMatchNumber = $('#startingMatchNumber').val() - 1;
  let activePlayers = players.filter(player => player.active === true);
  function shuffle(b) {
    for (let i = b.length - 1; i > 0; i--) {
      let r = Math.floor(Math.random() * (i + 1));
      let a = b[r];
      b[r] = b[i];
      b[i] = a;
    }
  }
  if (currentRound === 0) {
    currentRound++;
    shuffle(activePlayers);
    while (activePlayers.length > 1) {
      currentMatchNumber++;
      const match = new Match(currentMatchNumber, activePlayers[0].playerID, activePlayers[1].playerID, activePlayers[0].alias, activePlayers[1].alias);
      currPairings.push(match);
      activePlayers[0].paired = true;
      activePlayers[1].paired = true;
      activePlayers.splice(0, 2);
    }
    if (activePlayers.length === 1) {
      byePlayer = activePlayers[0];
      const bye = new Match(0, byePlayer.playerID, 0, byePlayer.alias, 'Bye');
      assignBye(byePlayer);
      bye.active = false;
      bye.playerOneWins = 2;
      currPairings.push(bye);
      byePlayer.paired = true;
    }
  } else if (currentRound + 1 === numberOfRounds) {
    let holdPlayer = [];
    currentRound++;
    let orderedPlayers = standings.filter(p => p.active === true);
    while (orderedPlayers.length > 1 || holdPlayer.length > 0) {
      if (holdPlayer.length > 0) {
        orderedPlayers.unshift(holdPlayer.pop());
      }
      do {
        if (orderedPlayers.length === 1) {
          const bye = new Match(0, orderedPlayers[0].playerID, 0, orderedPlayers[0].alias, 'Bye');
          assignBye(orderedPlayers[0]);
          orderedPlayers[0].paired = true;
          bye.active = false;
          bye.playerOneWins = 2;
          currPairings.push(bye);
          break;
        }
        if (orderedPlayers[0].opponents.indexOf(orderedPlayers[1].playerID) === -1) {
          currentMatchNumber++;
          const match = new Match(currentMatchNumber, orderedPlayers[0].playerID, orderedPlayers[1].playerID, orderedPlayers[0].alias, orderedPlayers[1].alias);
          currPairings.push(match);
          orderedPlayers[0].paired = true;
          orderedPlayers[1].paired = true;
          orderedPlayers.splice(0, 2);
          break;
        } else {
          holdPlayer.push(orderedPlayers.splice(1, 1)[0]);
          continue;
        }
      } while (true);
    }
    if (orderedPlayers.length === 1) {
      const bye = new Match(0, orderedPlayers[0].playerID, 0, orderedPlayers[0].alias, 'Bye');
      assignBye(orderedPlayers[0]);
      orderedPlayers[0].paired = true;
      bye.active = false;
      bye.playerOneWins = 2;
      currPairings.push(bye);
    }
  } else if (currentRound === numberOfRounds) {
    currentRound++;
    let orderedPlayers = standings.filter(p => p.active === true);
    for (let i = cutToTop; i < orderedPlayers.length; i++) players.find(p => p.playerID === orderedPlayers[i].playerID).active = false;
    if (cutToTop === 0) {
      endTournament();
      return;
    }
    let topPlayers = [];
    for (let i = 0; i < cutToTop; i++) {
      topPlayers.push(orderedPlayers[i]);
    }
    singleElim = true;
    let pairPlayers = pos => {
      for (let i = 0; i < pos.length; i += 2) {
        let top = topPlayers[pos[i] - 1];
        let bot = topPlayers[pos[i + 1] - 1];
        currentMatchNumber++;
        const match = new Match(currentMatchNumber, top.playerID, bot.playerID, top.alias, bot.alias);
        top.paired = true;
        bot.paired = true;
        currPairings.push(match);
      }
    }
    switch (cutToTop) {
      case 2:
        const match = new Match(currentMatchNumber, topPlayers[0].playerID, topPlayers[1].playerID, topPlayers[0].alias, topPlayers[1].alias);
        currPairings.push(match);
        topPlayers[0].paired = true;
        topPlayers[1].paired = true;
        break;
      case 4:
        pairPlayers([1, 4, 2, 3]);
        break;
      case 8:
        pairPlayers([1, 8, 4, 5, 3, 6, 2, 7]);
        break;
      case 16:
        pairPlayers([1, 16, 8, 9, 4, 13, 5, 12, 2, 15, 7, 10, 3, 14, 6, 11]);
        break;
    }
  } else if (currentRound > numberOfRounds) {
    if (players.filter(p => p.active === true).length === 1) {
      endTournament();
      return;
    }
    let prevPairings = pairings.find(r => r.round === currentRound).pairings;
    currentRound++;
    let currentPlayers = [];
    prevPairings.forEach(m => {
      let winner = m.playerOneWins > m.playerTwoWins ? m.playerOne : m.playerTwo;
      currentPlayers.push(activePlayers.find(p => p.playerID === winner));
    });
    for (let i = 0; i < currentPlayers.length; i += 2) {
      let p = currentPlayers[i];
      let o = currentPlayers[i + 1];
      currentMatchNumber++;
      const match = new Match(currentMatchNumber, p.playerID, o.playerID, p.alias, o.alias);
      currPairings.push(match);
      p.paired = true;
      o.paired = false;
    }
  } else {
    let holdPlayer = [];
    let points = currentRound * 3;
    currentRound++;
    let success;
    function attemptToPair (p) {
      do {
        let currentPlayers = activePlayers.filter(pl => pl.matchPts == p);
        if (currentPlayers.length === 0) {
          if (p === 0 && holdPlayer.length > 0) {
            if (holdPlayer.length > 1) return false;
            else {
              const bye = new Match(0, holdPlayer[0].playerID, 0, holdPlayer[0].alias, 'Bye');
              assignBye(holdPlayer[0]);
              holdPlayer[0].paired = true;
              bye.active = false;
              bye.playerOneWins = 2;
              currPairings.push(bye);
              return true;
            }
          } else {
          p--;
          continue;
          }
        }
        shuffle(currentPlayers);
        let l = 0;
        while (holdPlayer.length > 0) {
          if (currentPlayers.length === 0 && p === 0) {
            if (holdPlayer.length > 1) return false;
            const bye = new Match(0, holdPlayer[0].playerID, 0, holdPlayer[0].alias, 'Bye');
            assignBye(holdPlayer[0]);
            holdPlayer[0].paired = true;
            bye.active = false;
            bye.playerOneWins = 2;
            currPairings.push(bye);
            return true;
          }
          if (holdPlayer[0].opponents.indexOf(currentPlayers[l].playerID) === -1) {
            currentMatchNumber++;
            const match = new Match(currentMatchNumber, holdPlayer[0].playerID, currentPlayers[l].playerID, holdPlayer[0].alias, currentPlayers[l].alias);
            currPairings.push(match);
            holdPlayer[0].paired = true;
            currentPlayers[l].paired = true;
            holdPlayer.splice(0, 1);
            currentPlayers.splice(l, 1);
          } else l++;
          if (l === currentPlayers.length && l !== 0) {
            if (p === 0) return true;
            else break;
          }
        }
        while (currentPlayers.length > 1) {
          let i = 1;
          while (i < currentPlayers.length) {
            if (currentPlayers[0].opponents.indexOf(currentPlayers[i].playerID) === -1) {
              currentMatchNumber++;
              const match = new Match(currentMatchNumber, currentPlayers[0].playerID, currentPlayers[i].playerID, currentPlayers[0].alias, currentPlayers[i].alias);
              currentPlayers[0].paired = true;
              currentPlayers[i].paired = true;
              currPairings.push(match);
              currentPlayers.splice(i, 1);
              currentPlayers.splice(0, 1);
              break;
            } else i++;
            if (i === currentPlayers.length) {
              if (p === 0) return false;
              else {
                currentPlayers.forEach(player => holdPlayer.push(currentPlayers.shift()));
              }
            }
          }
        }
        if (currentPlayers.length === 1) {
          if (p === 0) {
            const bye = new Match(0, currentPlayers[0].playerID, 0, currentPlayers[0].alias, 'Bye');
            assignBye(currentPlayers[0]);
            currentPlayers[0].paired = true;
            bye.active = false;
            bye.playerOneWins = 2;
            currPairings.push(bye);
            return true;
          } else holdPlayer.push(currentPlayers[0]);
        } else if (currentPlayers.length === 0) {
            if (p === 0) return true;
            else {
              p--;
              continue;
            }
        } else return false;
        p--;
      } while (p >= 0)
    }
    do {
      currPairings = [];
      currentMatchNumber = $('#startingMatchNumber').val() - 1;
      success = attemptToPair(points);
    } while (success === false);
  }
  pairingsTable.setData(currPairings);
  let activeMatches = currPairings.filter(m => m.active === true);
  let footerText = 'Active Matches: ' + activeMatches.length;
  $('#pairingsTableFoot').text(footerText);
  let roundPairings = {
    "round": currentRound,
    "pairings": currPairings
  };
  pairings.push(roundPairings);
  lastMatchNumber = currentMatchNumber;
  computeTiebreakers();
  updateStandings();
  $('#createNewRound').prop('disabled', true);
}

function updatePairingsFooter() {
  let round = pairings.find(r => r.round == $('#displayedRound').val());
  let activePairings = round.pairings.filter(m => m.active === true);
  let footerText = 'Active Matches: ' + activePairings.length;
  $('#pairingsTableFoot').text(footerText);
}