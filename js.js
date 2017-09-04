angular.module('app', ['ngMaterial']);

function DialogRolesController($scope, $mdDialog, RolesService) {
    $scope.roles = ['Requestor', 'Countersigning officer', 'Provider', 'Administrator'];
    $scope.selected = RolesService.getRole();

    $scope.cancel = function () {
        $mdDialog.cancel();
    };

    $scope.select = function (role) {
        RolesService.setRole(role);
        $mdDialog.hide(role);
    };
}

angular.module('app')
.factory('ViewsService', function () {
    var _views = [
          { label: 'Dashboard', icon: 'fa-inbox', separator: false },
          { label: 'Orders', icon: 'fa-paper-plane', separator: false },
          { label: 'Contracts', icon: 'fa-file-text', separator: false },
          { label: 'Reports', icon: 'fa-bar-chart', separator: false },
          { label: 'Settings', icon: 'fa-cog', separator: true }
    ],
        _current = 'Dashboard';

    function _getViews() {
        return _views;
    }

    function _getCurrent() {
        return _current;
    }

    function _setCurrent(current) {
        _current = current
    }

    return {
        getViews: _getViews,
        getCurrent: _getCurrent,
        setCurrent: _setCurrent
    };
});

angular.module('app')
.factory('RolesService', function () {
    var _role = 'Requestor';
    function _getRole() {
        return _role;
    }

    function _setRole(role) {
        _role = role;
    }

    return {
        getRole: _getRole,
        setRole: _setRole
    };
});

angular.module('app').controller('DashboardController', function () {
    var ctrl = this;
});

angular.module('app').controller('OrdersController', function () {
    var ctrl = this;

    ctrl.orders = [
      {
          number: 'CIA.2015.004332', contractor: 'Ciano', date: '12/09/2015',
          total: 1233.32, status: 'pending'
      },
      {
          number: 'EUR.2015.001245', contractor: 'Eurest', date: '13/09/2015',
          total: 2811.21, status: 'pending'
      },
      {
          number: 'EUR.2015.001244', contractor: 'Eurest', date: '14/09/2015',
          total: 754.00, status: 'closed'
      },
      {
          number: 'CIA.2015.001244', contractor: 'Ciano', date: '14/09/2015',
          total: 1639.55, status: 'created'
      },
      {
          number: 'EUR.2015.001289', contractor: 'Eurest', date: '17/09/2015',
          total: 999.99, status: 'closed'
      },
      {
          number: 'CIA.2015.004343', contractor: 'Ciano', date: '18/09/2015',
          total: 666.66, status: 'created'
      }
    ];
});

angular.module('app')
.controller('appController', function ($scope, $mdSidenav, $document, $mdDialog,
  RolesService, ViewsService) {
    var ctrl = this;

    ctrl.onDocumentClick = null;
    ctrl.logOutMenuVisible = false;
    ctrl.views = ViewsService.getViews();
    ctrl.currentView = ViewsService.getCurrent();
    ctrl.role = RolesService.getRole();

    function _showLogOutMenu() {
        ctrl.logOutMenuVisible = true;

        ctrl.onDocumentClick = $document.bind('click', function () {
            _hideLogOutMenu();
            $scope.$apply();
        });
    }

    function _hideLogOutMenu() {
        ctrl.logOutMenuVisible = false;
        ctrl.onDocumentClick = null;
    }

    ctrl.toggleMainMenu = function () {
        $mdSidenav('menu-left').toggle();
    };

    ctrl.toggleLogOutMenu = function (event) {
        event.stopImmediatePropagation();

        if (ctrl.logOutMenuVisible) {
            _hideLogOutMenu();
        } else {
            _showLogOutMenu();
        }
    };

    ctrl.changeRole = function (event) {
        $mdDialog.show({
            controller: DialogRolesController,
            templateUrl: 'dialogRole.html',
            parent: angular.element(document.body),
            targetEvent: event,
            clickOutsideToClose: true
        })
          .then(function (role) {
              ctrl.role = role;
          });
    };

    ctrl.changeView = function (view) {
        ViewsService.setCurrent(view);
        ctrl.currentView = view;
        ctrl.toggleMainMenu();
    }
});