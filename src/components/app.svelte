<App { ...f7params }>
    <Matrix/>

    <View  name="categories" >
        <Categories/>
    </View>
    <View  name="animation-runner" main browserHistory={true} reloadPages={true} style="display: none">
    </View>


</App>
<script>
    import {onMount} from 'svelte';

    import {
        App, Badge,
        f7,
        View,
    } from 'framework7-svelte';

    import {sveltePresets} from "../js/svelteStore.js";

    //important (otherwise weird startup errors in dev mode):
    import 'framework7/lite';

    import Matrix from "../pages/matrix.svelte"

    import routes from '../js/routes';
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
