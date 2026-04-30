<?php
class puja
{
    public function index(){
        $model = new PujaModel();
        echo json_encode($model->all());
    }

    public function getBySubasta($id){
        $model = new PujaModel();
        echo json_encode($model->getBySubasta($id));
    }

    public function getByUsuario($id){
        $model = new PujaModel();
        echo json_encode($model->getByUsuario($id));
    }

    public function create()
    {
        try {
            $request = new Request();
            $response = new Response();
            $inputJSON = $request->getJSON();

            $model = new PujaModel();
            $result = $model->create($inputJSON);

            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    
}