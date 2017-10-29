const tesseract = require('node-tesseract');
const screenshot = require('screenshot-node');
const Observable = require('rxjs/Observable').Observable;

let pot
let stack
let tableCard

getPot().subscribe((res) => {
    pot = res
    console.log(pot)
})
getStack().subscribe((res) => {
    stack = res
    console.log(stack)
})
getTableCard().subscribe((res) => {
    tableCard = res
    console.log('tableCard: ', tableCard)
})

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

        tesseract.process(image, (err, text) => {
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

        tesseract.process(image, (err, text) => {
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

function getTableCard() {
    return Observable.create((observer) => {
        let x = 737
        let y = 375
        let width = 29
        let height = 32

        let path = __dirname + '\\img\\'
        let filename = 'tableCard.jpg'
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
    // console.log('text is:' + text + ':end');
    return text
}


