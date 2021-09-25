const mediaPlayer = require('../util/mediaPlayer.js');

module.exports = {
	name: 'voiceStateUpdate',
	execute(oldState, newState) {

    const server = mediaPlayer.get_server(newState);

    const botChannel = newState.guild.me.voice.channel;

    if (!botChannel) {
      return;
    }

    if (botChannel.members.size <= 1) {
      server.aloneInChannel = true;
    } else {
      server.aloneInChannel = false;
    }

    if (server.aloneInChannel && server.playing && server.playing.state.status === 'playing') {
      server.playing.pause();
    }

	}
};