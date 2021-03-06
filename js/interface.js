//creating interface elements
$(function() {
  $('#tourney-info').accordion({
    collapsible: true,
    heightStyle: "content"
  });
  
  $('.name-set').checkboxradio();
  
  $('#tabbed-interface').tabs({
    heightStyle: "fill",
    disabled: true,
    collapsible: true,
    active: false,
    activate: (e, ui) => {
      if (ui.newTab.index() !== 1) return;
      let activePlayers = players.filter(p => p.active === true);
      let unpairedPlayers = activePlayers.filter(a => a.paired === false);
      if (unpairedPlayers.length === 0) return;
      $('.pairings-left').css('display', 'none');
      editTable.setData(unpairedPlayers);
      $('#editPairingsButton').prop('checked', true);
      $('#editPairingsButton').prop('disabled', true);
      $('.edit-pairings').css('display', 'inline-block');
    }
  });
  
  $('#filterDroppedPlayers').checkboxradio({
    icon: false
  });
  
  $('#filterActivePairings').checkboxradio({
    icon: false
  });
  
  $('#editPairingsButton').checkboxradio({
    icon: false
  });
  
  $('#loadStoredEventDialog').dialog({
    autoOpen: false,
    buttons: {
      "Load Event": () => {
        let savedEvent = JSON.parse(window.localStorage.getItem("event"));
        loadEvent(savedEvent);
        $('#loadStoredEventDialog').dialog('close');
      },
      "Clear Saved Event": () => {
        window.localStorage.removeItem("event");
        $('#loadStoredEventDialog').dialog('close');
      }
    }
  });
  
  $('#playersDialog').dialog({
    autoOpen: false,
    buttons: {
      "Change Name": () => {
        let playerToChange = players.find(p => p.playerID == document.getElementById("playersDialog").dataset.pid);
        playerToChange.alias = $('#newName').val();
        $('#playersDialog').dialog('option', 'title', playerToChange.alias + ' - Player Card');
        $('#playersDialog').html("Name: " + playerToChange.alias
                                + "<br /> ID: " + playerToChange.playerID
                                + "<br /> Match Points: " + playerToChange.matchPts
                                + "<p><label for='newName'>New Name?</label><input type='text' id='newName' size='18'/></p>");
        playersTable.setData(players);
        if (currentRound > 0) {
          let round = pairings.find(r => r.round == $('#displayedRound').val());
          let match = round.pairings.find(m => (m.playerOne === playerToChange.playerID || m.playerTwo === playerToChange.playerID));
          if (playerToChange.playerID === match.playerOne) match.playerOneName = playerToChange.alias;
          else match.playerTwoName = playerToChange.alias;
          standings.find(p => p.playerID == playerToChange.playerID).alias = playerToChange.alias;
          pairingsTable.setData(round.pairings);
          standingsTable.setData(standings);
        }
      },
      "Drop/Undrop Player": () => {
        let playerToDrop = players.find(player => player.playerID == document.getElementById("playersDialog").dataset.pid);
        if (currentRound === 0) {
          players.splice(players.indexOf(playerToDrop), 1);
        } else {
          playerToDrop.active = !(playerToDrop.active);
          if (playerToDrop.active === true) {
            if (playerToDrop.dropRound != currentRound) {
              for (let i = playerToDrop.dropRound + 1; i < currentRound; i++) {
                const loss = new Match(0, playerToDrop.playerID, 0, playerToDrop.alias, 'Loss');
                assignLoss(playerToDrop);
                loss.active = false;
                pairings.find(r => r.round == i).pairings.push(loss);
              }
            }
            playerToDrop.dropRound = null;
          }
          if (playerToDrop.active === false) {
            playerToDrop.dropRound = currentRound;
            playerToDrop.paired = false;
          }
        }
        playersTable.setData(players);
        updatePlayersInterface();
        $('#playersDialog').dialog('close');
      }
    }
  });
  
  $('#deleteRoundDialog').dialog({
    autoOpen: false,
    buttons: {
      "Delete Round": () => {
        let round = pairings.find(r => r.round == currentRound);
        let matchesToErase = round.pairings.filter(p => p.active === false);
        matchesToErase.forEach(m => {
          if (m.playerTwo !== 0) {
            matchResult(m.playerOne, m.playerTwo, m.playerOneWins, m.playerTwoWins, m.draws, false);
          } else {
            let pOne = players.find(o => o.playerID === m.playerOne);
            if (m.playerTwoName === 'Bye') {
              pOne.byes--;
              pOne.matchPts -= 3;
              pOne.matches--;
              pOne.gamePts -= 6;
              pOne.games -= 2;
            } else if (m.playerTwoName === 'Loss') {
              pOne.matches--;
              pOne.games -= 2;
            }
          }
          if (m.playerOneDrop === true) players.find(a => a.playerID === m.playerOne).active = true;
          if (m.playerTwoDrop === true) players.find(b => b.playerID === m.playerTwo).active = true;
        });
        computeTiebreakers();
        updateStandings();
        playersTable.setData(players);
        let activePlayers = players.filter(player => player.active === true);
        let footerText = 'Active Players: ' + activePlayers.length + ' | Total Players: ' + players.length;
        $('#playerTableFoot').text(footerText);
        $('#deleteRoundDialog').dialog('close');
        if (currentRound === 1) {
          currentRound--;
          $('#importPlayers').prop('disabled', false);
          $('#startTournament').prop('disabled', false);
          $('#singleElimOption').prop('disabled', false);
          $('#tabbed-interface').tabs('disable', 2);
          $('#tabbed-interface').tabs('disable', 1).tabs('option', 'active', 0);
        } else {
          $('#displayedRound option[value="' + currentRound + '"]').remove();
          currentRound--;
          $('#displayedRound option[value="' + currentRound + '"]').prop('selected', true);
          if (currentRound === 1) $('#addPlayer').prop('disabled', false);
          let currPairings = pairings.find(c => c.round == currentRound).pairings;
          pairingsTable.setData(currPairings);
          let checkActive = currPairings.filter(m => m.active === true);
          if (checkActive.length === 0) $('#createNewRound').prop('disabled', false);
        }
        pairings.splice(pairings.indexOf(round), 1);
        document.getElementById("matchIDHolder").dataset.match = 0;
        $('#selectedMatchNumber').val('');
        $('#playerOneWins').val('');
        $('#playerTwoWins').val('');
        $('#numberOfDraws').val('');
        $('#playerOneAlias').text('');
        $('#playerTwoAlias').text('');
        updatePairingsFooter();
      }
    }
  });
  
  $('#printPairingsDialog').dialog({
    autoOpen: false,
    buttons: {
      "Print by Match": () => {
        $('#printPairingsDialog').dialog('close');
        pairingsTable.print(false, true);
      },
      "Print by Name": () => {
        let round = pairings.find(r => r.round == $('#displayedRound').val());
        let p = [];
        round.pairings.forEach(pair => {
          p.push(pair.playerOne);
          if (pair.playerTwo !== 0) p.push(pair.playerTwo);
        });
        let m = players.filter(player => p.indexOf(player.playerID) > -1);
        pairingsByName.setData(m);
        $('#printPairingsDialog').dialog('close');
        pairingsByName.print(false, true);
      }
    }
  });
});

