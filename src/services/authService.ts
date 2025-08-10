import { User, TwitterProfile } from '../types/auth.js';
import { usersRepository } from '../repositories/usersRepository.js';

class AuthService {
  async createOrUpdateUser(profile: TwitterProfile): Promise<User> {
    const existingUser = await usersRepository.findByTwitterId(profile.id);
    
    if (existingUser) {
      // Update existing user
      const updatedUser = {
        ...existingUser,
        username: profile.username,
        displayName: profile.displayName,
        profileImage: profile.photos?.[0]?.value,
        updatedAt: new Date().toISOString(),
      };
      
      await usersRepository.update(existingUser.id, updatedUser);
      return updatedUser;
    }
    
    // Create new user
    const newUser: User = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      twitterId: profile.id,
      username: profile.username,
      displayName: profile.displayName,
      profileImage: profile.photos?.[0]?.value,
      pro: false,
      tokenGatePassed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    await usersRepository.create(newUser);
    return newUser;
  }

  async createOrUpdateMockUser(): Promise<User> {
    const mockProfile: TwitterProfile = {
      id: 'mock_twitter_id',
      username: 'testuser',
      displayName: 'Test User',
      photos: [{ value: 'https://via.placeholder.com/150' }],
    };
    
    return this.createOrUpdateUser(mockProfile);
  }

  async findUserById(id: string): Promise<User | null> {
    return usersRepository.findById(id);
  }
}

export const authService = new AuthService();