const robot = require("robotjs");
const screenshot = require('screenshot-node');
const tesseract = require('node-tesseract');
const Observable = require('rxjs/Observable').Observable;
const Rx = require('rxjs')
const Simulator = require('./pokery/lib').Simulator
const Hand = require('./pokery/lib').Hand

const Rounds = {
    Pre: 0,
    Flop: 1,
    Turn: 2,
    River: 3
}
const myCardWidth = 84
const tableCardWidth = 91

let acted = false
let currentRound
let hand
let myCards = []
let pot
let stack
let tableCards = []


let myTurnPos = {
    x: 1496, // grey border around far right button
    y: 899
}
console.log('init')

// const sim = new Simulator(['AhAd', 'KK', 'JTs', '72o'], []).run();
// console.log(sim)

setInterval(() => {
    if(isMyTurn()) {
        console.log('\n')
        getMyCards()
        // getPot().subscribe((res) => {
        //     pot = res
        //     console.log('pot: ', pot)
        // })
        // getStack().subscribe((res) => {
        //     stack = res
        //     console.log('stack: ', stack)
        // })
        // getCallSize().subscribe((x) => {
        //     console.log('callSize: ', x)
        // })
        console.log('villains: ', countVillains())

        getTableCards().subscribe(() => {
            if(currentRound === 0) { // Preflop
                if(!preflopRange()) {
                    fold()
                } else {
                    getCallSize().subscribe((x) => {
                        console.log('callSize: ', x)
                        if (x < 1000) {
                            call()
                        } else {
                            fold()
                        }
                    })
                }
            } else if(currentRound === 1) { // Flop
                console.log('hand: ' + myCards[0] + myCards[1] + tableCards[0] + tableCards[1] + tableCards[2])
                // append 'o' for offsuit so it doesn't false flush
                hand = new Hand([myCards[0]+'c', myCards[1]+'s', tableCards[0]+'d', tableCards[1]+'o', tableCards[2]+'o']);
                console.log('hand: ', hand)
                // console.log('hand.strength: ', hand.strength)
                getCallSize().subscribe((callSize) => {
                    console.log('callSize: ', callSize)
                    if (!callSize) { // no bet so we can check/call
                        call()
                    } if (hand.strength >= 3) {
                        call()
                    } else if (hand.strength >= 2 && callSize <= 1000){
                        call()
                    } else if (hand.strength >= 1 && callSize <= 500){
                        call()
                    }else {
                        fold()
                    }
                })
            } else if(currentRound === 2) { // Turn
                console.log('hand: ' + myCards[0] + myCards[1] + tableCards[0] + tableCards[1] + tableCards[2] + tableCards[3]+'o')
                hand = new Hand([myCards[0]+'c', myCards[1]+'s', tableCards[0]+'d', tableCards[1]+'o', tableCards[2]+'o', tableCards[3]+'o']);
                console.log('hand: ', hand)
                // console.log('hand.strength: ', hand.strength)
                    getCallSize().subscribe((callSize) => {
                    console.log('callSize: ', callSize)
                    if (!callSize) { // no bet so we can check/call
                        call()
                    } if (hand.strength >= 3) {
                        call()
                    } else if (hand.strength >= 2 && callSize <= 1000){
                        call()
                    } else if (hand.strength >= 1 && callSize <= 500){
                        call()
                    }else {
                        fold()
                    }
                })
            } else if(currentRound === 3) { // River
                console.log('hand: ' + myCards[0] + myCards[1] + tableCards[0] + tableCards[1] + tableCards[2] + tableCards[3]+'o' + tableCards[4]+'o')
                hand = new Hand([myCards[0]+'c', myCards[1]+'s', tableCards[0]+'d', tableCards[1]+'o', tableCards[2]+'o', tableCards[3]+'o', tableCards[4]+'o']);
                console.log('hand: ', hand)
                // console.log('hand.strength: ', hand.strength)
                getCallSize().subscribe((callSize) => {
                    console.log('callSize: ', callSize)
                    if (!callSize) { // no bet so we can check/call
                        call()
                    } if (hand.strength >= 3) {
                        call()
                    } else if (hand.strength >= 2 && callSize <= 1000){
                        call()
                    } else if (hand.strength >= 1 && callSize <= 500){
                        call()
                    }else {
                        fold()
                    }
                })
            }

        })
    }
}, 1000)