$(document).ready(() => {
  let checkStorage = window.localStorage.getItem("event");
  if (checkStorage != null && checkStorage != undefined) {
    try {
      $('#loadStoredEventDialog').html('You have a saved event "' + JSON.parse(checkStorage)[0].name + '" - do you want to load this event?');
      $('#loadStoredEventDialog').dialog('open');
    } catch(err) {
      console.log(err);
    } 
  }
});

var playersTable = new Tabulator("#players-table", {
  index: "playerID",
  data: players,
  height: "410px",
  layout: "fitColumns",
  resizableColumns: false,
  printAsHtml: true,
  printHeader: () => "<h1>" + $('#tourney-name').val() + "</h1>",
  rowClick: (e, row) => {
    let data = row.getData();
    document.getElementById("playersDialog").dataset.pid = data.playerID;
    $('#playersDialog').dialog('option', 'title', data.alias + " - Player Card");
    $('#playersDialog').html("Name: " + data.alias
                            + "<br /> ID: " + data.playerID
                            + "<br /> Match Points: " + data.matchPts
                            + "<p><label for='newName'>New Name?</label><input type='text' id='newName' size='18'/></p>");
    $('#playersDialog').dialog('open');
  },
  initialSort: [
    {column: "playerID", dir: "asc"},
    {column: "alias", dir: "asc"}
  ],
  footerElement: '<div id="playerTableFoot">Players: 0</div>',
  columns: [
    {title: "ID", field: "playerID", width: 55, sorter: (a, b, aRow, bRow, column, dir, sorterParams) => {
      return a - b;
    }},
    {title: "Name", field: "alias", widthGrow: 1},
    {title: "Active", field: "active", width: 77, headerSort: false},
    {title: "Match Points", field: "matchPts", visible: false, width: "0px"},
    {title: "Matches", field: "matches", visible: false, width: "0px"},
    {title: "Game Points", field: "gamePts", visible: false, width: "0px"},
    {title: "Games", field: "games", visible: false, width: "0px"},
    {title: "Byes", field: "byes", visible: false, width: "0px"},
    {title: "Opponents", field: "opponents", visible: false, width: "0px"},
    {title: "MWP", field: "matchWinPct", visible: false, width: "0px"},
    {title: "GWP", field: "gameWinPct", visible: false, width: "0px"},
    {title: "OMWP", field: "oppMatchWinPct", visible: false, width: "0px"},
    {title: "OGWM", field: "oppGameWinPct", visible: false, width: "0px"}
  ]
});

