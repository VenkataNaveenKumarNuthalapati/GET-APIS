const express = require("express");
const app = express();
app.use(express.json());

const sqlite = require("sqlite");
const { open } = sqlite;
const sqlite3 = require("sqlite3");
const path = require("path");
const dbpath = path.join(__dirname, "cricketMatchDetails.db");
let DB;

const initializeDBServer = async () => {
  try {
    DB = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost/3000/");
    });
  } catch (error) {
    console.log(`BD Error ${error.message}`);
  }
};
initializeDBServer();

// API 1 GET Method

app.get("/players/", async (request, response) => {
  let getPlayersQuery = `SELECT player_id as playerId, player_name as playerName FROM player_details;`;
  let players = await DB.all(getPlayersQuery);
  response.send(players);
});
// API 2 GET Method

app.get("/players/:playerId/", async (request, response) => {
  let { playerId } = request.params;
  let getPlayerQuery = `SELECT player_id as playerId, player_name as playerName FROM player_details
                            WHERE player_id = ${playerId}`;
  let player = await DB.get(getPlayerQuery);
  response.send(player);
});

// API 3 PUT Method
app.put("/players/:playerId/", async (request, response) => {
  let { playerId } = request.params;
  let { playerName } = request.body;
  let putQuery = `UPDATE player_details
                        SET player_name = '${playerName}'
                        WHERE player_id = ${playerId};`;
  await DB.run(putQuery);
  response.send("Player Details Updated");
});

// API 4 GET Method
app.get("/matches/:matchId/", async (request, response) => {
  let { matchId } = request.params;
  let getMatchQuery = `SELECT match_id as matchId, match, year FROM match_details WHERE match_id = ${matchId};`;
  let match = await DB.get(getMatchQuery);
  response.send(match);
});

// API 5 GET Method

app.get("/players/:playerId/matches", async (request, response) => {
  let { playerId } = request.params;
  let getMatchsQuery = `SELECT match_details.match_id as matchId, match_details.match, match_details.year 
  FROM match_details LEFT JOIN player_match_score ON match_details.match_id = player_match_score.match_id

                            WHERE player_match_score.player_id = ${playerId};`;
  let playerMatchDetails = await DB.all(getMatchsQuery);
  response.send(playerMatchDetails);
});
// API 6 GET Method

app.get("/matches/:matchId/players", async (request, response) => {
  let { matchId } = request.params;
  let getPlayerQuery = `SELECT player_details.player_id as playerId, player_details.player_name as playerName
  FROM player_details LEFT JOIN player_match_score ON player_details.player_id = player_match_score.player_id

                            WHERE player_match_score.match_id = ${matchId};`;
  let match_players = await DB.all(getPlayerQuery);
  response.send(match_players);
});

// API 7 GET Method
app.get("/players/:playerId/playerScores", async (request, response) => {
  let { playerId } = request.params;
  let playerStackQuery = `SELECT 
                                player_details.player_id as playerId,
                                player_details.player_name as playerName,
                                sum(player_match_score.score) as totalScore, 
                                sum(player_match_score.fours) as totalFours,
                                sum(player_match_score.sixes) as totalSixes
                            FROM player_details LEFT JOIN player_match_score ON 
                                player_details.player_id = player_match_score.player_id
                                WHERE player_details.player_id = ${playerId}`;
  let playerStack = await DB.get(playerStackQuery);
  response.send(playerStack);
});
module.exports = app;
