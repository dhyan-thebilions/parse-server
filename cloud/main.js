async function loadModule() {
    const module = await import('./functions.js');
}

loadModule();
