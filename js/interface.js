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
    active: false 
  });
  
  $('#filterDroppedPlayers').checkboxradio({
    icon: false
  });
  
  $('#filterActivePairings').checkboxradio({
    icon: false
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
        }
        playersTable.setData(players);
        updatePlayersInterface();
        $('#playersDialog').dialog('close');
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

var playersTable = new Tabulator("#players-table", {
  index: "playerID",
  data: players,
  height: "430px",
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

var pairingsTable = new Tabulator("#pairings-table", {
  index: "matchNumber",
  height: "420px",
  layout: "fitColumns",
  resizableColumns: false,
  printAsHtml: true,
  printHeader: () => "<h1>" + $('#tourney-name').val() + " - Round " + currentRound.toString() + "</h1>",
  rowClick: (e, row) => {
    let data = row.getData();
    if (data.matchNumber === 0) return;
    document.getElementById("matchIDHolder").dataset.match = data.matchNumber;
    if (data.active === false) {
      $('#playerOneWins').val(data.playerOneWins);
      $('#playerTwoWins').val(data.playerTwoWins);
    } else {
      $('#playerOneWins').val('');
      $('#playerTwoWins').val('');
      $('#numberOfDraws').val('');
    }
    $('#selectedMatchNumber').val(data.matchNumber);
    $('#playerOneAlias').text(data.playerOneName);
    $('#playerTwoAlias').text(data.playerTwoName);
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
  height: "440px",
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