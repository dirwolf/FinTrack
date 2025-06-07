const invoiceService = require('../services/invoiceService');
const { createInvoicePdf, loadLogo } = require('../utils/pdfUtils');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');
const { getMonthNameFromNumber } = require('../utils/dateUtils');

const invoiceController = {
  async getAllInvoices(req, res) {
    try {
      const invoices = await invoiceService.getAllInvoices();
      res.json(invoices);
    } catch (error) {
      logger.error('Error fetching all invoices:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async getInvoiceById(req, res) {
    try {
      const invoice = await invoiceService.getInvoiceById(req.params.invoiceId);
      res.json(invoice);
    } catch (error) {
      if (error.message === 'Invoice not found') {
        res.status(404).json({ error: error.message });
      } else {
        logger.error('Error fetching invoice:', error);
        res.status(500).json({ error: error.message });
      }
    }
  },

  async createInvoice(req, res) {
    try {
      const invoice = await invoiceService.createInvoice(req.body);
      res.status(201).json(invoice);
    } catch (error) {
      logger.error('Error creating invoice:', error);
      res.status(400).json({ error: error.message });
    }
  },

  async updateInvoice(req, res) {
    try {
      const invoice = await invoiceService.updateInvoice(req.params.id, req.body);
      res.json(invoice);
    } catch (error) {
      if (error.message === 'Invoice not found') {
        res.status(404).json({ error: error.message });
      } else {
        logger.error('Error updating invoice:', error);
        res.status(400).json({ error: error.message });
      }
    }
  },

  async deleteInvoice(req, res) {
    try {
      const result = await invoiceService.deleteInvoice(req.params.invoiceId);
      res.json(result);
    } catch (error) {
      if (error.message === 'Invoice not found') {
        res.status(404).json({ error: error.message });
      } else {
        logger.error('Error deleting invoice:', error);
        res.status(500).json({ error: error.message });
      }
    }
  },

  async searchInvoices(req, res) {
    try {
      const invoices = await invoiceService.searchInvoices(req.query.q);
      res.json(invoices);
    } catch (error) {
      logger.error('Error searching invoices:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async getClientInvoices(req, res) {
    try {
      const invoices = await invoiceService.getClientInvoices(req.params.clientId);
      res.json(invoices);
    } catch (error) {
      logger.error('Error fetching client invoices:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async getEmployeeInvoices(req, res) {
    try {
      const invoices = await invoiceService.getEmployeeInvoices(req.params.employeeId);
      res.json(invoices);
    } catch (error) {
      logger.error('Error fetching employee invoices:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async getInvoicesByDateRange(req, res) {
    try {
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        return res.status(400).json({ error: 'Start date and end date are required' });
      }
      const invoices = await invoiceService.getInvoicesByDateRange(startDate, endDate);
      res.json(invoices);
    } catch (error) {
      logger.error('Error fetching invoices by date range:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async getInvoicesByStatus(req, res) {
    try {
      const { status } = req.params;
      const invoices = await invoiceService.getInvoicesByStatus(status);
      res.json(invoices);
    } catch (error) {
      logger.error('Error fetching invoices by status:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async getInvoicesByCurrency(req, res) {
    try {
      const { currencyId } = req.params;
      const invoices = await invoiceService.getInvoicesByCurrency(currencyId);
      res.json(invoices);
    } catch (error) {
      logger.error('Error fetching invoices by currency:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async getInvoicesSummary(req, res) {
    try {
      const summary = await invoiceService.getInvoicesSummary();
      res.json(summary);
    } catch (error) {
      logger.error('Error fetching invoices summary:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async markInvoiceAsPaid(req, res) {
    try {
      const invoice = await invoiceService.markInvoiceAsPaid(req.params.id);
      res.json(invoice);
    } catch (error) {
      if (error.message === 'Invoice not found') {
        res.status(404).json({ error: error.message });
      } else {
        logger.error('Error marking invoice as paid:', error);
        res.status(500).json({ error: error.message });
      }
    }
  },

  async markInvoiceAsOverdue(req, res) {
    try {
      const invoice = await invoiceService.markInvoiceAsOverdue(req.params.id);
      res.json(invoice);
    } catch (error) {
      if (error.message === 'Invoice not found') {
        res.status(404).json({ error: error.message });
      } else {
        logger.error('Error marking invoice as overdue:', error);
        res.status(500).json({ error: error.message });
      }
    }
  },

  async generateInvoices(req, res) {
    try {
      const { year, month, clientId } = req.body;
      if (!year || !month || !clientId) {
        return res.status(400).json({ error: 'Year, month, and clientId are required' });
      }
      logger.info(`Generating invoice: year=${year}, month=${month}, clientId=${clientId}`);
      const invoices = await invoiceService.generateInvoices(year, month, clientId);
      res.json(invoices);
    } catch (error) {
      logger.error('Error generating invoices:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async getGeneratedInvoices(req, res) {
    try {
      const { year, month } = req.params;
      logger.info(`Fetching generated invoices: year=${year}, month=${month}`);
      const invoices = await invoiceService.getGeneratedInvoices(year, month);
      res.json(invoices);
    } catch (error) {
      logger.error('Error fetching generated invoices:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async downloadInvoice(req, res) {
  try {
    const { invoiceId } = req.params;
    logger.info(`Downloading invoice: invoiceId=${invoiceId}`);
    const invoice = await invoiceService.getInvoiceById(invoiceId);
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const filePath = path.join(__dirname, '../invoices', invoice.PdfPath);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Invoice file not found' });
    }

    // Get the 3-character month name
    const monthName = getMonthNameFromNumber(invoice.Month);
    if (!monthName) {
      throw new Error(`Invalid month number: ${invoice.Month}`);
    }

    // Construct the filename: {Month} {Year} {ClientName} Invoice.pdf
    const sanitizedClientName = invoice.Client.ClientName.replace(/[^a-zA-Z0-9]/g, '_'); // Sanitize client name
    const filename = `${monthName} ${invoice.Year} ${sanitizedClientName} Invoice.pdf`;

    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/pdf');
    res.download(filePath, filename);
  } catch (error) {
    logger.error('Error downloading invoice:', error);
    res.status(500).json({ error: error.message });
  }
},

  async markInvoiceAsSent(req, res) {
    try {
      const invoice = await invoiceService.markInvoiceAsSent(req.params.invoiceId);
      res.json(invoice);
    } catch (error) {
      if (error.message === 'Invoice not found') {
        res.status(404).json({ error: error.message });
      } else {
        logger.error('Error marking invoice as sent:', error);
        res.status(500).json({ error: error.message });
      }
    }
  },

  async regenerateInvoice(req, res) {
    try {
      const invoice = await invoiceService.regenerateInvoice(req.params.invoiceId);
      res.json(invoice);
    } catch (error) {
      if (error.message === 'Invoice not found') {
        res.status(404).json({ error: error.message });
      } else {
        logger.error('Error regenerating invoice:', error);
        res.status(500).json({ error: error.message });
      }
    }
  },

  async viewInvoice(req, res) {
    try {
      const { filePath } = req.params;
      const fullPath = path.join(__dirname, '../invoices', filePath);
      logger.info(`Viewing invoice: filePath=${fullPath}`);
      
      if (!fs.existsSync(fullPath)) {
        return res.status(404).json({ error: 'Invoice file not found' });
      }

      res.sendFile(fullPath);
    } catch (error) {
      logger.error('Error viewing invoice:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = invoiceController;