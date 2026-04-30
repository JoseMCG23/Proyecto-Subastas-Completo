<?php
// Composer autoloader
require_once 'vendor/autoload.php';
/*Encabezada de las solicitudes*/
/*CORS*/
header("Access-Control-Allow-Origin: * ");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: *");
header('Content-Type: application/json');

/*--- Requerimientos Clases o librerías*/
require_once "controllers/core/Config.php";
require_once "controllers/core/HandleException.php";
require_once "controllers/core/Logger.php";
require_once "controllers/core/MySqlConnect.php";
require_once "controllers/core/Request.php";
require_once "controllers/core/Response.php";
//Middleware
require_once "middleware/AuthMiddleware.php";

/***--- Agregar todos los modelos*/

require_once "models/RolModel.php";
require_once "models/SubastaModel.php";
require_once "models/PujaModel.php";
require_once "models/UsuarioModel.php";
require_once "models/imageModel.php";
require_once "models/FunkoModel.php";
require_once "models/FunkoImagenModel.php";
require_once "models/FunkoCategoriaModel.php";
require_once "models/ResultadoSubastaModel.php";
require_once "models/PagoModel.php";

/***--- Agregar todos los controladores*/

require_once "controllers/usuario.php";
require_once "controllers/funko.php";
require_once "controllers/subasta.php";
require_once "controllers/puja.php";
require_once 'controllers/categoria.php';
require_once "controllers/image.php";
require_once "controllers/resultadoSubasta.php";
require_once "controllers/pago.php";
//Enrutador
require_once "routes/RoutesController.php";
$index = new RoutesController();
$index->index();
