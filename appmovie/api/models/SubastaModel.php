<?php
class SubastaModel {
    public $enlace;
    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }

    private function emitirEventoSubastas($evento, $payload = [])
    {
        require_once __DIR__ . '/../vendor/autoload.php';
        $config = include __DIR__ . '/../config.php';

        $pusher = new Pusher\Pusher(
            $config['PUSHER_KEY'],
            $config['PUSHER_SECRET'],
            $config['PUSHER_APP_ID'],
            [
                'cluster' => $config['PUSHER_CLUSTER'],
                'useTLS' => true
            ]
        );

        $pusher->trigger('subastas', $evento, $payload);
    }

    private function emitirEventoPuja($idSubasta)
    {
        require_once __DIR__ . '/../vendor/autoload.php';
        $config = include __DIR__ . '/../config.php';

        $pusher = new Pusher\Pusher(
            $config['PUSHER_KEY'],
            $config['PUSHER_SECRET'],
            $config['PUSHER_APP_ID'],
            [
                'cluster' => $config['PUSHER_CLUSTER'],
                'useTLS' => true
            ]
        );

        $subasta = $this->get($idSubasta);
        $pujaMayor = $this->getPujaMayor($idSubasta);
        $historial = $this->getPujas($idSubasta);

        $pusher->trigger("subasta-$idSubasta", "puja-registrada", [
            'subastaId' => (int)$idSubasta,
            'estado' => $subasta ? $subasta->estado : null,
            'pujaMayor' => $pujaMayor,
            'historial' => $historial
        ]);
    }

    private function sincronizarEstadoPorFecha($idSubasta)
    {
        date_default_timezone_set('America/Costa_Rica');

        $sql = "SELECT idsubasta, estado, fechaInicio, fechafin
                FROM subasta
                WHERE idsubasta = $idSubasta;";
        $r = $this->enlace->executeSQL($sql);

        if (empty($r)) {
            return;
        }

        $subasta = $r[0];
        $estado = strtoupper($subasta->estado);

        // No tocar subastas que ya no deben cambiar
        if (in_array($estado, ['FINALIZADA', 'CANCELADA', 'INACTIVA'])) {
            return;
        }

        $ahora = new DateTime();
        $fechaInicio = new DateTime($subasta->fechaInicio);
        $fechaFin = new DateTime($subasta->fechafin);

        // Si ya venció, pasar a FINALIZADA
        if ($ahora >= $fechaFin && $estado !== 'FINALIZADA') {
            $sql = "UPDATE subasta
                    SET estado = 'FINALIZADA'
                    WHERE idsubasta = $idSubasta;";
            $this->enlace->executeSQL_DML($sql);

            $this->emitirEventoSubastas('subasta-estado-cambiado', [
                'idSubasta' => $idSubasta,
                'estado' => 'FINALIZADA'
            ]);

            return;
        }

        // Si ya inició y estaba programada, pasar a ACTIVA
        if ($estado === 'PROGRAMADA' && $ahora >= $fechaInicio && $ahora < $fechaFin) {
            $sql = "UPDATE subasta
                    SET estado = 'ACTIVA'
                    WHERE idsubasta = $idSubasta;";
            $this->enlace->executeSQL_DML($sql);

            $this->emitirEventoSubastas('subasta-estado-cambiado', [
                'idSubasta' => $idSubasta,
                'estado' => 'ACTIVA'
            ]);
        }
    }

    public function sincronizarTodasPorFecha()
    {
        $sql = "SELECT idsubasta FROM subasta
                WHERE estado IN ('PROGRAMADA', 'ACTIVA');";
        $r = $this->enlace->executeSQL($sql);

        if (!empty($r)) {
            foreach ($r as $item) {
                $this->sincronizarEstadoPorFecha($item->idsubasta);
            }
        }
    }
        
    private function getNombreUsuario($idUsuario)
    {
        $sql = "SELECT nombre, apellido FROM Usuario WHERE id=$idUsuario;";
        $r = $this->enlace->executeSQL($sql);
        if (!empty($r)) return $r[0]->nombre . " " . $r[0]->apellido;
        return null;
    }

    public function all()
    {
        $sql = "SELECT 
            s.idsubasta,
            s.funko_id,
            f.nombre AS objeto,
            f.imagen_portada AS imagen,
            f.vendedor_id,
            f.condicion,
            s.fechaInicio,
            s.fechafin,
            s.precioBase,
            s.incre_minimo,
            s.estado,
            (
                SELECT COUNT(*)
                FROM Puja p
                WHERE p.subastaId = s.idsubasta
            ) AS cantidadPujas,
            (
                SELECT GROUP_CONCAT(DISTINCT c.nombre SEPARATOR ', ')
                FROM funko_categoria fc
                INNER JOIN Categoria c ON c.idCategoria = fc.categoria_id
                WHERE fc.funko_id = f.idFunko
            ) AS categorias
        FROM subasta s
        INNER JOIN Funko f ON s.funko_id = f.idFunko
        ORDER BY s.idsubasta DESC;";

        $r = $this->enlace->executeSQL($sql);

        if (!empty($r) && is_array($r)) {
            for ($i = 0; $i < count($r); $i++) {
                $r[$i]->usuarioCreador = $this->getNombreUsuario($r[$i]->vendedor_id);
                unset($r[$i]->vendedor_id);
            }
        }
        
        return $r ?: [];
    }
    
    //Cantidad Pujas
    private function getCantidadPujas($idSubasta)
    {
        $sql = "SELECT COUNT(*) as total FROM Puja WHERE subastaId = $idSubasta;";
        $r = $this->enlace->ExecuteSQL($sql);
        return (!empty($r)) ? $r[0]->total : 0;
    }

    //Subastas activas
    public function getActivas()
    {
        $sql = "SELECT s.idsubasta, f.nombre AS objeto, f.imagen_portada AS imagen, 
                   s.fechaInicio, s.fechafin AS fechaCierreEstimada, s.precioBase
            FROM subasta s
            INNER JOIN Funko f ON s.funko_id = f.idFunko
            WHERE s.estado = 'ACTIVA'
            ORDER BY s.fechaInicio DESC;";

        $r = $this->enlace->ExecuteSQL($sql);

        if (!empty($r) && is_array($r)) {
            foreach ($r as $item) {
                $item->cantidadPujas = $this->getCantidadPujas($item->idsubasta);
            }
        }

        return $r ?: [];
    }

    //Subastas finalizadas
    public function getFinalizadas()
    {
        $sql = "SELECT s.idsubasta, f.nombre AS objeto, f.imagen_portada AS imagen,
                   s.fechafin AS fechaCierre, s.estado AS estadoFinal, s.precioBase
            FROM subasta s
            INNER JOIN Funko f ON s.funko_id = f.idFunko
            WHERE s.estado IN ('FINALIZADA','CANCELADA')
            ORDER BY s.fechafin DESC;";

        $r = $this->enlace->ExecuteSQL($sql);

        if (!empty($r) && is_array($r)) {
            foreach ($r as $item) {
                $item->cantidadPujas = $this->getCantidadPujas($item->idsubasta);
            }
        }

        return $r ?: [];
    }

    //Detalle de una subasta en especifico
    public function get($id)
    {
        $sql = "SELECT 
                    s.idsubasta,
                    s.funko_id,
                    s.fechaInicio,
                    s.fechafin,
                    s.precioBase,
                    s.incre_minimo,
                    s.estado,
                    f.idFunko,
                    f.nombre,
                    f.descripcion,
                    f.imagen_portada,
                    f.condicion,
                    f.vendedor_id,
                    CONCAT(u.nombre, ' ', u.apellido) AS vendedor_nombre,
                    u.correo AS vendedor_correo
                FROM subasta s
                INNER JOIN Funko f ON s.funko_id = f.idFunko
                LEFT JOIN Usuario u ON f.vendedor_id = u.id
                WHERE s.idsubasta = $id;";

        $r = $this->enlace->ExecuteSQL($sql);

        if (!empty($r)) {
            $subasta = $r[0];

            $subasta->cantidadTotalPujas = $this->getCantidadPujas($id);
            $subasta->categorias = $this->getCategoriasFunko($subasta->idFunko);
            $subasta->imagenes = $this->getImagenesFunko($subasta->idFunko);
            $subasta->pujaActual = $this->getPujaMayor($id);
            $subasta->historial = $this->getPujas($id);

            if (isset($subasta->idFunko) && !isset($subasta->funko_id)) {
                $subasta->funko_id = $subasta->idFunko;
            }

            unset($subasta->idFunko);

            return $subasta;
        }

        return null;
    }

    //Historial pujas de una subasta
    public function getPujas($idSubasta)
    {
        $sql = "SELECT 
                    p.idPuja,
                    p.usuarioId,
                    CONCAT(u.nombre,' ',u.apellido) AS usuario,
                    p.monto,
                    p.fechaYhora
                FROM Puja p
                INNER JOIN Usuario u ON p.usuarioId = u.id
                WHERE p.subastaId = $idSubasta
                ORDER BY p.fechaYhora DESC, p.idPuja DESC;";
        return $this->enlace->ExecuteSQL($sql);
    }

    private function getImagenesFunko($idFunko)
    {
        $sql = "SELECT idImagen, urlImagen
                FROM Funko_Imagen
                WHERE funko_id = $idFunko
                ORDER BY idImagen ASC;";
        return $this->enlace->ExecuteSQL($sql) ?: [];
    }

    private function getPujaMayor($idSubasta)
    {
        $sql = "SELECT 
                    p.idPuja,
                    p.usuarioId,
                    CONCAT(u.nombre, ' ', u.apellido) AS usuario,
                    p.monto,
                    p.fechaYhora
                FROM Puja p
                INNER JOIN Usuario u ON p.usuarioId = u.id
                WHERE p.subastaId = $idSubasta
                ORDER BY p.monto DESC, p.fechaYhora DESC
                LIMIT 1;";

        $r = $this->enlace->ExecuteSQL($sql);
        return !empty($r) ? $r[0] : null;
    }

    //Categorias del funko
    private function getCategoriasFunko($idFunko){
        $sql = "SELECT c.nombre FROM Categoria c INNER JOIN funko_categoria fc ON c.idCategoria = fc.categoria_id
                WHERE fc.funko_id = $idFunko;";
        return $this->enlace->ExecuteSQL($sql);
    }

    //Crear subasta
    public function create($objeto)
    {
        error_log("SubastaModel::create - Iniciando validaciones");
        error_log("Fecha inicio: " . $objeto->fechaInicio);
        error_log("Fecha fin: " . $objeto->fechafin);
        error_log("Precio base: " . $objeto->precioBase);
        error_log("Incremento: " . $objeto->incre_minimo);
        error_log("Funko ID: " . $objeto->funko_id);

        date_default_timezone_set('America/Costa_Rica');

        $fechaInicio = new DateTime($objeto->fechaInicio);
        $fechaFin = new DateTime($objeto->fechafin);
        $ahora = new DateTime();
        $ahora->setTime((int)$ahora->format('H'), (int)$ahora->format('i'), 0);

        error_log("fechaInicio recibida: " . $fechaInicio->format('Y-m-d H:i:s'));
        error_log("fechaFin recibida: " . $fechaFin->format('Y-m-d H:i:s'));
        error_log("ahora servidor: " . $ahora->format('Y-m-d H:i:s'));

        if ($fechaInicio < $ahora) {
            throw new Exception("La fecha de inicio debe ser en el futuro");
        }

        if ($fechaFin <= $fechaInicio) {
            throw new Exception("La fecha de cierre debe ser mayor a la de inicio");
        }

        if (!isset($objeto->precioBase) || $objeto->precioBase <= 0) {
            throw new Exception("El precio base debe ser mayor a 0");
        }

        if (!isset($objeto->incre_minimo) || $objeto->incre_minimo <= 0) {
            throw new Exception("El incremento mínimo debe ser mayor a 0");
        }

        if (!isset($objeto->funko_id) || !is_numeric($objeto->funko_id)) {
            throw new Exception("El funko seleccionado no es válido");
        }

        $sql = "SELECT idsubasta FROM subasta
                WHERE funko_id = $objeto->funko_id
                AND estado = 'ACTIVA';";
        $r = $this->enlace->executeSQL($sql);

        if (!empty($r)) {
            throw new Exception("El funko ya tiene una subasta activa");
        }

        $sql = "SELECT estado FROM Funko WHERE idFunko = $objeto->funko_id;";
        $r = $this->enlace->executeSQL($sql);

        if (empty($r) || $r[0]->estado != 'DISPONIBLE') {
            throw new Exception("El funko no está disponible");
        }

        $sql = "INSERT INTO subasta
                (funko_id, fechaInicio, fechafin, precioBase, incre_minimo, estado)
                VALUES (
                    " . (int)$objeto->funko_id . ",
                    '" . $objeto->fechaInicio . "',
                    '" . $objeto->fechafin . "',
                    " . (float)$objeto->precioBase . ",
                    " . (float)$objeto->incre_minimo . ",
                    'INACTIVA'
                );";

        error_log("SQL INSERT SUBASTA: " . $sql);

        $id = $this->enlace->executeSQL_DML_last($sql);

        $nuevaSubasta = $this->get($id);
        $this->emitirEventoSubastas('subasta-creada', [
            'idSubasta' => $id,
            'subasta' => $nuevaSubasta
        ]);

        if (!$id) {
            throw new Exception("No se pudo crear la subasta");
        }

        return $this->get($id);
    }

    private function tienePujas($idSubasta)
    {
        $sql = "SELECT COUNT(*) as total FROM Puja WHERE subastaId = $idSubasta;";
        $r = $this->enlace->executeSQL($sql);
        return (!empty($r) && $r[0]->total > 0);
    }

    //Actualizar subasta
    public function update($objeto)
    {
        $id = $objeto->idsubasta;
        $sql = "SELECT fechaInicio, estado FROM subasta WHERE idsubasta = $id;";
        $r = $this->enlace->executeSQL($sql);

        if (empty($r)) {
            throw new Exception("Subasta no encontrada");
        }

        $fechaInicio = $r[0]->fechaInicio;
        $estado = $r[0]->estado ?? null;

        // Validar estados editables
        if (!in_array($estado, ['INACTIVA', 'PROGRAMADA'])) {
            throw new Exception("Solo se puede editar subasta INACTIVA o PROGRAMADA");
        }

        // Validar si no ha iniciado (solo con PROGRAMADA)
        if ($estado === 'PROGRAMADA' && strtotime($fechaInicio) <= time()) {
            throw new Exception("No se puede editar porque la subasta ya inició");
        }

        // Validar si no tiene pujas
        if ($this->tienePujas($id)) {
            throw new Exception("No se puede editar porque ya tiene pujas");
        }

        // Fecha cierre > fecha inicio
        if (strtotime($objeto->fechafin) <= strtotime($objeto->fechaInicio)) {
            throw new Exception("La fecha de cierre debe ser mayor a la de inicio");
        }

        //Precio base > 0
        if ($objeto->precioBase <= 0) {
            throw new Exception("Precio base inválido");
        }

        //Incremento mínimo > 0
        if ($objeto->incre_minimo <= 0) {
            throw new Exception("Incremento mínimo inválido");
        }

        // Update
        $sql = "UPDATE subasta SET
                    fechaInicio = '$objeto->fechaInicio',
                    fechafin = '$objeto->fechafin',
                    precioBase = $objeto->precioBase,
                    incre_minimo = $objeto->incre_minimo
                WHERE idsubasta = $id;";

        $this->enlace->executeSQL_DML($sql);

        $subastaActualizada = $this->get($id);

        $this->emitirEventoSubastas('subasta-actualizada', [
            'idSubasta' => $id,
            'subasta' => $subastaActualizada
        ]);

        return $subastaActualizada;
    }

    //Publicar subasta
    public function publicar($id)
    {
        date_default_timezone_set('America/Costa_Rica');

        $sql = "SELECT estado, fechaInicio, fechafin FROM subasta WHERE idsubasta = $id;";
        $r = $this->enlace->executeSQL($sql);

        if (empty($r)) {
            throw new Exception("Subasta no encontrada");
        }

        if ($r[0]->estado != 'INACTIVA') {
            throw new Exception("Solo se pueden publicar subastas INACTIVAS");
        }

        $ahora = new DateTime();
        $fechaInicio = new DateTime($r[0]->fechaInicio);
        $fechaFin = new DateTime($r[0]->fechafin);

        if ($ahora >= $fechaFin) {
            throw new Exception("No se puede publicar una subasta ya vencida");
        }

        $nuevoEstado = ($ahora >= $fechaInicio) ? 'ACTIVA' : 'PROGRAMADA';

        $sql = "UPDATE subasta SET estado = '$nuevoEstado' WHERE idsubasta = $id;";
        $this->enlace->executeSQL_DML($sql);

        $subastaPublicada = $this->get($id);

        $this->emitirEventoSubastas('subasta-estado-cambiado', [
            'idSubasta' => $id,
            'estado' => $subastaPublicada->estado,
            'subasta' => $subastaPublicada
        ]);

        return $subastaPublicada;
    }

    //Cancelar subasta
    public function cancelar($id)
    {
        $sql = "SELECT fechaInicio FROM subasta WHERE idsubasta = $id;";
        $r = $this->enlace->executeSQL($sql);

        if (empty($r)) {
            throw new Exception("Subasta no encontrada");
        }

        // Verificar si no ha iniciado o no tiene pujas
        if (strtotime($r[0]->fechaInicio) > time() || !$this->tienePujas($id)) {

            $sql = "UPDATE subasta SET estado = 'CANCELADA' WHERE idsubasta = $id;";
            $this->enlace->executeSQL_DML($sql);

            $this->emitirEventoSubastas('subasta-estado-cambiado', [
                'idSubasta' => $id,
                'estado' => 'CANCELADA'
            ]);

            return $this->get($id);
        }

        throw new Exception("No se puede cancelar la subasta");
    }

    public function reportePorEstado()
    {
        $this->sincronizarTodasPorFecha();

        $sql = "SELECT 
                    estado,
                    COUNT(*) AS total
                FROM subasta
                WHERE estado IN ('ACTIVA', 'FINALIZADA', 'CANCELADA')
                GROUP BY estado
                ORDER BY estado ASC;";

        return $this->enlace->ExecuteSQL($sql);
    }

    
}
