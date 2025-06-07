const path = require('path');
const fs = require('fs');
const PdfPrinter = require('pdfmake');

const { getMonthNameFromNumber } = require('./dateUtils'); 

const loadFonts = () => ({
  Roboto: {
    normal: path.join(__dirname, './fonts/Roboto-Regular.ttf'),
    bold: path.join(__dirname, './fonts/Roboto-Medium.ttf'),
    italics: path.join(__dirname, './fonts/Roboto-Italic.ttf'),
    bolditalics: path.join(__dirname, './fonts/Roboto-MediumItalic.ttf'),
  }
});

const loadLogo = () => {
  try {
    const logoPath = path.join(__dirname, './logo/CVT_logo.png');
    if (fs.existsSync(logoPath)) {
      return fs.readFileSync(logoPath, 'base64');
    }
    console.warn('Logo file not found, using empty logo');
    return '';
  } catch (error) {
    console.warn('Error loading logo:', error.message);
    return '';
  }
};

const createInvoicePdf = async (invoiceData, employeeDetails, invoiceFilePath) => {
  const { clientId, year, month, totalAmount, logoBase64, clientName, clientAddress, bankDetails, currencyCode, previousBalance = 0 } = invoiceData;

  if (!clientName) {
    console.warn(`clientName is missing or empty for clientId=${clientId}, using fallback 'Unknown Client'`);
  }

  // Calculate dates
  const invoiceDate = new Date();
  const dueDate = new Date(invoiceDate);
  dueDate.setDate(dueDate.getDate() + 30); // Due in 30 days
  const monthName = getMonthNameFromNumber(month);
  const lastDayOfMonth = new Date(year, month, 0).getDate();

  const docDefinition = {
    pageMargins: [40, 100, 40, 60],
    header: {
      margin: [40, 40, 40, 20],
      stack: [
        {
          columns: [
            {
              image: `data:image/png;base64,${logoBase64}`,
              width: 124,
              height: 24,
            },
            {
              text: [
                { text: 'Reg. No:', style: 'regNoLabel' },
                { text: ' REG1234567890CVT', style: 'regNoValue' }
              ],
              alignment: 'right',
              color: '#0E1866',
            }
          ]
        },
        {
          canvas: [
            {
              type: 'line',
              x1: 0,
              y1: 10,
              x2: 515,
              y2: 10,
              lineWidth: 1,
              lineColor: '#d3d3d3',
            },
          ],
          margin: [0, 10, 0, 10]
        }
      ]
    },
    content: [
      { text: 'INVOICE', style: 'invoiceTitle' },
      {
        columns: [
          { text: 'Project:', style: 'subheaderKey', width: 160 },
          { text: clientName || 'Unknown Client', style: 'subheaderValue' }
        ],
        margin: [0, 0, 0, 10]
      },
      {
        columns: [
          { text: 'Invoice number:', style: 'subheaderKey', width: 160 },
          {
            text: `CVT_${year}_${month.toString().padStart(2, '0')}`,
            style: 'subheaderValue'
          }
        ],
        margin: [0, 0, 0, 10]
      },
      {
        columns: [
          { text: 'Invoice Date:', style: 'subheaderKey', width: 160 },
          { text: invoiceDate.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' }), style: 'subheaderValue' }
        ],
        margin: [0, 0, 0, 10]
      },
      {
        columns: [
          { text: 'Payment Due Date:', style: 'subheaderKey', width: 160 },
          { text: dueDate.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' }), style: 'subheaderValue' }
        ],
        margin: [0, 0, 0, 10]
      },
      {
        columns: [
          { text: 'Invoiced to:', style: 'subheaderKey', width: 160 },
          {
            text: [
              { text: clientName || 'Unknown Client', bold: true },
              { text: `, ${clientAddress || 'N/A'}`, bold: false }
            ],
            style: 'subheaderValue',
            margin: [0, 0, 0, 10]
          }
        ]
      },
      {
        columns: [
          { text: 'Invoice Period:', style: 'subheaderKey', width: 160 },
          { text: `${monthName} 1, ${year} to ${monthName} ${lastDayOfMonth}, ${year}`, style: 'subheaderValue' }
        ],
        margin: [0, 0, 0, 20]
      },
      // CHANGED: Updated table structure to properly handle previous balance
      {
        style: 'table',
        table: {
          widths: ['*', '*'],
          body: [
            [
              { text: 'Services', style: 'tableHeaderService', fillColor: '#F7F7F7' },
              { text: `Cost (${currencyCode})`, style: 'tableHeaderCost', fillColor: '#F7F7F7' }
            ],
            ...employeeDetails.map(detail => [
              { text: detail.name, style: 'tableContentService' },
              { text: detail.amount, style: 'tableContentCost' }
            ]),
            // CHANGED: Added previous balance row
            [
              { text: 'Previous Balance', style: 'tableContentService' },
              { text: previousBalance.toFixed(2), style: 'tableContentCost' }
            ],
            // CHANGED: Updated total row to show current total
            [
              { text: 'Total', style: 'tableContentService', color: '#048DFF' },
              { text: totalAmount.toFixed(2), style: 'tableContentCost', color: '#048DFF' }
            ],
            // CHANGED: Updated total due to include previous balance
            [
              { text: `Total Due ${currencyCode}`, style: 'tableContentService', fillColor: '#048DFF', color: '#ffffff' },
              { text: `${currencyCode} ${(totalAmount + previousBalance).toFixed(2)}`, style: 'tableContentCost', fillColor: '#048DFF', color: '#ffffff' }
            ]
          ]
        },
        layout: {
          paddingLeft: function (i, node) { return 12; },
          paddingRight: function (i, node) { return 12; },
          paddingTop: function (i, node) { return 6; },
          paddingBottom: function (i, node) { return 6; },
          fillColor: function (rowIndex, node, columnIndex) {
            return (rowIndex === 0) ? '#F7F7F7' : null;
          },
          hLineWidth: function (i, node) { return 0; },
          vLineWidth: function (i, node) { return 0; }
        },
        margin: [0, 0, 0, 10]
      },
      {
        text: 'Payment details',
        style: 'tableHeader',
        alignment: 'center',
        margin: [0, 20, 0, 10]
      },
      {
        table: {
          widths: ['18%', '32%', '18%', '32%'],
          body: [
            [
              { text: 'Payee name:', style: 'cardLabel', border: [false, false, false, false] },
              { text: bankDetails.payeeName, style: 'cardValue', colSpan: 3, border: [false, false, false, false], margin: [0, 0, 0, 0] },
              {}, {}
            ],
            [
              { text: 'Swift code:', style: 'cardLabel', border: [false, false, false, false] },
              { text: bankDetails.swiftCode, style: 'cardValue', border: [false, false, false, false] },
              { text: 'Account No:', style: 'cardLabel', border: [false, false, false, false] },
              { text: bankDetails.accountNo, style: 'cardValue', border: [false, false, false, false] },
            ],
            [
              { text: 'Bank:', style: 'cardLabel', border: [false, false, false, false] },
              { text: bankDetails.bankName, style: 'cardValue', border: [false, false, false, false] },
              { text: 'IFSC code:', style: 'cardLabel', border: [false, false, false, false] },
              { text: bankDetails.ifscCode, style: 'cardValue', border: [false, false, false, false] },
            ]
          ]
        },
        fillColor: '#EDF7FF',
        layout: {
          paddingLeft: function (i, node) { return 16; },
          paddingRight: function (i, node) { return 16; },
          paddingTop: function (i, node) { return 8; },
          paddingBottom: function (i, node) { return 8; },
          hLineWidth: function (i, node) { return 0; },
          vLineWidth: function (i, node) { return 0; }
        },
        unbreakable: true,
      }
    ],
    footer: {
      stack: [
        {
          table: {
            widths: ['100%'],
            heights: [30],
            body: [
              [
                {
                  text: 'A-13A Graphix tower, Sec-62, Noida',
                  style: 'footerText',
                  alignment: 'center',
                  margin: [0, 3, 0, 0],
                  border: [false, false, false, false],
                  fillColor: '#002366',
                }
              ]
            ]
          },
          layout: 'noBorders'
        }
      ],
    },
    styles: {
      header: {
        color: '#1F271B',
        fontSize: 18,
        bold: true,
      },
      subheader: {
        color: '#1F271B',
        fontSize: 12,
        margin: [0, 10, 0, 5],
      },
      subheaderKey: {
        color: '#1F271B',
        fontSize: 12,
        bold: true,
      },
      subheaderValue: {
        color: '#1F271B',
        fontSize: 12,
      },
      invoiceTitle: {
        fontSize: 16,
        color: '#1F271B',
        bold: true,
        alignment: 'center',
        margin: [0, 0, 0, 20]
      },
      tableHeaderService: {
        color: '#1F271B',
        bold: true,
        fontSize: 12,
        alignment: 'left',
      },
      tableHeaderCost: {
        color: '#1F271B',
        bold: true,
        fontSize: 12,
        alignment: 'right',
      },
      tableContentService: {
        color: '#1F271B',
        fontSize: 12,
        alignment: 'left',
      },
      tableContentCost: {
        color: '#1F271B',
        fontSize: 12,
        alignment: 'right',
      },
      footerText: {
        fontSize: 12,
        alignment: 'center',
        color: '#ffffff',
      },
      regNoLabel: {
        font: 'Roboto',
        bold: true,
        fontSize: 12,
        lineHeight: 1.5,
      },
      regNoValue: {
        font: 'Roboto',
        fontWeight: 400,
        fontSize: 12,
        lineHeight: 1.5,
      },
      cardLabel: {
        fontSize: 12,
        bold: true,
        color: '#1F271B',
      },
      cardValue: {
        fontSize: 12,
        color: '#1F271B',
      }
    },
    defaultStyle: {
      columnGap: 20
    }
  };

  const printer = new PdfPrinter(loadFonts());
  const pdfDoc = printer.createPdfKitDocument(docDefinition);
  const writeStream = fs.createWriteStream(invoiceFilePath);
  pdfDoc.pipe(writeStream);

  return new Promise((resolve, reject) => {
    pdfDoc.end();
    writeStream.on('finish', resolve);
    writeStream.on('error', reject);
  });
};

module.exports = {
  createInvoicePdf,
  loadFonts,
  loadLogo,
};