angular.module('example', [
    'common.fabric',
    'common.fabric.utilities',
    'common.fabric.constants'
])

    .controller('ExampleCtrl', ['$scope', 'Fabric', 'FabricConstants', 'Keypress', '$http', '$q', function($scope, Fabric, FabricConstants, Keypress, $http, $q) {

        $scope.fabric = {};
        $scope.FabricConstants = FabricConstants;
        $scope.lastImage = '';

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

        $scope.savePage = function() {
            jsonDesign = ($scope.fabric.getJSON());

            $http.post('designOperations.php?action=saveDesign', {"json_info":jsonDesign}).
                then(function(response) {
                    alert('Succesfully added image');
                }, function(response) {
                    alert('Failed operation.');
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
                        angular.forEach(response[0].data.images, function(image) {
                            //lastImage = '{"objects":[{"type":"text","originX":"left","originY":"top","left":69.54,"top":48,"width":133.3984375,"height":52,"fill":"#454545","stroke":null,"strokeWidth":1,"strokeDashArray":null,"strokeLineCap":"butt","strokeLineJoin":"miter","strokeMiterLimit":10,"scaleX":1,"scaleY":1,"angle":0,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"clipTo":null,"backgroundColor":"","originalScaleX":1,"originalScaleY":1,"originalLeft":69.537109375,"originalTop":48,"lineHeight":1.3,"lockMovementX":false,"lockMovementY":false,"lockScalingX":false,"lockScalingY":false,"lockUniScaling":false,"lockRotation":false,"id":5581,"text":"Disable","fontSize":40,"fontWeight":"normal","fontFamily":"arial","fontStyle":"","textDecoration":"","textAlign":"left","path":null,"textBackgroundColor":"","useNative":true},{"type":"text","originX":"left","originY":"top","left":81.54,"top":180,"width":111.171875,"height":52,"fill":"#cccfff","stroke":null,"strokeWidth":1,"strokeDashArray":null,"strokeLineCap":"butt","strokeLineJoin":"miter","strokeMiterLimit":10,"scaleX":1,"scaleY":1,"angle":0,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"clipTo":null,"backgroundColor":"","originalScaleX":1,"originalScaleY":1,"originalLeft":81.53999999999999,"originalTop":180,"lineHeight":1.3,"lockMovementX":false,"lockMovementY":false,"lockScalingX":false,"lockScalingY":false,"lockUniScaling":false,"lockRotation":false,"id":9450,"text":"Image","fontSize":40,"fontWeight":"normal","fontFamily":"arial","fontStyle":"","textDecoration":"","textAlign":"left","path":null,"textBackgroundColor":"","useNative":true},{"type":"text","originX":"left","originY":"top","left":86.54,"top":112,"width":75.60546875,"height":52,"fill":"#454545","stroke":null,"strokeWidth":1,"strokeDashArray":null,"strokeLineCap":"butt","strokeLineJoin":"miter","strokeMiterLimit":10,"scaleX":1,"scaleY":1,"angle":0,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"clipTo":null,"backgroundColor":"","originalScaleX":1,"originalScaleY":1,"originalLeft":86.54,"originalTop":112,"lineHeight":1.3,"lockMovementX":false,"lockMovementY":false,"lockScalingX":false,"lockScalingY":false,"lockUniScaling":false,"lockRotation":false,"id":1858,"text":"Last","fontSize":40,"fontWeight":"normal","fontFamily":"arial","fontStyle":"","textDecoration":"","textAlign":"left","path":null,"textBackgroundColor":"","useNative":true}],"background":"#ffffff","height":300,"width":300,"originalHeight":300,"originalWidth":300}';
                            $scope.lastImage = image;
                            $('#previousImages').append('<a href="#" onclick="addDesignToCanvas(\''+image+'\')">Alfa</a>');
                            //console.log(image);
                        });
                        //console.log($scope.lastImage);

                        $('#previousImages').bPopup();
                        //$scope.fabric.loadJSON(JSON.parse($scope.lastImage));
                    }
                }, function(response) {
                    alert('Failed operation.');
                    console.log(response[0]);
                });
        }

        $scope.putDesign = function (design) {
            $scope.fabric.loadJSON(JSON.parse(design));
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
                    alert('success');
                    angular.element(document.getElementById('controllerHolder')).scope().addImage(data.result.file);
                } else {
                    alert(data.result.error);
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