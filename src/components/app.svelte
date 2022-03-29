<App { ...f7params }>

    <Matrix></Matrix>

    <!-- Left panel with cover effect-->
    <Panel left cover themeDark>
        <View>
            <Page>
                <Navbar title="Left Panel"/>
                <Block>Left panel content goes here</Block>
            </Page>
        </View>
    </Panel>


    <!-- Right panel with reveal effect-->
    <Panel right reveal themeDark>
        <View>
            <Page>
                <Navbar title="Right Panel"/>
                <Block>Right panel content goes here</Block>
            </Page>
        </View>
    </Panel>


    <!-- Views/Tabs container -->
    <Views tabs class="safe-areas">


        <!-- Tabbar for switching views-tabs -->
        <Toolbar tabbar labels bottom>
            <Link tabLink="#view-categories" iconIos="f7:square_list_fill" iconAurora="f7:square_list_fill"
                  iconMd="material:view_list" text="Animations"/>
<!--            <Link tabLink="#view-home" tabLinkActive iconIos="f7:house_fill" iconAurora="f7:house_fill"-->
<!--                  iconMd="material:home" text="Home"/>-->
            <Link tabLink="#view-settings" iconIos="f7:gear" iconAurora="f7:gear" iconMd="material:settings"
                  text="Settings"/>
        </Toolbar>

        <!-- Catalog View -->
        <View id="view-categories" name="categories" main tab tabActive browserHistory="true"  url="/categories/"/>

        <!-- Your main view/tab, should have "view-main" class. It also has "tabActive" prop -->
<!--        <View id="view-home" tab url="/"/>-->


        <!-- Settings View -->
        <View id="view-settings" name="settings" tab url="/settings/"/>

    </Views>


    <!-- Popup -->
    <Popup id="my-popup">
        <View>
            <Page>
                <Navbar title="Popup">
                    <NavRight>
                        <Link popupClose>Close</Link>
                    </NavRight>
                </Navbar>
                <Block>
                    <p>Popup content goes here.</p>
                </Block>
            </Page>
        </View>
    </Popup>

    <LoginScreen id="my-login-screen">
        <View>
            <Page loginScreen>
                <LoginScreenTitle>Login</LoginScreenTitle>
                <List form>
                    <ListInput
                            type="text"
                            name="username"
                            placeholder="Your username"
                            bind:value={username}
                    />
                    <ListInput
                            type="password"
                            name="password"
                            placeholder="Your password"
                            bind:value={password}
                    />
                </List>
                <List>
                    <ListButton title="Sign In" onClick={() => alertLoginData()}/>
                </List>
                <BlockFooter>
                    Some text about login information.<br/>Click "Sign In" to close Login Screen
                </BlockFooter>
            </Page>
        </View>
    </LoginScreen>
</App>
<script>
    import {onMount} from 'svelte';

    import {
        App,
        Block,
        BlockFooter,
        f7,
        f7ready,
        Link,
        List,
        ListButton,
        ListInput,
        LoginScreen,
        LoginScreenTitle,
        Navbar,
        NavRight,
        Page,
        Panel,
        Popup,
        Toolbar,
        View,
        Views
    } from 'framework7-svelte';

    import Matrix from "../pages/matrix.svelte"

    import routes from '../js/routes';
    // import store from '../js/store';


    // Framework7 Parameters
    let f7params = {
        name: 'My App', // App name
        theme: 'auto', // Automatic theme detection


        // App store
        // store: store,
        // App routes
        routes: routes,
    };
    // Login screen demo data
    let username = '';
    let password = '';


    function alertLoginData() {
        f7.dialog.alert('Username: ' + username + '<br>Password: ' + password, () => {
            f7.loginScreen.close();
        });
    }

</script>
