// Import Framework7


// Import Framework7-Svelte Plugin
import Framework7Svelte from 'framework7-svelte';

// Import Framework7 Styles
import 'framework7/css';

// Import Icons and App Custom Styles
import '../../css/icons.css';
import '../../css/app.css';
import '../../css/theme.css';

// Import App Component
import App from '../../components/app.svelte';
import {rpc} from "./RpcClient.js";
import Framework7 from "framework7"

// Init F7 Svelte Plugin
Framework7.use(Framework7Svelte)

rpc.init(
    //rpc connected
    async () => {
        // Mount Svelte App
        const app = new App({
            target: document.getElementById('app'),
        });
    },
    //disconnected
    async () => {

    })

// rpc.connect('192.168.13.109')
rpc.connect()


