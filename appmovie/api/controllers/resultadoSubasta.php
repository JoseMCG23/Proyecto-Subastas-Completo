<?php

class resultadoSubasta
{
    public function cerrar($id)
    {
        try {
            $response = new Response();
            $model = new ResultadoSubastaModel();
            $resultado = $model->cerrarSubasta($id);
            $response->toJSON($resultado);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    
}
