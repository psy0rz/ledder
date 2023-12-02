
import * as https from "https"


interface CacheInterface {
    lastTime: number,
    result: any,
    callbacks: Array<(resourceUrl, resourceData) => void>,
    inProgress: boolean
}

const cache: Record<string, CacheInterface> = {}




export function getRemoteData(resourceUrl = 'RSSFEED', callback: (resourceUrl, resourceData) => void) {

    if (!(resourceUrl in cache)) {
        //add new
        cache[resourceUrl] = {
            lastTime: 0,
            result: {},
            inProgress: false,
            callbacks: []
        }
    }

    //add ourselfs to callback queue
    cache[resourceUrl].callbacks.push(callback)

    //inprogress?
    if (cache[resourceUrl].inProgress) {
        //console.debug("Already in progress")
        return
    }

    function doCallbacks(d: CacheInterface) {
        for (const callback of d.callbacks)
            callback(resourceUrl,d.result)

        d.callbacks = []

    }

   

    //fresh?
    if (Date.now() - cache[resourceUrl].lastTime < 15000) {
        //console.debug("Returning cached response",)
        doCallbacks(cache[resourceUrl])
        //console.log("cache",cache)
        return
    }

    //start new request
    console.debug("Starting new request")
    cache[resourceUrl].inProgress = true
    try {
        const url = resourceUrl //fixed for now..make flex when it works
        https.get(url, (res) => {
     
            let rawdata = ""
            res.on('data', (d) => {
               rawdata=rawdata.concat(d.toString())
            })

            res.on('end', () => {
                //console.debug("Got freshdata")
                cache[resourceUrl].result = rawdata
                cache[resourceUrl].lastTime = Date.now()
                cache[resourceUrl].inProgress = false

                doCallbacks(cache[resourceUrl])
                return
            })

            res.on('error', (err) => {
                console.error(err)
                cache[resourceUrl].inProgress = false
                cache[resourceUrl].callbacks = []
            })
        }).on('error', (err) => {
            console.error(err)
            cache[resourceUrl].inProgress = false
            cache[resourceUrl].callbacks = []
        })

    } catch (e) {
        console.error(e)
        cache[resourceUrl].inProgress = false
        cache[resourceUrl].callbacks = []
    }
}
