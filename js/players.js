//global var & classes
class Player {
  constructor(name) {
    this.alias = name; //one or two names
    this.playerID = playerIDCounter;
    this.matchPts = 0;
    this.matches = 0;
    this.gamePts = 0;
    this.games = 0;
    this.byes = 0;
    this.opponents = []; //stores playerID of opp
    this.active = true;
    this.matchWinPct = '0';
    this.gameWinPct = '0';
    this.oppMatchWinPct = '0';
    this.oppGameWinPct = '0';
    this.paired = false;
    this.dropRound = null;
  }
}

var playerIDCounter = 0; //updates for each player added
var players = []; //object of players

//interface functions
//pressing enter to add player (first name/alias)
$('#player-first').keyup(function(e) {
  if (e.keyCode === 13) {
    if ($('#name-2').prop('checked') === true) {
      $('#player-second').focus();
    } else {
      $('#addPlayer').trigger('click');
      $('#player-first').focus();
    }
  }
});

//pressing enter to add player (last name)
$('#player-second').keyup(function(e) {
  if (e.keyCode === 13) {
    $('#addPlayer').trigger('click');
    $('#player-first').focus();
  }
});

//add player button
$('#addPlayer').click(function() {
  let name;
  if ($('#name-2').prop('checked') === true) {
    if ($('#player-first').val() == '' || $('#player-first').val == undefined || $('#player-second').val() == '' || $('#player-second').val() == undefined) return;
    else {
      name = $('#player-second').val() + ', ' + $('#player-first').val();
      $('#player-first').val('');
      $('#player-second').val('');
    }
  } else {
    if ($('#player-first').val() == '' || $('#player-first').val == undefined) return;
    else {
      name = $('#player-first').val();
      $('#player-first').val('');
    }
  }
  playerIDCounter++;
  const newPlayer = new Player(name);
  players.push(newPlayer);
  playersTable.setData(players);
  updatePlayersInterface();
});

function updatePlayersInterface() {
  //players footer
  let activePlayers = players.filter(player => player.active === true);
  let footerText = 'Active Players: ' + activePlayers.length + ' | Total Players: ' + players.length;
  $('#playerTableFoot').text(footerText);
  //print & export buttons
  if ($('#exportPlayers').prop('disabled') && $('#printPlayers').prop('disabled') && players.length > 0) {
    $('#exportPlayers').prop('disabled', false);
    $('#printPlayers').prop('disabled', false);
  }
  if ($('#startTournament').prop('disabled') && players.length >= 5) {
    $('#startTournament').prop('disabled', false);
  }
  if(!$('#exportPlayers').prop('disabled') && !$('#printPlayers').prop('disabled') && players.length === 0) {
    $('#exportPlayers').prop('disabled', true);
    $('#printPlayers').prop('disabled', true);
  }
  if (!$('#startTournament').prop('disabled') && players.length < 5) {
    $('#startTournament').prop('disabled', true);
          }
  //number of rounds
  switch (true) {
    case (players.length < 9):
      $('#numberOfRounds').val('3');
      $('#numberOfTop').val('0');
      $('#singleElimOption').prop('checked', true);
      break;
    case (players.length < 17):
      $('#numberOfRounds').val('4');
      break;
    case (players.length < 33):
      $('#numberOfRounds').val('5');
      break;
    case (players.length < 65):
      $('#numberOfRounds').val('6');
      break;
    case (players.length < 129):
      $('#numberOfRounds').val('7');
      break;
    case (players.length < 227):
      $('#numberOfRounds').val('8');
      break;
    default:
      $('#numberOfRounds').val('9');
      break;
  }
  if (players.length > 8) {
    $('#numberOfTop').val('8');
    $('#singleElimOption').prop('checked', false);
  }
  numberOfRounds = parseInt($('#numberOfRounds').val());
  cutToTop = parseInt($('#numberOfTop').val());
}

//import players button
$('#importPlayers').click(function() {
  $('#importPlayersFile').trigger('click');
});

//result of importing players
$('#importPlayersFile').change(function() {
  let importFile = $('#importPlayersFile')[0].files[0];
  let reader = new FileReader();
  reader.onload = (e) => {
    let importedPlayers;
    Papa.parse(reader.result, {
      header: true,
      dynamicTyping: true,
      complete: (results, file) => {
        importedPlayers = results.data;
      }
    });
    importedPlayers.forEach(p => {
      playerIDCounter++;
      const newP = new Player(p.alias);
      players.push(newP);
    });
    playersTable.setData(players);
    updatePlayersInterface();
  };
  reader.readAsText(importFile);
});

//print players
$('#printPlayers').click(function() {
  playersTable.print(false, true);
});

//export players as json
$('#exportPlayers').click(function() {
  //saveAs(new Blob([JSON.stringify(players, null, '\t')], {type: "text/plain;charset=utf-8"}), "players.json");
  saveAs(new Blob([Papa.unparse(players)], {type: "text/plain;charset=utf-8"}), "players.csv");
});

//filter when inputting search
function filterPlayersText() {
  let textFilter = $('#playerTableFilter').val();
  if ($('#filterDroppedPlayers').prop('checked')) {
    playersTable.setFilter([
      {field: "active", type: "=", value: true},
      [
        {field: "playerID", type: "=", value: textFilter},
        {field: "alias", type: "like", value: textFilter}
      ]
    ]);
  } else {
    playersTable.setFilter([
      [
        {field: "playerID", type: "=", value: textFilter},
        {field: "alias", type: "like", value: textFilter}
      ]
    ]);
  }
}

