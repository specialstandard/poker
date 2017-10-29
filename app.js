console.log('Brian is amazing')
const tesseract = require('node-tesseract');
const screenshot = require('screenshot-node');
const Observable = require('rxjs/Observable').Observable;

let pot

getPot().subscribe((res) => {
    pot = res
    console.log(pot)
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
            console.log(err)
        })

        // Recognize text of any language in any format
        const image = destination
        console.log('image: ', image)

        tesseract.process(image, function (err, text) {
            if (err) {
                console.error(err);
            } else {
                text = JSON.stringify(text)
                // remove the word 'Pot:' and '\n' and '"'
                text = text.replace(/Pot: |"|\\n/gi, '')
                // replace o with 0
                text = text.replace(/o/gi, '0')
                // replace s with 5
                text = text.replace(/s/gi, '5')
                // console.log('text is:' + text + ':end');
                // return text
                observer.next(text)
                observer.complete()
            }
        });
    })

}

