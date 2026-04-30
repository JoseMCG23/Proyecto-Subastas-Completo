<?php
class image
{
    public function create()
    {
        try {
            $response = new Response();

            $data = [
                'file' => $_FILES['file'] ?? null,
                'funko_id' => $_POST['funko_id'] ?? null
            ];

            $imagen = new ImageModel();
            $result = $imagen->uploadFile($data);

            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }
}
