angular.module('DojoIBL')

    .controller('InquiryEditGameController', function ($scope, $sce, $stateParams, $state, $modal, Session, RunService, ActivityService,
                                                       AccountService, ChannelService, GameService, UserService, toaster, $interval,
                                                       uiCalendarConfig, $anchorScroll, $location, config) {

        // Managing different tabs activities
        $scope.lists = [];
        $scope.selection = [];

        GameService.getGameById($stateParams.gameId).then(function(data){
            if (data.error) {
                $scope.showNoAccess = true;
            } else {
                $scope.show = true;
            }

            $scope.game = data;

            if(!$scope.game.config.roles)
                $scope.game.config.roles = [];
            else{
                //$scope.game.config.roles = new JSONObject(data.config.roles);
            }

            if(!$scope.game.config.roles2)
                $scope.game.config.roles2 = [];
            else{
                //$scope.game.config.roles = new JSONObject(data.config.roles);
            }

            $scope.phases = $scope.game.phases;

            if (data.lat) {
                $scope.coords.latitude = data.lat;
                $scope.coords.longitude = data.lng;
                $scope.map.center.latitude = data.lat;
                $scope.map.center.longitude = data.lng;
                $scope.showMap = true;
            }

            // Original list of activities
            $scope.list_original = [
                //{'name': 'Google Resources', 'type': 'org.celstec.arlearn2.beans.generalItem.AudioObject', 'icon': 'fa-file-text'},
                {'name': 'Add text activity', 'type': 'org.celstec.arlearn2.beans.generalItem.NarratorItem', 'icon': 'fa-file-text'},
                {'name': 'Add external resource', 'type': 'org.celstec.arlearn2.beans.generalItem.VideoObject', 'icon': 'fa-external-link'},
                //{'name': 'Concept map', 'type': 'org.celstec.arlearn2.beans.generalItem.SingleChoiceImageTest', 'icon': 'fa-sitemap'},
                //{'name': 'External widget', 'type': 'org.celstec.arlearn2.beans.generalItem.OpenBadge', 'icon': 'fa-link'},
                //{'name': 'Research question', 'type': 'org.celstec.arlearn2.beans.generalItem.ResearchQuestion', 'icon': 'fa-question'}
                {'name': 'Add list activity', 'type': 'org.celstec.arlearn2.beans.generalItem.AudioObject', 'icon': 'fa-tasks'},
                {'name': 'Add data collection', 'type': 'org.celstec.arlearn2.beans.generalItem.ScanTag', 'icon': 'fa-picture-o'},
                {'name': 'Add multi activity', 'type': 'org.celstec.arlearn2.beans.generalItem.SingleChoiceImageTest', 'icon': 'fa-folder-o'}
            ];

            ActivityService.getActivitiesServer($stateParams.gameId);
        });

        $scope.deleteInquiry = function (id) {

            swal({
                title: "Are you sure?",
                text: "You will not be able to recover this inquiry!",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes, delete it!",
                closeOnConfirm: false
            }, function () {
                swal("Deleted!", "Your inquiry has been deleted.", "success");

                GameService.deleteGame(id);
                window.location.href=config.server+'/#/home';

            });

        };

        $scope.activities = ActivityService.getActivities();


        $scope.isActiveGroup1 = false;
        $scope.isActiveGroup2 = false;
        $scope.isActiveGroup3 = true;
        $scope.isActiveGroup4 = false;
        $scope.isActiveGroup5 = false;
        $scope.isActiveGroup6 = false;

        /********
         Calendar
         *******/
        $scope.events = [];

        $scope.events = ActivityService.getCalendarActivities()[$stateParams.gameId];

        if(angular.isUndefined($scope.events)){
            $scope.events = ActivityService.getCalendarActivities();
        }

        $scope.updateCalendar = function(){
        };

        $scope.eventSources = [$scope.events];

        $scope.alertOnEventClick = function( event, allDay, jsEvent, view ){
            $scope.editActivity(event.activity, event.activity.gameId)
        };

        $scope.alertOnDrop = function(event, dayDelta, minuteDelta, allDay, revertFunc, jsEvent, ui, view){
            event.activity.timestamp += (60*60*24*dayDelta*1000);
            event.activity.timestamp = new Date(event.activity.timestamp)
            ActivityService.newActivity(event.activity).then(function(data){
                ActivityService.refreshActivity(data.id, data.gameId);
            });
        };

        $scope.alertOnResize = function(event, dayDelta, minuteDelta, revertFunc, jsEvent, ui, view ){
            $scope.alertMessage = (event.title +': Resized to make dayDelta ' + minuteDelta);
        };

        $scope.uiConfig = {
            calendar:{
                firstDay:1,
                height: 450,
                editable: true,
                header: {
                    left: 'prev,next,today',
                    center: 'title',
                    right: 'month,agendaWeek,agendaDay'
                },
                eventClick: $scope.alertOnEventClick,
                eventDrop: $scope.alertOnDrop,
                eventResize: $scope.alertOnResize
            }
        };

        $scope.ok = function(){
            GameService.newGame($scope.game);

            toaster.success({
                title: 'Inquiry template modified',
                body: 'The inquiry "'+$scope.game.title+'" has been modified.'
            });
        };

        //////////////////////
        // Scrolling functions
        //////////////////////
        $scope.gotoAnchor = function(x) {
            var newHash = 'anchor' + x;
            if ($location.hash() !== newHash) {
                // set the $location.hash to `newHash` and
                // $anchorScroll will automatically scroll to it
                $location.hash(x);
            } else {
                // call $anchorScroll() explicitly,
                // since $location.hash hasn't changed
                $anchorScroll();
            }
        };

        ///////////////
        // Manage roles
        ///////////////
        $scope.addRole = function () {
            //$scope.game.config.roles.push($scope.role);
            GameService.addRole($scope.game.gameId, $scope.role).then(function(data){
                $scope.game = data;
            });

            toaster.success({
                title: 'Role added to inquiry',
                body: 'The role "'+$scope.role.name+'" has been added.'
            });

            $scope.role = null;
        };

        $scope.editRole = function (index) {

            GameService.editRole($scope.game.gameId, $scope.role, $scope.index).then(function(data){
                $scope.game = data;
            });

            toaster.success({
                title: 'Role modified',
                body: 'The role "'+$scope.role.name+'" has been edited.'
            });

            $scope.role = null;
        };

        $scope.clearRole = function (index) {
            $scope.role = null;
        };

        $scope.selectRole = function(index){
            $scope.index = index;
            $scope.role = $scope.game.config.roles2[index];

            $scope.removeRole = function(){
                GameService.removeRole($scope.game.gameId, $scope.role).then(function(data){
                    $scope.game = data;
                });

                toaster.warning({
                    title: 'Role deleted',
                    body: 'The role "'+$scope.role.name+'" has been removed.'
                });

                $scope.role = null;
            };
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

        ////////////////
        // Manage phases
        ////////////////
        $scope.currentPhase = 0;

        $scope.addPhase = function(){
            swal({
                title: "New phase",
                text: "Are you sure you want to add a phase?",
                type: "input",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes, create it!",
                inputPlaceholder: "New phase name",
                closeOnConfirm: false
            }, function (inputValue) {

                if (inputValue === false)
                    return false;
                if (inputValue === "") {
                    swal.showInputError("You need to write something!");
                    return false
                }

                swal("Well done!", "New phase created", "success");


                $scope.phases.push({
                    //phaseId: $scope.phases.length,
                    title: inputValue,
                    type: "org.celstec.arlearn2.beans.game.Phase"
                });

                //$scope.lists.push($scope.phases.length);
                //$scope.lists = [];

                toaster.success({
                    title: 'Phase added',
                    body: 'The phase "' + $scope.phaseName + '" has been added to the inquiry template.'
                });

                $scope.phaseName = "";

                $scope.game.phases = $scope.phases;

                GameService.newGame($scope.game).then(function (updatedGame) {

                    angular.forEach($scope.gameRuns, function (value, key) {

                        value.game = updatedGame;

                        RunService.storeInCache(value);
                    });
                });
            });
        };

        $scope.removePhase = function(index){

            swal({
                title: "Are you sure you want to delete the phase?",
                text: "You will not be able to recover this phase!",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes, delete the phase!",
                closeOnConfirm: false
            }, function () {
                swal("Phase deleted!", "The phase has been removed from the inquiry structure.", "success");

                toaster.warning({
                    title: 'Phase removed',
                    body: 'The phase "'+$scope.phases[index].title+'" has been removed from the inquiry template.'
                });

                $scope.phases.splice(index, 1);
                $scope.game.phases = $scope.phases;
                GameService.newGame($scope.game).then(function(updatedGame){
                    angular.forEach($scope.gameRuns, function(value, key) {
                        value.game = updatedGame;
                        RunService.storeInCache(value);
                    });
                });

                angular.forEach($scope.activities[$stateParams.gameId][index], function(i, a){
                    ActivityService.deleteActivity(i.gameId, i);
                });
            });

        };

        $scope.movePhase = function(x, y){

            swal({
                title: "Moving phase "+x+" to phase "+y,
                text: "You will switch phase positions. Current phase "+x+" will be "+y+" and phase "+y+" will be phase "+x,
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes, move them!",
                closeOnConfirm: false
            }, function () {
                swal("Phase moved!", "Phases have been reordered", "success");

                var b = $scope.phases[y];
                var acts = $scope.lists[y];

                $scope.phases[y] = $scope.phases[x];
                $scope.lists[y] = $scope.lists[x];

                $scope.phases[x] = b;
                $scope.lists[x] = acts;

                angular.forEach($scope.lists[x], function(i, a){
                    i.section = x;
                    ActivityService.newActivity(i).then(function(data){
                    });
                });

                angular.forEach($scope.lists[y], function(i,a){
                    i.section = y;
                    ActivityService.newActivity(i).then(function(data){
                    });
                });

                $scope.game.phases = $scope.phases;

                GameService.newGame($scope.game).then(function(updatedGame){

                    angular.forEach($scope.gameRuns, function(value, key) {

                        value.game = updatedGame;

                        RunService.storeInCache(value);
                    });
                });

                toaster.success({
                    title: 'Phase moved',
                    body: 'The phase has been moved successfully.'
                });
            });
        };

        $scope.renamePhase = function(index){
            swal({
                title: "Rename phase "+index+" '"+$scope.phases[index].title+"'?",
                text: "Are you sure you want to rename the phase?",
                type: "input",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes, rename it!",
                inputPlaceholder: "New phase name",
                closeOnConfirm: false,
                inputValue: $scope.phases[index].title
            }, function (inputValue) {

                if (inputValue === false)
                    return false;
                if (inputValue === "") {
                    swal.showInputError("You need to write something!");
                    return false
                }

                swal("Well done!", "You renamed the phase, now it's called: " + inputValue, "success");

                $scope.phases[index].title = inputValue;

                $scope.game.phases = $scope.phases;

                GameService.newGame($scope.game).then(function(updatedGame){

                    angular.forEach($scope.gameRuns, function(value, key) {
                        value.game = updatedGame;

                        RunService.storeInCache(value);
                    });
                });

                toaster.success({
                    title: 'Phase renamed',
                    body: 'The phase has been renamed successfully.'
                });

            });
        };

        //////////////////////
        // Manage inquiry runs
        //////////////////////
        RunService.getParticipateRunsForGame($stateParams.gameId).then(function(data){
            if (data.error) {
                $scope.showNoAccess = true;
            } else {
                $scope.show = true;
            }

            $scope.gameRuns = data;


            $scope.usersRun = [];

            angular.forEach($scope.gameRuns, function(value, key) {
                $scope.usersRun[value.runId] = [];
                UserService.getUsersForRun(value.runId).then(function(data){

                    $scope.usersRun[value.runId] = data;

                });
            });
        });

        $scope.removeRun = function(run){

            swal({
                title: "Are you sure you want to delete the inquiry run?",
                text: "You will not be able to recover this inquiry run!",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes, delete the run!",
                closeOnConfirm: false
            }, function () {
                swal("Inquiry run deleted!", "The Inquiry Run has been removed from the list of inquiry runs.", "success");

                delete $scope.gameRuns["id"+run.runId];

                var updatedRun = RunService.deleteRun(run.runId);
            });
        };

        $scope.createInquiryRun = function(){
            // Add the link between run and game
            $scope.run.gameId = $stateParams.gameId;
            $scope.run.game = $scope.game;

            RunService.newRun($scope.run).then(function(run){
                // Update run with data from the server
                $scope.run = run;

                if(angular.isUndefined($scope.gameRuns)){
                    $scope.gameRuns = []
                }
                if(angular.isUndefined($scope.usersRun)){
                    $scope.usersRun = []
                }

                angular.forEach($scope.accountsAccesGame, function (gameAccess) {
                    if(gameAccess.accessRights == 1){
                        RunService.giveAccess(run.runId, gameAccess.account, 2);

                        //console.log(gameAccess)

                        RunService.addUserToRun({
                            runId: run.runId,
                            email: gameAccess.account,
                            accountType: gameAccess.accountType,
                            localId: gameAccess.localId,
                            gameId: run.game.gameId });
                    }
                });

                //$scope.gameRuns.push(run);
                AccountService.myDetails().then(function(data){

                    $scope.me = data;

                    // Grant me access to the run
                    RunService.giveAccess($scope.run.runId, data.accountType+":"+data.localId,1);

                    if(angular.isUndefined($scope.usersRun[$scope.run.runId])){
                        $scope.usersRun[$scope.run.runId] = []
                    }

                    var newUsers = [];

                    // Add me as a user to the run
                    var user = RunService.addUserToRun({
                        runId: $scope.run.runId,
                        email: data.accountType+":"+data.localId,
                        accountType: data.accountType,
                        localId: data.localId,
                        gameId: $stateParams.gameId
                    });

                    newUsers.push(user);

                    $scope.gameRuns[$scope.run.runId] = $scope.run;
                    angular.extend($scope.usersRun[$scope.run.runId], newUsers);

                    // Reset the run variable to create new ones
                    $scope.run = null;
                });
            });
        };

        $scope.addUsersToRun = function (run, game) {

            $scope.runVar = run;
            $scope.gameVar = game;

            var modalInstance = $modal.open({
                templateUrl: '/src/components/home/add.user.modal.html',
                controller: 'AddUserCtrl',
                resolve: {
                    run: function () {
                        return $scope.runVar;
                    },
                    game: function () {
                        return $scope.gameVar;
                    }
                }
            });

            modalInstance.result.then(function (result){
                angular.extend($scope.usersRun[$scope.runVar], result);
            });

        };

        ///////////////////////
        // Manage access rights
        ///////////////////////
        AccountService.myDetails().then(function(data){
           $scope.me = data;
        });

        GameService.getGameAccesses($stateParams.gameId).then(function(data){
            $scope.accountsAccesGame = {};
            angular.forEach(data.gamesAccess, function (gameAccess) {
                AccountService.accountDetailsById(gameAccess.account).then(function(data){
                    var data_extended = angular.extend({}, data, gameAccess);
                    $scope.accountsAccesGame[gameAccess.account] = data_extended;
                });
            });
        });

        $scope.grantEditorAccess = function (game, user){
            GameService.giveAccess(game.gameId, user.accountType+":"+user.localId,1);
            $scope.accountsAccesGame[user.account].accessRights = 1;

            angular.forEach($scope.gameRuns, function(run){
                RunService.giveAccess(run.runId, user.account, 2);

                RunService.addUserToRun({
                    runId: run.runId,
                    email: user.account,
                    accountType: user.accountType,
                    localId: user.localId,
                    gameId: run.game.gameId });
            });
        };

        $scope.revokeEditorAccess = function (game, user){
            GameService.giveAccess(game.gameId, user.accountType+":"+user.localId,2);
            $scope.accountsAccesGame[user.account].accessRights = 2;
        };

        //////////////////
        // Extra functions
        //////////////////
        function arrayObjectIndexOf(myArray, searchTerm, property) {
            for(var i = 0, len = myArray.length; i < len; i++) {
                if (myArray[i][property] === searchTerm) return i;
            }
            return -1;
        }

        function count(obj) {
            if (obj === undefined) { // Old FF
                return 0;
            }

            if (obj.__count__ !== undefined) { // Old FF
                return obj.__count__;
            }

            if (Object.keys) { // ES5
                return Object.keys(obj).length;
            }

            // Everything else:

            var c = 0, p;
            for (p in obj) {
                if (obj.hasOwnProperty(p)) {
                    c += 1;
                }
            }

            return c;

        }

        ////////////////////
        // Manage activities
        ////////////////////
        $scope.addNewActivity = function (phase, game) {
            $scope.activity = {};

            if(ActivityService.getActivityInCached()){
                $scope.activity = ActivityService.getActivityInCached();
            }

            $scope.activity.section = phase;

            var activitySortKey;

            if(!angular.equals({}, $scope.activities)){
                activitySortKey = count($scope.activities[game.gameId][phase]);
            }else{
                activitySortKey = 0;
            }

            var modalInstance = $modal.open({
                templateUrl: '/src/components/home/new.activity.modal.html',
                controller: 'NewActivityController',
                resolve: {
                    activity: function () { return $scope.activity; },
                    game: function () { return game; },
                    key: function () { return activitySortKey; }
                }
            });

            modalInstance.result.then(function (result){

                if(angular.isUndefined($scope.lists[result.section])){
                    $scope.lists[result.section] = []
                }

                ActivityService.newActivity(result).then(function(data){
                     ActivityService.getActivityById(data.id, $stateParams.gameId).then(function(data){
                        if(!angular.isUndefined(result.roles2)){
                        }else{
                            $scope.lists[result.section].push(data);
                        }

                    });
                });

            }, function(){

                ActivityService.saveActivityInCache($scope.activity);
            });
        };

        $scope.editActivity = function (activity, game) {

            var modalInstance = $modal.open({
                templateUrl: '/src/components/home/new.activity.modal.html',
                controller: 'NewActivityController',
                resolve: {
                    activity: function () { return activity; },
                    game: function () { return game; },
                    key: function () { return activity.sortKey; }
                }
            });

            modalInstance.result.then(function (result){
                ActivityService.newActivity(result).then(function(data){});
            });
        };

        $scope.wscrolltop = '';
        $scope.sortableFirst = false;

        $scope.sortableOptions = {
            //connectWith: ".connectList",
            'scroll': false,
            'ui-floating': 'auto',
            'start': function (event, ui) {
                if($scope.sortableFirst){
                    $scope.wscrolltop = $(window).scrollTop();
                }
                $scope.sortableFirst = true;
            },
            'sort': function (event, ui) {
                ui.helper.css({'top': ui.position.top + $scope.wscrolltop + 'px'});
            },
            stop: function(e, ui) {
                var item = ui.item.scope().activity;
                var group = event.target;
                $.map($(this).find('li'), function(el) {
                    var sortKey = $(el).index();
                    el = angular.fromJson(el.id);

                    el.sortKey = sortKey;
                    ActivityService.newActivity(el).then(function(data){});
                });
            }
        };
    })
    .controller('NewActivityController', function ($scope, $stateParams, $modalInstance,
                                                   GameService, ActivityService, Upload,
                                                   activity, game, key, config, $interval) {

        $scope.saveActivity = function (){
            if(angular.isUndefined($scope.activity.id)){
                ActivityService.saveActivityInCache($scope.activity);
            }else{
                ActivityService.newActivity($scope.activity).then(function(data){
                    ActivityService.refreshActivity(data.id, data.gameId);
                });
            }
        };

        $scope.list_original = [
            //{'name': 'Google Resources', 'type': 'org.celstec.arlearn2.beans.generalItem.AudioObject', 'icon': 'fa-file-text'},
            {'name': 'Discussion', 'type': 'org.celstec.arlearn2.beans.generalItem.NarratorItem', 'icon': 'fa-file-text'},
            //{'name': 'External resource', 'type': 'org.celstec.arlearn2.beans.generalItem.VideoObject', 'icon': 'fa-external-link'},
            //{'name': 'Concept map', 'type': 'org.celstec.arlearn2.beans.generalItem.SingleChoiceImageTest', 'icon': 'fa-sitemap'},
            //{'name': 'External widget', 'type': 'org.celstec.arlearn2.beans.generalItem.OpenBadge', 'icon': 'fa-link'},
            //{'name': 'Research question', 'type': 'org.celstec.arlearn2.beans.generalItem.ResearchQuestion', 'icon': 'fa-question'}
            {'name': 'List + Discussion', 'type': 'org.celstec.arlearn2.beans.generalItem.AudioObject', 'icon': 'fa-tasks'},
            //{'name': 'Data collection', 'type': 'org.celstec.arlearn2.beans.generalItem.ScanTag', 'icon': 'fa-picture-o'},
            {'name': 'Text input + Discussion', 'type': 'org.celstec.arlearn2.beans.generalItem.MultipleChoiceTest', 'icon': 'fa-file-text'},
            {'name': 'Multi activity', 'type': 'org.celstec.arlearn2.beans.generalItem.SingleChoiceImageTest', 'icon': 'fa-list-alt'}
        ];

        $scope.game = game;
        $scope.activity = activity;
        $scope.key = key;

        $scope.activity.fileReferences = [];
        $scope.activity.gameId = $stateParams.gameId;
        $scope.activity.sortKey = key;

        $scope.dateOptions = {format: 'dd/mm/yyyy'}

        if(activity.type == null){
            activity.type = $scope.list_original[0].type;
        }

        GameService.getGameAssets($stateParams.gameId).then(function(data){
            $scope.assets = data;
        });

        // upload on file select or drop
        $scope.upload = function (file) {
            $scope.progressPercentage = 0;
            if(file){

                file.name = (file.name).replace(/\s+/g, '_');

                ActivityService.uploadUrl($stateParams.gameId, activity.id, file.name.replace(/\s+/g, '_')).$promise
                    .then(function(url){

                        Upload.rename(file, file.name.replace(/\s+/g, '_'));
                        Upload.upload({
                            url: url.uploadUrl,
                            data: {file: file}
                        }).then(function (resp) {

                            switch (true) {
                                case /video/.test(resp.config.data.file.type):
                                    //ResponseService.newResponse({
                                    //    "type": "org.celstec.arlearn2.beans.run.Response",
                                    //    "runId": $stateParams.runId,
                                    //    "deleted": false,
                                    //    "generalItemId": $stateParams.activityId,
                                    //    "userEmail": $scope.myAccount.accountType+":"+$scope.myAccount.localId,
                                    //    "responseValue": {
                                    //        "videoUrl": config.server +"/uploadService/"+$stateParams.runId+"/"+$scope.myAccount.accountType+":"+$scope.myAccount.localId+"/"+file.name.replace(/\s+/g, '_'),
                                    //        "fileName": file.name,
                                    //        "fileType": resp.config.data.file.type,
                                    //        "width": 3264,
                                    //        "height": 1840
                                    //    },
                                    //    "parentId": 0,
                                    //    "revoked": false,
                                    //    "lastModificationDate": new Date().getTime()
                                    //}).then(function(data){
                                    //
                                    //});
                                    break;
                                case /image/.test(resp.config.data.file.type):

                                    //console.log(resp)
                                    //console.log(config)
                                    //console.log(config.server +"/generalItems/"+activity.gameId+"/"+file.name.replace(/\s+/g, '_'))
                                    ///generalItems/5784321700921344/requst-a-demo.jpg

                                    //ResponseService.newResponse({
                                    //    "type": "org.celstec.arlearn2.beans.run.Response",
                                    //    "runId": $stateParams.runId,
                                    //    "deleted": false,
                                    //    "generalItemId": $stateParams.activityId,
                                    //    "userEmail": $scope.myAccount.accountType+":"+$scope.myAccount.localId,
                                    //    "responseValue": {
                                    //        "imageUrl": config.server +"/uploadService/"+$stateParams.runId+"/"+$scope.myAccount.accountType+":"+$scope.myAccount.localId+"/"+file.name.replace(/\s+/g, '_'),
                                    //        "fileName": file.name,
                                    //        "fileType": resp.config.data.file.type,
                                    //        "width": 3264,
                                    //        "height": 1840
                                    //    },
                                    //    "parentId": 0,
                                    //    "revoked": false,
                                    //    "lastModificationDate": new Date().getTime()
                                    //}).then(function(data){
                                    //
                                    //});
                                    break;
                                case /pdf/.test(resp.config.data.file.type):
                                    //ResponseService.newResponse({
                                    //    "type": "org.celstec.arlearn2.beans.run.Response",
                                    //    "runId": $stateParams.runId,
                                    //    "deleted": false,
                                    //    "generalItemId": $stateParams.activityId,
                                    //    "userEmail": $scope.myAccount.accountType+":"+$scope.myAccount.localId,
                                    //    "responseValue": {
                                    //        "pdfUrl": config.server +"/uploadService/"+$stateParams.runId+"/"+$scope.myAccount.accountType+":"+$scope.myAccount.localId+"/"+file.name.replace(/\s+/g, '_'),
                                    //        "fileName": file.name,
                                    //        "fileType": resp.config.data.file.type,
                                    //        "width": 3264,
                                    //        "height": 1840
                                    //    },
                                    //    "parentId": 0,
                                    //    "revoked": false,
                                    //    "lastModificationDate": new Date().getTime()
                                    //}).then(function(data){
                                    //
                                    //});
                                    break;
                                case /audio/.test(resp.config.data.file.type):
                                    //ResponseService.newResponse({
                                    //    "type": "org.celstec.arlearn2.beans.run.Response",
                                    //    "runId": $stateParams.runId,
                                    //    "deleted": false,
                                    //    "generalItemId": $stateParams.activityId,
                                    //    "userEmail": $scope.myAccount.accountType+":"+$scope.myAccount.localId,
                                    //    "responseValue": {
                                    //        "audioUrl": config.server +"/uploadService/"+$stateParams.runId+"/"+$scope.myAccount.accountType+":"+$scope.myAccount.localId+"/"+file.name.replace(/\s+/g, '_'),
                                    //        "fileName": file.name,
                                    //        "fileType": resp.config.data.file.type,
                                    //        "width": 3264,
                                    //        "height": 1840
                                    //    },
                                    //    "parentId": 0,
                                    //    "revoked": false,
                                    //    "lastModificationDate": new Date().getTime()
                                    //}).then(function(data){
                                    //
                                    //});
                                    break;
                                case /wordprocessingml|msword/.test(resp.config.data.file.type):
                                    //console.log(resp.config.data.file.type);
                                    //ResponseService.newResponse({
                                    //    "type": "org.celstec.arlearn2.beans.run.Response",
                                    //    "runId": $stateParams.runId,
                                    //    "deleted": false,
                                    //    "generalItemId": $stateParams.activityId,
                                    //    "userEmail": $scope.myAccount.accountType+":"+$scope.myAccount.localId,
                                    //    "responseValue": {
                                    //        "documentUrl": config.server +"/uploadService/"+$stateParams.runId+"/"+$scope.myAccount.accountType+":"+$scope.myAccount.localId+"/"+file.name.replace(/\s+/g, '_'),
                                    //        "fileName": file.name,
                                    //        "fileType": resp.config.data.file.type,
                                    //        "width": 3264,
                                    //        "height": 1840
                                    //    },
                                    //    "parentId": 0,
                                    //    "revoked": false,
                                    //    "lastModificationDate": new Date().getTime()
                                    //}).then(function(data){
                                    //
                                    //});
                                    break;
                                case /vnd.ms-excel|spreadsheetml/.test(resp.config.data.file.type):
                                    //console.log(resp.config.data.file.type);
                                    //ResponseService.newResponse({
                                    //    "type": "org.celstec.arlearn2.beans.run.Response",
                                    //    "runId": $stateParams.runId,
                                    //    "deleted": false,
                                    //    "generalItemId": $stateParams.activityId,
                                    //    "userEmail": $scope.myAccount.accountType+":"+$scope.myAccount.localId,
                                    //    "responseValue": {
                                    //        "excelUrl": config.server +"/uploadService/"+$stateParams.runId+"/"+$scope.myAccount.accountType+":"+$scope.myAccount.localId+"/"+file.name.replace(/\s+/g, '_'),
                                    //        "fileName": file.name,
                                    //        "fileType": resp.config.data.file.type,
                                    //        "width": 3264,
                                    //        "height": 1840
                                    //    },
                                    //    "parentId": 0,
                                    //    "revoked": false,
                                    //    "lastModificationDate": new Date().getTime()
                                    //}).then(function(data){
                                    //
                                    //});
                                    break;
                                default:
                                    //ResponseService.newResponse({
                                    //    "type": "org.celstec.arlearn2.beans.run.Response",
                                    //    "runId": $stateParams.runId,
                                    //    "deleted": false,
                                    //    "generalItemId": $stateParams.activityId,
                                    //    "userEmail": $scope.myAccount.accountType+":"+$scope.myAccount.localId,
                                    //    "responseValue": file.name,
                                    //    "parentId": 0,
                                    //    "revoked": false,
                                    //    "lastModificationDate": new Date().getTime()
                                    //}).then(function(data){
                                    //
                                    //});
                                    break;
                            }


                            GameService.getGameAssets($stateParams.gameId).then(function(data){
                                $scope.assets = data;
                            });

                            //console.log(resp)
                            //console.log('Success ' + resp.config.data.file.name + ' uploaded by: ' + resp.config.data);

                        }, function (resp) {
                            //console.log(resp)
                            //console.log('Error ' + resp.config.data.file.name + ' from: ' + resp.config.data.username);
                            //console.log('Error status: ' + resp.status);
                        }, function (evt) {
                            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                            $scope.progressPercentage = progressPercentage;
                            //console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
                        });
                });

            }
        };

        $scope.ok = function () {

            if(angular.isUndefined($scope.activity.id)){
                ActivityService.removeCachedActivity();
            }

            var _aux = [];

            angular.forEach($scope.activity.roles2, function(role){
                _aux.push(angular.fromJson(role));
            });
            $scope.activity.roles2 = _aux;

            var _activities = [];

            angular.forEach($scope.activity.multiactivities, function(role){
                _activities.push(angular.fromJson(role));
            });
            $scope.activity.multiactivities = _activities;

            if($scope.activity.type == "org.celstec.arlearn2.beans.generalItem.AudioObject"){
                if($scope.activity.audioFeed == ""){
                    $scope.activity.audioFeed = "-";
                }else if(angular.isUndefined($scope.activity.audioFeed)){
                    $scope.activity.audioFeed = "-";
                }else{
                    // nothing
                }
            }

            if($scope.activity.type == "org.celstec.arlearn2.beans.generalItem.VideoObject"){
                if($scope.activity.videoFeed == ""){
                    $scope.activity.videoFeed = "-";
                }else if(angular.isUndefined($scope.activity.videoFeed)){
                    $scope.activity.videoFeed = "-";
                }else{
                    // nothing
                }
            }

            $modalInstance.close($scope.activity);
        };

        $scope.removeActivity = function(data){
            swal({
                title: "Are you sure?",
                text: "You will not be able to recover this activity!",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes, delete it!",
                closeOnConfirm: false
            }, function () {
                swal("Deleted!", "The activity has been removed from the inquiry structure.", "success");
                ActivityService.deleteActivity(data.gameId, data);
                $modalInstance.dismiss('cancel');
            });
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

    })

    .controller('AddUserCtrl', function ($scope, $modalInstance, AccountService, RunService, run, game) {

        $scope.refreshAccounts = function(query) {

            AccountService.searchAccount(query).then(function(data){
                $scope.availableColors = data.accountList;
            });
        };

        $scope.multipleDemo = {};
        $scope.multipleDemo.colors = [];

        $scope.ok = function () {

            var newUsers = [];

            angular.forEach($scope.multipleDemo.colors, function(value, key) {

                // Grant me access to the run
                RunService.giveAccess(run, value.accountType+":"+value.localId,1);
                // Add me as a user to the run
                var a = RunService.addUserToRun({
                    runId: run,
                    email: value.accountType+":"+value.localId,
                    accountType: value.accountType,
                    localId: value.localId,
                    gameId: game
                });
                newUsers.push(a);
            });

            $modalInstance.close(newUsers);
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

    })

    .controller('TabController', function ($scope, $stateParams, GameService, ActivityService) {
        this.tab = 0;

        GameService.getGameById($stateParams.gameId).then(function (data) {

            if (data.config.roles)
                $scope.roles = data.config.roles;

            $scope.game = data;

        });

        this.setTab = function (tabId) {

            this.tab = tabId;

        };

        this.isSet = function (tabId) {
            return this.tab === tabId;
        };
    })

;