var editTable = new Tabulator("#edit-table", {
  index: "playerID",
  data: [],
  height: "200px",
  layout: "fitColumns",
  resizableColumns: false,
  rowClick: (e, row) => {
    let data = row.getData();
    if (document.getElementById("editPOne").dataset.poneid == "0") {
      document.getElementById("editPOne").dataset.poneid = data.playerID.toString();
      $("#editPlayerOne").text(data.alias);
      $("#assignBye").prop("disabled", false);
      $("#assignLoss").prop("disabled", false);
      $("#removePlayer").prop("disabled", false);
    } else if (document.getElementById("editPTwo").dataset.ptwoid == "0") {
      if (document.getElementById("editPOne").dataset.poneid == data.playerID) return;
      document.getElementById("editPTwo").dataset.ptwoid = data.playerID.toString();
      $("#editPlayerTwo").text(data.alias);
      $("#assignBye").prop("disabled", true);
      $("#assignLoss").prop("disabled", true);
      $("#removePlayer").prop("disabled", true);
      $("#pairPlayers").prop("disabled", false);
      $("#removePlayers").prop("disabled", false);
    } else return;
  },
  initialSort: [
    {column: "playerID", dir: "asc"},
    {column: "alias", dir: "asc"}
  ],
  columns: [
    {title: "ID", field: "playerID", width: 55, sorter: (a, b, aRow, bRow, column, dir, sorterParams) => {
      return a - b;
    }},
    {title: "Name", field: "alias", widthGrow: 1, formatter: (cell, formatterParams, onRendered) => {
      let data = cell.getData();
      return cell.getValue() + ' (' + data.matchPts + ')';
    }}
  ]
});

