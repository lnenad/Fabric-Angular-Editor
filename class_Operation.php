<?php

/**
 * Created by PhpStorm.
 * User: Nenad
 * Date: 4/9/2015
 * Time: 1:28 PM
 */

class Operation
{
    private $tmpFolder = "tmp/";

    private $uploadFolder = "uploads/";

    public function connectAndSelect($params)
    {
        mysql_connect($params['host'], $params['user'], $params['pass']);
        mysql_select_db($params['database']);

        return true;
    }

    public function loadTemplates($params)
    {
        $category = $params['category'];

        $result = mysql_query("SELECT * FROM `templates` WHERE category = '".$category."'");
        $images = [];
        $thumbs = [];
        $name = [];
        while($fetchedResult = mysql_fetch_array($result)) {
            $images[] = htmlentities($fetchedResult['json']);
            $thumbs[] = $fetchedResult['thumb'];
            $name[] = $fetchedResult['name'];
        }

        if ($result) {
            echo json_encode(['result' => 'success', 'images' => $images, 'thumbs' => $thumbs, 'name' => $name]);
        } else {
            echo json_encode(['result' => 'fail', 'error' => print_r(mysql_error(), TRUE)]);
        }
    }

    public function loadTemplateCategories()
    {
        $result = mysql_query("SELECT category FROM `templates`");
        $categories = [];
        while($fetchedResult = mysql_fetch_array($result)) {
            $categories[] = $fetchedResult['category'];
        }

        if ($result) {
            echo json_encode(['result' => 'success', 'categories' => $categories]);
        } else {
            echo json_encode(['result' => 'fail', 'error' => print_r(mysql_error(), TRUE)]);
        }
    }

    public function saveDesign($params)
    {
        $name = "Test";
        $json = $params['json_info'];
        $blob = $params['canvasBlob'];
        $time = date('Y-m-d H:i:s');
        $thumb = $this->saveImageBlob($blob);
        $userId = '5';

        $result = mysql_query("INSERT INTO `designs` (user_id, name, json, thumb, date_added) VALUES ('" . $userId . "', '" . $name . "', '" . $json . "','" . $thumb . "','" . $time . "')");

        if ($result) {
            echo json_encode(['result' => 'success']);
        } else {
            echo json_encode(['result' => 'fail', 'error' => print_r(mysql_error(), TRUE)]);
        }
    }

    public function loadDesign($params)
    {
        $userId = $params;

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

    public function uploadImg($file)
    {
        $target_file = $this->uploadFolder . basename($file["files"]["name"][0]);
        $uploadOk = 1;
        $imageFileType = pathinfo($target_file,PATHINFO_EXTENSION);
        // Check if image file is a actual image or fake image
        $check = getimagesize($file["files"]["tmp_name"][0]);
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
        if ($file["files"]["size"][0] > 50000000) {
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
            if (move_uploaded_file($file["files"]["tmp_name"][0], $target_file)) {
                $time = date('Y-m-d H:i:s');
                $thumb = 'thumb.jpg';
                $userId = '5';

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
    }

    public function loadImages($params)
    {
        $userId = $params['userId'];

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

    private function saveImageBlob($data)
    {
        $randomName = $this->tmpFolder.substr(str_shuffle('abcdefghijklmnopqrstuvwxyz0123456789'),8).'.png';
        $data = base64_decode($data);
        file_put_contents($randomName, $data);

        return $randomName;
    }
}