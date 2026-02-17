import express from 'express';
import { body } from 'express-validator';
import {
  createTicket,
  getTicketByNumber,
  listTickets,
  getTicketById,
  updateTicket,
  addTicketUpdate,
  getTicketUpdates,
  listTechnicians,
} from '../controllers/ticketController.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post(
  '/',
  [
    body('subject').trim().notEmpty().withMessage('Subject required'),
    body('description').trim().notEmpty().withMessage('Description required'),
    body('category').trim().notEmpty().withMessage('Category required'),
    body('customerName').trim().notEmpty().withMessage('Customer name required'),
    body('customerEmail').isEmail().withMessage('Valid email required'),
  ],
  createTicket
);

router.get('/ticket/:ticketNumber', getTicketByNumber);
router.get('/technicians', authMiddleware, requireRole(['Admin', 'Technician']), listTechnicians);

// Protected routes (Admin/Technician only)
router.get('/', authMiddleware, requireRole(['Admin', 'Technician']), listTickets);
router.get('/:id', authMiddleware, requireRole(['Admin', 'Technician']), getTicketById);
router.patch('/:id', authMiddleware, requireRole(['Admin', 'Technician']), updateTicket);
router.post(
  '/:id/updates',
  authMiddleware,
  requireRole(['Admin', 'Technician']),
  [body('message').trim().notEmpty().withMessage('Message required')],
  addTicketUpdate
);
router.get('/:id/updates', authMiddleware, requireRole(['Admin', 'Technician']), getTicketUpdates);

export default router;
