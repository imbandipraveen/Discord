/**
 * Creates a test user with unique email and username
 * @param {Object} baseUser - Base user data to extend
 * @returns {Object} User data with unique email and username
 */
export const createUniqueTestUser = (baseUser) => {
  const timestamp = new Date().getTime();
  return {
    ...baseUser,
    email: `test_${timestamp}@example.com`,
    username: `user_${timestamp}`,
  };
};
