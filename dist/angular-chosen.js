/**
 * angular-chosen-localytics - Angular Chosen directive is an AngularJS Directive that brings the Chosen jQuery in a Angular way
 * @version v1.2.1
 * @link http://github.com/leocaseiro/angular-chosen
 * @license MIT
 */
(function() {
  var indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  angular.module('localytics.directives', []);

  angular.module('localytics.directives').directive('chosen', [
    '$timeout', function($timeout) {
      var CHOSEN_OPTION_WHITELIST, NG_OPTIONS_REGEXP, isEmpty, snakeCase;
      NG_OPTIONS_REGEXP = /^\s*(.*?)(?:\s+as\s+(.*?))?(?:\s+group\s+by\s+(.*))?\s+for\s+(?:([\$\w][\$\w]*)|(?:\(\s*([\$\w][\$\w]*)\s*,\s*([\$\w][\$\w]*)\s*\)))\s+in\s+(.*?)(?:\s+track\s+by\s+(.*?))?$/;
      CHOSEN_OPTION_WHITELIST = ['noResultsText', 'allowSingleDeselect', 'disableSearchThreshold', 'disableSearch', 'enableSplitWordSearch', 'inheritSelectClasses', 'maxSelectedOptions', 'placeholderTextMultiple', 'placeholderTextSingle', 'searchContains', 'singleBackstrokeDelete', 'displayDisabledOptions', 'displaySelectedOptions', 'width'];
      snakeCase = function(input) {
        return input.replace(/[A-Z]/g, function($1) {
          return "_" + ($1.toLowerCase());
        });
      };
      isEmpty = function(value) {
        var key;
        if (angular.isArray(value)) {
          return value.length === 0;
        } else if (angular.isObject(value)) {
          for (key in value) {
            if (value.hasOwnProperty(key)) {
              return false;
            }
          }
        }
        return true;
      };
      return {
        restrict: 'A',
        require: '?ngModel',
        priority: 1,
        link: function(scope, element, attr, ngModel) {
          var chosen, empty, initOrUpdate, match, options, origRender, startLoading, stopLoading, updateMessage, valuesExpr, viewWatch;
          scope.disabledValuesHistory = scope.disabledValuesHistory ? scope.disabledValuesHistory : [];
          element.addClass('localytics-chosen');
          options = scope.$eval(attr.chosen) || {};
          angular.forEach(attr, function(value, key) {
            if (indexOf.call(CHOSEN_OPTION_WHITELIST, key) >= 0) {
              return attr.$observe(key, function(value) {
                options[snakeCase(key)] = String(element.attr(attr.$attr[key])).slice(0, 2) === '{{' ? value : scope.$eval(value);
                return updateMessage();
              });
            }
          });
          startLoading = function() {
            return element.addClass('loading').attr('disabled', true).trigger('chosen:updated');
          };
          stopLoading = function() {
            return element.removeClass('loading').attr('disabled', false).trigger('chosen:updated');
          };
          chosen = null;
          empty = false;
          initOrUpdate = function() {
            if (chosen) {
              return element.trigger('chosen:updated');
            } else {
              return chosen = element.chosen(options).data('chosen');
            }
          };
          updateMessage = function() {
            if (empty) {
              element.attr('data-placeholder', chosen.results_none_found).attr('disabled', true);
            } else {
              element.removeAttr('data-placeholder');
            }
            return element.trigger('chosen:updated');
          };
          if (ngModel) {
            origRender = ngModel.$render;
            ngModel.$render = function() {
              origRender();
              return initOrUpdate();
            };
            if (attr.multiple) {
              viewWatch = function() {
                return ngModel.$viewValue;
              };
              scope.$watch(viewWatch, ngModel.$render, true);
            }
          } else {
            initOrUpdate();
          }
          attr.$observe('disabled', function() {
            return element.trigger('chosen:updated');
          });
          if (attr.ngOptions && ngModel) {
            match = attr.ngOptions.match(NG_OPTIONS_REGEXP);
            valuesExpr = match[7];
            scope.$watchCollection(valuesExpr, function(newVal, oldVal) {
              var timer;
              return timer = $timeout(function() {
                if (angular.isUndefined(newVal)) {
                  return startLoading();
                } else {
                  empty = isEmpty(newVal);
                  stopLoading();
                  return updateMessage();
                }
              });
            });
            return scope.$on('$destroy', function(event) {
              if (typeof timer !== "undefined" && timer !== null) {
                return $timeout.cancel(timer);
              }
            });
          }
        }
      };
    }
  ]);

}).call(this);
