angular.module('example', [
    'common.fabric',
    'common.fabric.utilities',
    'common.fabric.constants'
])

    .controller('ExampleCtrl', ['$scope', 'Fabric', 'FabricConstants', 'Keypress', function($scope, Fabric, FabricConstants, Keypress) {

        $scope.fabric = {};
        $scope.FabricConstants = FabricConstants;

        //
        // Creating Canvas Objects
        // ================================================================
        $scope.addShape = function(path) {
            $scope.fabric.addShape('http://fabricjs.com/assets/15.svg');
        };

        $scope.addImage = function(image) {
            $scope.fabric.addImage('Koala.jpg');
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
            console.log($scope.fabric.getJSON());
        }

        $scope.loadPage = function() {
            $scope.fabric.loadJSON('{"objects":[{"type":"text","originX":"left","originY":"top","left":69.54,"top":48,"width":168.92578125,"height":52,"fill":"#454545","stroke":null,"strokeWidth":1,"strokeDashArray":null,"strokeLineCap":"butt","strokeLineJoin":"miter","strokeMiterLimit":10,"scaleX":1,"scaleY":1,"angle":0,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"clipTo":null,"backgroundColor":"","originalScaleX":1,"originalScaleY":1,"originalLeft":69.537109375,"originalTop":48,"lineHeight":1.3,"lockMovementX":false,"lockMovementY":false,"lockScalingX":false,"lockScalingY":false,"lockUniScaling":false,"lockRotation":false,"id":5581,"text":"New Text","fontSize":40,"fontWeight":"normal","fontFamily":"arial","fontStyle":"","textDecoration":"","textAlign":"left","path":null,"textBackgroundColor":"","useNative":true},{"type":"text","originX":"left","originY":"top","left":4.54,"top":186,"width":82.24609375,"height":52,"fill":"#cccfff","stroke":null,"strokeWidth":1,"strokeDashArray":null,"strokeLineCap":"butt","strokeLineJoin":"miter","strokeMiterLimit":10,"scaleX":1,"scaleY":1,"angle":0,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"clipTo":null,"backgroundColor":"","originalScaleX":1,"originalScaleY":1,"originalLeft":4.537109375,"originalTop":186,"lineHeight":1.3,"lockMovementX":false,"lockMovementY":false,"lockScalingX":false,"lockScalingY":false,"lockUniScaling":false,"lockRotation":false,"id":9450,"text":"SUP","fontSize":40,"fontWeight":"normal","fontFamily":"arial","fontStyle":"","textDecoration":"","textAlign":"left","path":null,"textBackgroundColor":"","useNative":true},{"type":"text","originX":"left","originY":"top","left":86.54,"top":111,"width":157.87109375,"height":52,"fill":"#454545","stroke":null,"strokeWidth":1,"strokeDashArray":null,"strokeLineCap":"butt","strokeLineJoin":"miter","strokeMiterLimit":10,"scaleX":1,"scaleY":1,"angle":0,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"clipTo":null,"backgroundColor":"","originalScaleX":1,"originalScaleY":1,"originalLeft":86.537109375,"originalTop":111,"lineHeight":1.3,"lockMovementX":false,"lockMovementY":false,"lockScalingX":false,"lockScalingY":false,"lockUniScaling":false,"lockRotation":false,"id":1858,"text":"Nigga yo","fontSize":40,"fontWeight":"normal","fontFamily":"arial","fontStyle":"","textDecoration":"","textAlign":"left","path":null,"textBackgroundColor":"","useNative":true}],"background":"#ffffff","height":300,"width":300,"originalHeight":300,"originalWidth":300}');
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
        $('#previousImages').bPopup();
    });

});