function isMyTurn() {
    return robot.getPixelColor(myTurnPos.x, myTurnPos.y) === '696969'
}

function countVillains() {
    let count = 0
    let villainCardPos = [
        {x: 386, y:524},
        {x: 386, y: 241},
        {x: 880, y: 130},
        {x: 1377, y: 237},
        {x: 1377, y: 237}
    ]
    villainCardPos.map((item) => {
        if (robot.getPixelColor(item.x, item.y) === 'e6e6e6') {
            count++
        }
    })
    return count
}

function fold() {
    let wait = randomWait()
    setTimeout(() => {
        console.log('Fold')
        robot.keyTap('f')
    }, wait)
}

function call() {
    let wait = randomWait()
    setTimeout(() => {
        console.log('Call')
        robot.keyTap('a')
    }, wait)
}

function check() {
    let wait = randomWait()
    setTimeout(() => {
        console.log('Check')
        robot.keyTap('c')
    }, wait)
}

function preflopRange() {
    return (
        (myCards[0] === myCards[1]) ||              // any pair
        (isNaN(myCards[0]) && isNaN(myCards[1]))    // both cards T or greater
    )
}

function randomWait() {
    let min = 1
    let max = 200
    return Math.floor(Math.random()*(max-min+1)+min);
}

function getCallSize() {
    return Observable.create((observer) => {
        let x = 1220
        let y = 935
        // 1325, 961
        let width = 100
        let height = 30

        let path = __dirname + '\\img\\'
        let filename = 'callSize' + '.jpg'
        let destination = path + filename
        const options = {
            psm: 7 // single line of text.
        };
        screenshot.saveScreenshot(x, y, width, height, destination, (err) => {
            if (err){
                console.log(err)
            }
        })

        // Recognize text of any language in any format
        const image = destination

        tesseract.process(image, options, (err, text) => {
            if (err) {
                console.error(err);
            } else {
                text = cleanText(text)
                observer.next(text)
                observer.complete()
            }
        });
    })

}
function getMyCard(cardNum) {
    return Observable.create((observer) => {
        let x = 878 + cardNum * myCardWidth
        let y = 640
        let width = 29
        let height = 32

        let path = __dirname + '\\img\\'
        let filename = 'myCard' + cardNum + '.jpg'
        let destination = path + filename
        const options = {
            psm: 10, // allow single character recognition
        };
        screenshot.saveScreenshot(x, y, width, height, destination, (err) => {
            if (err){
                console.log(err)
            }
        })

        // Recognize text of any language in any format
        const image = destination

        tesseract.process(image, options, (err, text) => {
            if (err) {
                console.error(err);
            } else {
                text = cleanText(text)
                observer.next(text)
                observer.complete()
            }
        });
    })

}

function getMyCards() {
    Rx.Observable.forkJoin(
        getMyCard(0),
        getMyCard(1)
    ).subscribe((res) => {
        // console.log('res[0] ', res[0] )
        // console.log('res[1] ', res[1] )
        myCards[0] = cardMap(res[0])
        myCards[1] = cardMap(res[1])
        console.log(myCards)
    })
}

