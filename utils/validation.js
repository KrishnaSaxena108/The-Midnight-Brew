// Input validation utilities
const validator = require('validator');

// Email validation
const validateEmail = (email) => {
    if (!email || typeof email !== 'string') {
        return { isValid: false, message: 'Email is required and must be a string' };
    }
    
    if (!validator.isEmail(email)) {
        return { isValid: false, message: 'Please provide a valid email address' };
    }
    
    if (email.length > 254) {
        return { isValid: false, message: 'Email address is too long' };
    }
    
    return { isValid: true };
};

// Password validation
const validatePassword = (password) => {
    if (!password || typeof password !== 'string') {
        return { isValid: false, message: 'Password is required and must be a string' };
    }
    
    if (password.length < 8) {
        return { isValid: false, message: 'Password must be at least 8 characters long' };
    }
    
    if (password.length > 128) {
        return { isValid: false, message: 'Password is too long' };
    }
    
    // Check for at least one uppercase, lowercase, number, and special character
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
        return { 
            isValid: false, 
            message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character' 
        };
    }
    
    return { isValid: true };
};

// Name validation
const validateName = (name, fieldName = 'Name') => {
    if (!name || typeof name !== 'string') {
        return { isValid: false, message: `${fieldName} is required and must be a string` };
    }
    
    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
        return { isValid: false, message: `${fieldName} must be at least 2 characters long` };
    }
    
    if (trimmedName.length > 50) {
        return { isValid: false, message: `${fieldName} is too long (maximum 50 characters)` };
    }
    
    // Check for valid characters (letters, spaces, hyphens, apostrophes)
    if (!/^[a-zA-Z\s\-']+$/.test(trimmedName)) {
        return { isValid: false, message: `${fieldName} can only contain letters, spaces, hyphens, and apostrophes` };
    }
    
    return { isValid: true };
};

// Phone validation
const validatePhone = (phone) => {
    if (!phone) {
        return { isValid: true }; // Phone is optional
    }
    
    if (typeof phone !== 'string') {
        return { isValid: false, message: 'Phone number must be a string' };
    }
    
    // Remove all non-digit characters for validation
    const digitsOnly = phone.replace(/\D/g, '');
    
    if (digitsOnly.length < 10 || digitsOnly.length > 15) {
        return { isValid: false, message: 'Phone number must be between 10 and 15 digits' };
    }
    
    return { isValid: true };
};

// Sanitize input
const sanitizeInput = (input) => {
    if (typeof input !== 'string') return input;
    
    return input.trim().replace(/[<>]/g, '');
};

// Validation middleware factory
const createValidationMiddleware = (validationRules) => {
    return (req, res, next) => {
        const errors = [];
        
        for (const [field, rules] of Object.entries(validationRules)) {
            const value = req.body[field];
            
            for (const rule of rules) {
                const result = rule(value, field);
                if (!result.isValid) {
                    errors.push({ field, message: result.message });
                    break; // Stop checking this field after first error
                }
            }
        }
        
        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors
            });
        }
        
        // Sanitize inputs
        for (const field of Object.keys(validationRules)) {
            if (req.body[field]) {
                req.body[field] = sanitizeInput(req.body[field]);
            }
        }
        
        next();
    };
};

module.exports = {
    validateEmail,
    validatePassword,
    validateName,
    validatePhone,
    sanitizeInput,
    createValidationMiddleware
};
