exports.config = {
    allScriptsTimeout: 99999,
    capabilities: {
        'browserName': 'firefox'
    },
    directConnect: true,
    baseUrl: 'http://localhost:8001/',
    framework: 'jasmine',
    specs: ['./src/test/javascript/e2e/*.js'],
    jasmineNodeOpts: {
        showColors: true,
        defaultTimeoutInterval: 10000,
        isVerbose : false,
        includeStackTrace : false
    },
    count: 3,
    maxInstances: 3,

};