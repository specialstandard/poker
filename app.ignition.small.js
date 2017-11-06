const robot = require("robotjs");
const screenshot = require('screenshot-node');
const tesseract = require('node-tesseract');
const Observable = require('rxjs/Observable').Observable;
const Rx = require('rxjs')
const Simulator = require('./pokery/lib').Simulator
const Hand = require('./pokery/lib').Hand

const BigBlind = 100
const Rounds = {
    Pre: 0,
    Flop: 1,
    Turn: 2,
    River: 3
}
const myCardWidth = 44
const tableCardWidth = 120

let acted = false
let currentRound
let hand
let myCards = []
let pot
let stack
let tableCards = []


let myTurnPos = {
    x: 1578, // grey box under my cards
    y: 530
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
        // console.log('villains: ', countVillains())


        // getTableCards().subscribe(() => {
        //     getCallSize().subscribe((x) => {
        //         console.log('callSize: ', x)
        //     })
        // })


        // getTableCards().subscribe(() => {
        //     if(currentRound === 0) { // Preflop
        //         if(!preflopRange()) {
        //             fold()
        //         } else {
        //             getCallSize().subscribe((x) => {
        //                 console.log('callSize: ', x)
        //                 if (bigPocket() || AK()) {
        //                     betRaise()
        //                 } else if (x < BigBlind * 10) {
        //                     call()
        //                 } else {
        //                     fold()
        //                 }
        //             })
        //         }
        //     } else if(currentRound === 1) { // Flop
        //         console.log('hand: ' + myCards[0] + myCards[1] + tableCards[0] + tableCards[1] + tableCards[2])
        //         // append 'o' for offsuit so it doesn't false flush
        //         hand = new Hand([myCards[0], myCards[1], tableCards[0], tableCards[1], tableCards[2]]);
        //         console.log('hand: ', hand)
        //         // console.log('hand.strength: ', hand.strength)
        //         getCallSize().subscribe((callSize) => {
        //             console.log('callSize: ', callSize)
        //             if (bigPocket()) {
        //                 if(callSize > 0){
        //                     call()
        //                 } else {
        //                     betRaise()
        //                 }
        //             } else if (hand.strength >= 3) {
        //                 if(callSize > 0){
        //                     call()
        //                 } else {
        //                     betRaise()
        //                 }
        //             } else if (!callSize) { // no bet so we can check/call
        //                 call()
        //             } else if (hand.strength >= 2 && callSize <= BigBlind * 5){
        //                 call()
        //             } else if (hand.strength >= 1 && callSize <= BigBlind * 5){
        //                 call()
        //             } else {
        //                 fold()
        //             }
        //         })
        //     } else if(currentRound === 2) { // Turn
        //         console.log('hand: ' + myCards[0] + myCards[1] + tableCards[0] + tableCards[1] + tableCards[2] + tableCards[3])
        //         hand = new Hand([myCards[0], myCards[1], tableCards[0], tableCards[1], tableCards[2], tableCards[3]]);
        //         console.log('hand: ', hand)
        //         // console.log('hand.strength: ', hand.strength)
        //             getCallSize().subscribe((callSize) => {
        //             console.log('callSize: ', callSize)
        //             if (hand.strength >= 3) {
        //                 if(callSize > 0){
        //                     call()
        //                 } else {
        //                     betRaise()
        //                 }
        //             } else if (!callSize) { // no bet so we can check/call
        //                 call()
        //             } else if (hand.strength >= 2 && callSize <= BigBlind * 5){
        //                 call()
        //             } else if (hand.strength >= 1 && callSize <= BigBlind * 5){
        //                 call()
        //             } else {
        //                 fold()
        //             }
        //         })
        //     } else if(currentRound === 3) { // River
        //         console.log('hand: ' + myCards[0] + myCards[1] + tableCards[0] + tableCards[1] + tableCards[2] + tableCards[3] + tableCards[4])
        //         hand = new Hand([myCards[0], myCards[1], tableCards[0], tableCards[1], tableCards[2], tableCards[3], tableCards[4]]);
        //         console.log('hand: ', hand)
        //         // console.log('hand.strength: ', hand.strength)
        //         getCallSize().subscribe((callSize) => {
        //             console.log('callSize: ', callSize)
        //             if (hand.strength >= 3) {
        //                 betRaise()
        //             } else if (!callSize) { // no bet so we can check/call
        //                 call()
        //             } else if (hand.strength >= 2 && callSize <= BigBlind * 5){
        //                 call()
        //             } else if (hand.strength >= 1 && callSize <= BigBlind * 5){
        //                 call()
        //             } else {
        //                 fold()
        //             }
        //         })
        //     }

        // })
    }
}, 1000)

function isMyTurn() {
    return robot.getPixelColor(myTurnPos.x, myTurnPos.y) === '272727'
}

function bigPocket() {
    return (
        (myCards[0][0] === 'A' && myCards[1][0] === 'A') ||
        (myCards[0][0] === 'K' && myCards[1][0] === 'K')
        // (myCards[0][0] === 'Q' && myCards[1][0] === 'Q')
    )
}

function AK() {
    return (
        (myCards[0][0] === 'A' && myCards[1][0] === 'K') ||
        (myCards[0][0] === 'K' && myCards[1][0] === 'A')
    )
}

