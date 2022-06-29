<App { ...f7params }>
    <Display/>

    <View  name="categories" restoreScrollTopOnBack={true}>
        <Categories/>
    </View>

    <View  name="animation-runner" main browserHistory={true} reloadPages={true} style="display: none" >
    </View>


</App>
<script>
    import {onMount} from 'svelte';

    import {
        App, Badge,
        f7,
        View,
    } from 'framework7-svelte';

    import {sveltePresets} from "../js/web/svelteStore.js";

    //important (otherwise weird startup errors in dev mode):
    import 'framework7/lite';

    import Display from "../pages/display.svelte"

    import routes from '../js/web/routes.js';
    import Categories from '../pages/categories.svelte'
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
