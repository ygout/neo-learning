'use strict';

angular.module('NeoLearning.student', ['oitozero.ngSweetAlert'])
.controller('StudentCtrl', ['$scope', '$state', '$stateParams', '$location', '$window', '$filter', 'UserService', 'CourseService', 'SweetAlert', function($scope, $state, $stateParams, $location, $window, $filter, UserService, CourseService, SweetAlert) {
  $scope.itemsByPage=7;
  $scope.validRole=false;


  console.log('studentCtrl');

  // GET USER INFO
  var user = UserService.getUser($window.sessionStorage.token);
  if(user){
      $scope.userName = user.firstName;
  }

  var userRoleListRequest = UserService.api('role').get();
  userRoleListRequest.$promise.then(function(result){
    if(result.success){
      $scope.userRoleList = result.data;
      console.log('roles list success', result.data);
    }
  })

  $scope.format = 'd!/M!/yyyy';
  $scope.altInputFormats = ['M!/d!/yyyy'];

  $scope.popup1 = {
    opened: false
  };

  $scope.open1 = function() {
    $scope.popup1.opened = true;
  };

  $scope.displayedUsers = [];
  var usersRequest = UserService.api('user').get();
  usersRequest.$promise.then(function(result){
    if(result.success){
      console.log('student get success');
      $scope.displayedUsers = result.data;
      $scope.rowUsers = result.data;
    }else{
      //ERROR
    }
  })

  $scope.checkFormInput = function(){
    $scope.submitted = true;
    console.log('userIdRole', $scope.userIdRole);
    if (!$scope.userIdRole){
      console.log('userIdRole', $scope.userIdRole);
      $scope.invalidRole = true;
      $('#roleListInput').addClass('has-error');
      return;
    }
    $scope.addUser();
  }

  // $scope.checkEditFormInput = function(){
  //   $scope.submitted = true;
  //   if (!$('#editUserRole').val()){
  //     $scope.invalidRole = true;
  //     $('#roleListInput').addClass('has-error');
  //     return;
  //   }
  //   $scope.editUser();
  // }

  $scope.checkRoleValue = function(){
    if(!!$scope.userIdRole){
      $scope.invalidRole = false;
      $('#roleListInput').removeClass('has-error');
    }
  }

  $scope.addUser = function(){
    console.log('addUser');
    var user = {
                firstName: $scope.userFirstName, lastName: $scope.userLastName,
                email: $scope.userEmail, password: $scope.userPassword, city: $scope.userCity,
                phone: $scope.userPhone, address: $scope.userAddress, idRole: $scope.userIdRole.idRole,
                birthdate: $scope.userBirthdate
               }

    Object.keys(user).forEach(function(key){
      if(!user[key]) {
        delete user[key];
      }
    })

    var userAddRequest = UserService.api('user').post(user);
    userAddRequest.$promise.then(function(result){
      if(result.success){
        $('#newModalUser').modal('hide');
        console.log('result', result);
        console.log('addedUser', user);
        $scope.displayedUsers.push(user);
        $scope.rowUsers.push(user);
        SweetAlert.swal("L'utilisateur " + user.firstName + " " + user.lastName + " à été ajouté avec succès !", "", "success");
      }else{
        $('#newModalUser').modal('hide');
        SweetAlert.swal("Une erreur est survenue (" + result.error + ")", "", "error");
      }
      $('#newModalUser').modal('hide');
    })
  }

  $scope.openEditUserModal = function(selectedEditableUser){
    console.log('openuserModal');
    $scope.userFirstName = selectedEditableUser;
    $scope.userIdRole = null;
    $scope.userLastName = null;
    $scope.courseDescription = null;
    $scope.userEmail = null;
    $scope.userPassword = null;
    $scope.userCity = null;
    $scope.userPhone = null;
    $scope.userAddress = null;
    $scope.userBirthdate = null;
    $scope.registeredStudentCount = null;
    $scope.addedStudentsTxt = null;
    $scope.selectedEditableUser = selectedEditableUser;
    $scope.editableRole = selectedEditableUser.idRole;
    setTimeout(function(){$('#editUserRole').val($scope.selectedEditableUser.idRole);}, 1);
    $('#editModalUser').modal('show');
  }

  $scope.editUser = function(){
    console.log("editedPassword", $scope.editedPassword);

    var user = {
                firstName: $scope.selectedEditableUser.firstName, lastName: $scope.selectedEditableUser.lastName,
                password: $scope.editedPassword, city: $scope.selectedEditableUser.city,
                phone: $scope.selectedEditableUser.phone, address: $scope.selectedEditableUser.address, idRole: $('#editUserRole').val(),
                birthdate: $scope.selectedEditableUser.birthdate
               }

    Object.keys(user).forEach(function(key){
      if(!user[key]) {
        console.log('key', key);
        console.log('user key', user[key]);
        delete user[key];
      }
    })

    console.log('user',user);
    UserService.api('user/' + $scope.selectedEditableUser.idUser ).update(user).
    $promise.then(function(result){
      console.log('result', result);
       if(result.success){
         SweetAlert.swal("Utilisateur édité avec succès !", "", "success");
       }
      $('#editModalUser').modal('hide');
    })
  }

  $scope.openNewModalUser = function(){
    $scope.userIdRole = null;
    $scope.userLastName = null;
    $scope.courseDescription = null;
    $scope.userEmail = null;
    $scope.userPassword = null;
    $scope.userCity = null;
    $scope.userPhone = null;
    $scope.userAddress = null;
    $scope.userBirthdate = null;
    $scope.registeredStudentCount = null;
    $scope.addedStudentsTxt = null;
    $(".selectable-row").removeClass("st-selected");
    $('#newModalUser').modal('show');
  }

  $scope.removeUser = function(user){
    SweetAlert.swal({
          title: "Êtes-vous sûr de vouloir supprimer l'utilisateur " + user.firstName + " " + user.lastName + "?",
          text: "Il le sera définitivement !",
          type: "warning",
          showCancelButton: true,
          confirmButtonColor: "#DD6B55",
          confirmButtonText: "Oui, supprimer l'utilisateur!",
          cancelButtonText: "Annuler",
          closeOnConfirm: false,
          closeOnCancel: false
      },
      function(isConfirm){
          if(isConfirm){
            var userDeleteRequest = CourseService.api('user/' + user.idUser).remove();
            userDeleteRequest.$promise.then(function(result){
              if(result.success){
                var index = $scope.rowUsers.indexOf(user);
                  if(index !== -1){
                    $scope.rowUsers.splice(index, 1);
                  }
                  SweetAlert.swal("Utilisateur supprimé !", "", "success");
              }
              else
              {
                SweetAlert.swal("Erreur lors de la suppression!");
                console.log('result error', result);
              }
            })
          }
           else
          {
              SweetAlert.swal("Utilisateur conservé!");
          }
      });
  }

  $scope.goToStudentDetail = function(user) {
    $state.go("student", { id: user.idUser });
  };
}]);
