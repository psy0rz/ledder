//currently gets it from binance (free open api)
/*
APIs notes:
// curl -H "X-CMC_PRO_API_KEY: ..." -H "Accept: application/json" -d "" -G https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=BTC,ETH
//https://cryptingup.com/api/markets
//https://api2.binance.com/api/v3/ticker/24hr


 */


import * as https from "https"

interface CacheInterface {
    lastTime: number,
    result: any,
    callbacks: Array<(symbol, first, last) => void>,
    inProgress: boolean
}

const cache: Record<string, CacheInterface> = {}

export function cryptoFirstLast(symbol = 'BTCUSDT', callback: (symbol, first, last) => void) {

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
            callback(symbol, parseFloat(d.result.openPrice), parseFloat(d.result.lastPrice))

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
    cache[symbol].inProgress=true
    try {
        const url = `https://api2.binance.com/api/v3/ticker/24hr?symbol=${symbol}&type=mini`
        https.get(url, (res) => {
            // console.log(res)
            let json = ""
            res.on('data', (d) => {
                json += d.toString()
            })

            res.on('end', () => {
                console.debug("Got freshdata", json)

                const data = JSON.parse(json)
                cache[symbol].result = data
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
        })
    } catch (e) {
        console.error(e)
        cache[symbol].inProgress = false
        cache[symbol].callbacks = []
    }
}
