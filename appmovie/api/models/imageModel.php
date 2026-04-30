<?php
class imageModel
{
    private $upload_path = __DIR__ . '/../uploads/';
    private $valid_extensions = array('jpeg', 'jpg', 'png', 'gif', 'webp');

    public $enlace;

    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }

    public function uploadFile($object)
    {
        if (!isset($object['file']) || !$object['file']) {
            throw new Exception("No se recibió ningún archivo");
        }

        if (!isset($object['funko_id']) || empty($object['funko_id'])) {
            throw new Exception("No se recibió el funko_id");
        }

        $file = $object['file'];
        $funko_id = $object['funko_id'];

        $fileName = $file['name'];
        $tempPath = $file['tmp_name'];
        $fileSize = $file['size'];
        $fileError = $file['error'];

        if (empty($fileName)) {
            throw new Exception("El archivo no tiene nombre");
        }

        $fileExt = explode('.', $fileName);
        $fileActExt = strtolower(end($fileExt));

        if (!in_array($fileActExt, $this->valid_extensions)) {
            throw new Exception("Tipo de archivo no permitido");
        }

        if ($fileSize >= 2000000) {
            throw new Exception("El archivo supera el tamaño permitido");
        }

        if ($fileError != 0) {
            throw new Exception("Error al subir el archivo");
        }

        if (!is_dir($this->upload_path)) {
            mkdir($this->upload_path, 0777, true);
        }

        $safeFileName = basename($fileName);
        $destino = $this->upload_path . $safeFileName;

        if (!move_uploaded_file($tempPath, $destino)) {
            throw new Exception("No se pudo mover el archivo al directorio uploads");
        }

        return [
            "success" => true,
            "message" => "Imagen subida correctamente",
            "file" => $safeFileName,
            "funko_id" => $funko_id
        ];
    }
}
