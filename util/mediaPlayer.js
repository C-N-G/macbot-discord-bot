const { 
  VoiceConnectionStatus, 
  entersState, 
  getVoiceConnection, 
  joinVoiceChannel, 
  createAudioPlayer, 
  createAudioResource,
  AudioPlayerStatus, 
  StreamType
} = require('@discordjs/voice');
const ytdl = require('ytdl-core');
const yts = require('yt-search');
const util = require('./util.js');
const fs = require('fs');
const prism = require('prism-media');
const { MessageEmbed } = require('discord.js');

module.exports = {
  async play(interaction, seekTime) {

    const server = this.get_server(interaction);
    const queue = server.queue;

    this.remove_disconnect_timer(interaction);

    if (server.removeAllTimeout) { //remove timout for deleting entire cache if new song is being played
      clearTimeout(server.removeAllTimeout);
    }

    let audio = queue[0];
    let input;
    let player;
    let resource;

    if (!server.playing) {

      player = createAudioPlayer();
      
      player.on(AudioPlayerStatus.Idle, () => {
  
        server.seekTime = '';

        if (server.looping) return this.play(interaction);

        this.play_next_item(interaction);
  
      });

      player.on(AudioPlayerStatus.Paused, () => {
        if (server.aloneInChannel) {
          const embed = new MessageEmbed()
            .setColor('AQUA')
            .setDescription(`Audio source paused due to empty voice channel`);
          interaction.channel.send({ embeds: [embed] });
        }
        this.start_disconnect_interval(interaction, 10);
      });

      player.on(AudioPlayerStatus.Playing, () => {
        this.remove_disconnect_interval(interaction);
      });

    } else {
      player = server.playing;
    }

    if (audio.cached) { //play from cached file if it exists

      server.playing_cached = true;

      if (!seekTime) seekTime = 0;
      const file = `./data/music_cache/${interaction.guild.id}_${audio.id}.webm`;
      input = new prism.FFmpeg({
        args: [
          '-ss', seekTime,
          '-i', file,
          '-analyzeduration', '0',
          '-loglevel', '0',
          '-f', 's16le',
          '-ar', '48000',
          '-ac', '2',
        ],
      });
      server.ffmpeg = input.process;
      resource = createAudioResource(input, { inputType: StreamType.Raw });
      

    } else { //else stream directly

      server.playing_cached = false;

      input = ytdl(`https://www.youtube.com/watch?v=${audio.id}`, {filter: 'audioonly', highWaterMark: 1<<25});
      resource = createAudioResource(input, { inputType: StreamType.Arbitrary });

    }

    const connection = getVoiceConnection(interaction.guildId);
    connection.subscribe(player);

    player.play(resource);
    server.playing = player;

    if (!seekTime) {
      if (server.nowPlayingMessage && server.nowPlayingMessage.deletable) await server.nowPlayingMessage.delete();
      const queueItem = audio;
      const embed = new MessageEmbed()
        .setColor('AQUA')
        .setDescription(`[${util.convert_time(queueItem.timeLength)}] [${queueItem.title}](${queueItem.link}) now playing \n Requested by <@${queueItem.userId}>`);
      let msg = await interaction.channel.send({ embeds: [embed] });
      server.nowPlayingMessage = msg;
    }

  },

  play_next_item(interaction) {

    const server = this.get_server(interaction);
    const queue = server.queue;
    if (queue.length > 1) {// if is 2 or more then play next item
      this.clear_single_cache(interaction);
      queue.shift();
      this.play(interaction);
    } else if (server.playing) {// otherwise only 1 item in queue so commence shutdown
      this.clear_server(interaction);
      this.start_disconnect_timer(interaction, 30);
    }

  },

  async add_item_to_queue(interaction, url) {

    const server = this.get_server(interaction);
    
    if (!server.queue) {
      server.queue = [];
    }

    const queue = server.queue;

    if (!ytdl.validateURL(url)) {
      return await interaction.editReply('Cannot parse valid ID from URL.');
    }

    this.remove_disconnect_timer(interaction);
    const info = await ytdl.getInfo(url);
    
    const videoId = info.player_response.videoDetails.videoId;
    const title = info.player_response.videoDetails.title;
    const timeLength = info.player_response.videoDetails.lengthSeconds;
    const link = url;
    const userId = interaction.member.id;

    if (queue.find(ele => ele.id === videoId)) return await interaction.editReply('That item is already in the queue.');
    const queueItem = {id: videoId, title: title, timeLength: timeLength, link: link, cached: false, userId: userId};
    queue.push(queueItem);

    if (timeLength <= 5400) {
      ytdl(`https://www.youtube.com/watch?v=${queueItem.id}`, {filter: 'audioonly'})
      .pipe(
        fs.createWriteStream(`./data/music_cache/${interaction.guild.id}_${queueItem.id}.webm`)
        .on('close', () => {
          if (queue.find(item => item.id === queueItem.id)) {
            queue.find(item => item.id === queueItem.id).cached = true;
          }
        })
      );
    }

    const embed = new MessageEmbed()
      .setColor('AQUA')
      .setDescription(`[${util.convert_time(queueItem.timeLength)}] [${queueItem.title}](${queueItem.link}) added to queue`);
    await interaction.editReply({ embeds: [embed]});

    if (!server.playing) {
      this.play(interaction);
    }

  },

  join_voice_channel(interaction) {

    const server = this.get_server(interaction);

    server.voiceChannel = interaction.member.voice.channelId;

    let connection = getVoiceConnection(interaction.guild.id);

    if (connection) return connection;

    connection = joinVoiceChannel({
      channelId: interaction.member.voice.channel.id,
      guildId: interaction.guild.id,
      adapterCreator: interaction.channel.guild.voiceAdapterCreator,
    });
    
    connection.on(VoiceConnectionStatus.Destroyed, () => {
      if (server.queue) this.clear_server(interaction);
    });

    connection.on(VoiceConnectionStatus.Disconnected, async () => {
      try {
        await Promise.race([
          entersState(connection, VoiceConnectionStatus.Signalling, 3000),
          entersState(connection, VoiceConnectionStatus.Connecting, 3000),
        ]);
        // Seems to be reconnecting to a new channel - ignore disconnect
      } catch (error) {
        // Seems to be a real disconnect which SHOULDN'T be recovered from
        connection.destroy();
      }
    });
    

  },

  get_server(interaction) {
    const client = interaction.guild.client;
    const thisServer = interaction.guild.id;
    if (!client.servers.has(thisServer)) client.servers.set(thisServer, {id: thisServer});
    const server = client.servers.get(interaction.guild.id);
    return server;
  },

  async clear_server(interaction) {
    const server = this.get_server(interaction);

    if (server.playing_cached) {
      server.ffmpeg.kill();
    }

    if (server.removeAllTimeout) {
      clearTimeout(server.removeAllTimeout);
    }

    server.removeAllTimeout = setTimeout(() => {
      this.clear_all_cache(interaction);
    }, 5*1000);

    if (server.nowPlayingMessage && server.nowPlayingMessage.deletable) await server.nowPlayingMessage.delete();
    clearInterval(server.seekCache);
    server.queue = [];
    if (server.playing) await server.playing.stop();
    server.playing = '';
    server.seekTime = '';
    server.nowPlayingMessage = '';
  },

  clear_single_cache(interaction) {

    const server = this.get_server(interaction);

    let audio = server.queue[0];

    if (server.playing_cached) {
          
      server.ffmpeg.kill();

      setTimeout(() => { //give a grace period for ffmpeg to close
        fs.unlink(`./data/music_cache/${interaction.guild.id}_${audio.id}.webm`, (err) => {
          if (err) console.log(err);
        });
      }, 5*1000);

    } else if (audio.cached) { //otherwise remove immediately

      fs.unlink(`./data/music_cache/${interaction.guild.id}_${audio.id}.webm`, (err) => {
        if (err) console.log(err);
      });

    }
  },

  clear_all_cache(interaction) {

    let files = fs.readdirSync("./data/music_cache/");

    files = files.filter(file => file.includes(interaction.guild.id));

    files.forEach(file => {
      fs.unlink(`./data/music_cache/${file}`, (err) => {
        if (err) console.log(err);
      });
    });

  },

  async search_youtube(search) {
    const options = {
      query: search,
      pageStart: 1,
      pageEnd: 1
    };

    const result = await yts(options);
    
    const video = result.videos[0].url;
    if (video.startsWith('http')) {
      return video;
    } else {
      console.log('Error getting video url, please update bot');
      return undefined;
    }

  },

  start_disconnect_timer(interaction, minutes) {
    const server = this.get_server(interaction);
    const msTimeToDisconnect = minutes*60*1000;
    server.dcTimer = setTimeout(() => {
      this.disconnect_bot(interaction);
    }, msTimeToDisconnect);
  },

  remove_disconnect_timer(interaction) {
    const server = this.get_server(interaction);
    if (!server.dcTimer) return;
    clearTimeout(server.dcTimer);
  },

  start_disconnect_interval(interaction, minutes) {
    const server = this.get_server(interaction);
    const msTimeToDisconnect = minutes*60*1000;
    server.dcInterval = setInterval(() => {
      if (!server.aloneInChannel) return;
      this.disconnect_bot(interaction);
      const embed = new MessageEmbed()
        .setColor('AQUA')
        .setDescription(`I have left the voice channel due to loneliness.`);
      interaction.channel.send({ embeds: [embed] });
    }, msTimeToDisconnect);
  },

  remove_disconnect_interval(interaction) {
    const server = this.get_server(interaction);
    if (!server.dcInterval) return;
    clearInterval(server.dcInterval);
  },

  disconnect_bot(interaction) {
    const server = this.get_server(interaction);
    if (server.dcInterval) this.remove_disconnect_interval(interaction);
    if (server.dcTimer) this.remove_disconnect_timer(interaction);
    let connection = getVoiceConnection(interaction.guild.id);
    connection.destroy();
  }

};