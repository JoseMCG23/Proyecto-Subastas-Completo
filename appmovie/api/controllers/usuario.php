<?php
class usuario
{
    public function index()
    {
        try {
            $response = new Response();
            $usuarioM = new UsuarioModel();
            $result = $usuarioM->all();
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    // localhost:81/appmovie/api/usuario/1
    public function get($id)
    {
        try {
            $response = new Response();
            $m = new UsuarioModel();
            $result = $m->get($id);
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    //PUT actualizar
    public function update()
    {
        try {
            $request = new Request();
            $response = new Response();
            //Obtener json enviado
            $inputJSON = $request->getJSON();
            //Instancia del modelo
            $usuario = new UsuarioModel();
            //Acción del modelo a ejecutar
            $result = $usuario->update($inputJSON);
            //Dar respuesta
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }
    // PATCH cambiar estado lógico
    public function changeState()
    {
        try {
            $request = new Request();
            $response = new Response();
            // Obtener json enviado
            $inputJSON = $request->getJSON();
            // Instancia del modelo
            $usuario = new UsuarioModel();
            // Acción del modelo a ejecutar
            $result = $usuario->changeState($inputJSON);
            // Dar respuesta
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }
    public function login()
    {
        try {
            $request = new Request();
            $response = new Response();
            $inputJSON = $request->getJSON();

            $usuario = new UsuarioModel();
            $result = $usuario->login($inputJSON);

            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }
    public function create()
    {
        try {
            $request = new Request();
            $response = new Response();
            $inputJSON = $request->getJSON();

            $usuario = new UsuarioModel();
            $result = $usuario->create($inputJSON);

            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }
}
