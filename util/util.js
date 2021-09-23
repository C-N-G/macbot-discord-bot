module.exports = {

  get_time_from_text(input) {
    // hh:mm:ss
    let regex = /(\d{1,2}:\d{1,2}:\d{1,2})|(\d{1,2}:\d{1,2})|(\d{1,2})/g;
    const arr_matches = [...input.matchAll(regex)];
    if (!regex.test(input) || input.length > 8 || arr_matches.length > 1) return false;
    let times = input.split(':');
    let seconds = 0;
    if (times.length === 3) seconds += (parseInt(times[0]) * 60 * 60);
    if (times.length === 2) seconds += (parseInt(times[times.length - 2]) * 60);
    seconds += (parseInt(times[times.length - 1]));
    return seconds;
  },

  convert_time (seconds) {
    if (seconds < 60) {
      return `${Math.floor(seconds)}`;
    }

    let minutes = Math.floor(seconds/60);
    let returnSeconds = Math.floor(seconds - minutes*60);
    if (returnSeconds < 10) returnSeconds = '0' + returnSeconds;

    if (minutes < 60) {
      return `${minutes}:${returnSeconds}`;
    }

    let hours = Math.floor(seconds/60/60);
    minutes -= hours*60;
    if (minutes < 10) minutes = '0' + minutes;
    return `${hours}:${minutes}:${returnSeconds}`;
  },

  convert_named_time (seconds) {
    if (seconds < 60) {
      return `${Math.floor(seconds)} seconds`;
    }

    let minutes = Math.floor(seconds/60);
    let returnSeconds = Math.floor(seconds - minutes*60);
    if (returnSeconds < 10) returnSeconds = '0' + returnSeconds;

    if (minutes < 60) {
      return `${minutes} minutes ${returnSeconds} seconds`;
    }

    let hours = Math.floor(seconds/60/60);
    minutes -= hours*60;
    if (minutes < 10) minutes = '0' + minutes;
    return `${hours} hours ${minutes} minutes ${returnSeconds} seconds`;
  },

  check_bot_location (interaction, location) {
    if (location === 'same-voice') {
      const voiceChannel = interaction.member.voice.channelId;
      if (!interaction.guild.me.voice.channelId) {
        return false;
      }
      const botVoiceChannel = interaction.guild.me.voice.channelId;
      if (!voiceChannel || voiceChannel !== botVoiceChannel) {
        return false;
      } else {
        return true;
      }
    } else if (location === 'in-voice') {
      if (!interaction.guild.me.voice.channelId) {
        return false;
      } else {
        return true;
      }
    }
  },

  sort(array) {
    /*
    takes in array of values
    sets the first array value as the smallest
    loops through the array and checks if any value is smaller than smallest
    if it is smaller then set the smallest to that values
    push the smallest value into the return array
    remove the smallest value from the input array
    set the smallest var to the first value of this new input array
    repeat until done
    */

    let values = [];
    let smallest = array[0];
    const loops = array.length;

    while (values.length < loops) {
      for(var i = 0; i < array.length; i++) {
        if (array[i] <= smallest) smallest = array[i];
      }
    values.push(smallest);
    array.splice(array.indexOf(smallest), 1);
    smallest = array[0];
    }

    return values;
  },

  random(input) {
    return Math.round(Math.random()*Math.round(input));
  },

  get_time() {
    const now = new Date();
    return `[${now.getDate()}/${now.getMonth()+1}/${now.getFullYear()} ${now.getHours()}:${now.getMinutes()}]`;
  }

};
