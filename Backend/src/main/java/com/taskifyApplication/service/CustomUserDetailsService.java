package com.taskifyApplication.service;

import com.taskifyApplication.exception.ResourceNotFoundException;
import com.taskifyApplication.model.User;
import com.taskifyApplication.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.core.userdetails.User.UserBuilder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {
    // region REPOSITORIES
    private final UserRepository userRepository;

    // endregion

    // region PUBLIC FUNCTION
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));

        UserBuilder builder = org.springframework.security.core.userdetails.User.builder();
        builder.username(user.getEmail());
        builder.password(user.getPassword());
        builder.authorities("ROLE_USER");

        return builder.build();
    }
    // endregion
}