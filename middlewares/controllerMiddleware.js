'use strict';
const fs = require('fs');
function addMapping(router, mapping) {
    for (var url in mapping) {
        if (url.startsWith('GET ')) {
            let path = url.substring(4);
            router.get(path, mapping[url]);
            // console.log(`URL mapping: GET ${path}`);
        } else if (url.startsWith('POST ')) {
            let path = url.substring(5);
            router.post(path, mapping[url]);
            // console.log(`URL mapping: POST ${path}`);
        }else if(url.startsWith('PUT ')){
            let path = url.substring(4);
            router.put(path, mapping[url]);
            // console.log(`URL mapping: PUT ${path}`);
        }else if(url.startsWith('DELETE ')){
            var path = url.substring(7);
            router.delete(path, mapping[url]);
            // console.log(`URL mapping: DELETE ${path}`);
        }else {
            // console.log(`invalid URL: ${url}`);
        }
    }
}
function addControllers(router,controllersFatherPath) {
    let $controllersFatherPath = controllersFatherPath;
    var files = fs.readdirSync($controllersFatherPath);
    var jsFiles = files.filter((f) => {
        return f.endsWith('.js');
    });
    for (var f of jsFiles) {
        // console.log(`process controller: ${f}...`);
        let mapping = require($controllersFatherPath + f);
        addMapping(router, mapping);
    }
}
module.exports = function(controllersFatherPath){
    let $controllersFatherPath = controllersFatherPath+'/',
        router = require('express').Router();
    addControllers(router,$controllersFatherPath);
    return router;
};