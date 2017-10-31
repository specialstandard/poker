const Simulator = require('./pokery/lib').Simulator
const Hand = require('./pokery/lib').Hand

const hand = new Hand(['5o', 'Q', '5o', '7o', '7o']);
console.log('hand: ', hand)

// const sim = new Simulator(['AhAd', 'KK', 'JTs', '72o'], []).run();
// console.log(sim)