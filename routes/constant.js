function define(obj, name, value) {
    Object.defineProperty(obj, name, {
        value:        value,
        enumerable:   true,
        writable:     false,
        configurable: false
    });
}


exports.responseStatus = {};
define(exports.responseStatus, "PARAMETER_MISSING", 1);
define(exports.responseStatus, "SUCCESS", 4);
define(exports.responseStatus, "ERROR_IN_EXECUTION", 8);


exports.responseMessage = {};
define(exports.responseMessage, "PARAMETER_MISSING", "Some parameter missing" );
define(exports.responseMessage, "ERROR_IN_EXECUTION", "Something went wrong" );
define(exports.responseMessage, "NO_DATA_FOUND","No data found");
define(exports.responseMessage, "SUCCESS","Success");
define(exports.responseMessage, "SUPPLIER_REG","Registration Completed");
