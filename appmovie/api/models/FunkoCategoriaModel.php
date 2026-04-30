<?php
class FunkoCategoriaModel
{
    public $enlace;
    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }
    public function all()
    {
        $sql = "SELECT idCategoria, nombre
                FROM Categoria
                ORDER BY nombre ASC;";
        return $this->enlace->executeSQL($sql);
    }

    public function get($id)
    {
        $sql = "SELECT idCategoria, nombre
                FROM Categoria
                WHERE idCategoria=$id;";
        $result = $this->enlace->executeSQL($sql);
        return (!empty($result)) ? $result[0] : null;
    }

    public function getCategoriasFunko($idFunko)
    {
        $sql = "SELECT c.idCategoria, c.nombre
            FROM Categoria c
            INNER JOIN Funko_Categoria fc ON c.idCategoria = fc.categoria_id
            WHERE fc.funko_id = $idFunko
            ORDER BY c.nombre ASC;";

        $r = $this->enlace->executeSQL($sql);
        return (!empty($r) && is_array($r)) ? $r : [];
    }


}
