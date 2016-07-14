
var constant = require('./constant');

exports.somethingWentWrongError = function (res) {

    var errResponse = {
        status: constant.responseStatus.ERROR_IN_EXECUTION,
        message: constant.responseMessage.ERROR_IN_EXECUTION,
        data: {}
    }
    sendData(errResponse,res);
};

exports.parameterMissingError = function (res) {

    var errResponse = {
        status: constant.responseStatus.PARAMETER_MISSING,
        message: constant.responseMessage.PARAMETER_MISSING,
        data: {}
    }
    sendData(errResponse,res);
};

exports.sendErrorMessage = function (msg,res,status) {

    var errResponse = {
        status: status,
        message: msg,
        data: {}
    };
    sendData(errResponse,res);
};

exports.sendSuccessData = function (data,message,res,status) {

    var successResponse = {
        status: status,
        message: message,
        data: data
    };
    sendData(successResponse,res);
};





function sendData(data,res)
{
    res.type('json');
    res.jsonp(data);
}