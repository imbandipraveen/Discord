const { isEmail } = require('validator');

exports.validateEmail = (email) => {
  if (!email) {
    return 'Email is required';
  }
  if (!isEmail(email)) {
    return 'Please provide a valid email address';
  }
  return null;
};

exports.validatePassword = (password) => {
  if (!password) {
    return 'Password is required';
  }
  if (password.length < 7) {
    return 'Password must be at least 7 characters long';
  }
  if (!password.match(/\d/)) {
    return 'Password must contain at least one number';
  }
  if (!password.match(/[A-Z]/)) {
    return 'Password must contain at least one uppercase letter';
  }
  return null;
};

exports.validateUsername = (username) => {
  if (!username || username.trim().length === 0) {
    return 'Username is required';
  }
  if (username.length > 32) {
    return 'Username must be less than 32 characters';
  }
  if (!username.match(/^[a-zA-Z0-9_]+$/)) {
    return 'Username can only contain letters, numbers, and underscores';
  }
  return null;
};

exports.validateServerData = (data) => {
  const { name, type } = data;
  
  if (!name || name.trim().length === 0) {
    return 'Server name is required';
  }
  
  if (name.length > 100) {
    return 'Server name must be less than 100 characters';
  }
  
  if (!type || !['gaming', 'education', 'general'].includes(type)) {
    return 'Invalid server type';
  }
  
  return null;
};

exports.validateInviteData = (data) => {
  const { server_name, server_id, server_pic } = data;
  
  if (!server_name || !server_id) {
    return 'Server information is missing';
  }
  
  if (!server_pic) {
    return 'Server picture is required';
  }
  
  return null;
};

exports.validateChannelData = (data) => {
  const { channel_name, channel_type } = data;
  
  if (!channel_name || channel_name.trim().length === 0) {
    return 'Channel name is required';
  }
  
  if (channel_name.length > 32) {
    return 'Channel name must be less than 32 characters';
  }
  
  if (!channel_type || !['text', 'voice'].includes(channel_type)) {
    return 'Invalid channel type';
  }
  
  return null;
};

exports.validateMessageContent = (message) => {
  if (!message || message.trim().length === 0) {
    return 'Message content cannot be empty';
  }
  
  if (message.length > 2000) {
    return 'Message must be less than 2000 characters';
  }
  
  return null;
};

// Helper function to validate ObjectId
exports.isValidObjectId = (id) => {
  const objectIdPattern = /^[0-9a-fA-F]{24}$/;
  return objectIdPattern.test(id);
};

// Generic required field validator
exports.validateRequired = (field, fieldName) => {
  if (!field || (typeof field === 'string' && field.trim().length === 0)) {
    return `${fieldName} is required`;
  }
  return null;
}; 