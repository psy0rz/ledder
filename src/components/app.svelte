<script>

    import {
        App, View,
    } from 'framework7-svelte'


    import Display from "./Display.svelte"

    import routes from '../js/web/routes.js';
    import Categories from '../pages/categories.svelte'

    // Framework7 Parameters
    let f7params = {
        name: 'Ledder', // App name
        theme: 'auto', // Automatic theme detection

        // App routes
        routes: routes,
    };

</script>

<App { ...f7params }>
    <Display/>

    <View name="categories" restoreScrollTopOnBack={true}>
        <Categories/>
    </View>


</App>