function getTableCards() {
    return Rx.Observable.forkJoin(
        getTableCard(0),
        getTableCard(1),
        getTableCard(2),
        getTableCard(3),
        getTableCard(4)
    ).map((res) => {
        if (res[1] == ';') {
            // Preflop
            currentRound = Rounds.Pre
            tableCards = [null, null, null, null, null]
        } else if (res[3] === 'u') {
            // Flop
            currentRound = Rounds.Flop
            tableCards = [cardMap(res[0]), cardMap(res[1]), cardMap(res[2]), null, null]
        } else if (res[4] === '_') {
            // Turn
            currentRound = Rounds.Turn
            tableCards = [cardMap(res[0]), cardMap(res[1]), cardMap(res[2]), cardMap(res[3]), null]
        } else {
            // River
            currentRound = Rounds.River
            tableCards = [cardMap(res[0]), cardMap(res[1]), cardMap(res[2]), cardMap(res[3]), cardMap(res[4])]
        }
        console.log('currentRound: ', currentRound)
        console.log('table: ', tableCards)
    })
}
function getPot() {
    return Observable.create((observer) => {
        let x = 890
        let y = 320
        let width = 160
        let height = 30
        let path = __dirname + '\\img\\'
        let filename = 'pot.jpg'
        let destination = path + filename

        screenshot.saveScreenshot(x, y, width, height, destination, (err) => {
            if (err){
                console.log(err)
            }
        })

        // Recognize text of any language in any format
        const image = destination
        const options = {
            psm: 7, // single line of text
        };
        tesseract.process(image, options, (err, text) => {
            if (err) {
                console.error(err);
            } else {
                text = cleanText(text)

                observer.next(text)
                observer.complete()
            }
        });
    })

}

function getStack() {
    return Observable.create((observer) => {
        let x = 930
        let y = 750
        let width = 160
        let height = 30
        let path = __dirname + '\\img\\'
        let filename = 'stack.jpg'
        let destination = path + filename

        screenshot.saveScreenshot(x, y, width, height, destination, (err) => {
            if (err){
                console.log(err)
            }
        })

        // Recognize text of any language in any format
        const image = destination
        const options = {
            psm: 7, // single line of text
        };
        tesseract.process(image, options, (err, text) => {
            if (err) {
                console.error(err);
            } else {
                text = cleanText(text)

                observer.next(text)
                observer.complete()
            }
        });
    })

}

function getTableCard(cardNum) {
    return Observable.create((observer) => {
        let x = 737 + cardNum * tableCardWidth
        let y = 375
        let width = 29
        let height = 32

        let path = __dirname + '\\img\\'
        let filename = 'tableCard' + cardNum + '.jpg'
        let destination = path + filename
        const options = {
            psm: 10, // allow single character recognition
        };
        screenshot.saveScreenshot(x, y, width, height, destination, (err) => {
            if (err){
                console.log(err)
            }
        })

        // Recognize text of any language in any format
        const image = destination

        tesseract.process(image, options, (err, text) => {
            if (err) {
                console.error(err);
            } else {
                text = cleanText(text)
                observer.next(text)
                observer.complete()
            }
        });
    })

}
function cleanText(text) {
    text = JSON.stringify(text)
    // remove the word 'Pot:' and '\n' and '"' and ',' and ' '
    text = text.replace(/Pot: |"|'|\\n|V|f|,| /gi, '')
    // replace o with 0
    text = text.replace(/o/gi, '0')
    // replace s with 5
    text = text.replace(/s/gi, '5')
    // replace m with 10
    text = text.replace(/m/gi, '10')
    return text
}

function cardMap (key) {
    if(key =='2') {
        return '2'
    }
    if(key =='3') {
        return '3'
    }
    if(key =='4') {
        return '4'
    }
    if(key =='5') {
        return '5'
    }
    if(key =='6') {
        return '6'
    }
    if(key =='7') {
        return '7'
    }
    if(key =='8') {
        return '8'
    }
    if(key =='9') {
        return '9'
    }
    if(key =='10') {
        return 'T'
    }
    if(key =='J') {
        return 'J'
    }
    if(key =='Q') {
        return 'Q'
    }
    if(key =='0') {
        return 'Q'
    }
    if(key =='K') {
        return 'K'
    }
    if(key =='A') {
        return 'A'
    }
}
