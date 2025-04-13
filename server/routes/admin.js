const express = require('express');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all pending owners
// @route   GET /api/admin/pending-owners
// @access  Private/Admin
router.get('/pending-owners', protect, authorize('admin'), async (req, res) => {
  try {
    const pendingOwners = await User.find({
      role: 'owner',
      isApproved: false
    });

    res.status(200).json({
      success: true,
      count: pendingOwners.length,
      data: pendingOwners
    });
  } catch (err) {
    console.error('Error getting pending owners:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Approve an owner
// @route   PATCH /api/admin/approve-owner/:userId
// @access  Private/Admin
router.patch('/approve-owner/:userId', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role !== 'owner') {
      return res.status(400).json({
        success: false,
        message: 'User is not an owner'
      });
    }

    if (user.isApproved) {
      return res.status(400).json({
        success: false,
        message: 'Owner is already approved'
      });
    }

    user.isApproved = true;
    await user.save();

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    console.error('Error approving owner:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router; 