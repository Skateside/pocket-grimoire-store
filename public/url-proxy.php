<?php

/**
 * A simple proxy that will get the JSON from the given URL and return it,
 * getting around CORS issues that AJAX can generate.
 * 
 * Potential errors returned here:
 * 
 *      no_url: Invalid or missing URL
 *      cannot_access: Unable to access URL
 *      not_json: Cannot parse JSON from URL
 */

/**
 * Performs the JSON response.
 * 
 * @param array $json - the JSON to respond with.
 */
function respondWithJSON(array $json) {

    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($json);
    die();

}

// Check that the given URL is a valid URL.

$url = $_GET['url'] ?? '';

if ($url === '' || filter_var($url, FILTER_VALIDATE_URL) === false) {

    respondWithJSON([
        'success' => false,
        'message' => 'no_url',
    ]);

}

// See if we can access the data at that URL.

try {
    $contents = file_get_contents($url);
} catch (\Exception $ignore) {
    // file_get_contents() returns `false` on failure, so set $contents to
    // `false` on error for a simple check.
    $contents = false;
}

if ($contents === false) {

    respondWithJSON([
        'success' => false,
        'message' => 'cannot_access',
    ]);

}

// Check to see if the contents can be parsed as JSON.

$json = json_decode($contents);

if ($json === null) {

    respondWithJSON([
        'success' => false,
        'message' => 'not_json',
    ]);

}

// Everything's fine so return the JSON.

respondWithJSON([
    'success' => true,
    'message' => $json,
]);
