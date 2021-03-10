const Discord = require('discord.js');
const canvas = require('../util/canvas.js');
module.exports = {
  name: 'chess',
  aliases: ['startchess', 'playchess'],
  description: 'Starts a chess game',
  usage: '<args> ...',
  cooldown: 10,
  guildOnly: true,
  args: true,
  execute(message, args) {

    function chess_game (player1, player2, gameState, boardState){

      // player 1
      this.player1 = player1;
      
      // player 2
      this.player2 = player2;

      // state of the current game
      // 0 = player 1 turn
      // 1 = player 2 turn
      // 2 = match ended
      this.gameState = gameState;

      // state of the game board i.e. all of the piece positions
      this.boardState = boardState;

    }

    function new_chess_game (){

      let coords = [
        ['br', 'bk', 'bb', 'be', 'bq', 'bb', 'bk', 'br',''],
        ['bp', 'bp', 'bp', 'bp', 'bp', 'bp', 'bp', 'bp'],
        ['em', 'em', 'em', 'em', 'em', 'em', 'em', 'em'],
        ['em', 'em', 'em', 'em', 'em', 'em', 'em', 'em'],
        ['em', 'em', 'em', 'em', 'em', 'em', 'em', 'em'],
        ['em', 'em', 'em', 'em', 'em', 'em', 'em', 'em'],
        ['wp', 'wp', 'wp', 'wp', 'wp', 'wp', 'wp', 'wp'],
        ['wr', 'wk', 'wb', 'we', 'wq', 'wb', 'wk', 'wr']
      ];

      if (!message.client.chessGames.get(message.guild.id)) {
        message.client.chessGames.set(message.guild.id, new chess_game(message.author.id, message.author.id, 0, coords));
      } else if (message.client.chessGames.get(message.guild.id).gameState == 2) {
        message.client.chessGames.set(message.guild.id, new chess_game(message.author.id, message.author.id, 0, coords));
      } else {
        return false;
      }

      const chessGame = message.client.chessGames.get(message.guild.id);

      return chessGame;

    }

    function determine_move (chessGame, move){

      // RETURNS TRUE OR FALSE IF MOVE IS VALD

      // see if given move is correct syntax
      // check if move is valid on the game board
      // update game board with new move
      // update game state to other player
      
      const regex = /([a-h][1-8]|[1-8][a-h]) to ([a-h][1-8]|[1-8][a-h])/;
      if (!regex.test(move)) {
        return false;
      }

      let origin = {
        x: convert_move_input(move.slice(0, 2))[0],
        y: convert_move_input(move.slice(0, 2))[1]
      };
      let destination = {
        x: convert_move_input(move.slice(6))[0],
        y: convert_move_input(move.slice(6))[1]
      };
      let piece = chessGame.boardState[origin.y][origin.x];

      // invalidate move if origin is empty space
      if (piece == 'em') return false;

      // invalidaate if trying to move piece to tile it is already on
      if(origin.x == destination.x && origin.y == destination.y) return false;

      // check if move is valid for each individual piece
      // since each piece has different movement characteristics

      return true;

    }

    function convert_move_input (move){

      let strArr = move.split('');
      if (!isNaN(strArr[0])) { // if number is at the start put it at the end for consistent input
        strArr.reverse();
      }

      switch (strArr[0]) {
        case 'a':
          strArr[0] = 0;
          break;
        case 'b':
          strArr[0] = 1;
          break;
        case 'c':
          strArr[0] = 2;
          break;
        case 'd':
          strArr[0] = 3;
          break;
        case 'e':
          strArr[0] = 4;
          break;
        case 'f':
          strArr[0] = 5;
          break;
        case 'g':
          strArr[0] = 6;
          break;
        case 'h':
          strArr[0] = 7;
          break;
      }

      strArr[1] = parseInt(strArr[1]) - 1; // lower the numerical value by one to start at 0

      return strArr.join('');

    }

    function perform_move (chessGame, move){

      // updates the board state with the designated move order

      let origin = {
        x: convert_move_input(move.slice(0, 2))[0],
        y: convert_move_input(move.slice(0, 2))[1]
      };
      let destination = {
        x: convert_move_input(move.slice(6))[0],
        y: convert_move_input(move.slice(6))[1]
      };
      let piece = chessGame.boardState[origin.y][origin.x];

      chessGame.boardState[origin.y][origin.x] = 'em';
      chessGame.boardState[destination.y][destination.x] = piece;
      
    }

    async function update_board (chessGame){

      // darw game board from given board state
      // await new move
      // repeat

      const embed = new Discord.MessageEmbed().setColor('AQUA').setTitle(`Chess WIP`);
      const chessboard = canvas.draw_chessboard(chessGame.boardState);
      const image = new Discord.MessageAttachment(chessboard, 'canvas.png');
      embed.setImage('attachment://canvas.png');
      let msg = await message.channel.send({files: [image], embed: embed});

      const filter = (m) => {

        // if message doesn't come from eihter player then ignore
        if (m.author != chessGame.player1 || m.author != chessGame.player2) return false;

        // if move is invald then ignore
        const move = determine_move(chessGame, m.content);
        if (move == false) return false;

        return true;

      };
      message.channel.awaitMessages(filter, {max: 1, time: 30*1000})
      .then(move => {

        if (move.size == 1) {

          perform_move(chessGame, move.first().content);
          msg.delete();
          update_board(chessGame);

        } else {

          message.channel.send('turn timeout game over');
          chessGame.gameState = 2;

        }

      });
    }

    let chessGame = new_chess_game();
    if (!chessGame) {
      return message.channel.send('A chess game is already in progresson in this server');
    }

    update_board(chessGame);

  }
};