var pairingsTable = new Tabulator("#pairings-table", {
  index: "matchNumber",
  height: "410px",
  layout: "fitColumns",
  resizableColumns: false,
  printAsHtml: true,
  printHeader: () => "<h1>" + $('#tourney-name').val() + " - Round " + currentRound.toString() + "</h1>",
  rowClick: (e, row) => {
    if ($('#editPairingsButton').prop('checked')) {
      let currPairings = pairings.find(r => r.round == currentRound).pairings;
      let data = row.getData();
      if (data.active === false && data.matchNumber !== 0) return;
      if (data.matchNumber !== 0) unusedMatchNumbers.push(data.matchNumber);
      currPairings.splice(currPairings.indexOf(data), 1);
      let playerOne = players.find(p => p.playerID === data.playerOne);
      playerOne.paired = false;
      if (data.matchNumber != 0) {
        let playerTwo = players.find(o => o.playerID === data.playerTwo);
        playerTwo.paired = false;
      } else {
        if (data.playerTwoName === 'Bye') {
          playerOne.byes--;
          playerOne.matchPts -= 3;
          playerOne.matches--;
          playerOne.gamePts -= 6;
          playerOne.games -= 2;
          computeTiebreakers();
          updateStandings();
        } else if (data.playerTwoName === 'Loss') {
          playerOne.matches--;
          playerOne.games -= 2;
          computeTiebreakers();
          updateStandings();
        }
      }
      let activePlayers = players.filter(p => p.active === true);
      let unpairedPlayers = activePlayers.filter(a => a.paired === false);
      editTable.setData(unpairedPlayers);
      $('#editPairingsButton').prop('disabled', true);
      pairingsTable.setData(currPairings);
      updatePairingsFooter();
    } else {
      let data = row.getData();
      if (data.matchNumber === 0) return;
      document.getElementById("matchIDHolder").dataset.match = data.matchNumber;
      if (data.active === false) {
        $('#playerOneWins').val(data.playerOneWins);
        $('#playerTwoWins').val(data.playerTwoWins);
        if (data.playerOneDrop === true) $('#dropPlayerOne').prop('checked', true);
        if (data.playerTwoDrop === true) $('#dropPlayerTwo').prop('checked', true);
      } else {
        $('#playerOneWins').val('');
        $('#playerTwoWins').val('');
        $('#numberOfDraws').val('');
      }
      $('#selectedMatchNumber').val(data.matchNumber);
      $('#playerOneAlias').text(data.playerOneName);
      $('#playerTwoAlias').text(data.playerTwoName);
    }
  },
  initialSort: [
    {column: "matchNumber", dir: "asc"}
  ],
  footerElement: '<div id="pairingsTableFoot">Active Matches: 0</div>',
  columns: [
    {title: "Match", field: "matchNumber", width: 65, headerSort: false, sorter: (a, b, aRow, bRow, column, dir, sorterParams) => a - b},
    {title: "Player", field: "playerOneName", widthGrow: 1, headerSort: false, formatter: (cell, formatterParams, onRendered) => {
      let data = cell.getData();
      let currPlayer = players.find(p => p.playerID === data.playerOne);
      return cell.getValue() + ' (' + currPlayer.matchPts + ')';
    }},
    {title: "Player", field: "playerTwoName", widthGrow: 1, headerSort: false, formatter: (cell, formatterParams, onRendered) => {
      let data = cell.getData();
      let currPlayer = players.find(p => p.playerID === data.playerTwo);
      if (currPlayer === undefined) return cell.getValue();
      return cell.getValue() + ' (' + currPlayer.matchPts + ')';
    }},
    {title: "Result", field: "result", width: 75, headerSort: false, formatter: (cell, formatterParams, onRendered) => {
      let data = cell.getData();
      let draws = data.draws === 0 ? '' : '-' + data.draws;
      return data.playerOneWins + '-' + data.playerTwoWins + draws;
    }},
    {title: "Active", field: "active", visible: false},
    {title: "P1ID", field: "playerOne", visible: false},
    {title: "P2ID", field: "playerTwo", visible: false},
    {title: "P1W", field: "playerOneWins", visible: false},
    {title: "P2W", field: "playerTwoWins", visible: false},
    {title: "Draws", field: "draws", visible: false}
  ]
});

