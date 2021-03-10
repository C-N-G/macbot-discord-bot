const util = require('../util/util.js');
module.exports = {
  name: 'timer',
  aliases: ['tmr'],
  description: 'Sets up a timer to notify you after a designated amount of time',
  usage: '<duration|stop|check>',
  cooldown: 2,
  guildOnly: false,
  args: true,
  execute(message, args) {

    function start_timer(length) {
      // starts the timer

      if (!does_timer_exist()) { // clear any previous timers
        message.channel.send('Timer started');
      } else {
        clearTimeout(people.get(message.author.id).timer.timeout);
        message.channel.send('Timer started. Overrided previous timer');
      }
      let timer = setTimeout(notification, length*1000);
      people.set(message.author.id, {
        timer: {
          timeout: timer,
          timerStarted: Date.now(),
          timerTarget: Date.now() + length*1000
        }
        
      });

    }

    function notification() {
      // sends the notification message

      message.reply("Your timer has elapsed");
      people.get(message.author.id).timer = undefined;

    }

    function stop_timer() {
      // stops the timer from elapsing

      
      if (!does_timer_exist()) {
        return message.channel.send('You do not currently have a timer set');
      }
      let timer = people.get(message.author.id).timer;
      clearTimeout(timer.timeout);
      people.get(message.author.id).timer = undefined;
      message.channel.send('Your timer has been cancelled');

    }

    function check_timer() {

      if (!does_timer_exist()) {
        return message.channel.send('You do not have any active timers');
      }

      let timer = people.get(message.author.id).timer;
      let timeLeft = timer.timerTarget - Date.now();
      timeLeft = util.convert_named_time(timeLeft/1000);
      message.channel.send(`You have ${timeLeft} left in your timer`);



    }

    function does_timer_exist() {
      // checks if a user and timer exists in the bot
      if (people.get(message.author.id) == undefined || people.get(message.author.id).timer == undefined) {
        return false;
      } else {
        return true;
      }
      
    }

    function format_length(args) {
      // parse a string and returns the number of hours/minutes/seconds found in seconds

      let string = args.join(' ');

      let time = {
        seconds: string.match(/([\d]+\s?(second|sec|s)(s)?)/g),
        minutes: string.match(/([\d]+\s?(minute|min|m)(s)?)/g),
        hours: string.match(/([\d]+\s?(hour|hr|h)(s)?)/g)
      };

      let length = 0;

      if (time.seconds) {
        time.seconds.forEach(ele => { 
          length += Number(ele.match(/([\d]+)/g)); 
        });
      }
      
      if (time.minutes) {
        time.minutes.forEach(ele => { 
          length += 60*Number(ele.match(/([\d]+)/g)); 
        });
      }
      
      if (time.hours) {
        time.hours.forEach(ele => { 
          length += 60*60*Number(ele.match(/([\d]+)/g)); 
        });
      }

      return length;

    }

    const client = message.client;
    const people = client.people;

    if (args[0] == 'stop') {
      return stop_timer();
    } else if (args[0] == 'check') {
      return check_timer();
    }

    let length = format_length(args);

    if (length > 43200000) {
      return message.channel.send('The maximum length of timers is 12 hours. Please choose a shorter length');
    } else if (length == 0) {
      return message.channel.send('You did not provide enough time to make a timer');
    }

    start_timer(length);


  }
};