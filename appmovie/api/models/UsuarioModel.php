<?php

use Firebase\JWT\JWT;
class UsuarioModel
{
    public $enlace;
    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }

    /**
     * Listar usuarios
     * Campos: Nombre, Rol, Estado
     */
    public function all()
    {
        $rolM = new RolModel();

        $vSql = "SELECT id, nombre, apellido, estado, rol_id FROM Usuario
        ORDER BY id DESC;";

        $vResultado = $this->enlace->ExecuteSQL($vSql);

        if (!empty($vResultado) && is_array($vResultado)) {
            for ($i = 0; $i < count($vResultado); $i++) {

                $vResultado[$i]->nombreCompleto =
                    $vResultado[$i]->nombre . " " . $vResultado[$i]->apellido;

                $vResultado[$i]->rol = $rolM->getNombreRol($vResultado[$i]->rol_id);

                //estado sin numero
                $vResultado[$i]->estado = ($vResultado[$i]->estado == "INACTIVO") ? "BLOQUEADO" : "ACTIVO";

                unset($vResultado[$i]->nombre, $vResultado[$i]->apellido, $vResultado[$i]->rol_id);
            }
        }

        return $vResultado;
    }

    /**
     * Detalle usuario
     * incluye: nombre completo, rol, estado, fecha registro
     * campos calculados: cantidad subastas creadas y pujas
     */
    public function get($id)   
    {
        $rolM = new RolModel();

        //cambio del tercer adelanto, agrego correo
        $vSql = "SELECT id, nombre, apellido, correo, estado, fechaRegistro, rol_id
         FROM Usuario
         WHERE id=$id;";

        $vResultado = $this->enlace->executeSQL($vSql);

        if (!empty($vResultado)) {

            $u = $vResultado[0];

            //nombre completo
            $u->nombreCompleto = $u->nombre . " " . $u->apellido;

            //rol
            $u->rol = $rolM->getNombreRol($u->rol_id);

            // CAMPOS CALCULADOSSSS
            

            //cant  subastas creadas
            $sqlSubastas = "SELECT COUNT(*) as cantidad
                        FROM subasta
                        WHERE funko_id IN (
                            SELECT idFunko FROM Funko WHERE vendedor_id=$id
                        );";

            $rSub = $this->enlace->executeSQL($sqlSubastas);
            $u->cantidadSubastasCreadas = (!empty($rSub)) ? (int)$rSub[0]->cantidad : 0;

            //cant pujas realizadas
            $sqlPujas = "SELECT COUNT(*) as cantidad
                     FROM Puja
                     WHERE usuarioId=$id;";

            $rPuja = $this->enlace->executeSQL($sqlPujas);
            $u->cantidadPujasRealizadas = (!empty($rPuja)) ? (int)$rPuja[0]->cantidad : 0;

            unset($u->nombre);
            unset($u->apellido);
            unset($u->rol_id);

            return $u;
        }

        return null;
    }


    public function update($objeto)
    {
        //separo nombre completo
        $nombreCompleto = trim($objeto->nombreCompleto);
        $partes = explode(" ", $nombreCompleto, 2);

        $nombre = $partes[0];
        $apellido = isset($partes[1]) ? $partes[1] : "";

        //consulta sql
        $sql = "Update Usuario SET nombre ='$nombre'," .
            "apellido ='$apellido'," .
            "correo ='$objeto->correo' " .
            "Where id=$objeto->id";

        
        $cResults = $this->enlace->executeSQL_DML($sql);

        
        return $this->get($objeto->id);
    }
    public function changeState($objeto)
    {
        // Consultar estado actual
        $sql = "SELECT id, estado FROM Usuario WHERE id=$objeto->id";
        $resultado = $this->enlace->executeSQL($sql);

        if (empty($resultado)) {
            return null;
        }
        $estadoActual = strtoupper($resultado[0]->estado);
        $nuevoEstado = ($estadoActual == "ACTIVO") ? "INACTIVO" : "ACTIVO";

        // Update lógico
        $sql = "UPDATE Usuario SET estado ='$nuevoEstado' " .
            "WHERE id=$objeto->id";

        $cResults = $this->enlace->executeSQL_DML($sql);
        return $this->get($objeto->id);
    }
    public function login($objeto)
    {
        if (!isset($objeto->correo) || !isset($objeto->password)) {
            throw new Exception("Correo y contraseña son obligatorios");
        }

        $correo = $objeto->correo;
        $password = $objeto->password;

        $sql = "SELECT u.id, u.nombre, u.apellido, u.correo, u.contraseña, u.estado,
                   r.id AS rol_id, r.nombre AS rol_nombre
            FROM Usuario u
            INNER JOIN Roles r ON u.rol_id = r.id
            WHERE u.correo = '$correo'
            LIMIT 1;";

        $resultado = $this->enlace->executeSQL($sql);

        if (empty($resultado)) {
            throw new Exception("Usuario o contraseña incorrectos");
        }

        $usuario = $resultado[0];

        if (strtoupper($usuario->estado) !== "ACTIVO") {
            throw new Exception("El usuario está bloqueado o inactivo");
        }

        if (!password_verify($password, $usuario->contraseña)) {
            throw new Exception("Usuario o contraseña incorrectos");
        }

        $data = [
            'id' => $usuario->id,
            'correo' => $usuario->correo,
            'nombre' => $usuario->nombre . ' ' . $usuario->apellido,
            'rol' => $usuario->rol_nombre,
            'iat' => time(),
            'exp' => time() + 3600
        ];

        $jwt_token = JWT::encode($data, Config::get('SECRET_KEY'), 'HS256');

        return [
            'success' => true,
            'message' => 'Login correcto',
            'data' => $jwt_token
        ];
    }
    public function create($objeto)
    {
        if (
            !isset($objeto->nombre) ||
            !isset($objeto->apellido) ||
            !isset($objeto->correo) ||
            !isset($objeto->password) ||
            !isset($objeto->cedula) ||
            !isset($objeto->direccion)
        ) {
            throw new Exception("Faltan datos obligatorios para registrar el usuario");
        }

        $correo = $objeto->correo;

        $sqlExiste = "SELECT id FROM Usuario WHERE correo = '$correo' LIMIT 1;";
        $existe = $this->enlace->executeSQL($sqlExiste);

        if (!empty($existe)) {
            throw new Exception("Ya existe un usuario registrado con ese correo");
        }

        $sqlRol = "SELECT id FROM Roles WHERE UPPER(nombre) = 'COMPRADOR' LIMIT 1;";
        $rolResult = $this->enlace->executeSQL($sqlRol);

        if (empty($rolResult)) {
            throw new Exception("No existe el rol COMPRADOR en la base de datos");
        }

        $rolId = (int)$rolResult[0]->id;
        $passwordHash = password_hash($objeto->password, PASSWORD_DEFAULT);

        $sql = "INSERT INTO Usuario
                (nombre, apellido, correo, contraseña, cedula, direccion, estado, fechaRegistro, rol_id)
            VALUES
                ('$objeto->nombre',
                 '$objeto->apellido',
                 '$objeto->correo',
                 '$passwordHash',
                 '$objeto->cedula',
                 '$objeto->direccion',
                 'ACTIVO',
                 NOW(),
                 $rolId);";

        $id = $this->enlace->executeSQL_DML_last($sql);

        return $this->get($id);
    }
}

