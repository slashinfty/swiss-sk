var players = [];
var pairings = [];
var standings = [];

$(function() {
  $('#loadEvent').click(function() {
    $('#loadFile').trigger('click');
  });
  
  $('#loadFile').change(function() {
    let importFile = $('#loadFile')[0].files[0];
    let reader = new FileReader();
    reader.onloadend = (e) => {
      $('#chooseSection').css('display', 'block');
      let event = JSON.parse(reader.result);
      players = event[1];
      pairings = event[2];
      standings = event[3];
      for(let i = 1; i <= pairings.length; i++) {
        $('#selectRound').append('<option value="' + i + '">' + i + '</option>');
      }
      $('#selectRound').val(pairings.length);
    }
    reader.readAsText(importFile);
  }); 
  
  $('#pairings').click(function() {
    $('#setup').css('display', 'none');
    let round = pairings.find(r => r.round == $('#selectRound').val()).pairings;
    if (round === undefined) return;
    let sorted = [];
    players.forEach(p => {
      let match = round.find(m => m.playerOne === p.playerID || m.playerTwo === p.playerID);
      if (match !== undefined) {
        let oppID = match.playerOne === p.playerID ? match.playerTwo : match.playerOne;
        let oppName = oppID === 0 ? 'Bye' : players.find(o => o.playerID === oppID).alias;
        sorted.push({number: match.matchNumber, player: p.alias, opponent: oppName});
      }
    });
    sorted.sort((a, b) => {
      if (a.player === b.player) return a.number - b.number;
      return a.player.localeCompare(b.player);
    });
    sorted.forEach(s => {
      $('#first').append('<div class="hflex"><span class="match">' + s.number + '</span><span class="names">' + s.player + '</span><span class="names">' + s.opponent + '</span></div>');
    });
    sorted.forEach(s => {
      $('#second').append('<div class="hflex"><span class="match">' + s.number + '</span><span class="names">' + s.player + '</span><span class="names">' + s.opponent + '</span></div>');
    });
  });
  
  $('#standings').click(function() {
    $('#setup').css('display', 'none');
    let active = standings.filter(p => p.active === true);
    active.forEach((s, i) => {
      let rank = i + 1;
      let score = s.matchPts + ' / ' + s.oppMatchWinPct + ' / ' + s.gameWinPct + ' / ' + s.oppGameWinPct;
      $('#first').append('<div class="hflex"><span class="match">' + rank + '</span><span class="one-name">' + s.alias + '</span><span class="scores">' + score + '</span></div>');
    });
    active.forEach((s, i) => {
      let rank = i + 1;
      let score = s.matchPts + ' / ' + s.oppMatchWinPct + ' / ' + s.gameWinPct + ' / ' + s.oppGameWinPct;
      $('#second').append('<div class="hflex"><span class="match">' + rank + '</span><span class="one-name">' + s.alias + '</span><span class="scores">' + score + '</span></div>');
    });
  });
});