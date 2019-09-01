//global var & classes
var currentRound = 0;
var numberOfRounds = 3;
var singleElim = false;
var cutToTop = 0;
var bestOf = 3;

//interface functions
//create tournament button
$('#createTournament').click(function() {
  $('#nameRadios input[id^=name]:radio').checkboxradio('disable').checkboxradio('refresh');
  $('#tourney-name').prop('disabled', true);
  $('#createTournament').prop('disabled', true);
  $('#tourney-info').accordion('option', 'active', false);
  if ($('#name-2').prop('checked') === true) {
    $('label[for="player-first"]').text('First: ');
    $('#secondName').css('display', 'block');
  }
  $('#saveTournament').prop('disabled', false);
  $('#loadTournament').prop('disabled', true);
  $('#tabbed-interface').tabs('enable', 0).tabs('option', 'active', 0);
});

$('#startTournament').click(function() {
  $('#importPlayers').prop('disabled', true);
  $('#startTournament').prop('disabled', true);
  $('#singleElimOption').prop('disabled', true);
  //$('#addPlayer').prop('disabled', true);
  bestOf = $('#bestOfNumber').val();
  createPairings();
  singleElim = $('#singleElimOption').prop('checked') === true ? true : false;
  $('#tabbed-interface').tabs('enable', 2);
  $('#tabbed-interface').tabs('enable', 1).tabs('option', 'active', 1);
});

$('#saveTournament').click(function() {
  let saveJson = [];
  let header = {
    name: $('#tourney-name').val(),
    single: singleElim,
    twoNames: $('#name-2').prop('checked'),
    currRound: currentRound,
    totalRounds: numberOfRounds,
    topX: cutToTop,
    bestOfGames: bestOf,
    currID: playerIDCounter,
    startMatch: $('#startingMatchNumber').val()
  };
  saveJson.splice(0, 0, header, players, pairings, standings);
  let filename = $('#tourney-name').val() === '' ? "swiss-sk.json" : $('#tourney-name').val() + '.json';
  saveAs(new Blob([JSON.stringify(saveJson, null, '\t')], {type: "text/plain;charset=utf-8"}), filename);
});

$('#loadTournament').click(function() {//TODO update players footer
  $('#loadFile').trigger('click');
});

$('#loadFile').change(function() {
  let importFile = $('#loadFile')[0].files[0];
  let reader = new FileReader();
  reader.onloadend = (e) => {
    let event = JSON.parse(reader.result);
    let header = event[0];
    $('#tourney-name').val(header.name);
    singleElim = header.single;
    currentRound = header.currRound;
    numberOfRounds = header.totalRounds;
    playerIDCounter = header.currID;
    cutToTop = header.topX;
    bestOf = header.bestOfGames;
    $('#numberOfTop').val(cutToTop);
    $('#numberOfRounds').val(numberOfRounds);
    $('#startingMatchNumber').val(header.startMatch);
    players = event[1];
    pairings = event[2];
    standings = event[3];
    if (singleElim) $('#singleElimOption').prop('checked', true);
    else $('#singleElimOption').prop('checked', false);
    if (header.twoNames === true) {
      $('label[for="player-first"]').text('First: ');
      $('#secondName').css('display', 'block');
      $('#name-2').prop('checked', true);
    }
    if ($('#exportPlayers').prop('disabled') && $('#printPlayers').prop('disabled') && players.length > 0) {
      $('#exportPlayers').prop('disabled', false);
      $('#printPlayers').prop('disabled', false);
    }
    $('#nameRadios input[id^=name]:radio').checkboxradio('disable').checkboxradio('refresh');
    $('#tourney-name').prop('disabled', true);
    $('#createTournament').prop('disabled', true);
    if (header.twoNames === true) {
      $('label[for="player-first"]').text('First: ');
      $('#secondName').css('display', 'block');
    }
    $('#saveTournament').prop('disabled', false);
    $('#loadTournament').prop('disabled', true);
    $('#tourney-info').accordion('option', 'active', false);
    $('#bestOfNumber').val(bestOf);
    let activePlayers = players.filter(player => player.active === true);
    let playerFooterText = 'Active Players: ' + activePlayers.length + ' | Total Players: ' + players.length;
    $('#playerTableFoot').text(playerFooterText);
    if (currentRound === 0) {
      playersTable.setData(players);
      $('#tabbed-interface').tabs('enable', 0).tabs('option', 'active', 0);
    } else {
      $('#importPlayers').prop('disabled', true);
      $('#startTournament').prop('disabled', true);
      $('#singleElimOption').prop('disabled', true);
      if (currentRound > 1) $('#addPlayer').prop('disabled', true);
      if (currentRound > 1) {
        for(let i = 2; i <= currentRound; i++){
          $('#displayedRound').append('<option value="' + i + '">' +
                             i + '</option>');
        }
        $('#displayedRound').val(currentRound.toString());
      }
      let round = pairings.find(r => r.round == currentRound);
      let activeRound = round.pairings.filter(m => m.active === true);
      if (activeRound.length === 0) $('#createNewRound').prop('disabled', false);
      if (activePlayers.length === 2 || (currentRound === numberOfRounds && cutToTop === 0)) $('#createNewRound').text('End Tournament');
      playersTable.setData(players);
      pairingsTable.setData(round.pairings);
      standingsTable.setData(standings);
      let pairingsFooterText = 'Active Matches: ' + activeRound.length;
      $('#pairingsTableFoot').text(pairingsFooterText);
      $('#tabbed-interface').tabs('enable').tabs('option', 'active', 1);
    }
  };
  reader.readAsText(importFile);
});

//other functions
function endTournament() {
  pairingsTable.setData([]);
  $('#createNewRound').prop('disabled', true);
  players.forEach(p => p.active = false);
  $('#tabbed-interface').tabs('option', 'active', 2);
}