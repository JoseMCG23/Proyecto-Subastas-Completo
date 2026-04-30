<?php

require_once "vendor/autoload.php";

class ResultadoSubastaModel
{
    public $enlace;

    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }

    public function cerrarSubasta($idSubasta)
    {
        $subastaModel = new SubastaModel();

        // Reutilizamos el get existente de SubastaModel
        $subasta = $subastaModel->get($idSubasta);

        if (!$subasta) {
            throw new Exception("Subasta no encontrada");
        }

        // Si ya está finalizada o cancelada, no hacer nada
        $estadoActual = strtoupper($subasta->estado ?? '');
        if ($estadoActual === 'FINALIZADA' || $estadoActual === 'CANCELADA') {
            return [
                "success" => true,
                "message" => "La subasta ya estaba cerrada",
                "subasta" => $subasta,
                "resultado" => $this->getResultadoBySubasta($idSubasta),
                "pago" => $this->getPagoBySubasta($idSubasta)
            ];
        }

        // Si todavía no ha llegado la fecha de cierre, no cerrar
        date_default_timezone_set('America/Costa_Rica');

        $fechaActual = new DateTime();
        $fechaFin = new DateTime($subasta->fechafin);

        if ($fechaActual < $fechaFin) {
            return [
                "success" => false,
                "message" => "La subasta aún no ha terminado",
                "fechaActual" => $fechaActual,
                "fechaFin" => $subasta->fechafin
            ];
        }

        // Evitar duplicar resultados
        $resultadoExistente = $this->getResultadoBySubasta($idSubasta);
        if ($resultadoExistente) {
            return [
                "success" => true,
                "message" => "La subasta ya tenía resultado registrado",
                "subasta" => $subasta,
                "resultado" => $resultadoExistente,
                "pago" => $this->getPagoBySubasta($idSubasta)
            ];
        }

        // Buscar puja ganadora (mayor monto antes del cierre)
        $pujaGanadora = $this->getPujaMayorValida($idSubasta, $subasta->fechafin);

        // Cambiar estado de la subasta a FINALIZADA
        $this->cerrarEstadoSubasta($idSubasta);

        // Caso sin pujas
        if (!$pujaGanadora) {
            $this->insertResultadoSinOfertas($idSubasta);

            // Emitir evento realtime
            $this->emitirEventoCierre($idSubasta);

            return [
                "success" => true,
                "message" => "Subasta finalizada sin ofertas",
                "subasta_id" => $idSubasta,
                "resultado" => $this->getResultadoBySubasta($idSubasta),
                "pago" => null
            ];
        }

        // Caso con ganador
        $this->insertResultadoConGanador(
            $idSubasta,
            $pujaGanadora->usuarioId,
            $pujaGanadora->monto
        );

        // Crear pago pendiente si no existe
        if (!$this->getPagoBySubasta($idSubasta)) {
            $this->insertPagoPendiente(
                $idSubasta,
                $pujaGanadora->usuarioId,
                $pujaGanadora->monto
            );
        }

        // Emitir evento realtime
        $this->emitirEventoCierre($idSubasta);

        return [
            "success" => true,
            "message" => "Subasta finalizada correctamente",
            "subasta_id" => $idSubasta,
            "ganador_usuario_id" => $pujaGanadora->usuarioId,
            "monto_final" => $pujaGanadora->monto,
            "resultado" => $this->getResultadoBySubasta($idSubasta),
            "pago" => $this->getPagoBySubasta($idSubasta)
        ];
    }

    private function cerrarEstadoSubasta($idSubasta)
    {
        $sql = "UPDATE subasta
                SET estado = 'FINALIZADA'
                WHERE idsubasta = $idSubasta";
        return $this->enlace->executeSQL_DML($sql);
    }

    private function getPujaMayorValida($idSubasta, $fechaFin)
    {
        $sql = "SELECT usuarioId, monto, fechaYhora
                FROM Puja
                WHERE subastaId = $idSubasta
                  AND fechaYhora <= '$fechaFin'
                ORDER BY monto DESC, fechaYhora ASC
                LIMIT 1";
        $r = $this->enlace->executeSQL($sql);
        return (!empty($r)) ? $r[0] : null;
    }

    private function insertResultadoConGanador($idSubasta, $idUsuarioGanador, $montoFinal)
    {
        $sql = "INSERT INTO Resultado_Subasta
                    (subasta_id, usuario_ganador_id, monto_final, fecha_cierre, estado_resultado)
                VALUES
                    ($idSubasta, $idUsuarioGanador, $montoFinal, NOW(), 'CON_GANADOR')";
        return $this->enlace->executeSQL_DML($sql);
    }

    private function insertResultadoSinOfertas($idSubasta)
    {
        $sql = "INSERT INTO Resultado_Subasta
                    (subasta_id, usuario_ganador_id, monto_final, fecha_cierre, estado_resultado)
                VALUES
                    ($idSubasta, NULL, NULL, NOW(), 'SIN_OFERTAS')";
        return $this->enlace->executeSQL_DML($sql);
    }

    private function insertPagoPendiente($idSubasta, $idUsuario, $monto)
    {
        $sql = "INSERT INTO Pago
                    (idUsuario, monto, fecha_pago, estado, idSubasta)
                VALUES
                    ($idUsuario, $monto, NOW(), 'Pendiente', $idSubasta)";
        return $this->enlace->executeSQL_DML($sql);
    }

    public function getResultadoBySubasta($idSubasta)
    {
        $sql = "SELECT 
                    r.idResultado,
                    r.subasta_id,
                    r.usuario_ganador_id,
                    CONCAT(u.nombre, ' ', u.apellido) AS ganador_nombre,
                    r.monto_final,
                    r.fecha_cierre,
                    r.estado_resultado
                FROM Resultado_Subasta r
                LEFT JOIN Usuario u ON r.usuario_ganador_id = u.id
                WHERE r.subasta_id = $idSubasta
                LIMIT 1";
        $r = $this->enlace->executeSQL($sql);
        return (!empty($r)) ? $r[0] : null;
    }

    public function getPagoBySubasta($idSubasta)
    {
        $sql = "SELECT *
                FROM Pago
                WHERE idSubasta = $idSubasta
                LIMIT 1";
        $r = $this->enlace->executeSQL($sql);
        return (!empty($r)) ? $r[0] : null;
    }

    private function emitirEventoCierre($idSubasta)
    {
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

        $subastaModel = new SubastaModel();
        $subasta = $subastaModel->get($idSubasta);

        $payload = [
            'subastaId' => $idSubasta,
            'estado' => $subasta ? $subasta->estado : 'FINALIZADA',
            'resultado' => $this->getResultadoBySubasta($idSubasta),
            'pago' => $this->getPagoBySubasta($idSubasta)
        ];

        $pusher->trigger("subasta-$idSubasta", "subasta-cerrada", $payload);
    }
}
