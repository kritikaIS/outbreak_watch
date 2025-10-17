import jwt from 'jsonwebtoken';
import Doctor from '../models/Doctor.js';

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Access token required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const doctor = await Doctor.findOne({ doctor_id: decoded.doctor_id }).select('-password');
    
    if (!doctor) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid token'
      });
    }

    req.user = doctor;
    next();
  } catch (error) {
    return res.status(403).json({
      status: 'error',
      message: 'Invalid or expired token'
    });
  }
};
