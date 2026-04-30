<?php
class RolModel
{
    public $enlace;
    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }

    public function getNombreRol($rol_id)
    {
        $sql = "SELECT nombre FROM Roles WHERE id=$rol_id;";
        $r = $this->enlace->executeSQL($sql);
        if (!empty($r)) return $r[0]->nombre;
        return null;
    }



}
