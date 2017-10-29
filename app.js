const tesseract = require('node-tesseract');
const screenshot = require('screenshot-node');
const Observable = require('rxjs/Observable').Observable;

Round = {
    PRE: 0,
    FLOP: 1,
    TURN: 2,
    RIVER: 3
}

const myCardWidth = 84
const tableCardWidth = 91

let currentRound = Round.PRE
let isMyTurn = false;
let myCards = []
let pot
let stack
let tableCards = []

console.log('currentRound: ', currentRound)

for(let i = 0; i < 2; i++) {
    getMyCard(i).subscribe((res) => {
        myCards[i] = res
        console.log('myCards: ', myCards)
    })
}

getPot().subscribe((res) => {
    pot = res
    console.log('pot: ', pot)
})
getStack().subscribe((res) => {
    stack = res
    console.log('stack: ', stack)
})
for(let i = 0; i < 5; i++) {
    getTableCard(i).subscribe((res) => {
        tableCards[i] = res
        console.log('tableCards: ', tableCards)
    })
}

function getMyCard(cardPos) {
    return Observable.create((observer) => {
        let x = 878 + cardPos * myCardWidth
        let y = 640
        let width = 29
        let height = 32

        let path = __dirname + '\\img\\'
        let filename = 'myCard' + cardPos + '.jpg'
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

function getTableCard(cardPos) {
    return Observable.create((observer) => {
        let x = 737 + cardPos * tableCardWidth
        let y = 375
        let width = 29
        let height = 32

        let path = __dirname + '\\img\\'
        let filename = 'tableCard' + cardPos + '.jpg'
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

875
640

