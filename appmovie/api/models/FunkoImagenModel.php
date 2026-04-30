<?php
class FunkoImagenModel
{
    public $enlace;
    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }

    public function getImagenesFunko($idFunko)
    {
        $sql = "SELECT urlImagen FROM Funko_Imagen WHERE funko_id=$idFunko;";
        $r = $this->enlace->executeSQL($sql);

        $imgs = [];
        if (!empty($r) && is_array($r)) {
            for ($i = 0; $i < count($r); $i++) {
                $imgs[] = $r[$i]->urlImagen;
            }
        }
        return $imgs;
    }
}
