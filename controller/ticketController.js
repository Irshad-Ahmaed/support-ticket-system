const Reply = require('../models/Reply');

const Ticket = require('../models/Ticket');
const { createGitHubIssue } = require('../services/github');

exports.createTicket = async (req, res) => {
  const { title, description, category } = req.body;

  if (!req.session?.user?.id) {
    req.flash('error_msg', 'You must be logged in to create a ticket');
    return res.redirect('/auth/login');
  }

  try {
    const github = await createGitHubIssue(title, description);

    await Ticket.create({
      customer: req.session.user.id,
      title,
      description,
      category,
      github_issue_url: github.html_url,
      github_issue_id: github.number,
    });

    req.flash('success_msg', 'Ticket created successfully');
    res.redirect('/');
  } catch (error) {
    console.error('Ticket creation failed:', error);
    req.flash('error_msg', 'Something went wrong while creating your ticket');
    res.redirect('/ticket/create');
  }
};

exports.getTickets = async (req, res) => {
  if (!req.session?.user?.id) {
    req.flash('error_msg', 'Login to view your tickets');
    return res.redirect('/auth/login');
  }

  try {
    const tickets = await Ticket.find({ customer: req.session.user.id }).lean();
    res.render('tickets/list', { tickets });
  } catch (error) {
    console.error('Failed to fetch tickets:', error);
    req.flash('error_msg', 'Unable to load tickets');
    res.redirect('/');
  }
};

exports.viewTicket = async (req, res) => {
  const ticketId = req.params.id;
  const userId = req.session.user?.id;

  try {
    const ticket = await Ticket.findOne({ _id: ticketId, customer: userId }).lean();
    if (!ticket) {
      req.flash('error_msg', 'Ticket not found or unauthorized');
      return res.redirect('/tickets');
    }

    const replies = await Reply.find({ ticket: ticketId })
      .populate('user', 'username')
      .sort({ created_at: 1 }) // oldest first
      .lean();

    res.render('tickets/view', { ticket, replies, session: req.session });
  } catch (error) {
    console.error('Failed to load ticket', error);
    req.flash('error_msg', 'Something went wrong');
    res.redirect('/tickets');
  }
};