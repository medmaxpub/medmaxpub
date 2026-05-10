package com.medmaxpub.api.security;

import com.medmaxpub.api.repository.AdminUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final AdminUserRepository adminUserRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        var adminUser = adminUserRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("Admin user not found"));

        return User.builder()
                .username(adminUser.getEmail())
                .password(adminUser.getPassword())
                .authorities(adminUser.getRoles().stream().map(SimpleGrantedAuthority::new).toList())
                .build();
    }
}

