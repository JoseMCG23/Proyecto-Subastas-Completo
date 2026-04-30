<?php
// localhost:81/appmovie/api/funko
class funko
{

    public function index()
    {
        try {
            $response = new Response();
            $m = new FunkoModel();
            $result = $m->all();
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    // localhost:81/appmovie/api/funko/1
    public function get($id)
    {
        try {
            $response = new Response();
            $m = new FunkoModel();
            $result = $m->get($id);
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
            $funko = new FunkoModel();
            //Acción del modelo a ejecutar
            $result = $funko->create($inputJSON);
            //Dar respuesta
            $response->toJSON($result);
        } catch (Exception $e) {
            $response->toJSON($result);
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

            $funko = new FunkoModel();
            $result = $funko->update($inputJSON);

            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    // PUT Eliminación lógica
    public function deleteLogic()
    {
        try {
            $request = new Request();
            $response = new Response();
            $inputJSON = $request->getJSON();

            $funko = new FunkoModel();
            $result = $funko->deleteLogic($inputJSON->idFunko);

            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    // PUT Activar / Desactivar
    public function changeState()
    {
        try {
            $request = new Request();
            $response = new Response();
            $inputJSON = $request->getJSON();

            $funko = new FunkoModel();
            $result = $funko->changeState($inputJSON->idFunko);

            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }
}
