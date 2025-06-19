const Ticket = require('../models/Ticket');
const User = require('../models/User');
const { closeGitHubIssue } = require('../services/github');
const mongoose = require('mongoose');

// Admin Dashboard
exports.adminDashboard = async (req, res) => {
  try {
    const tickets = await Ticket.find()
      .populate('customer assigned_agent')
      .populate('assigned_agent', 'username')
      .lean();

    const stats = {
      total: tickets.length,
      open: 0,
      resolved: 0,
      inProgress: 0,
    };

    const categories = {};

    for (const t of tickets) {
      stats[t.status?.toLowerCase().replace(' ', '')] =
        (stats[t.status?.toLowerCase().replace(' ', '')] || 0) + 1;
      categories[t.category] = (categories[t.category] || 0) + 1;
    }

    const agents = await User.find({ role: 'agent' }).lean();
    res.render('admin/dashboard', { tickets, stats, categories, agents });
  } catch (error) {
    console.error('Dashboard error:', error);
    req.flash('error_msg', 'Failed to load admin dashboard');
    res.redirect('/');
  }
};

// Assign Agent
exports.assignAgent = async (req, res) => {
  const ticketId = req.params.id;
  const { agentId } = req.body;

  if (!mongoose.isValidObjectId(ticketId) || !mongoose.isValidObjectId(agentId)) {
    req.flash('error_msg', 'Invalid ticket or agent ID');
    return res.redirect('/admin');
  }

  try {
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      req.flash('error_msg', 'Ticket not found');
      return res.redirect('/admin');
    }

    ticket.assigned_agent = agentId;
    await ticket.save();

    req.flash('success_msg', 'Agent assigned');
    res.redirect('/admin');
  } catch (error) {
    console.error('Assign agent failed:', error);
    req.flash('error_msg', 'Failed to assign agent');
    res.redirect('/admin');
  }
};

// Update Status
exports.updateStatus = async (req, res) => {
  const ticketId = req.params.id;
  const newStatus = req.body.status;

  if (!mongoose.isValidObjectId(ticketId)) {
    req.flash('error_msg', 'Invalid ticket ID');
    return res.redirect('/admin');
  }

  try {
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      req.flash('error_msg', 'Ticket not found');
      return res.redirect('/admin');
    }

    ticket.status = newStatus;
    await ticket.save();

    if (newStatus === 'Resolved') {
      await closeGitHubIssue(ticket.github_issue_id);
    }

    req.flash('success_msg', 'Status updated');
    res.redirect('/admin');
  } catch (error) {
    console.error('Status update failed:', error);
    req.flash('error_msg', 'Failed to update status');
    res.redirect('/admin');
  }
};

// Close ticket manually from admin panel
exports.closeTicket = async (req, res) => {
  const ticketId = req.params.id;

  if (!mongoose.isValidObjectId(ticketId)) {
    req.flash('error_msg', 'Invalid ticket ID');
    return res.redirect('/admin');
  }

  try {
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      req.flash('error_msg', 'Ticket not found');
      return res.redirect('/admin');
    }

    // Update ticket status
    ticket.status = 'Resolved';
    await ticket.save();

    // Close GitHub issue
    if (ticket.github_issue_id) {
      await closeGitHubIssue(ticket.github_issue_id);
    }

    req.flash('success_msg', 'Ticket and GitHub issue closed successfully');
    res.redirect('/admin');
  } catch (error) {
    console.error('Close ticket failed:', error);
    req.flash('error_msg', 'Failed to close ticket');
    res.redirect('/admin');
  }
};