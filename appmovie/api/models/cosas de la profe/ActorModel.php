<?php
class ActorModel{
    public $enlace;
    public function __construct(){
        $this->enlace=new MySqlConnect();
    }
    /*Listar actores*/
    public function all(){
        //Consulta de SQL
        $vSql="Select * from actor;";
        //Ejecutan la consulta
        $vResultado= $this->enlace->executeSQL($vSql);
        //Retornan el resultado de la consulta
        return $vResultado;
    }

}