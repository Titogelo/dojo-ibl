angular.module('DojoIBL')

    .controller('ActivityController', function ($scope, $sce, $stateParams, Session, ActivityService, AccountService, Response, ResponseService) {
        $scope.activity = ActivityService.getItemFromCache($stateParams.activityId);
        console.log($scope.activity);

        AccountService.myDetails().then(
            function(data){
                $scope.myAccount = data;
            }
        );

        $scope.games = {};
        $scope.games.games = [];

        Response.getResponsesForActivity({runId: $stateParams.runId, itemId: $stateParams.activityId })
            .$promise.then(function (data) {

                console.log(data)
                $scope.games.games = $scope.games.games.concat(data.responses);
                //for (i = 0; i < data.responses.length; i++) {
                //    //GameService.storeInCache(data.games[i]);
                //    data.responses[i].description = $sce.trustAsHtml(data.games[i].description);
                //
                //}
                //$scope.games = GameService.getGames();
                $scope.games.resumptionToken = data.resumptionToken;
                $scope.games.serverTime = data.serverTime;

                if (data.resumptionToken) {
                    $scope.disableGameLoading = false
                } else {
                    $scope.disableGameLoading = true
                }

            });

        $scope.sendComment = function(){
            AccountService.myDetails().then(function(data){
                ResponseService.newResponse({
                    "type": "org.celstec.arlearn2.beans.run.Response",
                    "runId": $stateParams.runId,
                    "deleted": false,
                    "generalItemId": $stateParams.activityId,
                    "userEmail": data.accountType+":"+data.localId,
                    "responseValue": $scope.response,
                    "parentId": 0,
                    "revoked": false,
                    "lastModificationDate": new Date().getTime()
                }).then(function(data){
                    console.log(data);

                    $scope.games.games.push(data);

                    $scope.response = null;
                });
            });
        };

        $scope.removeComment = function(data){
            console.log(data);
            var idx = $scope.games.games.indexOf(data);

            // is currently selected
            if (idx > -1) {
                $scope.games.games.splice(idx, 1);
            }
            ResponseService.deleteResponse(data.responseId);
        };

        //$scope.disableGameLoading = false;
        //
        //$scope.loadMoreGames = function () {
        //
        //    $scope.disableGameLoading = true;
        //
        //
        //
        //};

        //if(res.parentId != 0){
        //
        //    var childView = new ResponseView({ model: response.toJSON(), user: user[0] });
        //    this.childViews.push(childView);
        //    childView = childView.render().el;
        //
        //    if($("textarea[responseid='"+res.parentId+"']").parent().parent().length == 0){
        //        $("div[data-item='"+res.parentId+"']").parent().append(childView);
        //    }else{
        //        $(childView).insertBefore($("textarea[responseid='"+res.parentId+"']").parent().parent());
        //    }
        //    this.childViews.push(childView);
        //}else{
        //    var view = new ResponseView({ model: response.toJSON(), user: user[0] });
        //    this.childViews.push(view);
        //    view = view.render().el;
        //    this.$el.find('#list_answers').append(view);
        //}


        $scope.trustSrc = function(src) {
            return $sce.trustAsResourceUrl(src);
        }
    }
);