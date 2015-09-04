<?php
/**
 * Created by PhpStorm.
 * User: Nenad
 * Date: 3/9/2015
 * Time: 10:05 AM
 */

include_once("class_Operation.php");

$dbinfo['host'] = 'localhost';
$dbinfo['user'] = 'root';
$dbinfo['pass'] = 'admin';
$dbinfo['database'] = 'vincompass_test';

$params = json_decode(file_get_contents('php://input'),true);

//var_dump($params);

$action = $_GET['action'];
$operation = new Operation;

if ($action == 'saveDesign') {
    if (!empty($params['json_info'])) {
        $operation->connectAndSelect($dbinfo);
        $operation->saveDesign($params);
    } else {
        echo json_encode(['result' => 'fail', 'error' => 'Missing params']);
    }
} else if ($action == 'loadDesign') {
    if (!empty($params['userId'])) {
        $operation->connectAndSelect($dbinfo);
        $operation->loadDesign($params);
    } else {
        echo json_encode(['result' => 'fail', 'error' => 'Missing params']);
    }
} else if ($action == 'uploadImg') {
    if ($_FILES) {
        //var_dump($_FILES["files"]);
        $operation->connectAndSelect($dbinfo);
        $operation->uploadImg($_FILES);

    } else {
        echo json_encode(['result' => 'fail', 'error' => 'Invalid file request']);
    }
}  else if ($action == 'loadImages') {
    if (!empty($_POST['userId'])) {
        $operation->connectAndSelect($dbinfo);
        $operation->loadImages($_POST);
    }
} else {
    echo json_encode(['result' => 'fail', 'error' => 'Invalid request']);
}