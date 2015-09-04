angular.module('example', [
    'common.fabric',
    'common.fabric.utilities',
    'common.fabric.constants'
])

    .controller('ExampleCtrl', ['$scope', 'Fabric', 'FabricConstants', 'Keypress', '$http', '$q', function($scope, Fabric, FabricConstants, Keypress, $http, $q) {

        $scope.fabric = {};
        $scope.FabricConstants = FabricConstants;
        $scope.lastImage = '';
        $scope.canvasBorder = 0;
        $scope.displayError = false;
        $scope.displayErrorText = ''
        $scope.resultClass = '';

        //
        // Creating Canvas Objects
        // ================================================================
        $scope.addShape = function(path) {
            $scope.fabric.addShape('http://fabricjs.com/assets/15.svg');
        };

        $scope.addImage = function(image) {
            $scope.fabric.addImage(image);
        };

        $scope.addImageUpload = function(data) {
            var obj = angular.fromJson(data);
            $scope.addImage(obj.filename);
        };

        //
        // Editing Canvas Size
        // ================================================================
        $scope.selectCanvas = function() {
            $scope.canvasCopy = {
                width: $scope.fabric.canvasOriginalWidth,
                height: $scope.fabric.canvasOriginalHeight
            };
        };

        $scope.setCanvasSize = function() {
            $scope.fabric.setCanvasSize($scope.canvasCopy.width, $scope.canvasCopy.height);
            $scope.fabric.setDirty(true);
            delete $scope.canvasCopy;
        };

        //
        // Loading and saving
        // ===============================================================

        $scope.savePage = function() {
            jsonDesign = ($scope.fabric.getJSON());
            b64Blob = $scope.fabric.getRawCanvasBlob();

            $scope.fabric.setDirty(false)

            $http.post('designOperations.php?action=saveDesign', {"json_info":jsonDesign, "canvasBlob":b64Blob}).
                then(function(response) {
                    $scope.displayErrorText = 'Your design has been saved.';
                    $scope.resultClass = 'bg-success';
                    $('#resultPopup').bPopup();
                }, function(response) {
                    $scope.displayErrorText = 'Failed operation. Your design has not been saved.';
                    $scope.resultClass = 'bg-danger';
                    $('#resultPopup').bPopup();
                    console.log(response);
                });
        }

        $scope.loadPage = function() {
            userId = '5';

            one = $http.post('designOperations.php?action=loadDesign', {"userId":userId});
            $q.all([one]).
                then(function(response) {
                    $('#previousImages').html('');
                    //console.log(response);
                    if (response[0].data.result == 'success') {
                        //$('#previousImages').bPopup();
                        var i = 0;
                        angular.forEach(response[0].data.images, function(image) {
                            $('#previousImages').append('<img src="'+response[0].data.thumbs[i]+'" onclick="addDesignToCanvas(\''+image+'\')" style="width:160px;" />');
                            //console.log(image);
                            i++;
                        });
                        //console.log($scope.lastImage);

                        $('#previousImages').bPopup();
                        //$scope.fabric.loadJSON(JSON.parse($scope.lastImage));
                    }
                }, function(response) {
                    $scope.displayErrorText = 'Failed operation.';
                    $('#resultPopup').bPopup();
                    $scope.resultClass = 'bg-danger';
                    console.log(response[0]);
                });
        }

        $scope.putDesign = function (design) {
            $scope.fabric.loadJSON(JSON.parse(design));
        }

        //
        // General helpers
        // ================================================================
        $scope.toggleBorder = function () {
            if ($scope.canvasBorder == 1) {
                $('#mainDrawingContainer').css({'border': 'none'});
                $scope.canvasBorder = 0;
            } else {
                $('#mainDrawingContainer').css({'border': '3px #000 solid'});
                $scope.canvasBorder = 1;
            }
        }

        //
        // Init
        // ================================================================
        $scope.init = function() {
            $scope.fabric = new Fabric({
                JSONExportProperties: FabricConstants.JSONExportProperties,
                textDefaults: FabricConstants.textDefaults,
                shapeDefaults: FabricConstants.shapeDefaults,
                json: {}
            });
        };

        $scope.$on('canvas:created', $scope.init);

        Keypress.onSave(function() {
            $scope.savePage();
        });

    }]);

