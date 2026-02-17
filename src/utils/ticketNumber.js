export const generateTicketNumber = async (prisma) => {
  const year = new Date().getFullYear();

  // Count tickets created this year
  const count = await prisma.ticket.count({
    where: {
      createdAt: {
        gte: new Date(`${year}-01-01`),
        lt: new Date(`${year + 1}-01-01`),
      },
    },
  });

  // Generate ticket number: TKT-YYYY-XXXX (4 digits, zero-padded)
  const number = String(count + 1).padStart(4, '0');
  return `TKT-${year}-${number}`;
};
