package com.taskifyApplication.dto.UserDto;


import com.taskifyApplication.model.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserSummaryDTO {
    private Long id;
    private String username;
    private String firstName;
    private String lastName;
    private String email;
    private String profilePictureUrl;

    public String getFullName() {
        return firstName + " " + lastName;
    }

    public UserSummaryDTO(User user) {
        this.id = user.getId();
        this.username = user.getUsername();
        this.firstName = user.getFirstName();
        this.lastName = user.getLastName();
        this.email = user.getEmail();
        this.profilePictureUrl = user.getProfilePictureUrl();

    }
}
