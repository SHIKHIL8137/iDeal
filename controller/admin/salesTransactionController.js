
const {Transaction} = require('../../model/admin/transactionModel');
const {Orders} = require('../../model/user/orderModel');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');





// load Sales report page 

const loadSales = async(req,res)=>{
  try {
    const username=req.session.username;
    res.status(200).render('admin/sales',{username,title:"Sales"});
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
}


// get the sales table

const getSalesTable = async(req,res)=>{
  try {
    const orderData = await Orders.find({status : 'Delivered'}).sort({orderDate : -1});
    res.status(200).json({
      status: true,
      data: orderData,
    });
  } catch (error) {
    console.error('Error fetching sales table data:', error);
    res.status(500).json({
      status: false,
      message: 'Internal Server Error',
    });
  }
}

// get the filtered table


const getFilteredSalesTable = async (req, res) => {
  try {
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
          return res.status(400).json({ status: false, message: 'Start date and end date are required.' });
      }
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
          return res.status(400).json({ status: false, message: 'Invalid date format. Use YYYY-MM-DD.' });
      }
      end.setHours(0, 0, 0, 0);
      if (start > end) {
          return res.status(400).json({ status: false, message: 'Start date cannot be after end date.' });
      }

      console.log(start,end);
      const orderData = await Orders.find({
        orderDate: { $gte: start, $lte: end },
        status: 'Delivered'
      }).sort({ orderDate: -1 });
      

      return res.status(200).json({ 
          status: true, 
          orderData, 
          totalOrders: orderData.length 
      });
  } catch (error) {
      console.error('Error fetching filtered sales table:', error);
      return res.status(500).json({ status: false, message: 'Internal Server Error' });
  }
};



// generate sales report 


function generatePDFReport(data, res) {
  const doc = new PDFDocument({ margin: 50 });
  const filename = `Sales_Report_${Date.now()}.pdf`;


  let totalAmount = 0;
  let totalDiscount = 0;
  let netSales = 0;


  data.forEach(order => {
    const amount = order.total_Amt_WOT_Discount || 0;
    const discount = order.discount || 0;
    const net = order.totalAmount || 0;

    if (isNaN(amount) || isNaN(discount) || isNaN(net)) {
      console.error('Invalid data:', order);
      throw new Error('Invalid data in order object');
    }

    totalAmount += amount;
    totalDiscount += discount;
    netSales += net;
  });


  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

  doc.pipe(res);


  doc
    .fontSize(24)
    .text('iDeal Sales Report', { align: 'center' })
    .fontSize(10)
    .fillColor('gray')
    .text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' })
    .moveDown(1);


  doc
    .moveTo(50, doc.y)
    .lineTo(550, doc.y)
    .strokeColor('black')
    .stroke()
    .moveDown(1);



  let currentY = doc.y
  doc
    .fontSize(12)
    .font('Helvetica-Bold')
    .fillColor('black')
    .text('Order Date', 50, currentY, { width: 100 })
    .text('Order ID', 150, currentY, { width: 100 })
    .text('Total Amount', 280, currentY, { width: 100 })
    .text('Discount', 390, currentY, { width: 100 })
    .text('Net Amount', 480, currentY, { width: 100 })
    .moveDown(1);
    currentY += 20;

  doc
    .moveTo(50, currentY)
    .lineTo(550, currentY)
    .strokeColor('gray')
    .stroke()
    .moveDown(1);
    currentY += 20;

  doc.font('Helvetica');
  data.forEach(order => {
    doc
      .text(new Date(order.orderDate).toLocaleDateString(), 50,currentY)
      .text(order.orderId || 'N/A', 150,currentY)
      .text(`${(order.total_Amt_WOT_Discount || 0).toFixed(2)}`, 300,currentY)
      .text(`${(order.discount || 0).toFixed(2)}`, 400,currentY)
      .text(`${(order.totalAmount || 0).toFixed(2)}`, 500,currentY);
    doc.moveDown(1); 
    currentY += 30;
  });


  doc
  .moveTo(50, currentY)
  .lineTo(550, currentY)
  .strokeColor('gray')
  .stroke()
  .moveDown(1);
  currentY += 20;


  doc
    .moveDown(1)
    .fontSize(12)
    .font('Helvetica-Bold')
    .text('Totals:', 50, currentY)
    .text(`${totalAmount.toFixed(2)}`, 300,currentY)
    .text(`${totalDiscount.toFixed(2)}`, 400,currentY)
    .text(`${netSales.toFixed(2)}`, 500,currentY)
    .moveDown(1);
    currentY += 20;
  doc
    .moveDown(1)
    .fontSize(10)
    .font('Helvetica-Oblique')
    .fillColor('gray')
    .text(
      'This report was generated by iDeal. All amounts are in INR.',
      50,
      doc.y,
      { align: 'center', width: 500 }
    )
    .text('For any queries, contact support@ideal.com.', { align: 'center' });

  doc.end();
}



