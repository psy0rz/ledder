<App { ...f7params }>
    <Display />

    <View  name="categories" restoreScrollTopOnBack={true}>
        <Categories/>
    </View>

    <View  name="animation-runner" main browserHistory={true} reloadPages={true} style="display: none" >
    </View>


</App>
<script>

    import {
        App, View,
    } from 'framework7-svelte'

    //important (otherwise weird startup errors in dev mode):
   // import 'framework7/lite';

    import Display from "./Display.svelte"


    import routes from '../js/web/routes.js';
    import Categories from '../pages/categories.svelte'
    import {onMount} from "svelte"
    // import Test from '../pages/test.svelte'
    // import store from '../js/store';


    // Framework7 Parameters
    let f7params = {
        name: 'Ledder', // App name
        theme: 'auto', // Automatic theme detection

        // App routes
        routes: routes,
    };

</script>
