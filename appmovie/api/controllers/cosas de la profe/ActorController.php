<?php
// localhost:81/appmovie/api/actor
class actor{
    //GET Lista actores
    //URL localhost:81/appmovie/api/actor
    public function index(){
        try {
            $response = new Response();
            //Instancia del modelo actor
            $actorM = new ActorModel();
            //Metodo del modelo
            $result = $actorM->all();
            //Dar respuesta
            $response->toJSON($result);
            
        } catch (Exception $e) {
            $response->toJSON($result);
            handleException($e);
        }
    }
}