const util = require('../util/util.js');
const fs = require('fs').promises;
const fs1 = require('fs');

const emojis = [
  '🇦','🇧','🇨','🇩','🇪','🇫','🇬','🇭','🇮','🇯','🇰','🇱','🇲',
  '🇳','🇴','🇵','🇶','🇷','🇸','🇹'
];

const capitals = [
  'A','B','C','D','E','F','G','H','I','J','K','L','M',
  'N','O','P','Q','R','S','T'
];

function simulate_runoff(ballots) {

  let votes = {};
  let weights = {};
  let totalVotes, highestVote, lowestVote, lowestVotedItem, lowestWeight;

  // count first preference votes
  for (const user in ballots) {
    if (!votes[ballots[user][0]]) {
      votes[ballots[user][0]] = 1;
      continue;
    }
    votes[ballots[user][0]]++;
  }

  // do a borda count to resolve ties
  let i;
  for (const voter in ballots) {
    i = ballots[voter].length;
    for (const voteItem of ballots[voter]) {
      if (!weights.hasOwnProperty(voteItem)) {
        weights[voteItem] = i;
      } else {
        weights[voteItem] += i;
      }
      i--;
    }
  }

  i = 0; //DEBUG

  let winner = false;
  while (winner == false) {

    // cacluate highest voted item
    highestVote = 0;
    totalVotes = 0;
    for (const option in votes) {
      totalVotes += votes[option];
      if (votes[option] > highestVote) highestVote = votes[option];
    }

    // if there is a majority winner from this calcultion then consider a winner chosen
    if (highestVote / totalVotes > 0.5) break;

    // else find the item with fewest first votes
    lowestVote = highestVote;
    lowestVotedItem = undefined;
    for (const option in votes) {
      if (votes[option] < lowestVote) {
        lowestVote = votes[option];
        lowestVotedItem = option;
      }
    }

    // if there is no lowest voted item then use borda count to determine lowest option
    lowestWeight = 0;
    if (lowestVotedItem == undefined) {
      for (const option in votes) {
        if (weights[option] > lowestWeight) {
          lowestWeight = weights[option];
          lowestVotedItem = option;
        }
      }
    }

    // redistribute votes from the lowest voted option to the next preference for those voters
    for (const user in ballots) {

      if (ballots[user][0] != lowestVotedItem) continue;// check if voter voted for lowest option

      let voidBallot = false;
      while (voidBallot == false) {

        if (votes.hasOwnProperty(ballots[user][1])) { // check if ballot has a valid second prefernce vote
          votes[ballots[user][1]]++; // if yes then redistribute vote
          ballots[user].shift();
          break;
        } else {
          ballots[user].shift(); // if no then remove first preference vote
        }

        if (ballots[user].length == 1) { // if there is no lower preference to distribute votes then consider that ballot void
          delete ballots[user];
          voidBallot = true;
        }

      }

    }

    // remove the item with the fewest votes
    delete votes[lowestVotedItem];

    // if item holds majoirty of the votes then consider a winner chosen
    if (highestVote / totalVotes >= 0.5) winner = true;

    i++; // DEBUG
    if (i > 2000) {
      return "FAILED";
    }

  }

  return votes;

}

function check_file() {
  try {
    if (fs1.existsSync('./test/poll_testCase.txt')) {
      return true;
    } else {
      return false;
    }
  } catch (e) {
    console.log(e);
  }
}

module.exports = async function run_tests() {
  let testCase = {};
  if (check_file()) {
    let data = await fs.readFile('./test/poll_testCase.txt', 'utf8');
    testCase = JSON.parse(data);
  } else {
    for (let i = 0; i < 5; i++) {
      let ballots = [];
      let options = emojis.slice();
      for (let j = 0; j < emojis.length; j++) {
        ballots.push(options.splice(util.random(options.length - 1),1));
      }
      testCase[i] = ballots;
    }
  }

  let result = simulate_runoff(testCase);
  if (result == 'FAILED') {
    if(!check_file()) {
      await fs.writeFile('./test/poll_testCase.txt', JSON.stringify(testCase))
    }
    console.log('FAILED');
  } else {
    console.log('SUCCESS');
    console.log(result);
  }
};
