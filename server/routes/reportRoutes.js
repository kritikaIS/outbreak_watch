import express from 'express';
import { body, validationResult } from 'express-validator';
import Report from '../models/Report.js';
import Patient from '../models/Patient.js';
import Clinic from '../models/Clinic.js';
import Doctor from '../models/Doctor.js';
import Symptom from '../models/Symptom.js';
import { authenticateToken } from '../middleware/auth.js';
import jwt from 'jsonwebtoken';
import PublicReport from '../models/PublicReport.js';

const router = express.Router();

// Get all reports with search and filter
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      patient_id, 
      clinic_id, 
      doctor_id,
      start_date,
      end_date 
    } = req.query;
    
    const query = {};

    // Build search query
    if (search) {
      query.$or = [
        { report_id: { $regex: search, $options: 'i' } }
      ];
    }

    if (patient_id) query.patient_id = patient_id;
    if (clinic_id) query.clinic_id = clinic_id;
    if (doctor_id) query.doctor_id = doctor_id;

    // Date range filter
    if (start_date || end_date) {
      query.report_date = {};
      if (start_date) query.report_date.$gte = new Date(start_date);
      if (end_date) query.report_date.$lte = new Date(end_date);
    }

    const reports = await Report.find(query)
      .populate('patient_id', 'name dob gender')
      .populate('clinic_id', 'name address region')
      .populate('doctor_id', 'name specialty')
      .populate('symptoms.symptom_id', 'name severity')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ report_date: -1 });

    const total = await Report.countDocuments(query);

    res.json({
      status: 'success',
      data: {
        reports,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch reports'
    });
  }
});

// Get single report
router.get('/:id', async (req, res) => {
  try {
    const report = await Report.findOne({ report_id: req.params.id })
      .populate('patient_id', 'name dob gender address phone')
      .populate('clinic_id', 'name address region type')
      .populate('doctor_id', 'name specialty')
      .populate('symptoms.symptom_id', 'name severity description');
    
    if (!report) {
      return res.status(404).json({
        status: 'error',
        message: 'Report not found'
      });
    }

    res.json({
      status: 'success',
      data: { report }
    });
  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch report'
    });
  }
});

// Create report
router.post('/', authenticateToken, [
  body('report_id').notEmpty().withMessage('Report ID is required'),
  body('patient_id').notEmpty().withMessage('Patient ID is required'),
  body('clinic_id').notEmpty().withMessage('Clinic ID is required'),
  body('doctor_id').notEmpty().withMessage('Doctor ID is required'),
  body('symptoms').isArray().withMessage('Symptoms must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { report_id, patient_id, clinic_id, doctor_id, symptoms, report_date } = req.body;

    // Validate that all referenced entities exist
    const [patient, clinic, doctor] = await Promise.all([
      Patient.findOne({ patient_id }),
      Clinic.findOne({ clinic_id }),
      Doctor.findOne({ doctor_id })
    ]);

    if (!patient) {
      return res.status(400).json({
        status: 'error',
        message: 'Patient not found'
      });
    }

    if (!clinic) {
      return res.status(400).json({
        status: 'error',
        message: 'Clinic not found'
      });
    }

    if (!doctor) {
      return res.status(400).json({
        status: 'error',
        message: 'Doctor not found'
      });
    }

    // Validate symptoms
    if (symptoms && symptoms.length > 0) {
      const symptomIds = symptoms.map(s => s.symptom_id);
      const existingSymptoms = await Symptom.find({ symptom_id: { $in: symptomIds } });
      
      if (existingSymptoms.length !== symptomIds.length) {
        return res.status(400).json({
          status: 'error',
          message: 'One or more symptoms not found'
        });
      }
    }

    const report = new Report({
      report_id,
      patient_id,
      clinic_id,
      doctor_id,
      symptoms: symptoms || [],
      report_date: report_date || new Date()
    });

    await report.save();

    const populatedReport = await Report.findOne({ report_id })
      .populate('patient_id', 'name dob gender')
      .populate('clinic_id', 'name address region')
      .populate('doctor_id', 'name specialty')
      .populate('symptoms.symptom_id', 'name severity');

    res.status(201).json({
      status: 'success',
      message: 'Report created successfully',
      data: { report: populatedReport }
    });
  } catch (error) {
    console.error('Create report error:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        status: 'error',
        message: 'Report ID already exists'
      });
    }
    res.status(500).json({
      status: 'error',
      message: 'Failed to create report'
    });
  }
});

// Update report
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const report = await Report.findOneAndUpdate(
      { report_id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    )
    .populate('patient_id', 'name dob gender')
    .populate('clinic_id', 'name address region')
    .populate('doctor_id', 'name specialty')
    .populate('symptoms.symptom_id', 'name severity');

    if (!report) {
      return res.status(404).json({
        status: 'error',
        message: 'Report not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Report updated successfully',
      data: { report }
    });
  } catch (error) {
    console.error('Update report error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update report'
    });
  }
});

// Delete report
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const report = await Report.findOneAndDelete({ report_id: req.params.id });

    if (!report) {
      return res.status(404).json({
        status: 'error',
        message: 'Report not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Report deleted successfully'
    });
  } catch (error) {
    console.error('Delete report error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete report'
    });
  }
});

// Public anonymous report submission (no auth)
router.post('/public', [
  body('report_id').notEmpty().withMessage('Report ID is required'),
  body('symptoms_text').notEmpty().withMessage('Symptoms are required'),
  body('state').notEmpty().withMessage('State is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { report_id, symptoms_text, state, symptom_type, severity, patient_age, additional_notes, public_user_token } = req.body;

    const existing = await PublicReport.findOne({ report_id });
    if (existing) {
      return res.status(400).json({ status: 'error', message: 'Report ID already exists' });
    }

    let public_user_id;
    try {
      if (public_user_token) {
        const decoded = jwt.verify(public_user_token, process.env.JWT_SECRET);
        public_user_id = decoded?.public_id;
      }
    } catch {}

    const report = new PublicReport({
      report_id,
      symptoms_text,
      state,
      symptom_type,
      severity,
      patient_age,
      additional_notes,
      public_user_id
    });
    await report.save();

    return res.status(201).json({
      status: 'success',
      message: 'Public report submitted',
      data: { report }
    });
  } catch (error) {
    console.error('Public report error:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to submit public report' });
  }
});

// Public: get my submissions (requires public JWT in Authorization header)
router.get('/public/mine', async (req, res) => {
  try {
    const auth = req.headers['authorization'];
    const token = auth && auth.split(' ')[1];
    if (!token) return res.status(401).json({ status: 'error', message: 'Token required' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const publicId = decoded?.public_id;
    if (!publicId) return res.status(401).json({ status: 'error', message: 'Invalid token' });
    const reports = await PublicReport.find({ public_user_id: publicId }).sort({ submitted_at: -1 });
    return res.json({ status: 'success', data: { reports } });
  } catch (error) {
    console.error('Public reports mine error:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to fetch public reports' });
  }
});

export default router;
