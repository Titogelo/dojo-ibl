angular.module('DojoIBL')

    .service('RunService', function ($q, Run, CacheFactory) {

        CacheFactory('runsCache', {
            maxAge: 24 * 60 * 60 * 1000, // Items added to this cache expire after 1 day
            cacheFlushInterval: 60 * 60 * 1000, // This cache will clear itself every hour
            deleteOnExpire: 'aggressive', // Items will be deleted from this cache when they expire
            storageMode: 'localStorage' // This cache will use `localStorage`.

        });

        var runs = {};
        var dataCache = CacheFactory.get('runsCache');
        var runsIds = dataCache.keys();
        for (var i=0; i < runsIds.length; i++) {
            runs[runsIds[i]] = dataCache.get(runsIds[i]);
        }


        return {
            getRunById: function (id) {
                var deferred = $q.defer();
                var dataCache = CacheFactory.get('runsCache');
                if (dataCache.get(id)) {
                    deferred.resolve(dataCache.get(id));
                } else {

                    Run.getRun({id: id}).$promise.then(
                        function (data) {

                            if(!angular.isUndefined(data.game.config.roles)){
                                var roles = [];

                                for (var i=0; i < data.game.config.roles.length; i++){
                                    roles.push(JSON.parse(data.game.config.roles[i]))
                                }
                                data.game.config.roles = roles;
                            }


                            dataCache.put(id, data);
                            deferred.resolve(data);
                        }
                    );
                }
                return deferred.promise;
            },
            getRuns: function(){
                return runs;
            },
            getRunByCode: function (code) {
                var deferred = $q.defer();

                Run.getRunByCode({ code: code }).$promise.then(function (data) {
                        deferred.resolve(data);
                    }).catch(function() {
                        deferred.reject('Please provide a valid inquiry code. (Capital letters)');
                });

                return deferred.promise;
            },
            getParticipatedRuns: function () {
                var service = this;
                var deferred = $q.defer();
                Run.getParticipateRuns().$promise.then(
                    function (data) {
                        var runAccess={};
                        for (var i = 0; i < data.runs.length; i++) {

                            if (data.runs[i].deleted) {
                                //delete games[data.games[i].gameId];
                            } else {
                                runs[data.runs[i].runId] = data.runs[i];
                            }
                        }
                        deferred.resolve(data);
                    }
                );

                return deferred.promise;
            },
            getOwnedRunsForGame: function (gameId) {
                var service = this;
                var deferred = $q.defer();
                Run.getOwnedRunsForGame({id: gameId}).$promise.then(
                    function (data) {
                        var runAccess={};
                        for (var i = 0; i < data.runAccess.length; i++) {
                            runAccess['id'+data.runAccess[i].runId] = data.runAccess[i];
                            service.getRunById(data.runAccess[i].runId).then(function (runObject) {
                                runAccess['id'+runObject.runId].run = runObject;
                            });
                        }
                        deferred.resolve(data);
                    }
                );

                return deferred.promise;
            },
            getParticipateRunsForGame: function (gameId) {
                var service = this;
                var dataCache = CacheFactory.get('runsCache');
                var deferred = $q.defer();
                Run.getParticipateRunsForGame({id: gameId}).$promise.then(
                    function (data) {

                        var runAccess={};
                        for (var i = 0; i < data.runs.length; i++) {
                            if(!data.runs[i].deleted){
                                dataCache.put(data.runs[i].runId, data.runs[i]);
                                runAccess['id'+data.runs[i].runId] = data.runs[i];
                            }
                        }
                        deferred.resolve(runAccess);
                    }
                );

                return deferred.promise;
            },
            newRun: function(runAsJson){
                var newrun = new Run(runAsJson);
                var dataCache = CacheFactory.get('runsCache');

                ////////////////////////////////////////
                // Only put in cache when we are editing
                ////////////////////////////////////////
                if(runAsJson.runId)
                    dataCache.put(runAsJson.runId, runAsJson);

                runAsJson.avoidNotification = 0;

                return newrun.$save();
            },
            updateRun: function(runAsJson){
                Run.update({ runId: runAsJson.runId }, runAsJson);
            },
            giveAccess: function(runId, accountId, accessRight){
                Run.giveAccess({ runId: runId, accountId: accountId, accessRight: accessRight});
            },
            removeAccessToInquiryRun: function(runId, account){

                Run.removeAccess({ runId: runId, accountId: account.accountType+":"+account.localId });

                Run.removeUserRun({
                    runId: runId,
                    email: account.accountType+":"+account.localId
                });

            },
            addUserToRun: function(json){
                var deferred = $q.defer();
                Run.addUserToRun(json).$promise.then(function(data){
                    deferred.resolve(true);
                });
                return deferred.promise;
            },
            deleteRun: function(runId){
                var dataCache = CacheFactory.get('runsCache');

                delete runs[runId];
                dataCache.remove(runId);
                return Run.delete({ runId: runId });
            },
            storeInCache:function(run){
                var dataCache = CacheFactory.get('runsCache');
                if (dataCache.get(run.runId)) {
                    dataCache.remove(run.runId);
                }
                dataCache.put(run.runId, run);
            },
            emptyRunsCache: function(){
                runs = {};
                var dataCache = CacheFactory.get('runsCache');
                if(dataCache) dataCache.removeAll();
            }
        }
    }
);