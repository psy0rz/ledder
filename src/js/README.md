Overal structure:

./web: Web interface client stuff
 * Uses framework7 with Svelte

./server: Server side stuff:
 * RPC server
 * static webserver
 * Animation runner
 * Matrix drivers 
 * Preset handling and store
 * Preview image generation

./ledder: Ledder core framework. 
 * Should have minimal dependencies.
 * Used both on server and client side.

./ledder/animation: Actual animation repository. e.g. the good stuff :)

