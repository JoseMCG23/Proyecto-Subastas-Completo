<?php
class categoria
{
    // GET /appmovie/api/categoria
    public function index()
    {
        try {
            $response = new Response();
            $m = new FunkoCategoriaModel();
            $result = $m->all();
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    // GET /appmovie/api/categoria/1
    public function get($id)
    {
        try {
            $response = new Response();
            $m = new FunkoCategoriaModel();
            $result = $m->get($id);
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    public function getCategoriaFunkos($idCategoria)
    {
        try {
            $response = new Response();
            $m = new FunkoCategoriaModel();
            $result = $m->getCategoriasFunko($idCategoria);
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }
}
