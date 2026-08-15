//currently gets it from binance (free open api)
/*
APIs notes:
// curl -H "X-CMC_PRO_API_KEY: ..." -H "Accept: application/json" -d "" -G https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=BTC,ETH
//https://cryptingup.com/api/markets
//https://api2.binance.com/api/v3/ticker/24hr


 */


import {NodeFetchCache, MemoryCache, cacheStrategies} from "node-fetch-cache"

//every animation restart (which happens on every control change) asks for the ticker again, and
//several displays can show it at the same time, so cache it briefly instead of hammering binance.
//15s is short enough that the price still looks live.
//NOTE: in memory on purpose, unlike the other fetchers here: a price is worthless after a restart,
//and it shouldnt linger on disk.
const fetchTicker = NodeFetchCache.create({
    cache: new MemoryCache({ttl: 15000}),

    //never cache error responses, they would stay in the cache for the whole ttl
    shouldCacheResponse: cacheStrategies.cacheOkayOnly
})

export type CryptoTicker = {
    //the price 24 hours ago and the most recent one
    openPrice: number
    lastPrice: number
}

/** The binance 24h ticker of a symbol (e.g. BTCUSDT). Throws when it cannot be fetched. */
export async function cryptoTicker24h(symbol = 'BTCUSDT'): Promise<CryptoTicker> {

    const url = `https://api2.binance.com/api/v3/ticker/24hr?symbol=${symbol}&type=mini`
    const response = await fetchTicker(url)

    if (!response.ok)
        throw new Error(`Could not fetch ticker of ${symbol}: ${response.status} ${response.statusText}`)

    //binance returns the prices as strings
    const ticker = await response.json() as {openPrice: string, lastPrice: string}

    return {
        openPrice: parseFloat(ticker.openPrice),
        lastPrice: parseFloat(ticker.lastPrice)
    }
}
