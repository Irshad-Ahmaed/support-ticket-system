const Ticket = require('../models/Ticket');
const { createGitHubIssue } = require('../services/github');

exports.createTicket = async (req, res) => {
  const { title, description, category } = req.body;

  if (!req.session?.user?._id) {
    req.flash('error_msg', 'You must be logged in to create a ticket');
    return res.redirect('/login');
  }

  try {
    const github = await createGitHubIssue(title, description);

    await Ticket.create({
      customer: req.session.user._id,
      title,
      description,
      category,
      github_issue_url: github.html_url,
      github_issue_id: github.number,
    });

    req.flash('success_msg', 'Ticket created successfully');
    res.redirect('/tickets');
  } catch (error) {
    console.error('Ticket creation failed:', error);
    req.flash('error_msg', 'Something went wrong while creating your ticket');
    res.redirect('/tickets');
  }
};

exports.getTickets = async (req, res) => {
  if (!req.session?.user?._id) {
    req.flash('error_msg', 'Login to view your tickets');
    return res.redirect('/login');
  }

  try {
    const tickets = await Ticket.find({ customer: req.session.user._id }).lean();
    res.render('tickets/list', { tickets });
  } catch (error) {
    console.error('Failed to fetch tickets:', error);
    req.flash('error_msg', 'Unable to load tickets');
    res.redirect('/');
  }
};