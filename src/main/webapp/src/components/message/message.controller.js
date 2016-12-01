angular.module('DojoIBL')

    .controller('InstantMessagingController', function ($window, $scope, $stateParams, Message, MessageService,
                                                        ChannelService, AccountService, UserService, ngAudio) {

        var loadMessages = function(anyThing){
            UserService.getUsersForRun(anyThing).then(function(data){
                $scope.usersRun = data;
            }).then(function(){
                $scope.messages = {};
                $scope.messages.messages = [];

                $scope.loadMoreButton = false;
                $scope.disableMessagesLoading = false;

                // Option 1
                $scope.messages.messages = MessageService.getMessages($stateParams.runId);

                // Option 2 - new
                //$scope.loadMoreMessages = function () {
                //
                //    $scope.disableMessagesLoading = true;
                //
                //    Message.resume({resumptionToken: $scope.messages.resumptionToken, runId: $stateParams.runId, from: 0 })
                //        .$promise.then(function (data) {
                //
                //            var messages = [];
                //
                //            angular.forEach(data.messages, function(message){
                //                messages.push(message);
                //            });
                //
                //            $scope.messages.messages = $scope.messages.messages.concat(messages);
                //            $scope.messages.resumptionToken = data.resumptionToken;
                //            $scope.messages.serverTime = data.serverTime;
                //
                //            if (data.resumptionToken) {
                //                $scope.disableMessagesLoading = false
                //            } else {
                //                $scope.disableMessagesLoading = true
                //            }
                //        });
                //};
            });
        }
        $scope.scroll = 0;
        AccountService.myDetails().then(
            function(data){
                $scope.myAccount = data;
            }
        );

        $scope.$on('inquiry-run', function(event, args) {
            loadMessages(args.runId)
        });

        $scope.account = AccountService.myDetailsCache();

        loadMessages($stateParams.runId);



        $scope.bodyMessage;
        $scope.glued = true;

        $scope.sendMessage = function() {
            var m = $scope.bodyMessage;
            $scope.bodyMessage = null;
            AccountService.myDetails().then(function(data){
                if(m){
                    MessageService.newMessage({
                        runId: $stateParams.runId,
                        threadId: data.accountType + ":" + data.localId,
                        subject: "empty",
                        body: m
                    }).then(function(data){
                    });
                }
            });
        };

        $scope.numberMessages = 0;

        ChannelService.register('org.celstec.arlearn2.beans.run.Message', function (notification) {
            //console.info("[Notification][Message]", notification);
            if (notification.runId == $stateParams.runId) {
                $scope.numberMessages += 1;

                MessageService.getMessageById(notification.messageId).then(function (data) {
                    //if(me.localId != data.senderId){
                    //    $scope.sound = ngAudio.load("/src/assets/beep.m4a");
                    //    $scope.sound.play();
                    //}
                });
            }
        });

        $scope.notifications = [];
        $scope.waitingForData = function () {
            $scope.notifications.length == 0;
        };
    }
);