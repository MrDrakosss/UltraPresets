<?php
header('Content-Type: application/json');

$exclude = 'web-source';
$path = '.';
$result = [];

function listDir($dir, $base = '') {
    global $exclude, $result;

    $items = scandir($dir);
    foreach ($items as $item) {
        if ($item === '.' || $item === '..') continue;
        if ($item === $exclude) continue;

        $fullPath = $dir . '/' . $item;
        $relPath = $base . $item;

        if (is_dir($fullPath)) {
            $result[] = ["path" => $relPath . "/", "type" => "dir"];
            listDir($fullPath, $relPath . "/");
        } else {
            $result[] = ["path" => $relPath, "type" => "file"];
        }
    }
}

listDir($path);
echo json_encode($result);
