const libcore = require('./dist/lib/core/core');
const libroute = require('./dist/lib/route/route');
const http = require('http');


var server;
exports.Run = (config, appstart) => {
    if (!config['BaseDir'])
        throw new Error("Must specify server base dir at least.");
    libcore.UpdateGlobalVariable('ServerBaseDir', config['BaseDir']);
    let port = 926;
    if (config['Port'])
        port = config['Port'];

    if (config['PageNotFound'])
    // libcore.SetGlobalVariable('PageNotFound', config['PageNotFound']);
        throw new Error('Not implemented!');

    if (config['Controllers']) {
        config['Controllers'].forEach(ele => {
            libcore.RegisterController(ele);
        });
    }
    if (config['WebDir']) {
        libcore.SetGlobalVariable('WebDir', config['WebDir']);
    }
    if (config['ControllerDir']) {
        libcore.SetGlobalVariable('ControllerDir', config['ControllerDir']);
    }
    if (config['ViewDir']) {
        libcore.SetGlobalVariable('ViewDir', config['ViewDir']);
    }
    if (config['ModelDir']) {
        libcore.SetGlobalVariable('ModelDir', config['ModelDir']);
    }

    if (config['MaxCacheSize']) {
        try {
            let config_size = parseInt(config['MaxCacheSize']);
            let installed_memory = parseInt(require('os').totalmem() / 1024 / 1024);
            if (config_size > 0.2 * installed_memory) {
                config_size = 0.2 * installed_memory;
                console.log('MaxCacheSize exceeded limitation, reduce to', config_size, 'MB');
            } else console.log('Maximum cache size set to', config_size, 'MB');
            libcore.SetGlobalVariable('MaxCacheSize', config_size);
        } catch (error) {
            console.error('Configuration property "MaxCacheSize" is not a valid number');
        }
    }

    if (appstart)
        appstart(libroute.Route.GetRoute());
    else throw new Error("Error SH020701: Missing appstart method");

    libcore.RegisterRouter(libroute.Route.GetRoute());

    server = http.createServer((req, res) => {
        libcore.RoutePath(req.url, req, res);
    });


    server.listen(port);

    console.log('Server started on port:', port);
}