var pairingsByName = new Tabulator("#pair-name-table", {
  index: "playerID",
  layout: "fitColumns",
  printAsHtml: true,
  height: "0px",
  printHeader: () => "<h1>" + $('#tourney-name').val() + " - Round " + currentRound.toString() + "</h1>",
  initialSort: [
    {column: "alias", dir: "asc"}
  ],
  columns: [
    {title: "Match", field: "playerID", width: "12%", headerSort: false, formatter: (cell, formatterParams, onRendered) => {
      let pID = cell.getValue();
      let round = pairings.find(r => r.round == $('#displayedRound').val());
      let match = round.pairings.find(m => (m.playerOne === pID || m.playerTwo === pID));
      return match.matchNumber;
    }},
    {title: "Player", field: "alias", width: "38%", headerSort: false, formatter: (cell, formatterParams, onRendered) => {
      let data = cell.getData();
      if (currentRound != $('#displayedRound').val()) return cell.getValue();
      else return cell.getValue() + ' (' + data.matchPts + ')';
    }},
    {title: "Player", field: "matches", width: "38%", headerSort: false, formatter: (cell, formatterParams, onRendered) => {
      let data = cell.getData();
      let round = pairings.find(r => r.round == $('#displayedRound').val());
      let match = round.pairings.find(m => (m.playerOne === data.playerID || m.playerTwo === data.playerID));
      let oppID = data.playerID === match.playerOne ? match.playerTwo : match.playerOne;
      let opp = players.find(p => p.playerID === oppID);
      if (currentRound != $('#displayedRound').val()) return opp.alias;
      else if (opp === undefined) return 'Bye';
      else return opp.alias + ' (' + opp.matchPts + ')';
    }},
    {title: "Result", field: "byes", width: "12%", headerSort: false, formatter: (cell, formatterParams, onRendered) => {
      let data = cell.getData();
      let round = pairings.find(r => r.round == $('#displayedRound').val());
      let match = round.pairings.find(m => (m.playerOne === data.playerID || m.playerTwo === data.playerID));
      let draws = match.draws === 0 ? '' : '-' + match.draws;
      if (data.playerID === match.playerOne) return match.playerOneWins + '-' + match.playerTwoWins + draws;
      else return match.playerTwoWins + '-' + match.playerOneWins + draws;
    }}
  ]
});

var standingsTable = new Tabulator("#standings-table", {
  index: "playerID",
  layout: "fitColumns",
  printAsHtml: true,
  resizableColumns: false,
  height: "410px",
  printHeader: () => "<h1>" + $('#tourney-name').val() + " - Standings</h1>",
  rowFormatter: (row) => {
    let data = row.getData();
    if (data.active === true) row.getElement().style.fontWeight = 'bold';
  },
  initialSort: [
    {column: "active", dir: "asc"}
  ],
  columns: [
    {title: "Rank", field: "active", width: 65, headerSort: false, formatter: (cell, formatterParams, onRendered) => {
      let player = cell.getData();
      let position = standings.find(p => p.playerID === player.playerID);
      return standings.indexOf(position) + 1;
    }, sorter: (a, b, aRow, bRow, column, dir, sorterParams) => {
      let aRank = standings.indexOf(aRow.getData());
      let bRank = standings.indexOf(bRow.getData());
      return aRank - bRank;
    }},
    {title: "ID", field: "playerID", width: 45, headerSort: false},
    {title: "Player", field: "alias", widthGrow: 1, headerSort: false},
    {title: "MatchPts", field: "matchPts", width: 80, headerSort: false, align: "center"},
    {title: "OppMatch%", field: "oppMatchWinPct", width: 100, headerSort: false, align: "center"},
    {title: "GameWin%", field: "gameWinPct", width: 100, headerSort: false, align: "center"},
    {title: "OppGame%", field: "oppGameWinPct", width: 100, headerSort: false, align: "center"}
  ]
});