
import * as https from "https"


interface CacheInterface {
    lastTime: number,
    result: any,
    callbacks: Array<(rssFeedUrl, titles) => void>,
    inProgress: boolean
}

const cache: Record<string, CacheInterface> = {}

function rssTagParser(data:String,tag="item",subtags=[])
{
    const regexpTag=RegExp("<"+tag+">\s*(.+?)\s*</"+tag+">","g" )
    let filteredData=filterDirtyChars(data.toString())
    const items=[...filteredData.matchAll(regexpTag)];
    //console.log("regext result:",regexpTag,items,filteredData)
    let itemslist=[]
    if (items && items.length>0)
    {
        for (let i=0;i<items.length;i++)
        {
            let itemsDirty=items[i].toString().split("</"+tag)
            let itemClean=itemsDirty[0].substring(tag.length+2)
             //console.log("processing: ",itemClean)
            if (subtags.length>0)
            {
                //console.log('processing sub:',subtags)
                let subs=[]
                for (let j=0;j<subtags.length;j++)
                {
                    subs[subtags[j]]=rssTagParser(itemClean,subtags[j],[])
                }
                itemslist.push(subs)
            }
            else
            {
                itemslist.push(itemClean)
            }
            
        }
    }
    //console.log("itemlist:",itemslist)
    return itemslist
}

function filterDirtyChars(mystring:String)
{
    const regexDirtychars=RegExp("\r?\n|\r|\t","gm")
    let result=mystring.replace(regexDirtychars,"")
   
    return filterDirtyChars2(result)
}
function filterDirtyChars2(mystring:String)
{
    let result=mystring
    let filter=["<![CDATA[","]]>","<p>","</p>","&nbsp;","&#8230;"]
    
    for (let i=0;i<filter.length;i++)
    {  
        //console.log("filtering",filter[i])
        let filtered=result.split(filter[i])
        result=filtered.join("")
    }
   
    return result
}

function titleParser(url:String, tag:string, data:String, fields:string[])
{
    
    let titlesList=rssTagParser(data,tag,fields)
    //return JSON.stringify(titlesList)
    //console.log(titlesList)
    return titlesList
}

export function getRssFeedData(rssFeedUrl = 'RSSFEED', callback: (rssFeedUrl, titles) => void) {

    if (!(rssFeedUrl in cache)) {
        //add new
        cache[rssFeedUrl] = {
            lastTime: 0,
            result: {},
            inProgress: false,
            callbacks: []
        }
    }

    //add ourselfs to callback queue
    cache[rssFeedUrl].callbacks.push(callback)

    //inprogress?
    if (cache[rssFeedUrl].inProgress) {
        console.debug("Already in progress")
        return
    }

    function doCallbacks(d: CacheInterface) {
        for (const callback of d.callbacks)
            callback(rssFeedUrl,d.result)

        d.callbacks = []

    }

   

    //fresh?
    if (Date.now() - cache[rssFeedUrl].lastTime < 15000) {
        console.debug("Returning cached response",)
        doCallbacks(cache[rssFeedUrl])
        //console.log("cache",cache)
        return
    }

    //start new request
    console.debug("Starting new request")
    cache[rssFeedUrl].inProgress = true
    try {
        const url = rssFeedUrl //fixed for now..make flex when it works
        https.get(url, (res) => {
     
            let xml = ""
            res.on('data', (d) => {
               xml=xml.concat(d.toString())
            })

            res.on('end', () => {
                console.debug("Got freshdata")
                let fields=['title','description']
                let titles=titleParser(url,'item',filterDirtyChars(xml),fields)
                cache[rssFeedUrl].result = titles
                cache[rssFeedUrl].lastTime = Date.now()
                cache[rssFeedUrl].inProgress = false

                doCallbacks(cache[rssFeedUrl])
                return
            })

            res.on('error', (err) => {
                console.error(err)
                cache[rssFeedUrl].inProgress = false
                cache[rssFeedUrl].callbacks = []
            })
        }).on('error', (err) => {
            console.error(err)
            cache[rssFeedUrl].inProgress = false
            cache[rssFeedUrl].callbacks = []
        })

    } catch (e) {
        console.error(e)
        cache[rssFeedUrl].inProgress = false
        cache[rssFeedUrl].callbacks = []
    }
}
