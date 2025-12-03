package com.finance.tracker.security;

import com.finance.tracker.entity.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

/**
 * Custom UserDetails implementation
 * Adapts User entity to Spring Security's UserDetails interface
 * Follows Adapter Pattern
 */
@Data
@AllArgsConstructor
public class CustomUserDetails implements UserDetails {

    private Long id;
    private String name;
    private String email;
    private String password;
    private boolean enabled;
    private Long partnerId;

    /**
     * Create CustomUserDetails from User entity
     */
    public static CustomUserDetails build(User user) {
        return new CustomUserDetails(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPassword(),
                user.getEnabled(),
                user.getPartnerId()
        );
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // For now, all users have ROLE_USER
        // Can be extended later for admin roles
        return List.of(new SimpleGrantedAuthority("ROLE_USER"));
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return email; // Using email as username
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return enabled;
    }
}