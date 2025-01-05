// Import Framework7


import Framework7 from "framework7/lite/bundle"


// Import Framework7-Svelte Plugin
import Framework7Svelte from 'framework7-svelte';



// Import Framework7 Styles
import 'framework7/css/bundle';

// Import Icons and App Custom Styles
import '../../css/icons.css';
import '../../css/app.css';
import '../../css/theme.css';

// Import App Component
import App from '../../components/app.svelte';
import {rpc} from "./RpcClient.js";
import {svelteSelectedTitle} from "./svelteStore.js"
import {mount} from "svelte"

// Init F7 Svelte Plugin
Framework7.use(Framework7Svelte)

rpc.init(
    //rpc connected
    async () => {
        // Mount Svelte App
        const app = mount(App,{
            target: document.getElementById('app'),
        });


        // console.log(await rpc.request("displayDeviceStore.list"))
    },
    //disconnected
    async () => {

    })

// rpc.connect('192.168.13.109')
svelteSelectedTitle.set("Connecting...")
rpc.connect()