function getMyCardSuit(cardNum) {
    let myCardPos = [
        {x: 877, y: 727},  // myCards[0]
        {x: 877 + myCardWidth, y: 727}  // myCards[0]
    ]
    let suitColors = {
        '007700': 'c',  // green
        '000000': 's',  // black
        '005ab4': 'd',  // blue
        'e20000': 'h',  // red
    }
    let pixelColor = robot.getPixelColor(myCardPos[cardNum].x, myCardPos[cardNum].y)
    // console.log('pixelColor: ', pixelColor)

    let suit = suitColors[robot.getPixelColor(myCardPos[cardNum].x, myCardPos[cardNum].y)]
    // return '' + pixelColor + ' ' + suit
    return suit
}
function getTableCardSuit(cardNum) {
    let TableCardPos = [
        {x: 690, y: 454},
        {x: 690 + tableCardWidth, y: 454},
        {x: 690 + 2*tableCardWidth, y: 454},
        {x: 690 + 3*tableCardWidth, y: 454},
        {x: 690 + 4*tableCardWidth, y: 454}
    ]
    let suitColors = {
        '007600': 'c',  // green
        '007700': 'c',  // green
        '000000': 's',  // black
        '005ab4': 'd',  // blue
        'e20000': 'h',  // red
    }
    let pixelColor = robot.getPixelColor(TableCardPos[cardNum].x, TableCardPos[cardNum].y)
    // console.log('pixelColor: ', pixelColor)

    let suit = suitColors[robot.getPixelColor(TableCardPos[cardNum].x, TableCardPos[cardNum].y)]
    // return '' + pixelColor + ' ' + suit
    return suit
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
        robot.moveMouse(1135, 900);
        robot.mouseClick();
    }, wait)
}

function betRaise() {
    let wait = randomWait()
    setTimeout(() => {
        console.log('betRaise')
        robot.keyTap('b')
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
        (myCards[0][0] === myCards[1][0]) ||                // any pair

        (myCards[0][0] === 'Q' && myCards[1][0] === 'K') || // both cards Q or greater
        (myCards[0][0] === 'K' && myCards[1][0] === 'Q') ||
        (myCards[0][0] === 'Q' && myCards[1][0] === 'A') ||
        (myCards[0][0] === 'A' && myCards[1][0] === 'Q') ||
        (myCards[0][0] === 'K' && myCards[1][0] === 'A') ||
        (myCards[0][0] === 'A' && myCards[1][0] === 'K') ||
                                                            // Suited AT and up
        (myCards[0][0] === 'A' && myCards[1][0] === 'J' && myCards[0][1] ===  myCards[1][1]) ||
        (myCards[0][0] === 'J' && myCards[1][0] === 'A' && myCards[0][1] ===  myCards[1][1]) ||
        (myCards[0][0] === 'A' && myCards[1][0] === 'T' && myCards[0][1] ===  myCards[1][1]) ||
        (myCards[0][0] === 'T' && myCards[1][0] === 'A' && myCards[0][1] ===  myCards[1][1])

    )
}

function randomWait() {
    let min = 1
    let max = 200
    return Math.floor(Math.random()*(max-min+1)+min);
}

function getCallSize() {
    return Observable.create((observer) => {
        let x = 1390
        let y = 900
        let width = 100
        let height = 20

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
        let x = 1471 + cardNum * myCardWidth
        let y = 453
        let width = 18
        let height = 18

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
                let myCardSuit = getMyCardSuit(cardNum)
                console.log('card: ', text)
                text = cleanText(text)
                observer.next([text, myCardSuit])
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
        myCards[0] = cardMap(res[0][0]) + res[0][1]
        myCards[1] = cardMap(res[1][0]) + res[1][1]
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
        console.log(res)
        if (res[1][0] == '.') {
            // Preflop
            currentRound = Rounds.Pre
            tableCards = [null, null, null, null, null]
        } else if (res[3][0] === 'h') {
            // Flop
            currentRound = Rounds.Flop
            tableCards = [cardMap(res[0][0]) + res[0][1], cardMap(res[1][0]) + res[1][1], cardMap(res[2][0]) + res[2][1], null, null]
        } else if (res[4][0] === 'H') {
            // Turn
            currentRound = Rounds.Turn
            tableCards = [cardMap(res[0][0]) + res[0][1], cardMap(res[1][0]) + res[1][1], cardMap(res[2][0]) + res[2][1], cardMap(res[3][0]) + res[3][1], null]
        } else {
            // River
            currentRound = Rounds.River
            tableCards = [cardMap(res[0][0]) + res[0][1], cardMap(res[1][0]) + res[1][1], cardMap(res[2][0]) + res[2][1], cardMap(res[3][0]) + res[3][1], cardMap(res[4][0]) + res[4][1]]
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
                // text = cleanText(text)

                observer.next(text)
                observer.complete()
            }
        });
    })

}

function getTableCard(cardNum) {
    return Observable.create((observer) => {
        let x = 673 + cardNum * tableCardWidth // old deck
        let y = 415
        let width = 39
        let height = 26

        // let x = 765 + cardNum * tableCardWidth // big deck
        // let y = 377
        // let width = 52
        // let height = 58
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

                let tableCardSuit = getTableCardSuit(cardNum)
                // console.log('tableCardSuit: ', getTableCardSuit(cardNum))
                text = cleanText(text)
                observer.next([text, tableCardSuit])
                observer.complete()

                // text = cleanText(text)
                // observer.next(text)
                // observer.complete()
            }
        });
    })

}
function cleanText(text) {
    text = JSON.stringify(text)
    // remove the word '$' and '\n' and '"' and ',' and ' '
    text = text.replace(/\$|"|'|\\n|V|f|,| /gi, '')
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
    if(key =='.') {
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
    if(key == undefined) {
        return 'A'
    }
    return 'A'
}
