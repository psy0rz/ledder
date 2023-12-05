import PixelBox from "../../PixelBox.js"
import PixelList from "../../PixelList.js"
import Pixel from "../../Pixel.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import Animator from "../../Animator.js"
import Color from "../../Color.js"
import { getRemoteData } from "../../remotedata .js"
import AnimationManager from "../../server/AnimationManager.js"


export default class RemotePlaylist extends Animator {
    static category = "Time"
    static title = "Playlist "
    static description = "playlist"
    private animationManager: AnimationManager


    playList
    playListReady: boolean
    activeSlide:number=0
    activeSlideDuration:number=60
    activeSlidePreset:string
    timer:number=0

    activateNext()
    {
        //select next
        this.activeSlide=(this.activeSlide+1)%(this.playList.length)
        
        //load details
        this.activeSlideDuration=this.playList[this.activeSlide].duration
        this.activeSlidePreset=this.playList[this.activeSlide].preset
        console.log("slide: #"+this.activeSlide+", preset:"+this. activeSlidePreset+", duration: "+this.activeSlideDuration+"s")
        
        //send to animation manager
        this.timer=0
        this.animationManager.select(this.activeSlidePreset, false).catch((e) => {
            console.log((e.message))

        })
    
       
    }

   

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup, x = 0, y = 0) 
    {
        const clockIntervalControl = controls.value("Clock interval", 1, 1, 10, 0.1);
        const playlistUrl = controls.input("playlistUrl","https://mechanicape.nl/playlist.json",true)
        const cacheControl=controls.value("Cache refresh time (s)",60,15,60*60*24,60,true)
        let childControls = controls.group('Current animation')
        this.animationManager = new AnimationManager(box, scheduler.child(), childControls)
        this.playListReady=false
      

        getRemoteData(playlistUrl.text,1000*cacheControl.value,(resourceUrl, resourceData) => {
            this.playList=JSON.parse(resourceData)
            this.playListReady=true
            //console.log(this.playList)
            if (this.playList && this.playList.length>0)
            {
                this.animationManager.select(this.playList[0].preset, false).catch((e) => {
                    console.log((e.message))
        
                })
            } 
        })

    
        scheduler.intervalControlled(clockIntervalControl, (frameNr) => {
            if(this.playListReady)
            {
                this.timer=this.timer+(clockIntervalControl.value)/50
                //console.log(this.timer,this.activeSlideDuration)
                if (this.timer>this.activeSlideDuration) { this.activateNext()   }
            }
            else
            {
                //wait
            }


        });
       
    }

}


/*


[
	{
		"order": 0,
		"preset":"Text/Marquee/ledder",
		"duration":30
	},
	{
		"order": 10,
		"preset":"Text/Marquee/coolfx",
		"duration":30
	},
	{
                "order": 11,
                "preset":"Text/Marquee/Font Atari",
                "duration":2
        },
	{
                "order": 12,
                "preset":"Text/Marquee/Font C64",
                "duration":2
        },
	{
                "order": 13,
                "preset":"Text/Marquee/Font MSDOS",
                "duration":2
        },
        {
                "order": 14,
                "preset":"Text/Marquee/Font MSX",
                "duration":2
        },
	{
                "order": 15,
                "preset":"Text/Marquee/Font Quasar",
                "duration":2
        },
        {
                "order": 16,
                "preset":"Text/Marquee/FX Twinkle",
                "duration":4
        },
        {
                "order": 17,
                "preset":"Text/Marquee/FX Flames",
                "duration":4
        },
          {
                "order": 18,
                "preset":"Text/Marquee/Water",
                "duration":4
        },
        {
                "order": 18,
                "preset":"Text/Marquee/Ijspegels",
                "duration":4
        },
 	{
                "order"	: 29,
                "preset"	: "ReinsCollection/Sensorclock32x8/default",
                "duration": 10
        },
        {
                "order"	: 30,
                "preset"	: "ReinsCollection/Photon/Plasma",
                "duration": 30
        },
	{
                "order" : 80,
                "preset"        : "ReinsCollection/Cube2/default",
                "duration": 30
        },
	{
                "order" : 100,
                "preset"        : "ReinsCollection/Dna/default",
                "duration": 30
        },
	{
                "order" : 110,
                "preset"        : "Fires/PlasmaFire/Active",
                "duration": 30
        },
        {
                "order" : 110,
                "preset"        : "Fires/Fire/default",
                "duration": 30
        },
        {
                "order" : 110,
                "preset"        : "Fires/ParticleFire/default",
                "duration": 30
        },
        {
                "order" : 110,
                "preset"        : "Fires/PlasmaFire/Active",
                "duration": 30
        },
	{
                "order" : 120,
                "preset"  : "Memes/Nyancat/default",
                "duration": 20
        },
	{
                "order" : 130,
                "preset"  : "Memes/Cyber/default",
                "duration": 5
        }
	,
        {
                "order" : 140,
                "preset"  : "ReinsCollection/PolePosition/default",
                "duration": 20
        },
	{
                "order" : 150,
                "preset"  : "ReinsCollection/Julibrot/default",
                "duration": 30
        },
	{
                "order" : 160,
                "preset"  : "ReinsCollection/Fireworks/default",
                "duration": 10
        },
	{
                "order" : 170,
                "preset"  : "ReinsCollection/MQTTclimate/default",
                "duration": 30
        },
	{
                "order" : 180,
                "preset"  : "ReinsCollection/Love/default",
                "duration": 80
        },
	{
                "order" : 190,
                "preset"  : "ReinsCollection/Pong/default",
                "duration": 10
        },
	{
                "order" : 200,
                "preset"  : "ReinsCollection/Prisma/default",
                "duration": 10
        },
	{
                "order" : 150,
                "preset"  : "ReinsCollection/Rainbowcross/default",
                "duration": 30
        },
    {
                "order" : 160,
                "preset"  : "ReinsCollection/Beleep2/oersoep",
                "duration": 30
        },
        {
                "order" : 160,
                "preset"  : "Games/Tankwars/default",
                "duration": 200
        }
]


*/
