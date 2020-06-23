# swiss-sk (v1.0)
An online scorekeeping application for tournaments with Swiss pairings. It is written in JavaScript and runs client-side. **This is currently an BETA build - please report all bugs!**

## Table of Contents
- [Features](#Features)
  * [Current](#Current)
  * [Planned](#Planned)
- [Starting a Tournament](#Starting%20a%20Tournament)
  * [Creating](#Creating)
  * [Players](#Players)
- [Running a Tournament](#Running%20a%20Tournament)
  * [Pairings](#Pairings)
  * [Results](#Results)
  * [Standings](#Standings)
- [Known Bugs](#Known%20Bugs)

## Features

### Current
- Create tournaments with a custom name
- Export and import tournaments as .json
- **New** Tournament saves in localStorage at every round creation (in case tabs are accidentally closed)
- Input player names as either an alias or first and last name
- Export and import players as .csv
- Print a list of players
- Sort players by ID or name, and filter by ID or name
- Toggle players by active/all
- Suggests number of rounds (up to 9) and single elimination cut-off (from no cut to top 16)
- Matches can be best of 1, 3, 5, or 7 (can change each round)
- Run tournament as single elimination
- Change the starting match number (can change each round)
- Drop/undrop players or change their name by clicking on them in players tab
- Can add players during first round
- Export pairings as .csv
- Print pairings by match number or name
- Filter pairings by match number or name
- Toggle matches by active/all
- Can input results with just keypad (entering `d` with results will drop that player)
- Can clear results and overwrite results
- Can edit matches
- Can delete rounds
- Standings update after each match
- Filter standings by name
- Print standings
- Display pairings and standings on an [external page](https://mattbraddock.com/swiss-sk/display.html)

### Planned
- ~~Edit player name on player card~~ **implemented in alpha2**
- ~~Separate display page for external screens~~ **implemented in alpha3**
- ~~Hotkey for dropping players while inputting results~~ **implemented in alpha3**
- ~~Edit matches after pairings~~ **implemented in alpha4**
- ~~Add players late during round one~~ **implemented in alpha4**
- ~~Delete round button~~ **implemented in alpha5**
- ~~Import players as a .csv~~ **implemented in beta2**
- Print match result slips
- Custom player ID

## Starting a Tournament

### Creating
Upon loading, the "Tournament Info" accordion will be open. Here you can decide if names will be one name (an alias) or two names (first and last). You can also name the tournament, which is only used for printings and saving the tournament. You can only load a tournament before one is created, and you can only save a tournament after one is created. Loading a tournament will set all appropiate values, toggle all buttons and inputs, and open the correct tab. The save file exported is a readable .json file containing global tournament data, players, pairings, and standings.

### Players
Players can be entered using just the keyboard (no mouse) by pressing enter (if two names, pressing enter will move from first name to last name). Player IDs increment from 1 for each player entered; if a player drops, that player's ID will not be reused. If a player is clicked on in the table, a player card dialog appears with the player's name, ID, and amount of match points. In this dialog, players can be dropped or re-added, and their names can be changed. Players can be added during the first round, but they must be paired (or assigned a bye or loss).

The players table can be sorted by ID or name and filtered by ID, name, or active status (using the toggle button). When printing players, it prints what is currently shown on the table (including filters). Players can be imported and exported in .csv files. Data (such as points and tiebreakers) is stored in the exported file, but erased when importing; new players are created using the alias field. Thus, an imported .csv file only needs an `alias` field, and the name included.

## Running a Tournament

### Pairings
In round one, players are randomly paired. In subsequent rounds, players are paired by the Swiss pairing algorithm (designed to be fast, not perfect). The exception is the final Swiss round, which is paired by standings. Pairings can be filtered by name or active status (using the toggle button). Pairings can be exported as a .csv file. Printing pairings launches a dialog to select printing by match number or by name. If printing by match number, it prints what is currently shown on the table (if set to active matches only shown, you get a printout of outstanding matches).

Active matches can be edited during a round. This includes assigning byes and losses to players. Entire rounds can be deleted.

### Results
Results can be entered using just the keyboard. You can type a match number, press enter to load the match, then enter player one's wins, press enter, then enter player two's wins, and press enter to submit the result. If draws have happened, press tab after player two's wins, then press enter to submit. Clearing a result works as stated, as does entering a new result for a match that already has a result. You can include a 'd' with the amount of wins to drop the player. Once there are no active matches, the ability to create a new round (or end the tournament) is enabled.

### Standings
Standings are available when the tournament starts, and are updated after every result. The table can be filtered by name, and active players are bolded. Printing standings prints what is shown in the table.

## Known Bugs
- The pairing algorithm may fail or loop indefinitely - please report any issues, and include your tournament JSON data, if possible
- ~~You can enter a draw during single elimination (someone definitely gets dropped, though)~~ **fixed in alpha5**
- ~~If you enter a new result for a match that already has a result, and a player was dropped initially, they stay dropped~~ **fixed in alpha5**
- ~~Re-adding a player in a round after they have dropped doesn't impact their tiebreakers (does not assign losses for missed rounds)~~ **fixed in alpha6**