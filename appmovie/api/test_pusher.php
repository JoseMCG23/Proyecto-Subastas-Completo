<?php
require __DIR__ . '/vendor/autoload.php';

$options = [
    'cluster' => 'us2',
    'useTLS' => true
];

$pusher = new Pusher\Pusher(
    '5496ba78b56633e65006', // KEY
    '8f42f744b5f40190ab7a', // SECRET
    '2135843',              // APP_ID
    $options
);

$data = [
    'mensaje' => 'holap pruebaaaaa',
    'hora' => date('Y-m-d H:i:s')
];

try {
    $pusher->trigger('subasta-canal', 'evento-prueba', $data);
    echo 'Evento enviado correctamente';
} catch (Exception $e) {
    echo 'Error: ' . $e->getMessage();
}
