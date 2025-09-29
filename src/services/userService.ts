/* eslint-disable @typescript-eslint/no-explicit-any */
import api from './api';

export interface UserProfileUpdateData {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface PasswordUpdateData {
  currentPassword: string;
  newPassword: string;
}

export const userService = {
  // Update user profile information
  async updateProfile(profileData: UserProfileUpdateData): Promise<{ message: string; user: any }> {
    const response = await api.put('/user/profile', profileData);
    return response.data;
  },

  // Update user password
  async updatePassword(passwordData: PasswordUpdateData): Promise<{ message: string }> {
    const response = await api.put('/user/profile/password', passwordData);
    return response.data;
  }
};

export default userService;
