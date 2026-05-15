import * as yup from 'yup';

export const registerSchema = yup.object({
  fullName: yup.string()
    .trim()
    .min(2, 'Name too short')
    .matches(/^[A-Za-z\s.'-]+$/, 'Name cannot contain numbers or invalid characters')
    .required('Full name is required'),
  email: yup.string()
    .trim()
    .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Enter a valid email with "@"')
    .required('Email is required'),
  password: yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/^(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/, 'Password must contain at least one special character')
    .required('Password is required'),
  confirm: yup.string()
    .oneOf([yup.ref('password')], 'Passwords do not match')
    .required('Please confirm password'),
});
