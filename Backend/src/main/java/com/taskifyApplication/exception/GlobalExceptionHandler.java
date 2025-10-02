package com.taskifyApplication.exception;

import com.taskifyApplication.dto.ErrorResponseDTO;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;

import java.time.LocalDateTime;
import java.util.stream.Collectors;

@ControllerAdvice
public class GlobalExceptionHandler {

    private ErrorResponseDTO createErrorResponse(HttpStatus status, String message, WebRequest request) {
        return new ErrorResponseDTO(
                LocalDateTime.now(),
                status.value(),
                status.getReasonPhrase(), // Ex: "Not Found", "Bad Request"
                message,
                request.getDescription(false).replace("uri=", "") // Limpa o path
        );
    }

    @ExceptionHandler(TooManyRequestsException.class)
    public ResponseEntity<ErrorResponseDTO> handleTooManyRequestsException(TooManyRequestsException ex, WebRequest request) {
        ErrorResponseDTO errorResponse = createErrorResponse(HttpStatus.TOO_MANY_REQUESTS, ex.getMessage(), request);
        return new ResponseEntity<>(errorResponse, HttpStatus.TOO_MANY_REQUESTS);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponseDTO> handleResourceNotFoundException(ResourceNotFoundException ex, WebRequest request) {
        ErrorResponseDTO errorResponse = createErrorResponse(HttpStatus.NOT_FOUND, ex.getMessage(), request);
        return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ErrorResponseDTO> handleBadRequestException(BadRequestException ex, WebRequest request) {
        ErrorResponseDTO errorResponse = createErrorResponse(HttpStatus.BAD_REQUEST, ex.getMessage(), request);
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(ForbiddenException.class)
    public ResponseEntity<ErrorResponseDTO> handleForbiddenException(ForbiddenException ex, WebRequest request) {
        ErrorResponseDTO errorResponse = createErrorResponse(HttpStatus.FORBIDDEN, ex.getMessage(), request);
        return new ResponseEntity<>(errorResponse, HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponseDTO> handleAccessDeniedException(AccessDeniedException ex, WebRequest request) {
        ErrorResponseDTO errorResponse = createErrorResponse(HttpStatus.FORBIDDEN, "You do not have permission to access this resource.", request);
        return new ResponseEntity<>(errorResponse, HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<ErrorResponseDTO> handleDuplicateResourceException(DuplicateResourceException ex, WebRequest request) {
        ErrorResponseDTO errorResponse = createErrorResponse(HttpStatus.CONFLICT, ex.getMessage(), request);
        return new ResponseEntity<>(errorResponse, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(InvalidFormatException.class)
    public ResponseEntity<ErrorResponseDTO> handleInvalidResourceException(InvalidFormatException ex, WebRequest request) {
        ErrorResponseDTO errorResponse = createErrorResponse(HttpStatus.NOT_ACCEPTABLE, ex.getMessage(), request);
        return new ResponseEntity<>(errorResponse, HttpStatus.NOT_ACCEPTABLE);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponseDTO> handleValidationException(MethodArgumentNotValidException ex, WebRequest request) {
        String errorMessage = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .collect(Collectors.joining(", "));

        ErrorResponseDTO errorResponse = createErrorResponse(HttpStatus.BAD_REQUEST, errorMessage, request);
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponseDTO> handleGlobalException(Exception ex, WebRequest request) {
        ErrorResponseDTO errorResponse = createErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected internal server error occurred.", request);
        ex.printStackTrace();
        return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}