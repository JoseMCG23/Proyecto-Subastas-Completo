<?php
class PagoModel
{
    public $enlace;
    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }


    public function getPagoById($idPago)
    {
        $sql = "SELECT * FROM Pago WHERE idPago = $idPago";
        $r = $this->enlace->executeSQL($sql);
        return (!empty($r)) ? $r[0] : null;
    }



    public function confirmarPago($idPago)
    {
        $sql = "UPDATE Pago
            SET estado = 'Confirmado'
            WHERE idPago = $idPago";

        return $this->enlace->executeSQL_DML($sql);
    }
}
