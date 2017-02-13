angular.module('DojoIBL')
    .factory('Activity', function ActivityFactory($resource, $http, config) {
        return $resource(config.server+'/rest/generalItems', {}, {
            getActivities: {
                method: 'GET',
                isArray: false,
                url: config.server+'/rest/generalItems/gameId/:gameId'
            },
            getActivitiesForPhase: {
                method: 'GET',
                isArray: false,
                url: config.server+'/rest/generalItems/gameId/:gameId/section/:phase'
            },
            'create': {
                method: 'POST',
                isArray: false,
                url: config.server + '/rest/generalItems'
            },
            'delete':{
                params: { gameId: '@gameId', itemId: '@itemId' },
                method: 'DELETE',
                isArray: false,
                url: config.server + '/rest/generalItems/gameId/:gameId/generalItem/:itemId'
            },
            'getActivity':{
                params: { gameId: '@gameId', itemId: '@itemId' },
                method: 'GET',
                isArray: false,
                url: config.server + '/rest/generalItems/gameId/:gameId/generalItem/:itemId'
            },
            changeActivityStatus: {
                params: { runId: '@runId', generalItemId: '@generalItemId', status: '@status' },
                method: 'POST',
                isArray: false,
                url: config.server+'/rest/myRuns/runId/:runId/generalItem/:generalItemId/status/:status'
            },
            getActivityStatus: {
                params: { runId: '@runId', generalItemId: '@generalItemId' },
                method: 'GET',
                isArray: false,
                url: config.server+'/rest/myRuns/runId/:runId/generalItem/:generalItemId/status'
            },
            'addRole': {
                params: { generalItemId: '@generalItemId' },
                method: 'POST',
                isArray: false,
                url: config.server + '/rest/generalItems/generalItem/:generalItemId/role'
            },
            'uploadUrl': {
                method: 'GET',
                isArray: false,
                url: config.server + '/rest/generalItems/pictureUrl/gameId/:gameId/generalItem/:itemId/:key'
            }

        })
            ;
    })
    .factory('ML4WUser', function ScenarioFactory($resource, $http, config) {
        return $resource(config.mobile_data_collection+'/users/register/', {}, {
            'login': {
                method: 'POST',
                isArray: false,
                url: config.mobile_data_collection + '/users/login'
            }
        });
    })
    .factory('ML4WScenario', function ScenarioFactory($resource, $http, config) {
        return $resource(config.mobile_data_collection+'/scenarios/', {}, {
            'create': {
                method: 'POST',
                isArray: false,
                url: config.mobile_data_collection + '/scenarios/'
            }
        });
    })
;