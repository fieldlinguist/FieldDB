/*globals FieldDB, runs, waitsFor */

'use strict';
var debug = false;
var specIsRunningTooLong = 500000;
describe('Directive: fielddb-datalist', function() {

  describe('multiple lists of datalists', function() {

    // load the directive's module and the template
    beforeEach(module('fielddbAngularApp', 'views/user.html', 'views/datalist.html'));
    var el, scope, compileFunction;

    beforeEach(inject(function($rootScope, $compile) {
      el = angular.element('<div data-fielddb-datalist json="docs2"></div> <div data-fielddb-datalist json="docs1"></div>');
      scope = $rootScope.$new();
      scope.docs1 = [{
        firstname: 'Ling',
        lastname: 'Llama'
      }];
      scope.docs2 = [{
        firstname: 'Anony',
        lastname: 'Mouse'
      }];
      compileFunction = $compile(el);
      // bring html from templateCache
      scope.$digest();
      if (debug) {
        console.log('post compile', el.html()); // <== html here has {{}}
      }
    }));

    // http://stackoverflow.com/questions/17223850/how-to-test-directives-that-use-templateurl-and-controllers
    it('should make a datalist element with contents from scope', function() {

      inject(function() {
        compileFunction(scope); // <== the html {{}} are bound
        scope.$digest(); // <== digest to get the render to show the bound values
        if (debug) {
          console.log('post link', el.html());
          console.log('scope team ', scope.team);
          console.log('scope docs1 ', scope.docs1);
          // console.log(angular.element(el.find('h1')));
        }
        expect(angular.element(el.find('h1')[1]).text().trim()).toEqual('Anony Mouse');
        expect(angular.element(el.find('h1')[3]).text().trim()).toEqual('Ling Llama');
      });
    });
  });


  describe('fetch of corpus datalist', function() {

    // load the directive's module and the template
    beforeEach(module('fielddbAngularApp', 'views/user.html', 'views/datalist.html'));
    var el, scope, compileFunction, httpBackend, http;

    beforeEach(inject(function($rootScope, $compile, $controller, $httpBackend, $http) {
      FieldDB.BASE_DB_URL = 'https://localhost:6984';

      scope = $rootScope.$new();
      scope.corpus = {
        dbname: 'testing-phophlo',
        docs: []
      };

      // mock the network request
      // http://odetocode.com/blogs/scott/archive/2013/06/11/angularjs-tests-with-an-http-mock.aspx
      httpBackend = $httpBackend;
      http = $http;
      httpBackend.when('GET', FieldDB.BASE_DB_URL + '/' + scope.corpus.dbname + '/_design/psycholinguistics/_view/speakers?descending=true').respond([{
        firstname: 'Ling',
        lastname: 'Llama'
      }, {
        firstname: 'Anony',
        lastname: 'Mouse'
      }, {
        firstname: 'Teammate',
        lastname: 'Tiger'
      }]);

      el = angular.element('<div data-fielddb-datalist json="corpus.docs" corpus="corpus"></div>');
      compileFunction = $compile(el);
      // bring html from templateCache
      scope.$digest();
      if (debug) {
        console.log('post compile', el.html()); // <== html here has {{}}
      }

    }));

    it('should mock network request of 3 docs', function() {
      // call the network request
      http.get(FieldDB.BASE_DB_URL + '/' + scope.corpus.dbname + '/_design/psycholinguistics/_view/speakers?descending=true').then(function(result) {
        result.data.map(function(doc) {
          scope.corpus.docs.push(doc);
          // scope.$digest();
        });
      });

      // flush the mock backend
      httpBackend.flush();
      expect(scope.corpus.docs.length).toBe(3);

      inject(function() {
        compileFunction(scope); // <== the html {{}} are bound
        scope.$digest(); // <== digest to get the render to show the bound values
        if (debug) {
          console.log('post link', el.html());
          console.log('scope team ', scope.team);
          console.log('scope docs ', scope.docs);
          // console.log(angular.element(el.find('h1')));
        }

        // expect(angular.element(el.find('h1').length)).toEqual(' ');
        expect(angular.element(el.find('h1')[0]).text().trim()).toEqual('List');
        expect(angular.element(el.find('h1')[1]).text().trim()).toEqual('Ling Llama');
        expect(angular.element(el.find('h1')[2]).text().trim()).toEqual('Anony Mouse');
        expect(angular.element(el.find('h1')[3]).text().trim()).toEqual('Teammate Tiger');
      });

    });



    it('should run async tests', function() {
      var value, flag;

      runs(function() {
        flag = false;
        value = 0;
        setTimeout(function() {
          flag = true;
        }, 500);
      });

      waitsFor(function() {
        value++;
        return flag;
      }, 'The Value should be incremented', 750);

      runs(function() {
        expect(value).toBeGreaterThan(0);
      });

    }, specIsRunningTooLong);

    it('should try to display corpus docs from a database using CORS', function() {
      var value, flag;

      runs(function() {
        flag = false;
        value = 0;
        setTimeout(function() {
          flag = true;
        }, 50);
      });

      waitsFor(function() {
        value++;
        inject(function() {
          compileFunction(scope); // <== the html {{}} are bound
          scope.$digest(); // <== digest to get the render to show the bound values
          if (debug) {
            console.log('post link', el.html());
            console.log('scope team ', scope.team);
            console.log('scope docs ', scope.docs);
          }
        });
        return flag;
      }, 'The docs should try to be downloaded ', 100);

      runs(function() {
        expect(value).toBeGreaterThan(0);
        expect(el.scope().corpus.fetchDatalistDocsExponentialDecay).toBeGreaterThan(31000);
      });

    });
  }, specIsRunningTooLong);

});