<?php
/**
 * Created by PhpStorm.
 * User: Nenad
 * Date: 3/9/2015
 * Time: 10:05 AM
 */
$host = 'localhost';
$user = 'root';
$pass = 'admin';
$db = 'vincompass_test';

$params = json_decode(file_get_contents('php://input'),true);

//var_dump($params);

$action = $_GET['action'];

if ($action == 'saveDesign') {

    if (!empty($params['json_info'])) {
        $json = $params['json_info'];
        $blob = $params['canvasBlob'];
        $time = date('Y-m-d H:i:s');
        $thumb = saveImageBlob($blob);
        $userId = '5';

        mysql_connect($host, $user, $pass);
        mysql_select_db($db);

        $result = mysql_query("INSERT INTO `designs` (user_id, json, thumb, date_added) VALUES ('" . $userId . "', '" . $json . "','" . $thumb . "','" . $time . "')");

        if ($result) {
            echo json_encode(['result' => 'success']);
        } else {
            echo json_encode(['result' => 'fail', 'error' => print_r(mysql_error(), TRUE)]);
        }
    } else {
        echo json_encode(['result' => 'fail']);
    }
} else if ($action == 'loadDesign') {

    if (!empty($params['userId'])) {

        $userId = $params['userId'];

        mysql_connect($host, $user, $pass);
        mysql_select_db($db);

        $result = mysql_query("SELECT * FROM `designs` WHERE user_id = '" . $userId . "'");
        $images = [];
        $thumbs = [];
        while($fetchedResult = mysql_fetch_array($result)) {
            $images[] = htmlentities($fetchedResult['json']);
            $thumbs[] = $fetchedResult['thumb'];
        }

        if ($result) {
            echo json_encode(['result' => 'success', 'images' => $images, 'thumbs' => $thumbs]);
        } else {
            echo json_encode(['result' => 'fail', 'error' => print_r(mysql_error(), TRUE)]);
        }
    }
} else if ($action == 'uploadImg') {

    if ($_FILES) {

        //var_dump($_FILES["files"]);

        $target_dir = "uploads/";
        $target_file = $target_dir . basename($_FILES["files"]["name"][0]);
        $uploadOk = 1;
        $imageFileType = pathinfo($target_file,PATHINFO_EXTENSION);
        // Check if image file is a actual image or fake image
        $check = getimagesize($_FILES["files"]["tmp_name"][0]);
        if($check !== false) {
            $uploadOk = 1;
        } else {
            $error = 'File is not an image.';
            $uploadOk = 0;
        }
        // Check if file already exists
        if (file_exists($target_file)) {
            $error = 'Sorry, file already exists.';
            $uploadOk = 0;
        }
        // Check file size
        if ($_FILES["files"]["size"][0] > 50000000) {
            $error = 'Sorry, your file is too large';
            $uploadOk = 0;
        }
        // Allow certain file formats
        if($imageFileType != "jpg" && $imageFileType != "png" && $imageFileType != "jpeg"
            && $imageFileType != "gif" ) {
            echo json_encode(['result' => 'fail', 'error' => 'Sorry, only JPG, JPEG, PNG & GIF files are allowed']);
            $uploadOk = 0;
        }
        // Check if $uploadOk is set to 0 by an error
        if ($uploadOk == 0) {
            echo json_encode(['result' => 'fail', 'error' => $error]);
        // if everything is ok, try to upload file
        } else {
            if (move_uploaded_file($_FILES["files"]["tmp_name"][0], $target_file)) {
                $time = date('Y-m-d H:i:s');
                $thumb = 'thumb.jpg';
                $userId = '5';

                mysql_connect($host, $user, $pass);
                mysql_select_db($db);

                $result = mysql_query("INSERT INTO `images` (user_id, url, thumb, date_added) VALUES ('" . $userId . "', '" . $target_file . "','" . $thumb . "','" . $time . "')");

                if ($result) {
                    echo json_encode(['result' => 'success', 'file' => $target_file]);
                } else {
                    echo json_encode(['result' => 'fail', 'error' => print_r(mysql_error(), TRUE)]);
                }
            } else {
                echo json_encode(['result' => 'fail', 'error' => 'Sorry, there was an error uploading your file']);
            }
        }
    } else {
        echo json_encode(['result' => 'fail', 'error' => 'Invalid file request']);
    }
}  else if ($action == 'loadImages') {

    if (!empty($_POST['userId'])) {

        $userId = $_POST['userId'];

        mysql_connect($host, $user, $pass);
        mysql_select_db($db);

        $result = mysql_query("SELECT * FROM `images` WHERE user_id = '" . $userId . "'");
        $images = [];
        $thumbs = [];
        while($fetchedResult = mysql_fetch_array($result)) {
            $images[] = $fetchedResult['url'];
            $thumbs[] = $fetchedResult['thumb'];
        }

        if ($result) {
            if (count($images) > 0) {
                echo json_encode(['result' => 'success', 'images' => $images]);
            } else {
                echo json_encode(['result' => 'fail', 'error' => 'No images added']);
            }
        } else {
            echo json_encode(['result' => 'fail', 'error' => print_r(mysql_error(), TRUE)]);
        }
    }
} else {
    echo json_encode(['result' => 'fail', 'error' => 'Invalid request']);
}

function saveImageBlob($data)
{
    $folder = "tmp/";
    $randomName = $folder.substr(str_shuffle('abcdefghijklmnopqrstuvwxyz0123456789'),8).'.png';
    $data = base64_decode($data);
    file_put_contents($randomName, $data);

    return $randomName;
}