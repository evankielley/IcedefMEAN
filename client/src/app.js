import angular from 'angular'
import 'angular-ui-router'
angular.module('icebergs', ["ui.router"])

.config(($stateProvider, $urlRouterProvider) => {
  $urlRouterProvider.otherwise('/observations')

  $stateProvider
    .state('observations', {
      url: '/observations',
      templateUrl: 'observations/observations-nav.html',
      resolve: {
        observationsService: function($http) {
          return $http.get('/observations');
        }
      },
      controller: function(observationsService, $location) {
        this.observations = observationsService.data;

        this.isActive = (observation) => {
          let pathRegexp = /observations\/(\w+)/;
          let match = pathRegexp.exec($location.path());

          console.log('hi')
          if(match === null || match.length === 0) return false;
          let selectedObservationName = match[1];
          console.log('below', selectedObservationName, observation)

          return observation === selectedObservationName;

        };
      },
      controllerAs: 'observationsCtrl'
    })
    .state('observations.measurements', {
      url: '/:observationName',
      templateUrl: 'observations/observations-measurements.html',
      resolve: {
        observationService: function($http, $stateParams) {
          return $http.get(`/observations/${$stateParams.observationName}`);
        }
      },
      controller: function(observationService){
        this.observation = observationService.data;
      },
      controllerAs: 'observationCtrl'
    })
    .state('observations.new', {
      url: '/:observationName/measurement/new',
      templateUrl: 'observations/new-measurement.html',
      controller: function($stateParams, $state, $http){
        this.observationName = $stateParams.observationName;

        this.saveMeasurement = function(measurement){
          $http({method: 'POST', url: `/observations/${$stateParams.observationName}/measurements`, data: {measurement}}).then(function(){
            $state.go('observations.measurements', {observationName: $stateParams.observationName});
          });
        };
      },
      controllerAs: 'newMeasurementCtrl'
    })
})
