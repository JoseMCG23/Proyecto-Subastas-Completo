<?php

class pago
{
    public function confirmarPago($id)
    {
        $model = new PagoModel();
        $model->confirmarPago($id);

        $response = new Response();
        return $response->toJSON([
            "success" => true,
            "message" => "Pago confirmado"
        ]);
    }
}
