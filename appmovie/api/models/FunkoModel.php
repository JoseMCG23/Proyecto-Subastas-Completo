<?php
class FunkoModel
{
    public $enlace;

    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }


    private function getNombreDueno($idUsuario)
    {
        $sql = "SELECT nombre, apellido FROM Usuario WHERE id=$idUsuario;";
        $r = $this->enlace->executeSQL($sql);
        if (!empty($r)) return $r[0]->nombre . " " . $r[0]->apellido;
        return null;
    }


    /**
     * LISTADO
     * nombre, imagen_portada, categorias, dueno
     */
    public function all()
    {
        $catM = new FunkoCategoriaModel();

        $sql = "SELECT idFunko, nombre, imagen_portada, vendedor_id, estado, condicion
            FROM Funko
            ORDER BY idFunko DESC;";
        $r = $this->enlace->ExecuteSQL($sql);

        if (!empty($r) && is_array($r)) {
            for ($i = 0; $i < count($r); $i++) {
                $idFunko = $r[$i]->idFunko;

                $r[$i]->categorias = $catM->getCategoriasFunko($idFunko);
                $r[$i]->dueno = $this->getNombreDueno($r[$i]->vendedor_id);
                $r[$i]->tieneSubastaActiva = $this->tieneSubastaActiva($idFunko);

                // solo lo necesario
                unset($r[$i]->vendedor_id);
            }
        }

        return $r ?: [];
    }

    /**
     * DETALLE
     */
    public function get($id)
    {
        $catM = new FunkoCategoriaModel();
        $imgM = new FunkoImagenModel();

        $sql = "SELECT idFunko, nombre, descripcion, estado, condicion, fecha_registro, vendedor_id, imagen_portada
        FROM Funko
        WHERE idFunko=$id;";
        $r = $this->enlace->executeSQL($sql);

        if (!empty($r)) {
            $f = $r[0];

            $f->categorias = $catM->getCategoriasFunko($f->idFunko);
            $imagenes = $imgM->getImagenesFunko($f->idFunko);

            $ordenadas = [];
            if (!empty($f->imagen_portada)) {
                $ordenadas[] = $f->imagen_portada;
            }

            if (!empty($imagenes) && is_array($imagenes)) {
                foreach ($imagenes as $img) {
                    if ($img !== $f->imagen_portada) {
                        $ordenadas[] = $img;
                    }
                }
            }

            $f->imagenes = $ordenadas;
            $f->propietario = $this->getNombreDueno($f->vendedor_id);


            $sqlSub = "SELECT idsubasta, fechaInicio, fechafin, estado
                       FROM subasta
                       WHERE funko_id=$id
                       ORDER BY fechaInicio DESC;";
            $subs = $this->enlace->executeSQL($sqlSub);
            $f->subastas = (!empty($subs) && is_array($subs)) ? $subs : [];

            unset($f->vendedor_id);
            return $f;
        }
        return null;
    }

    /**
     * Crear funko
     * @param $objeto funko a insertar
     * @return $this->get($idFunko) - Objeto funko
     */
    //
    public function create($objeto)
    {
        // portada
        $imagenPortada = $objeto->imagenes[0];

        $sql = "Insert into Funko (nombre, descripcion, condicion, estado, vendedor_id, imagen_portada)" .
            " Values ('$objeto->nombre','$objeto->descripcion',
                '$objeto->condicion','$objeto->estado',$objeto->vendedor_id,'$imagenPortada')";


        //btenemos el último insert
        $idFunko = $this->enlace->executeSQL_DML_last($sql);

        //CATEGORÍAS
        foreach ($objeto->categorias as $value) {
            $sql = "Insert into Funko_Categoria(funko_id,categoria_id)" .
                " Values($idFunko,$value)";
            $vResultadoCat = $this->enlace->executeSQL_DML($sql);
        }

        //IMÁGENES
        foreach ($objeto->imagenes as $item) {
            $sql = "Insert into Funko_Imagen(funko_id,urlImagen)" .
                " Values($idFunko,'$item')";
            $vResultadoImg = $this->enlace->executeSQL_DML($sql);
        }
        return $this->get($idFunko);
    }



    /**
     * Actualizar funko
     * @param $objeto funko a actualizar
     * @return $this->get($idFunko) - Objeto funko
     */
    public function update($objeto)
    {
        $idFunko = $objeto->idFunko;

    
        // RN 1: solo se puede editar si NO está en subasta activa
        if ($this->tieneSubastaActiva($idFunko)) {
            throw new Exception("No se puede editar el funko porque tiene una subasta activa");
        }

        $imagenPortada = $objeto->imagenes[0];

        // se actualiza la tabla principal
        $sql = "UPDATE Funko SET
                nombre = '$objeto->nombre',
                descripcion = '$objeto->descripcion',
                condicion = '$objeto->condicion',
                estado = '$objeto->estado',
                imagen_portada = '$imagenPortada'
            WHERE idFunko = $idFunko";

        $this->enlace->executeSQL_DML($sql);

        // CATEGORÍAS
        // delete de categorias actuales
        $sql = "DELETE FROM Funko_Categoria WHERE funko_id = $idFunko";
        $this->enlace->executeSQL_DML($sql);

        // insert con categorias nuevas
        foreach ($objeto->categorias as $value) {
            $sql = "INSERT INTO Funko_Categoria(funko_id, categoria_id)
                VALUES($idFunko, $value)";
            $this->enlace->executeSQL_DML($sql);
        }

        // IMÁGENES
        // delete imagenes actuales
        $sql = "DELETE FROM Funko_Imagen WHERE funko_id = $idFunko";
        $this->enlace->executeSQL_DML($sql);

        // insert con imagenes nuevas
        foreach ($objeto->imagenes as $item) {
            $sql = "INSERT INTO Funko_Imagen(funko_id, urlImagen)
                VALUES($idFunko, '$item')";
            $this->enlace->executeSQL_DML($sql);
        }
        return $this->get($idFunko);
    }
    
    private function tieneSubastaActiva($idFunko)
    {
        $sql = "SELECT idsubasta
            FROM subasta
            WHERE funko_id = $idFunko
              AND UPPER(estado) = 'ACTIVA';";
        $r = $this->enlace->executeSQL($sql);
        return (!empty($r));
    }

   
    private function haSidoSubastado($idFunko)
    {
        $sql = "SELECT idsubasta
            FROM subasta
            WHERE funko_id = $idFunko
            LIMIT 1;";
        $r = $this->enlace->executeSQL($sql);
        return (!empty($r));
    }

  
    private function getEstadoActual($idFunko)
    {
        $sql = "SELECT estado
            FROM Funko
            WHERE idFunko = $idFunko
            LIMIT 1;";
        $r = $this->enlace->executeSQL($sql);
        return (!empty($r)) ? $r[0]->estado : null;
    }
    public function deleteLogic($idFunko)
    {
        if ($this->haSidoSubastado($idFunko)) {
            throw new Exception("No se puede eliminar el funko porque ya fue subastado");
        }

        if ($this->tieneSubastaActiva($idFunko)) {
            throw new Exception("No se puede eliminar el funko porque pertenece a una subasta activa");
        }

        $sql = "UPDATE Funko
            SET estado = 'Eliminado'
            WHERE idFunko = $idFunko";

        $this->enlace->executeSQL_DML($sql);

        return [
            "success" => true,
            "message" => "Funko eliminado lógicamente",
            "idFunko" => $idFunko
        ];
    }

    public function changeState($idFunko)
    {
        $estadoActual = $this->getEstadoActual($idFunko);

        if (!$estadoActual) {
            throw new Exception("Funko no encontrado");
        }

        if (strtolower($estadoActual) === 'eliminado') {
            throw new Exception("No se puede activar o desactivar un funko eliminado");
        }

        $nuevoEstado = in_array(strtolower($estadoActual), ['activo', 'disponible'])
            ? 'Inactivo'
            : 'Activo';

        $sql = "UPDATE Funko
            SET estado = '$nuevoEstado'
            WHERE idFunko = $idFunko";

        $this->enlace->executeSQL_DML($sql);

        return $this->get($idFunko);
    }
}