// get the sales repord pdf



const reportPDF = async (req, res) => {
  try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
          return res.status(400).json({ status: false, message: 'Start date and end date are required.' });
      }

      const start = new Date(startDate);
      const end = new Date(endDate);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
          return res.status(400).json({ status: false, message: 'Invalid date format. Use YYYY-MM-DD.' });
      }

      end.setHours(23, 59, 59, 999);

      if (start > end) {
          return res.status(400).json({ status: false, message: 'Start date cannot be after end date.' });
      }

      const data = await Orders.find({
        orderDate: { $gte: start, $lte: end },
        status: 'Delivered'
      }).sort({ orderDate: -1 });
    

      if (data.length === 0) {
          return res.status(404).json({ status: false, message: 'No data found for the specified date range.' });
      }

      generatePDFReport(data, res);
  } catch (error) {
      console.error('Error generating PDF report:', error);
      return res.status(500).json({ status: false, message: 'Internal Server Error' });
  }
};



// generate generate excel report

function generateExcelReport(data, res) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Sales Report');

  worksheet.mergeCells('A1:E1');
  worksheet.getCell('A1').value = 'iDeal Sales Report';
  worksheet.getCell('A1').font = { size: 16, bold: true };
  worksheet.getCell('A1').alignment = { horizontal: 'center' };

  worksheet.mergeCells('A2:E2');
  worksheet.getCell('A2').value = `Generated on: ${new Date().toLocaleString()}`;
  worksheet.getCell('A2').font = { italic: true };
  worksheet.getCell('A2').alignment = { horizontal: 'center' };

  worksheet.addRow(['Order Date', 'Order ID', 'Total Amount', 'Discount', 'Net Amount']);
  const headerRow = worksheet.getRow(3);
  headerRow.font = { bold: true };
  headerRow.alignment = { horizontal: 'center' };
  headerRow.eachCell(cell => {
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };
  });

  let totalAmount = 0;
  let totalDiscount = 0;
  let netSales = 0;

  data.forEach(order => {
    const amount = order.total_Amt_WOT_Discount || 0;
    const discount = order.discount || 0;
    const net = order.totalAmount || 0;

    worksheet.addRow([
      new Date(order.orderDate).toLocaleDateString(),
      order.orderId || 'N/A',
      amount,
      discount,
      net,
    ]);

    totalAmount += amount;
    totalDiscount += discount;
    netSales += net;
  });

  const totalsRow = worksheet.addRow(['Totals', '', totalAmount, totalDiscount, netSales]);
  totalsRow.font = { bold: true };
  totalsRow.alignment = { horizontal: 'center' };
  totalsRow.eachCell((cell, colNumber) => {
    if (colNumber > 2) {
      cell.border = {
        top: { style: 'thin' },
        bottom: { style: 'double' },
      };
    }
  });

  worksheet.getColumn(1).width = 15; 
  worksheet.getColumn(2).width = 20; 
  worksheet.getColumn(3).width = 15; 
  worksheet.getColumn(4).width = 15;
  worksheet.getColumn(5).width = 15; 

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename=Sales_Report_${Date.now()}.xlsx`
  );

  workbook.xlsx.write(res).then(() => {
    res.end();
  }).catch(err => {
    console.error('Error generating Excel report:', err);
    res.status(500).send('Error generating report');
  });
}


// get the sales excel report


const reportExcel = async (req,res)=>{
  
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ status: false, message: 'Start date and end date are required.' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ status: false, message: 'Invalid date format. Use YYYY-MM-DD.' });
    }

    end.setHours(23, 59, 59, 999);

    if (start > end) {
      return res.status(400).json({ status: false, message: 'Start date cannot be after end date.' });
    }

    const data = await Orders.find({
      orderDate: { $gte: start, $lte: end },
      status: 'Delivered'
  }).sort({ orderDate: -1 });
  

    if (data.length === 0) {
      return res.status(404).json({ status: false, message: 'No data found for the specified date range.' });
    }

    generateExcelReport(data, res);
  } catch (error) {
    console.error('Error generating Excel report:', error);
    return res.status(500).json({ status: false, message: 'Internal Server Error' });
  }


}

// load the transction page 

const loadTransctions = async(req,res)=>{
  try{
    const username=req.session.username;
    res.status(200).render('admin/transaction',{
  username,
  title:'Transaction'
});

  }catch(error){
    res.status(500).send('Internal server Error');
  }
}


// get transaction table

const getTransactionDetails = async(req,res)=>{
  try {
    const transactions = await Transaction.find().sort({createdAt : -1}); 
    res.status(200).json(transactions); 
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ message: 'Server error' });
  }
}





module.exports = {
  loadSales,
  getSalesTable,
  getFilteredSalesTable,
  reportPDF,
  reportExcel,
  loadTransctions,
  getTransactionDetails,
}