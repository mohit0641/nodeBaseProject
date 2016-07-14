var async = require('async');
var sendResponse = require('./sendResponse.js');
var constant = require('./constant.js');
var connection = require('./db.js');
var login=require('./signup.js');

exports.getData = function(userId, res) {
  var data={};
  var posts=[];
  var status={};
  var comments=[];
    async.auto({
        getName:function(callback) {
            var q = ' select name from user where id ='+userId;
            connection.query(q,function(err, result) {
                if (err)
                    callback(err);
                else{
                    data.userName=result[0].name;
                    callback(null);
                }
            });

        },
        getPost:['getName',function (callback) {
            var q = ' select id,status,likes from post where created_by ='+userId;
            connection.query(q,function(err, post) {
                if (err)
                    callback(err);
                else{
               if(post.length){
                   for(var j=0;j<post.length;j++){
                       (function (j) {
                               var q1='select comment from comment where post_id = '+post[j].id;
                               connection.query(q1,function(err, comment) {
                                   if (err){
                                       console.log("err",err);
                                       callback(err);
                                   }
                                   else{
                                       if(comment.length){
                                           for(var i=0;i<comment.length;i++){
                                               (function (i) {
                                                   comments.push(comment[i].comment);
                                                   if(i==comment.length-1){
                                                       posts.push({
                                                          'post':post[j].status,
                                                          'likes':post[j].likes,
                                                           'comments':comments
                                                       });
                                                       comment=[];
                                                       if(j==post.length-1){
                                                           data.status=posts;
                                                           callback(null);
                                                       }
                                                   }
                                               }(i))
                                           }
                                       }
                                       else {
                                           posts.push({
                                               'post':post[j].status,
                                               'likes':post[j].likes,
                                               'comments':comments
                                           })
                                           if(j==post.length-1){
                                               data.status=posts;
                                               callback(null);
                                           }
                                       }
                                   }
                               });
                       }(j))
                   }
               }
                    else {
                        data.staus=[];
                        callback(null)
                    }

                }
            });

        }]
    }, function(err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res);
        } else {
            sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
        }
    });

}

exports.addPost = function(req, res) {
    var postText = req.body.status;
    var userId = req.body.userId;
    var values=[postText,userId];
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
        insertPost: ['checkempty',function (callback) {
            var q = ' insert into post(status,created_by) values(?,?) ';
            connection.query(q, [postText, userId], function(err, result) {
                if (err)
                    sendResponse.somethingWentWrongError(err);
                else {
                        callback(null);
                }

            })
        }]
    },function(err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res);
        } else {
            var data=[];
            sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
        }
    });

}

exports.addComment =  function(req,res) {
    var postId=req.body.postId;
	var likes = req.body.like || 0;
	var userId = req.body.userId;
	var comment  = req.body.comment||"";
	var values=[postId,userId];
    var flag=0;
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
        insertComment: ['checkempty',function (callback) {
           if(comment.length){
               var q = ' insert into comment(post_id,comment,user_id) values(?,?,?) ';
               connection.query(q,[postId,comment,userId],function(err,result)
               {
                   if(err)
                       sendResponse.somethingWentWrongError(err);
                   else
                   {
                      callback(null);
                   }
               })
           }
            else {
               callback(null);
           }
        }],
        checkLike:['insertComment',function (callback) {
            var q1="select id from likes where post_id="+postId+" and like_by ="+userId;
            connection.query(q1,function (err,result) {
                if(err){
                    sendResponse.somethingWentWrongError(err);
                }
                else {
                    if(result.length){
                        flag=1;
                        callback(null);
                    }
                    else {
                        callback(null);
                    }
                }
            })
        }],
        likePost:['checkLike',function (callback) {
            if(flag==1){
                callback(null);
            }
            else {
                var q1='update post set likes = likes + ? where id = ?'
                connection.query(q1,[likes,postId],function (err,result) {
                    if(err){
                        sendResponse.somethingWentWrongError(err);
                    }
                    else {
                        var q2= ' insert into likes(post_id,like_by) values(?,?) ';
                        connection.query(q2,[postId,userId],function(err,result)
                        {
                            if(err)
                                sendResponse.somethingWentWrongError(err);
                            else
                            {
                                callback(null);
                            }
                        })
                    }
                })
            }
        }]
    },function(err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res);
        } else {
            var data=[];
            sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
        }
    });
}