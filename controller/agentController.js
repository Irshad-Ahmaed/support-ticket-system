const Ticket = require('../models/Ticket');
const Reply = require('../models/Reply');
const { closeGitHubIssue } = require('../services/github');
const mongoose = require('mongoose');

exports.getAssignedTickets = async (req, res) => {
  const agentId = req.session?.user?.id;

  if (!mongoose.isValidObjectId(agentId)) {
    req.flash('error_msg', 'Invalid agent ID');
    return res.redirect('/auth/login');
  }

  try {
    const tickets = await Ticket.find({ assigned_agent: agentId }).lean();
    res.render('agent/list', { tickets });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    req.flash('error_msg', 'Failed to load assigned tickets');
    res.redirect('/');
  }
};

exports.viewTicket = async (req, res) => {
  const ticketId = req.params.id;

  if (!mongoose.isValidObjectId(ticketId)) {
    req.flash('error_msg', 'Invalid ticket ID');
    return res.redirect('/agent/tickets');
  }

  try {
    const ticket = await Ticket.findById(ticketId).populate('customer').lean();
    if (!ticket) {
      req.flash('error_msg', 'Ticket not found');
      return res.redirect('/agent/tickets');
    }

    const replies = await Reply.find({ ticket: ticketId }).populate('user').lean();
    res.render('agent/view', { ticket, replies });
  } catch (error) {
    console.error('Error loading ticket:', error);
    req.flash('error_msg', 'Could not load ticket details');
    res.redirect('/agent/tickets');
  }
};

exports.postReply = async (req, res) => {
  const ticketId = req.params.id;
  const userId = req.session?.user?.id;

  if (!mongoose.isValidObjectId(ticketId) || !mongoose.isValidObjectId(userId)) {
    req.flash('error_msg', 'Invalid data');
    return res.redirect('/agent/tickets');
  }

  try {
    await Reply.create({
      ticket: ticketId,
      user: userId,
      message: req.body.message,
    });
    req.flash('success_msg', 'Reply posted');
    res.redirect(`/agent/tickets/${ticketId}`);
  } catch (error) {
    console.error('Error posting reply:', error);
    req.flash('error_msg', 'Failed to post reply');
    res.redirect(`/agent/tickets/${ticketId}`);
  }
};

exports.updateStatus = async (req, res) => {
  const ticketId = req.params.id;

  if (!mongoose.isValidObjectId(ticketId)) {
    req.flash('error_msg', 'Invalid ticket ID');
    return res.redirect('/agent/tickets');
  }

  try {
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      req.flash('error_msg', 'Ticket not found');
      return res.redirect('/agent/tickets');
    }

    ticket.status = req.body.status;
    await ticket.save();

    if (req.body.status === 'Resolved') {
      await closeGitHubIssue(ticket.github_issue_id);
    }

    req.flash('success_msg', 'Status updated');
    res.redirect(`/agent/tickets/${ticketId}`);
  } catch (error) {
    console.error('Error updating status:', error);
    req.flash('error_msg', 'Could not update ticket status');
    res.redirect('/agent/tickets');
  }
};