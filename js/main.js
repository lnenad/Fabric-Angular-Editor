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
                    $('#resultPopup p').html('Succesfully saved your design');
                    $('#resultPopup').bPopup();
                }, function(response) {
                    $('#resultPopup p').html('Failed operation.');
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
                    $('#resultPopup p').html('Failed operation.');
                    $('#resultPopup').bPopup();
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
                    $('#resultPopup p').html('File uploaded succesfully.');
                    $('#resultPopup').bPopup();
                    angular.element(document.getElementById('controllerHolder')).scope().addImage(data.result.file);
                } else {
                    $('#resultPopup p').html(data.result.error);
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