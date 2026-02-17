import prisma from '../config/database.js';
import { generateTicketNumber } from '../utils/ticketNumber.js';

// Public: Create a new ticket
export const createTicket = async (req, res) => {
  try {
    const { subject, description, category, priority, customerName, customerEmail } = req.body;

    // Generate ticket number
    const ticketNumber = await generateTicketNumber(prisma);

    const ticket = await prisma.ticket.create({
      data: {
        ticketNumber,
        subject,
        description,
        category,
        priority: priority || 'Medium',
        customerName,
        customerEmail,
        status: 'Open',
      },
    });

    res.status(201).json(ticket);
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Public: Get ticket by ticket number
export const getTicketByNumber = async (req, res) => {
  try {
    const { ticketNumber } = req.params;

    const ticket = await prisma.ticket.findUnique({
      where: { ticketNumber },
      include: {
        updates: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    res.json(ticket);
  } catch (error) {
    console.error('Get ticket error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Admin/Technician: List all tickets with pagination and filters
export const listTickets = async (req, res) => {
  try {
    const { status, priority, category, page = 1, limit = 20 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const where = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (category) where.category = category;

    const [tickets, total] = await Promise.all([
      prisma.ticket.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.ticket.count({ where }),
    ]);

    res.json({
      tickets,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('List tickets error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Admin/Technician: Get ticket by ID
export const getTicketById = async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: {
        updates: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    res.json(ticket);
  } catch (error) {
    console.error('Get ticket error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Admin/Technician: Update ticket
export const updateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, priority, assignedTo } = req.body;

    const ticket = await prisma.ticket.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(priority && { priority }),
        ...(assignedTo !== undefined && { assignedTo: assignedTo || null }),
      },
    });

    res.json(ticket);
  } catch (error) {
    console.error('Update ticket error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Admin/Technician: Add update to ticket
export const addTicketUpdate = async (req, res) => {
  try {
    const { id } = req.params;
    const { message, status } = req.body;
    const userId = req.user.id;

    const update = await prisma.ticketUpdate.create({
      data: {
        ticketId: id,
        message,
        status,
        createdBy: userId,
      },
    });

    // If status is provided, also update the ticket status
    if (status) {
      await prisma.ticket.update({
        where: { id },
        data: { status },
      });
    }

    res.status(201).json(update);
  } catch (error) {
    console.error('Add ticket update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Admin/Technician: Get ticket updates
export const getTicketUpdates = async (req, res) => {
  try {
    const { id } = req.params;

    const updates = await prisma.ticketUpdate.findMany({
      where: { ticketId: id },
      orderBy: { createdAt: 'desc' },
    });

    res.json(updates);
  } catch (error) {
    console.error('Get ticket updates error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Admin/Technician: List technicians
export const listTechnicians = async (req, res) => {
  try {
    const technicians = await prisma.user.findMany({
      where: { role: 'Technician' },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    res.json(technicians);
  } catch (error) {
    console.error('List technicians error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
