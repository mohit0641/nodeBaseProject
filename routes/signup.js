var async = require('async');
var validator = require("email-validator");
var bcrypt = require('bcrypt');
var sendResponse = require('./sendResponse.js');
var constant = require('./constant.js');
var connection = require('./db.js');
var nodemailer = require('nodemailer');
const saltRounds = 10;
var profile = require('./profile.js');
var login=require('./signup.js');

exports.signUp = function(req, res) {
    var email = req.body.email;
    var device_id = req.body.deviceId;
    var password = req.body.password;
    var name = req.body.name;
    //console.log('body', req.body);
    var hash = 0;
    var values=[email,password,device_id,name];
    async.auto({
        checkempty: function (callback) {
            login.checkBlank(res, values, function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    callback(null);
                }
            })
        },
        validEmail:['checkempty',function(callback) {
            var checkEmail = validator.validate(email);
            //console.log('valid email')
            if (checkEmail)
                callback(null);
            else {
                var msg = "enter valid email";
                sendResponse.sendErrorMessage(msg, res, constant.responseMessage.NO_DATA_FOUND);
            }

        }],
        checkDevice: ['validEmail',function(callback) {
          var  q = 'select * from user where device_id = ? ';
            //console.log('check device')
            connection.query(q, [device_id], function(err, result) {
                if (err)
                    callback(err);

                else if (result.length) {
                    var msg = "device id already registered";
                    sendResponse.sendErrorMessage(msg, res, constant.responseMessage.NO_DATA_FOUND);

                } else
                    callback(null);
            });
        }],
        checkEmail: ['checkDevice',function(callback) {
         //   console.log('check email')
           var q = 'select * from user where email = ? ';
            connection.query(q, [email], function(err, result) {
                if (err)
                    callback(err);

                else if (result.length != 0) {
                    var msg = "email id already registered";
                    sendResponse.sendErrorMessage(msg, res, constant.responseMessage.NO_DATA_FOUND);

                } else
                    callback(null);
            });

        }],
        checkPassword:['checkEmail',function(callback) {
            //console.log('check pass')
            var salt = bcrypt.genSaltSync(saltRounds);
            hash = bcrypt.hashSync(password, salt);
            callback(null);


        }],
        storeData: ['checkPassword', function(callback) {
                //console.log('store data');
              var  q = ' insert into user(email,device_id,password,name) value(?,?,?,?) ';
                connection.query(q, [email, device_id, hash, name], function(err, result) {
                    if (err)
                        callback(err);
                    else
                        callback(null, result);
                })
            }
        ],
        sendEmail: ['storeData', function(callback) {
                // console.log(config.get('EmailCredentials.email'));
                var transporter = nodemailer.createTransport("SMTP", {
                        service: "Gmail",
                        auth: {
                            user: 'mg1042600@gmail.com',//senderId
                            pass: 'pas####'//password
                        }
                    })
                var mailOptions = {
                    from: 'mg1042600@gmail.com', // sender address
                    to: email, // list of receivers
                    subject: constant.responseMessage.SUPPLIER_REG, // Subject line
                    html: '<h1> Welcome </h1>:' + email // html body
                };

                // send mail with defined transport object
                transporter.sendMail(mailOptions, function(error, info) {
                    if (error) {
                        console.log("message can't sent");
                        callback(null);
                    } else {
                        console.log('Message sent: ' + JSON.stringify(info));
                        callback(null);
                    }

                });
            }]
    }, function(err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res);
        } else {
            var data=[];
            sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
        }
    })
}

exports.signIn = function(req, res) {
    var email = req.body.email;
    var pass = req.body.password;
    var pass1 = 0;
    var userId =0;
    var values=[email,pass];
    async.auto({
        checkempty: function (callback) {
            login.checkBlank(res, values, function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    callback(null);
                }
            })
        },
        checkEmail:['checkempty',function(callback) {
            var q = ' select * from user where email = ? limit 1 ';
           // console.log('q=========', q);
            connection.query(q, [email], function(err, result) {
                if (result.length != 0) {
                    pass1 = result[0].password;
                    userId = result[0].id;
                    callback(null);
                } else {
                    var msq='invalid email';
                    sendResponse.sendErrorMessage(msq, res, constant.responseMessage.NO_DATA_FOUND);
                }
            });
        }],
        checkPass: ['checkEmail', function(callback) {
               //console.log('pass==========', pass1)
                //console.log('password----------', pass);
                var bool = bcrypt.compareSync(pass, pass1); // 
              //console.log('bool-----',bool);
                if (bool == true)
                    {
                    	profile.getData(userId ,res);
                    }
                else
                    { 
                        var msg = "wrong password";
                sendResponse.sendErrorMessage(msg, res, constant.responseMessage.NO_DATA_FOUND);}
            }],
    }, function(err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res);
        } else {

            sendResponse.sendSuccessData(result, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
        }
    });
}

exports.checkBlank = function (res, manValues, callback) {
    var checkBlankData = checkBlank(manValues);

    if (checkBlankData) {
        sendResponse.parameterMissingError(res);
    } else {
        callback(null);
    }
}

function checkBlank(arr) {

    var arrlength = arr.length;
    //   console.log("================" + arr);
    for (var i = 0; i < arrlength; i++) {
        //   console.log("==============array values===============" + arr[i]);
        //   console.log(typeof arr[i]);
        if (arr[i] == undefined) {
            return 1;
            break;
        }
        else if (arr[i].toString().trim() == '') {
            return 1;
            break;
        } else if (arr[i] == '(null)') {
            return 1;
            break;
        }
    }
    return 0;
}