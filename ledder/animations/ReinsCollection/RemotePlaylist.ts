import PixelBox from "../../PixelBox.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import Animator from "../../Animator.js"
import { getRemoteData } from "../../remotedata .js"
import AnimationManager from "../../server/AnimationManager.js"


export default class RemotePlaylist extends Animator {
    static category = "Time"
    static title = "Playlist "
    static description = "playlist"
    private animationManager: AnimationManager

    playList
    playListReady: boolean


    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup, x = 0, y = 0) 
    {
        const clockIntervalControl = controls.value("Clock interval", 1, 1, 10, 0.1);
        const playlistUrl = controls.input("playlistUrl","https://mechanicape.nl/playlist.json",true)
        let childControls = controls.group('Current animation')
        this.animationManager = new AnimationManager(box, scheduler.child(), childControls)
        this.playListReady=false

        getRemoteData(playlistUrl.text,(resourceUrl, resourceData) => {
            this.playList=JSON.parse(resourceData)
            this.playListReady=true
            console.log(this.playList)
            if (this.playList && this.playList.length>0)
            {
                this.animationManager.select(this.playList[0].preset, false).catch((e) => {
                    console.log((e.message))
        
                })
            }
            
          
        })

       

       
       
        let timer=0
        let activeSlide=0
    
        scheduler.intervalControlled(clockIntervalControl, (frameNr) => {
            if(this.playListReady)
            {
                let activeSlideDuration=this.playList[activeSlide].duration
                let activeSlidePreset=this.playList[activeSlide].preset
              
                timer=timer+0.1
                if (timer>activeSlideDuration)
                {
                       
                        activeSlide++
                        if (activeSlide>this.playList.length-1)
                        {
                            activeSlide=0
                        }
                        console.log("slide: #"+activeSlide+", preset:"+activeSlidePreset+", duration: "+activeSlideDuration+"s")
                        this.animationManager.select(activeSlidePreset, false).catch((e) => {
                            console.log((e.message))
                
                        })
                        timer=0
                }
            }
            else
            {
                //waiting for playlist to become ready
            }


        });
       
    }

}
