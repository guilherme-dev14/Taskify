package com.taskifyApplication.service;

import com.taskifyApplication.dto.UserDto.AuthResponseDTO;
import com.taskifyApplication.dto.UserDto.CreateUserRequestDTO;
import com.taskifyApplication.dto.UserDto.LoginRequestDTO;
import com.taskifyApplication.dto.UserDto.UserDTO;
import com.taskifyApplication.exception.DuplicateResourceException;
import com.taskifyApplication.exception.InvalidFormatException;
import com.taskifyApplication.model.User;
import com.taskifyApplication.repository.UserRepository;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import static com.taskifyApplication.service.UserService.getUserDTO;

@Service
@RequiredArgsConstructor
public class AuthService {

    // region REPOSITORIES
    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    private final JwtService jwtService;

    private final AuthenticationManager authenticationManager;

    private final CustomUserDetailsService userDetailsService;

    private final ValidationService validationService;

    private final EmailService emailService;

    @Value("${spring.mail.from}")
    private String mailFrom;
    // endregion

    // region PUBLIC FUNCTIONS
    public AuthResponseDTO register(CreateUserRequestDTO request, HttpServletResponse response) {
        if (!validationService.isValidEmail(request.getEmail())) {
            throw new InvalidFormatException("Invalid email format");
        }

        if (!validationService.isValidUsername(request.getUsername())) {
            throw new InvalidFormatException("Invalid username format");
        }

        if (!validationService.isValidPassword(request.getPassword())) {
            throw new InvalidFormatException("Password must be at least 8 characters with uppercase, lowercase, and digit");
        }

        request.setEmail(validationService.sanitizeString(request.getEmail()));
        request.setUsername(validationService.sanitizeString(request.getUsername()));
        request.setFirstName(validationService.sanitizeString(request.getFirstName()));
        request.setLastName(validationService.sanitizeString(request.getLastName()));

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email address " + request.getEmail() + " is already in use.");
        }

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new DuplicateResourceException("Username " + request.getUsername() + " is already in use.");
        }

        User user = User.builder()
                .email(request.getEmail())
                .username(request.getUsername())
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .password(passwordEncoder.encode(request.getPassword()))
                .build();

        user = userRepository.save(user);
        emailService.sendWelcomeEmail(user.getEmail(), user.getFirstName());

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtService.generateToken(userDetails);

        ResponseCookie cookie = ResponseCookie.from("jwt-token", token)
                .httpOnly(true)
                .secure(false) // Mude para 'true' em produção (HTTPS)
                .path("/")
                .maxAge(24 * 60 * 60)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        return AuthResponseDTO.builder()

                .user(convertToProfileDTO(user))
                .build();
    }

    public AuthResponseDTO login(LoginRequestDTO request, HttpServletResponse response) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new InvalidFormatException("Invalid credentials"));

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtService.generateToken(userDetails);

        ResponseCookie cookie = ResponseCookie.from("jwt-token", token)
                .httpOnly(true)
                .secure(false) // Mude para 'true' em produção (HTTPS)
                .path("/")
                .maxAge(24 * 60 * 60) // 1 dia
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        return AuthResponseDTO.builder()
                .token(token)
                .user(convertToProfileDTO(user))
                .build();
    }

    public void logout(HttpServletResponse response) {

        ResponseCookie cookie = ResponseCookie.from("jwt-token", "")
                .httpOnly(true)
                .secure(false) // Mude para 'true' em produção (HTTPS)
                .path("/")
                .maxAge(0)
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    // endregion

    // region PRIVATE FUNCTIONS
    private UserDTO convertToProfileDTO(User user) {
        return getUserDTO(user);
    }
    // endregion
}
