package com.taskifyApplication.service;

import com.taskifyApplication.dto.UserDto.AuthResponseDTO;
import com.taskifyApplication.dto.UserDto.CreateUserRequestDTO;
import com.taskifyApplication.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.annotation.DirtiesContext;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_EACH_TEST_METHOD)
public class AuthServiceIntegrationTest {

    // Classe interna que fornece um "duplo" do JavaMailSender para os testes
    @TestConfiguration
    static class MailSenderTestConfig {
        @Bean
        public JavaMailSender javaMailSender() {
            return Mockito.mock(JavaMailSender.class);
        }
    }

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    private CreateUserRequestDTO validRequest;

    @BeforeEach
    void setUp() {
        validRequest = new CreateUserRequestDTO();
        validRequest.setEmail("test.user@example.com");
        validRequest.setUsername("testuser");
        validRequest.setPassword("ValidPassword123");
        validRequest.setFirstName("Test");
        validRequest.setLastName("User");
    }

//    @Test
//    void shouldRegisterUserSuccessfully_whenDataIsValid() {
//        // Ação
//        AuthResponseDTO response = authService.register(validRequest);
//
//        // Verificações
//        assertNotNull(response, "A resposta não deveria ser nula.");
//        assertNotNull(response.getToken(), "A resposta deveria conter um token JWT.");
//        assertFalse(response.getToken().isBlank(), "O token não pode estar vazio.");
//        assertNotNull(response.getUser(), "A resposta deveria conter os dados do utilizador.");
//        assertEquals("test.user@example.com", response.getUser().getEmail(), "O email do utilizador na resposta está incorreto.");
//        assertEquals("testuser", response.getUser().getUsername(), "O username do utilizador na resposta está incorreto.");
//        assertTrue(userRepository.findByEmail("test.user@example.com").isPresent(), "O utilizador deveria existir na base de dados.");
//    }
}