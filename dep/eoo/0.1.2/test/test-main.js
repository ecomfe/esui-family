var allTestFiles = [];

for (var file in window.__karma__.files) {
    if (/spec\/.+\.js$/.test(file)) {
        allTestFiles.push(file);
    }
}

require.config({
    // Karma serves files under /base, which is the basePath from your config file
    baseUrl: '/base/src',

    // dynamically load all test files
    deps: allTestFiles,
    packages: [
        {
            name: 'eoo',
            location: '.'
        }
    ],

    // we have to kickoff jasmine, as it is asynchronous
    callback: window.__karma__.start
});