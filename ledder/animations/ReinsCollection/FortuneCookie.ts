import PixelBox from "../../PixelBox.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import PixelList from "../../PixelList.js"
import Animator from "../../Animator.js"
import { fonts } from "../../fonts.js"
import DrawText from "../../draw/DrawText.js"
import Color from "../../Color.js"
import { fontSelect } from "../../fonts.js"



export class Fortunecookies {
    quotes = []
    counter: number = 0
    lastQuote = { text: "No quotes loaded", author: "@" }
    font
    status

    statusIdle = 0
    statusPlaying = 1
    statusFinished = 2

    constructor(font) {
        this.font = font
        this.quotes = []
        this.quotes.push({ text: "The saddest aspect of life right now is that science gathers knowledge faster than society gathers wisdom.", author: "Isaac Asimov" })
        this.quotes.push({ text: "The most exciting phrase to hear in science, the one that heralds new discoveries, is not 'Eureka!' but 'That's funny...'", author: "Isaac Asimov" })
        this.quotes.push({ text: "No amount of experimentation can ever prove me right; a single experiment can prove me wrong.", author: "Albert Einstein" })
        this.quotes.push({ text: "I am among those who think that science has great beauty.", author: "Marie Curie" })
        this.quotes.push({ text: "Research is what I'm doing when I don't know what I'm doing.", author: "Wernher von Braun" })
        this.quotes.push({ text: "We live in a society exquisitely dependent on science and technology, in which hardly anyone knows anything about science and technology.", author: "Carl Sagan" })
        this.quotes.push({ text: "Science does not know its debt to imagination.", author: "Ralph Waldo Emerson" })
        this.quotes.push({ text: "We can lick gravity, but sometimes the paperwork is overwhelming.", author: "Wernher von Braun" })
        this.quotes.push({ text: "Science is a wonderful thing if one does not have to earn one's living at it.", author: "Albert Einstein" })
        this.quotes.push({ text: "If you believe in science, like I do, you believe that there are certain laws that are always obeyed.", author: "Stephen Hawking" })
        this.quotes.push({ text: "Art is I; science is we.", author: "Claude Bernard" })
        this.quotes.push({ text: "The science of today is the technology of tomorrow.", author: "Edward Teller" })
        this.quotes.push({ text: "Science is organized knowledge. Wisdom is organized life.", author: "Immanuel Kant" })
        this.quotes.push({ text: "To raise new questions, new possibilities, to regard old problems from a new angle, requires creative imagination and marks real advance in science.", author: "Albert Einstein" })
        this.quotes.push({ text: "Computer science inverts the normal. In normal science, you're given a world, and your job is to find out the rules. In computer science, you give the computer the rules, and it creates the world.", author: "Alan Kay" })
        this.update()
    }

    update() {
        this.counter = 0
        this.status = this.statusPlaying
        let rand = Math.random()
        let nrOfItems = this.quotes.length
        let randomIndex = Math.round(rand * (nrOfItems - 1))
        this.lastQuote = this.quotes[randomIndex]
        return this.lastQuote
    }

    getLongestWord(text: string) {
        let longest = 0
        let words = text.split(" ")
        for (let i = 0; i < words.length; i++) {
            longest = Math.max(longest, words[i].length)
        }
        return longest
    }



    render(box: PixelBox) {
        if (this.status == this.statusFinished) { this.update() }
        let text = this.lastQuote.text
        let author = this.lastQuote.author
        let textAll = text + " - " + author
        let pl = new PixelList()
        //horizontal
        let xpos = Math.round(box.width() - (this.counter))
        pl.add(new DrawText(xpos, Math.round((box.height() - 8) / 2), this.font, text, new Color(100, 100, 100, 1)))
        pl.add(new DrawText(xpos + text.length * 8 + 32, Math.round((box.height() - 8) / 2), this.font, author, new Color(100, 0, 0, 1)))
        if (xpos < (-1 * ((textAll.length * 8) + box.width() * 3))) {
            this.status = this.statusFinished
        }
        this.counter++
        return pl
    }
}



export default class FortuneCookie extends Animator {
    static category = "Misc"
    static title = "Fortune Cookie"
    static description = "blabla"


    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {

        const intervalControl = controls.value("Clock interval", 1, 1, 10, 0.1, true)
        let font = fontSelect(controls, "Font", fonts["Pixel-Gosub"].name, 0)
        font.load()


        let canvas = new PixelBox(box)
        box.add(canvas)
        let famousQuotes = new Fortunecookies(font)

        scheduler.intervalControlled(intervalControl, (frameNr) => {
            canvas.clear()
            canvas.add(famousQuotes.render(box))
            canvas.crop(box)

        })

    }
}
