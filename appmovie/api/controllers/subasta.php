<?php
class subasta
{
    public function index(){
        try {
            $response = new Response();
            $m = new SubastaModel();
            $m->sincronizarTodasPorFecha();
            $result = $m->all();
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    public function get($id){
        try {
            $response = new Response();
            $m = new SubastaModel();
            $m->sincronizarTodasPorFecha();
            $result = $m->get($id);
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    public function activas(){
        try {
            $response = new Response();
            $m = new SubastaModel();
            $m->sincronizarTodasPorFecha();
            $result = $m->getActivas();
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    public function finalizadas(){
        try {
            $response = new Response();
            $m = new SubastaModel();
            $m->sincronizarTodasPorFecha();
            $result = $m->getFinalizadas();
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    public function pujas($id){
        try {
            $response = new Response();
            $m = new SubastaModel();
            $result = $m->getPujas($id);
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    
    //POST Crear
    public function create()
    {
        try {
            $request = new Request();
            $response = new Response();
            //Obtener json enviado
            $inputJSON = $request->getJSON();
            //Instancia del modelo
            $subasta = new SubastaModel();
            //Acción del modelo a ejecutar
            $result = $subasta->create($inputJSON);
            //Dar respuesta
            $response->toJSON($result);
        } catch (Exception $e) {
            
            handleException($e);
        }
    }

    // PUT Actualizar
    public function update()
    {
        try {
            $request = new Request();
            $response = new Response();
            $inputJSON = $request->getJSON();

            $subasta = new SubastaModel();
            $result = $subasta->update($inputJSON);

            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    // Publicar
    public function publicar($id){
        try {
            $response = new Response();
            $m = new SubastaModel();
            $result = $m->publicar($id);
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    //cancelar
    public function cancelar($id){
        try {
            $response = new Response();
            $m = new SubastaModel();
            $result = $m->cancelar($id);
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    // Reporte por estado
    public function reportePorEstado()
    {
        try {
            $response = new Response();
            $m = new SubastaModel();
            $result = $m->reportePorEstado();
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }
}