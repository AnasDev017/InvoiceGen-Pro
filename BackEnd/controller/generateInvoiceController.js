// Import required modules
import puppeteer from "puppeteer";      // Puppeteer for HTML -> PDF conversion
import fs from "fs";                     // File system to read HTML template
import path from "path";                 // Path module to handle file paths
import { fileURLToPath } from "url";     // Needed to define __dirname in ESM
import invoiceModel from "../models/invoiceModel.js";
import UserModel from "../models/userModel.js";
import crypto from "crypto";

// ------------------------
// Define __dirname in ESM mode
// ------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ------------------------
// Exported function to generate invoice PDF
// ------------------------
export const generateInvoice = async (req, res) => {
  try {
    // ------------------------
    const { items,formData,template,status,discountAmount,sendOptions } = req.body;
    // ------------------------
    // Step 2: Select the correct HTML template
    // Template folder: backend/utils/template1.html etc.
    // '..' moves from controller folder to backend root, then utils
    // ------------------------
    const templatePath = path.join(__dirname, "..", "utils", `${template}.html`);

    // Read HTML file as string
    let html = fs.readFileSync(templatePath, "utf-8");

    // ------------------------
    // Step 3: Replace placeholders in template with real data
    // ------------------------
    html = html.replace("{{clientName}}", formData.clientName)
               .replace("{{clientEmail}}", formData.clientEmail)
               .replaceAll("{{invoiceId}}", formData.invoiceNumber)
               .replace("{{date}}", formData.dueDate);
    
    // Fetch sender details
    const user = await UserModel.findById(req.user._id);
    const senderName = user ? user.name : "Sender";
    const senderEmail = user ? user.email : "";

    html = html.replace("{{senderName}}", senderName)
               .replace("{{senderEmail}}", senderEmail);

    // ------------------------
    // Step 4: Generate table rows dynamically for items
    // ------------------------
   // ------------------------
// Step 4: Generate table rows dynamically
// ------------------------
let subTotal = 0;

let itemsHtml = items.map(i => {
  const qty = Number(i.quantity);
  const price = Number(i.price);
  const rowTotal = qty * price;

  subTotal += rowTotal;

  return `
    <tr class="border-thin">
      <td class="py-4 px-4 font-medium">${i.description}</td>
      <td class="py-4 px-4 text-center">${qty}</td>
      <td class="py-4 px-4 text-center">$${price.toFixed(2)}</td>
      <td class="py-4 px-4 text-right font-bold">$${rowTotal.toFixed(2)}</td>
    </tr>
  `;
}).join("");

// ------------------------
// Step 5: Calculate totals
// ------------------------
const discount = Number(discountAmount || 0);
const grandTotal = subTotal - discount;

// ------------------------
// Step 6: Replace placeholders
// ------------------------
html = html
  .replace("{{items}}", itemsHtml)
  .replace("{{subTotal}}", subTotal.toFixed(2))
  .replace("{{discount}}", discount.toFixed(2))
  .replace("{{grandTotal}}", grandTotal.toFixed(2));

    // ------------------------
    // Step 5: Launch Puppeteer to generate PDF
    // ------------------------
    const browser = await puppeteer.launch({
      headless: true,           // Run headless
      args: ["--no-sandbox"],   // Avoid sandbox issues
    });
    const page = await browser.newPage();            

    // Use domcontentloaded instead of networkidle0 to avoid timeout
    await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 60000 });

    const pdfBuffer = await page.pdf({               
      format: 'A4',
      printBackground: true,
      margin: { top: "20px", bottom: "20px", left: "20px", right: "20px" } // Optional
    });

    await browser.close();  // Close browser
    // save invoice in histry
    await invoiceModel.create({
      user: req.user._id,
      invoiceId: crypto.randomUUID(),
      clientName: formData.clientName,
      invoiceNumber:formData.invoiceNumber,
      totalAmount:grandTotal,
      status,
      dueDate: formData.dueDate,
    });
    
    // ------------------------
    // Step 6: Send PDF back to frontend
    // ------------------------
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": "inline; filename=Invoice_3456789.pdf",
    });
    
    res.send(pdfBuffer);
      // Send the PDF file

  } catch (err) {
    // ------------------------
    // Step 7: Error handling
    // ------------------------
    console.error("Error generating PDF:", err);
    res.status(500).send("Error generating PDF");
  }
};

export const downloadSavedInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const invoice = await invoiceModel.findOne({ _id: id, user: req.user._id });

        if (!invoice) {
            return res.status(404).send("Invoice not found");
        }

        // Use a default template
        const templatePath = path.join(__dirname, "..", "utils", "template1.html"); 
        let html = fs.readFileSync(templatePath, "utf-8");

        // Mock items since we don't save them
        const items = [{
            description: "Invoice Services (Summary)",
            quantity: 1,
            price: invoice.totalAmount
        }];

        // Replace placeholders
        // Note: We might be missing clientEmail if not saved, so fallback to empty
        html = html.replace("{{clientName}}", invoice.clientName)
                   .replace("{{clientEmail}}", "") 
                   .replaceAll("{{invoiceId}}", invoice.invoiceNumber)
                   .replace("{{date}}", new Date(invoice.createdAt).toLocaleDateString());

        // Fetch sender details
        const user = await UserModel.findById(req.user._id);
        const senderName = user ? user.name : "Sender";
        const senderEmail = user ? user.email : "";
 
        html = html.replace("{{senderName}}", senderName)
                   .replace("{{senderEmail}}", senderEmail);

        let subTotal = 0;
        let itemsHtml = items.map(i => {
            const qty = Number(i.quantity);
            const price = Number(i.price);
            const rowTotal = qty * price;
            subTotal += rowTotal;
            return `
                <tr class="border-thin">
                <td class="py-4 px-4 font-medium">${i.description}</td>
                <td class="py-4 px-4 text-center">${qty}</td>
                <td class="py-4 px-4 text-center">$${price.toFixed(2)}</td>
                <td class="py-4 px-4 text-right font-bold">$${rowTotal.toFixed(2)}</td>
                </tr>
            `;
        }).join("");

        const discount = 0; // Not saved
        const grandTotal = subTotal; // Already total

        html = html
            .replace("{{items}}", itemsHtml)
            .replace("{{subTotal}}", subTotal.toFixed(2))
            .replace("{{discount}}", discount.toFixed(2))
            .replace("{{grandTotal}}", grandTotal.toFixed(2));

        const browser = await puppeteer.launch({
            headless: true,
            args: ["--no-sandbox"],
        });
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 60000 });
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: "20px", bottom: "20px", left: "20px", right: "20px" }
        });
        await browser.close();

        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": `inline; filename=${invoice.invoiceNumber}.pdf`,
        });
        res.send(pdfBuffer);

    } catch (err) {
        console.error("Error downloading PDF:", err);
        res.status(500).send("Error downloading PDF");
    }
};
