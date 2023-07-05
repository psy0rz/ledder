
import * as https from "https"


interface CacheInterface {
    lastTime: number,
    result: any,
    callbacks: Array<(symbol, titles) => void>,
    inProgress: boolean
}

const cache: Record<string, CacheInterface> = {}

function titleParser(url:String, data:String)
{
    const regexp=RegExp('<title>.*<\/title>','gm' )
    const titles=[...data.matchAll(regexp)];
    let titlesList=[]
    for (let i=0;i<titles.length;i++)
    {
        let titledirty=titles[i].toString()
        let titleclean=titledirty.substring(7,titledirty.length-8)
        titlesList.push(titleclean)
    }
    console.log("Rss feed titles",titlesList)
    return JSON.stringify(titlesList)
}

export function getRssFeedData(symbol = 'HSDNEWS', callback: (symbol, headlines) => void) {

    if (!(symbol in cache)) {
        //add new
        cache[symbol] = {
            lastTime: 0,
            result: {},
            inProgress: false,
            callbacks: []
        }
    }

    //add ourselfs to callback queue
    cache[symbol].callbacks.push(callback)

    //inprogress?
    if (cache[symbol].inProgress) {
        console.debug("Already in progress")
        return
    }

    function doCallbacks(d: CacheInterface) {
        for (const callback of d.callbacks)
            callback(symbol,d.result)

        d.callbacks = []

    }

    //fresh?
    if (Date.now() - cache[symbol].lastTime < 15000) {
        console.debug("Returning cached response")
        doCallbacks(cache[symbol])
        return
    }

    //start new request
    console.debug("Starting new request")
    cache[symbol].inProgress = true
    try {
        const url = `https://www.hackerspace-drenthe.nl/feed/` //fixed for now..make flex when it works
        https.get(url, (res) => {
     
            let xml = ""
            res.on('data', (d) => {
               xml += d.toString()
            })

            res.on('end', () => {
                console.debug("Got freshdata")
                let titles=titleParser(url,xml)
                cache[symbol].result = titles
                cache[symbol].lastTime = Date.now()
                cache[symbol].inProgress = false

                doCallbacks(cache[symbol])
                return
            })

            res.on('error', (err) => {
                console.error(err)
                cache[symbol].inProgress = false
                cache[symbol].callbacks = []
            })
        }).on('error', (err) => {
            console.error(err)
            cache[symbol].inProgress = false
            cache[symbol].callbacks = []
        })

    } catch (e) {
        console.error(e)
        cache[symbol].inProgress = false
        cache[symbol].callbacks = []
    }
}
