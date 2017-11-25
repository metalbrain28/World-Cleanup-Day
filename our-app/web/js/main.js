"use strict";

function BaseClass() {}

BaseClass.prototype = {
    init: function() {
        console.log("Init!");
    }
};

var baseClass = new BaseClass();