//filter when pressing all/active players
$('#filterDroppedPlayers').change(function() {
  let textFilter = $('#playerTableFilter').val();
  if (textFilter === '' || textFilter === undefined) {
    if ($('#filterDroppedPlayers').prop('checked')) {
      playersTable.setFilter([
        {field: "active", type: "=", value: true}
      ]);
    } else {
      playersTable.clearFilter();
    }
  } else {
    if ($('#filterDroppedPlayers').prop('checked')) {
      playersTable.setFilter([
        {field: "active", type: "=", value: true},
        [
          {field: "playerID", type: "=", value: textFilter},
          {field: "alias", type: "like", value: textFilter}
        ]
      ]);
    } else {
      playersTable.setFilter([
        [
          {field: "playerID", type: "=", value: textFilter},
          {field: "alias", type: "like", value: textFilter}
        ]
      ]);
    }
  }
  let updateLabel = $('#filterDroppedPlayers').prop('checked') ? 'Active' : 'All';
  $('label[for="filterDroppedPlayers"]').text(updateLabel);
});

//other functions
//computes tiebreakers
function computeTiebreakers() {
  players.forEach(player => {
    mwp(player);
    gwp(player);
    omwp(player);
    ogwp(player);
  });
  function mwp(p) {
    if (p.matches === 0) p.matchWinPct = (33.00).toFixed(2);
    else {
      let actual = Math.round(p.matchPts / (p.matches * 3) * 10000) / 100;
      p.matchWinPct = actual < 33 ? (33.00).toFixed(2) : actual.toFixed(2); 
    }
  }
  function gwp(p) {
    if (p.games === 0) p.gameWinPct = (33.00).toFixed(2);
    else {
      let actual = Math.round(p.gamePts / (p.games * 3) * 10000) / 100;
      p.gameWinPct = actual < 33 ? (33.00).toFixed(2) : actual.toFixed(2);
    }
  }
  function omwp(p) {
    let num = 0;
    p.opponents.forEach(opp => {
      let currOpp = players.find(player => player.playerID === opp);
      let actual = Math.round((currOpp.matchPts - (currOpp.byes * 3)) / ((currOpp.matches * 3) - (currOpp.byes * 3)) * 100) / 100;
      num += actual < 0.33 ? 0.33 : actual;
    });
    let den = p.opponents.length;
    p.oppMatchWinPct = den === 0 ? (33.00).toFixed(2) : (Math.round(num / den * 10000) / 100).toFixed(2);
  }
  function ogwp(p) {
    let num = 0;
    p.opponents.forEach(opp => {
      let currOpp = players.find(player => player.playerID === opp);
      let actual = Math.round((currOpp.gamePts - (currOpp.byes * 6)) / ((currOpp.games * 3) - (currOpp.byes * 3)) * 100) / 100;
      num += actual < 0.33 ? 0.33 : actual;
    });
    let den = p.opponents.length;
    p.oppGameWinPct = den === 0 ? (33.00).toFixed(2) : (Math.round(num / den * 10000) / 100).toFixed(2);
  }
}

//assigning data for a bye
function assignBye(p) {
  p.byes++;
  p.matchPts += 3;
  p.matches++;
  p.gamePts += 6;
  p.games += 2;
  computeTiebreakers();
  updateStandings();
}

function assignLoss(p) {
  p.matches++;
  p.games += 2;
  computeTiebreakers();
  updateStandings();
}

//assigning data for a match result
function matchResult(pOne, pTwo, oneGames, twoGames, drawGames, newResult = true) {
  let winner, loser, winGames, loseGames;
  if (oneGames >= twoGames) {
    winner = players.find(player => player.playerID === pOne);
    loser = players.find(player => player.playerID === pTwo);
    winGames = oneGames;
    loseGames = twoGames;
  } else {
    winner = players.find(player => player.playerID === pTwo);
    loser = players.find(player => player.playerID === pOne);
    winGames = twoGames;
    loseGames = oneGames;
  }
  if (newResult === true) {
    if (oneGames === twoGames) {
      winner.matchPts++;
      loser.matchPts++;
    } else {
      winner.matchPts += 3;
    }
    winner.matches++;
    winner.gamePts += winGames * 3 + drawGames;
    winner.games += winGames + loseGames + drawGames;
    winner.opponents.push(loser.playerID);
    loser.matches++;
    loser.gamePts += loseGames * 3 + drawGames;
    loser.games += winGames + loseGames + drawGames;
    loser.opponents.push(winner.playerID);
    if (singleElim) {
      winner.active = true;
      loser.active = false;
      playersTable.setData(players);
    }
  } else {
    if (oneGames === twoGames) {
      winner.matchPts--;
      loser.matchPts--;
    } else {
      winner.matchPts -= 3;
    }
    winner.matches--;
    winner.gamePts -= winGames * 3 + drawGames;
    winner.games -= winGames + loseGames + drawGames;
    winner.opponents.splice(winner.opponents.indexOf(loser.playerID), 1);
    loser.matches--;
    loser.gamePts -= loseGames * 3 + drawGames;
    loser.games -= winGames + loseGames + drawGames;
    loser.opponents.splice(loser.opponents.indexOf(winner.playerID), 1);
  }
  updateStandings();
}