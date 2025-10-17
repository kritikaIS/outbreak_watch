import express from 'express';
import { body, validationResult } from 'express-validator';
import Outbreak from '../models/Outbreak.js';
import Symptom from '../models/Symptom.js';
import Report from '../models/Report.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all outbreaks with search and filter
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      status, 
      region,
      start_date,
      end_date 
    } = req.query;
    
    const query = {};

    // Build search query
    if (search) {
      query.$or = [
        { outbreak_id: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (status) query.status = status;
    if (region) query.region = region;

    // Date range filter
    if (start_date || end_date) {
      query.start_date = {};
      if (start_date) query.start_date.$gte = new Date(start_date);
      if (end_date) query.start_date.$lte = new Date(end_date);
    }

    const outbreaks = await Outbreak.find(query)
      // .populate('symptoms.symptom_id', 'name severity')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ start_date: -1 });

    const total = await Outbreak.countDocuments(query);

    res.json({
      status: 'success',
      data: {
        outbreaks,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get outbreaks error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch outbreaks'
    });
  }
});

// Get single outbreak
router.get('/:id', async (req, res) => {
  try {
    const outbreak = await Outbreak.findOne({ outbreak_id: req.params.id });
    
    if (!outbreak) {
      return res.status(404).json({
        status: 'error',
        message: 'Outbreak not found'
      });
    }

    res.json({
      status: 'success',
      data: { outbreak }
    });
  } catch (error) {
    console.error('Get outbreak error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch outbreak'
    });
  }
});

// Create outbreak
router.post('/', authenticateToken, [
  body('outbreak_id').notEmpty().withMessage('Outbreak ID is required'),
  body('start_date').isISO8601().withMessage('Valid start date is required'),
  body('region').notEmpty().withMessage('Region is required'),
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

    const { outbreak_id, start_date, end_date, status, description, region, symptoms } = req.body;

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

    const outbreak = new Outbreak({
      outbreak_id,
      start_date,
      end_date,
      status: status || 'Investigation',
      description,
      region,
      symptoms: symptoms || []
    });

    await outbreak.save();
    await outbreak.checkThresholds();

    const populatedOutbreak = await Outbreak.findOne({ outbreak_id });

    res.status(201).json({
      status: 'success',
      message: 'Outbreak created successfully',
      data: { outbreak: populatedOutbreak }
    });
  } catch (error) {
    console.error('Create outbreak error:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        status: 'error',
        message: 'Outbreak ID already exists'
      });
    }
    res.status(500).json({
      status: 'error',
      message: 'Failed to create outbreak'
    });
  }
});

// Update outbreak
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const outbreak = await Outbreak.findOneAndUpdate(
      { outbreak_id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    )
    .populate('symptoms.symptom_id', 'name severity');

    if (!outbreak) {
      return res.status(404).json({
        status: 'error',
        message: 'Outbreak not found'
      });
    }

    // Check thresholds after update
    await outbreak.checkThresholds();
    await outbreak.save();

    res.json({
      status: 'success',
      message: 'Outbreak updated successfully',
      data: { outbreak }
    });
  } catch (error) {
    console.error('Update outbreak error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update outbreak'
    });
  }
});

// Delete outbreak
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const outbreak = await Outbreak.findOneAndDelete({ outbreak_id: req.params.id });

    if (!outbreak) {
      return res.status(404).json({
        status: 'error',
        message: 'Outbreak not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Outbreak deleted successfully'
    });
  } catch (error) {
    console.error('Delete outbreak error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete outbreak'
    });
  }
});

// Analyze outbreak data and update case counts
router.post('/:id/analyze', authenticateToken, async (req, res) => {
  try {
    const outbreak = await Outbreak.findOne({ outbreak_id: req.params.id })
      .populate('symptoms.symptom_id', 'name severity');

    if (!outbreak) {
      return res.status(404).json({
        status: 'error',
        message: 'Outbreak not found'
      });
    }

    // Get reports within outbreak date range and region
    const reportQuery = {
      report_date: {
        $gte: outbreak.start_date,
        $lte: outbreak.end_date || new Date()
      }
    };

    // If region is specified, filter by clinic region
    if (outbreak.region) {
      const reports = await Report.find(reportQuery)
        .populate('clinic_id', 'region')
        .populate('symptoms.symptom_id', 'symptom_id');
      
      const regionReports = reports.filter(report => 
        report.clinic_id && report.clinic_id.region === outbreak.region
      );

      // Count symptoms
      const symptomCounts = {};
      outbreak.symptoms.forEach(outbreakSymptom => {
        const symptomId = outbreakSymptom.symptom_id;
        const count = regionReports.reduce((acc, report) => {
          const matchingSymptoms = report.symptoms.filter(
            reportSymptom => reportSymptom.symptom_id === symptomId
          );
          return acc + matchingSymptoms.length;
        }, 0);
        symptomCounts[symptomId] = count;
      });

      // Update outbreak with new counts
      outbreak.symptoms.forEach(outbreakSymptom => {
        outbreakSymptom.cases_count = symptomCounts[outbreakSymptom.symptom_id] || 0;
      });
    }

    await outbreak.checkThresholds();
    await outbreak.save();

    res.json({
      status: 'success',
      message: 'Outbreak analysis completed',
      data: { outbreak }
    });
  } catch (error) {
    console.error('Analyze outbreak error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to analyze outbreak'
    });
  }
});

// Get outbreak statistics
router.get('/:id/stats', async (req, res) => {
  try {
    const outbreak = await Outbreak.findOne({ outbreak_id: req.params.id })
      .populate('symptoms.symptom_id', 'name severity');

    if (!outbreak) {
      return res.status(404).json({
        status: 'error',
        message: 'Outbreak not found'
      });
    }

    const stats = {
      total_symptoms: outbreak.symptoms.length,
      symptoms_exceeding_threshold: outbreak.symptoms.filter(s => s.is_threshold_exceeded).length,
      total_cases: outbreak.symptoms.reduce((sum, s) => sum + s.cases_count, 0),
      symptoms: outbreak.symptoms.map(s => ({
        name: s.symptom_id.name,
        severity: s.symptom_id.severity,
        cases_count: s.cases_count,
        threshold: s.threshold,
        is_exceeded: s.is_threshold_exceeded
      }))
    };

    res.json({
      status: 'success',
      data: { stats }
    });
  } catch (error) {
    console.error('Get outbreak stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch outbreak statistics'
    });
  }
});

export default router;
