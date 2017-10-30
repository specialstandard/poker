const robot = require("robotjs");
const screenshot = require('screenshot-node');
const tesseract = require('node-tesseract');
const Observable = require('rxjs/Observable').Observable;
const Rx = require('rxjs')

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
// let isMyTurn = false;
let myCards = []
let pot
let stack
let tableCards = []

let myTurnPos = {
    x: 1180,
    y: 862
}
console.log('init')

setInterval(() => {
    if(isMyTurn()) {
        console.log('\nisMyTurn now')
        getMyCards()
        getTableCards().subscribe(() => {
            console.log('subscribed to getTableCards')
            if(currentRound === 0) {
                if(myCards[0] < 10 || myCards[1] < 10) {
                    fold()
                }
            }
        })
    } else {
        // console.log('not isMyTurn now')
    }
}, 1000)

function isMyTurn() {
    return robot.getPixelColor(myTurnPos.x, myTurnPos.y) === 'ffffff'
}

function fold() {
    console.log('Fold')
    // click fold button
    robot.moveMouse(959, 914);
    robot.mouseClick();
}

function check() {
    console.log('Check')
    // click check button
    robot.moveMouse(1215, 915);
    robot.mouseClick();
}

// console.log('currentRound: ', currentRound)

// for(let i = 0; i < 2; i++) {
//     getMyCard(i).subscribe((res) => {
//         myCards[i] = res
//         console.log('myCards: ', myCards)
//     })
// }

// getPot().subscribe((res) => {
//     pot = res
//     console.log('pot: ', pot)
// })
// getStack().subscribe((res) => {
//     stack = res
//     console.log('stack: ', stack)
// })
// for(let i = 0; i < 5; i++) {
//     getTableCard(i).subscribe((res) => {
//         tableCards[i] = res
//         console.log('tableCards: ', tableCards)
//     })
// }

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
        console.log('tableCards: ', tableCards)
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
            psm: 6, // allow single character recognition
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
            psm: 6, // allow single character recognition
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
    text = text.replace(/Pot: |"|\\n|,| /gi, '')
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
        return 2
    }
    if(key =='3') {
        return 3
    }
    if(key =='4') {
        return 4
    }
    if(key =='5') {
        return 5
    }
    if(key =='6') {
        return 6
    }
    if(key =='7') {
        return 7
    }
    if(key =='8') {
        return 8
    }
    if(key =='9') {
        return 9
    }
    if(key =='10') {
        return 10
    }
    if(key =='J') {
        return 11
    }
    if(key =='Q') {
        return 12
    }
    if(key =='0') {
        return 12
    }
    if(key =='K') {
        return 13
    }
    if(key =='A') {
        return 14
    }
}
