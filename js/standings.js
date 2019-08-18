//global var
var standings = [];

//interface functions
$('#printStandings').click(function() {
  standingsTable.print(false, true);
});

//other functions
function updateStandings() {
  let all = players;
  all.sort((a, b) => {
    if (a.matchPts === b.matchPts) {
      if (a.oppMatchWinPct === b.oppMatchWinPct) {
        if (a.gameWinPct === b.gameWinPct) {
          if (a.oppGameWinPct === b.oppGameWinPct) {
            return a.playerID - b.playerID;
          } return b.oppGameWinPct - a.oppGameWinPct;
        } return b.gameWinPct - a.gameWinPct;
      } return b.oppMatchWinPct - a.oppMatchWinPct;
    } return b.matchPts - a.matchPts;
  });
  standings = all;
  standingsTable.setData(standings);
}

function filterStandings() {
  let textFilter = $('#standingsTableFilter').val();
  standingsTable.setFilter("alias", "like", textFilter);
}