$(document).ready(function(){
    loadTemplateCategories();

    $("#colorPicker").spectrum({
        color: "#fff",
        preferredFormat: "hex",
        showInput: true,
        change: function(color) {
            console.log(color.toHexString()); // #ff0000
            $('#backgroundValue').val(color.toHexString());
            $('#backgroundValue').trigger('input');
        }
    });

    $('#loadImagesButton').on('click', function() {
        $.ajax({
            url: 'designOperations.php?action=loadImages',
            type: 'POST',
            dataType: 'json',
            data: 'userId=5',
        }).success(function (data) {
            $('#previousImages').html('');
            console.log(data);
            for(var key in data.images){
                console.log(data.images[key]);
                var image = data.images[key];
                $('#previousImages').append('<img src="'+image+'" onclick="addImageToCanvas(\''+image+'\')" style="width: 160px; height: 100px;" />');
                //ng-click="addImage(\''+image+'\')"
            }
        })
        $('#previousImages').bPopup();
    });

    $('#uploadImage').on('click', function (evt) {
        $('#fileupload').trigger('click');
    })

    $('#imageAc').on('click', function (evt) {
        $('#textAc').prop('checked', true)
        $('#backgroundAc').prop('checked', true)
    })

    $('#textAc').on('click', function (evt) {
        $('#imageAc').prop('checked', true)
        $('#backgroundAc').prop('checked', true)
    })

    $('#backgroundAc').on('click', function (evt) {
        $('#textAc').prop('checked', true)
        $('#imageAc').prop('checked', true)
    })

    $(function () {
        $('#fileupload').fileupload({
            dataType: 'json',
            progressall: function (e, data) {
                var progress = parseInt(data.loaded / data.total * 100, 10);
                $('#progress').show();
                $('#progress .bar').css({
                    'width':progress +'%'
                });
            },
            done: function (e, data) {
                //console.log(data);
                if (data.result.result == 'success') {
                    angular.element(document.getElementById('controllerHolder')).scope().displayErrorText = 'Image uploaded succesfully.';
                    angular.element(document.getElementById('controllerHolder')).scope().resultClass = 'bg-success';
                    $('#resultPopup').bPopup();
                    $('#progress').hide();
                    angular.element(document.getElementById('controllerHolder')).scope().addImage(data.result.file);
                } else {
                    angular.element(document.getElementById('controllerHolder')).scope().displayErrorText = data.result.error;
                    angular.element(document.getElementById('controllerHolder')).scope().resultClass = 'bg-danger';
                    $('#resultPopup').bPopup();
                }
            }
        });
    });

});

function addImageToCanvas(image) {
    $('#previousImages').bPopup().close();
    angular.element(document.getElementById('controllerHolder')).scope().addImage(image);
}

function addDesignToCanvas(design) {
    $('#previousImages').bPopup().close();
    angular.element(document.getElementById('controllerHolder')).scope().putDesign(design);
}

function loadTemplateCategories() {
    $.ajax({
        url: 'designOperations.php?action=loadTemplateCategories',
        type: 'POST',
        dataType: 'json',
        data: '',
    }).success(function (data) {
        console.log(data);
        for(var key in data.categories){
            $('#vcTemplates p').append('<a href="#" onclick="loadTemplates(\''+data.categories[key]+'\')">'+data.categories[key]+'</a><br />');
            //ng-click="addImage(\''+image+'\')"
        }
    })
}

function loadTemplates(category) {
    $.ajax({
        url: 'designOperations.php?action=loadTemplates',
        type: 'POST',
        dataType: 'json',
        data: 'category='+category,
    }).success(function (data) {
        //console.log(data);
        $('#templates').html('');
        for(var key in data.images){
            console.log(key);
            $('#templates').append('<img src="'+data.thumbs[key]+'" onclick="selectTemplate(\''+data.images[key]+'\')" style="width:160px;" />');
            //ng-click="addImage(\''+image+'\')"
        }
    })
}

function loadYourDesigns() {
    userId = '5'

    $.ajax({
        url: 'designOperations.php?action=loadDesign',
        type: 'POST',
        dataType: 'json',
        data: 'userId='+userId,
    }).success(function (data) {
        //console.log(data);
        $('#templates').html('');
        for(var key in data.images){
            console.log(key);
            $('#templates').append('<img src="'+data.thumbs[key]+'" onclick="selectTemplate(\''+data.images[key]+'\')" style="width:160px;" />');
            //ng-click="addImage(\''+image+'\')"
        }
    })
}

function selectTemplate(template) {
    $('#templateSelect').slideUp(function() {
       $('#mainApp').slideDown();
    });
    angular.element(document.getElementById('controllerHolder')).scope().putDesign(template);
}

function backToTemplates() {
    $('#mainApp').slideUp(function() {
        $('#templateSelect').slideDown();
    });
}