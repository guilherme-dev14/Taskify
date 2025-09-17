package com.taskifyApplication.service;

import com.taskifyApplication.exception.ResourceNotFoundException;
import com.taskifyApplication.model.User;
import com.taskifyApplication.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.core.userdetails.User.UserBuilder;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {
    // region REPOSITORIES
    @Autowired
    private UserRepository userRepository;
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