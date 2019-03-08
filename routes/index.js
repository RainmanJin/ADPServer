'use strict';
let homeWelcome = function(req, res, next){
    res.render('index', { title: 'Home-Page' });
};
let indexFn = function(req, res, next){
    res.render('index', { title: 'Index-Page' });
};

module.exports = {
    // 'GET /':homeWelcome,
    'GET /page/home':homeWelcome,               
    'GET /page/index':indexFn
};
