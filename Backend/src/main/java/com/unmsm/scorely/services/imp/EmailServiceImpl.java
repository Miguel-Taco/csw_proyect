package com.unmsm.scorely.services.imp;

import com.unmsm.scorely.exception.EmailServiceException;
import com.unmsm.scorely.models.Invitacion;
import com.unmsm.scorely.services.EmailService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class EmailServiceImpl implements EmailService {
    private final JavaMailSender mailSender;

    @Value("${app.base-url:http://localhost:5173}") //cambiar
    private String baseUrl;

    @Value("${spring.mail.username}") //cambiar
    private String fromEmail;

    public EmailServiceImpl(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Override
    public void enviarInvitacion(Invitacion invitacion) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(invitacion.getCorreo());
            message.setSubject("Invitación a unirte al curso: " + invitacion.getSeccion().getNombreCurso());
            message.setText(construirMensaje(invitacion));

            mailSender.send(message);
            log.info("Invitación enviada a: {}", invitacion.getCorreo());
        } catch (Exception e) {
            log.error("Error al enviar invitación: {}", e.getMessage());
            throw new EmailServiceException("Error al enviar el correo de invitación", e);
        }
    }

    private String construirMensaje(Invitacion invitacion) {
        String linkInvitacion = baseUrl + "/login";

        return String.format(
                """
                Hola,
        
                Has sido invitado a unirte al curso:
        
                Curso: %s
                Año: %d
        
                Para unirte al curso, haz clic en el siguiente enlace:
        
                %s
        
                Esta invitación expirará el: %s
        
                Saludos,
                """,
                invitacion.getSeccion().getNombreCurso(),
                invitacion.getSeccion().getAnio(),
                linkInvitacion,
                invitacion.getFechaExpiracion()
        );
    }
}
