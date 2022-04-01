// Import Framework7

import Framework7 from 'framework7/lite-bundle';

// Import Framework7-Svelte Plugin
import Framework7Svelte from 'framework7-svelte';

// Import Framework7 Styles
import 'framework7/framework7-bundle.css';

// Import Icons and App Custom Styles
import '../css/icons.css';
import '../css/app.css';

// Import App Component
import App from '../components/app.svelte';
import {rpc} from "./RpcClient.js";

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


