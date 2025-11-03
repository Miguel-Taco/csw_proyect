package com.unmsm.scorely.services.imp;

import com.unmsm.scorely.dto.EntregaTareaRequest;
import com.unmsm.scorely.dto.EntregaTareaResponse;
import com.unmsm.scorely.dto.VerificarEntregaResponse;
import com.unmsm.scorely.services.EntregarTareaService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.ResultSet;

@Service
public class EntregarTareaImpl implements EntregarTareaService {

    private final DataSource dataSource;

    // Inyección por constructor (recomendado)
    public EntregarTareaImpl(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    @Transactional
    public EntregaTareaResponse guardarEntrega(EntregaTareaRequest request) {
        try (Connection conn = dataSource.getConnection();
             CallableStatement stmt = conn.prepareCall("{CALL sp_guardar_entrega(?, ?, ?)}")) {

            // Setear parámetros de entrada
            stmt.setInt(1, request.getIdPersona());
            stmt.setInt(2, request.getIdTarea());
            stmt.setString(3, request.getEnlace());

            // Ejecutar el procedimiento
            ResultSet rs = stmt.executeQuery();

            if (rs.next()) {
                Integer idEntrega = rs.getInt("id_entrega");
                String tipoTarea = rs.getString("tipo_tarea");
                String operacion = rs.getString("operacion");
                String mensaje = rs.getString("mensaje");

                EntregaTareaResponse response = new EntregaTareaResponse();
                response.setIdEntrega(idEntrega);
                response.setTipoTarea(tipoTarea);
                response.setOperacion(operacion);
                response.setMensaje(mensaje);
                response.setSuccess(true);

                return response;
            } else {
                EntregaTareaResponse response = new EntregaTareaResponse();
                response.setMensaje("No se obtuvo respuesta del procedimiento");
                response.setSuccess(false);
                return response;
            }

        } catch (Exception e) {
            EntregaTareaResponse response = new EntregaTareaResponse();
            response.setMensaje("Error al guardar la entrega: " + e.getMessage());
            response.setSuccess(false);
            return response;
        }
    }

    @Override
    public VerificarEntregaResponse verificarEntrega(Integer idPersona, Integer idTarea) {
        try (Connection conn = dataSource.getConnection();
             CallableStatement stmt = conn.prepareCall("{CALL sp_verificar_entrega(?, ?)}")) {

            stmt.setInt(1, idPersona);
            stmt.setInt(2, idTarea);

            ResultSet rs = stmt.executeQuery();

            if (rs.next()) {
                // Existe una entrega previa
                VerificarEntregaResponse response = new VerificarEntregaResponse();
                response.setExiste(true);
                response.setIdEntrega(rs.getInt("id_entrega"));
                response.setEnlace(rs.getString("enlace"));

                // Manejar fechas y notas que pueden ser NULL
                java.sql.Timestamp timestamp = rs.getTimestamp("fecha_entrega");
                if (timestamp != null) {
                    response.setFechaEntrega(timestamp.toLocalDateTime());
                }

                Double nota = rs.getDouble("nota");
                if (!rs.wasNull()) {
                    response.setNota(nota);
                }

                response.setMensaje("Entrega encontrada");
                return response;
            } else {
                // No existe entrega previa
                VerificarEntregaResponse response = new VerificarEntregaResponse();
                response.setExiste(false);
                response.setMensaje("No hay entrega previa");
                return response;
            }

        } catch (Exception e) {
            VerificarEntregaResponse response = new VerificarEntregaResponse();
            response.setExiste(false);
            response.setMensaje("Error al verificar entrega: " + e.getMessage());
            return response;
        }
    }
}