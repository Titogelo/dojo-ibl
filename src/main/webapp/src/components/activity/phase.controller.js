angular.module('DojoIBL')

    .controller('PhaseController', function ($scope, $sce, $stateParams, $state, toaster, Session, ActivityService, RunService, ChannelService) {
        $scope.runId = $stateParams.runId;



        ChannelService.register('org.celstec.arlearn2.beans.run.GeneralItemsStatus', function (notification) {

            console.log(notification)

            ActivityService.refreshActivityStatus(notification.generalItemId, $scope.gameId, $stateParams.runId);
            //toaster.success({
            //    title: 'Activity modified',
            //    body: 'The structure of the activity has been modified.'
            //});
        });

        $scope.activities = ActivityService.getActivitiesStatus($stateParams.runId);
        console.log($scope.activities)

        RunService.getRunById($stateParams.runId).then(function(data){

            $scope.phase = data.game.phases[$stateParams.phase];
            $scope.phase.num = $stateParams.phase;

            ActivityService.getActivitiesServerStatus(data.game.gameId, $stateParams.runId);

            $scope.activitiesTodo = [];
            $scope.activitiesInProgress = [];
            $scope.activitiesCompleted = [];

            $scope.gameId = data.game.gameId;

            //ActivityService.getActivitiesForPhase(data.game.gameId, $stateParams.phase).then(function (data) {
            //    angular.forEach(data, function(activity){
            //        ActivityService.getActivityStatus($stateParams.runId, activity.id).then(function(status){
            //            switch(status.status){
            //                case 0:
            //                    $scope.activitiesTodo.push(activity);
            //                    break;
            //                case 1:
            //                    $scope.activitiesInProgress.push(activity);
            //                    break;
            //                case 2:
            //                    $scope.activitiesCompleted.push(activity);
            //                    break;
            //                default:
            //                    $scope.activitiesTodo.push(activity);
            //            }
            //        });
            //    });
            //});


        });

        $scope.sortableOptions = {
            connectWith: ".connectList",
            scroll: false,
            receive: function(event, ui) {
                var item = ui.item.scope().activity;
                var group = event.target;
                //ActivityService.changeActivityStatus($stateParams.runId, item.id,group.id).then(function (data) {
                //    switch(data.status){
                //        case 0:
                //            toaster.success({
                //                title: 'Moved to ToDo list',
                //                body: 'The activity has been successfully moved to the ToDo list.'
                //            });
                //            break;
                //        case 1:
                //            toaster.success({
                //                title: 'Moved to In Progress list',
                //                body: 'The activity has been successfully moved to the In Progress list.'
                //            });
                //            break;
                //        case 2:
                //            toaster.success({
                //                title: 'Moved to Completed list',
                //                body: 'The activity has been successfully moved to the Completed list.'
                //            });
                //            break;
                //    }
                //
                //});
            },
            'ui-floating': 'auto',
            'start': function (event, ui) {
                if($scope.sortableFirst){
                    $scope.wscrolltop = $(window).scrollTop();
                }
                $scope.sortableFirst = true;
            },
            'sort': function (event, ui) {
                ui.helper.css({'top': ui.position.top + $scope.wscrolltop + 'px'});
            }
        };

        $scope.getRoleName = function(roles){
            if(!angular.isUndefined(roles)) {
                try{
                    if (!angular.isUndefined(roles[0])) {
                        return roles[0].name;
                    }
                }catch(e){
                    return "-";
                }
            }
            return "-";
        };


        $scope.getRoleColor = function(roles){

            if(!angular.isUndefined(roles)) {
                try{
                    if (!angular.isUndefined(roles[0])) {
                        return {
                            "border-left": "3px solid "+roles[0].color
                        };
                    }
                }catch(e){
                    return {
                        "border-left": "3px solid #2f4050"
                    };
                }
            }
            return {
                "border-left": "3px solid #2f4050"
            };
        };


        function isEmpty(obj) {
            for(var prop in obj) {
                if(obj.hasOwnProperty(prop))
                    return false;
            }
            return true;
        }
    }
);