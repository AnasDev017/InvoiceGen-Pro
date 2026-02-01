import chromium from "chrome-aws-lambda";
import puppeteer from "puppeteer-core";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import invoiceModel from "../models/invoiceModel.js";
import UserModel from "../models/userModel.js";
import crypto from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ------------------------
// Generate Invoice PDF
// ------------------------
export const generateInvoice = async (req, res) => {
  let browser = null;
  try {
    const { items, formData, template, status, discountAmount } = req.body;

    // Template path
    const strategies = [
      path.join(process.cwd(), "BackEnd", "utils", `${template}.html`),
      path.join(process.cwd(), "utils", `${template}.html`),
      path.join(__dirname, "..", "utils", `${template}.html`)
    ];
    let templatePath = strategies.find(p => fs.existsSync(p));
    if (!templatePath) {
      return res.status(400).json({ success: false, message: "Template not found" });
    }

    let html = fs.readFileSync(templatePath, "utf-8");

    // Replace placeholders
    html = html.replace("{{clientName}}", formData.clientName)
               .replace("{{clientEmail}}", formData.clientEmail)
               .replaceAll("{{invoiceId}}", formData.invoiceNumber)
               .replace("{{date}}", formData.dueDate);

    const user = await UserModel.findById(req.user._id);
    html = html.replace("{{senderName}}", user?.name || "Sender")
               .replace("{{senderEmail}}", user?.email || "");

    let subTotal = 0;
    const itemsHtml = items.map(i => {
      const qty = Number(i.quantity);
      const price = Number(i.price);
      const rowTotal = qty * price;
      subTotal += rowTotal;
      return `<tr class="border-thin">
        <td class="py-4 px-4 font-medium">${i.description}</td>
        <td class="py-4 px-4 text-center">${qty}</td>
        <td class="py-4 px-4 text-center">$${price.toFixed(2)}</td>
        <td class="py-4 px-4 text-right font-bold">$${rowTotal.toFixed(2)}</td>
      </tr>`;
    }).join("");

    const discount = Number(discountAmount || 0);
    const grandTotal = subTotal - discount;

    html = html.replace("{{items}}", itemsHtml)
               .replace("{{subTotal}}", subTotal.toFixed(2))
               .replace("{{discount}}", discount.toFixed(2))
               .replace("{{grandTotal}}", grandTotal.toFixed(2));

    // Puppeteer launch
    browser = await puppeteer.launch({
      args: [
        ...chromium.args,
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--single-process",
        "--no-zygote"
      ],
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: true,
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "domcontentloaded", timeout: 60000 });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "20px", bottom: "20px", left: "20px", right: "20px" }
    });

    await browser.close();

    // Save invoice in DB
    await invoiceModel.create({
      user: req.user._id,
      invoiceId: crypto.randomUUID(),
      clientName: formData.clientName,
      invoiceNumber: formData.invoiceNumber,
      totalAmount: grandTotal,
      status,
      dueDate: formData.dueDate,
    });

    // Send PDF
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename=Invoice_${formData.invoiceNumber}.pdf`,
    });
    res.send(pdfBuffer);

  } catch (err) {
    console.error("🔥 Error in generateInvoice:", err);
    if (browser) await browser.close();
    res.status(500).json({ success: false, message: err.message });
  }
};

// ------------------------
// Download Saved Invoice
// ------------------------
export const downloadSavedInvoice = async (req, res) => {
  let browser = null;
  try {
    const { id } = req.params;
    const invoice = await invoiceModel.findOne({ _id: id, user: req.user._id });
    if (!invoice) return res.status(404).json({ success: false, message: "Invoice not found" });

    const strategies = [
      path.join(process.cwd(), "BackEnd", "utils", "template1.html"),
      path.join(process.cwd(), "utils", "template1.html"),
      path.join(__dirname, "..", "utils", "template1.html")
    ];
    const templatePath = strategies.find(p => fs.existsSync(p));
    if (!templatePath) return res.status(404).json({ success: false, message: "Template not found" });

    let html = fs.readFileSync(templatePath, "utf-8");

    // Replace placeholders
    html = html.replace("{{clientName}}", invoice.clientName)
               .replace("{{clientEmail}}", "")
               .replaceAll("{{invoiceId}}", invoice.invoiceNumber)
               .replace("{{date}}", new Date(invoice.createdAt).toLocaleDateString());

    const user = await UserModel.findById(req.user._id);
    html = html.replace("{{senderName}}", user?.name || "Sender")
               .replace("{{senderEmail}}", user?.email || "");

    const items = [{
      description: "Invoice Services (Summary)",
      quantity: 1,
      price: invoice.totalAmount
    }];

    let subTotal = 0;
    const itemsHtml = items.map(i => {
      const qty = Number(i.quantity);
      const price = Number(i.price);
      const rowTotal = qty * price;
      subTotal += rowTotal;
      return `<tr class="border-thin">
        <td class="py-4 px-4 font-medium">${i.description}</td>
        <td class="py-4 px-4 text-center">${qty}</td>
        <td class="py-4 px-4 text-center">$${price.toFixed(2)}</td>
        <td class="py-4 px-4 text-right font-bold">$${rowTotal.toFixed(2)}</td>
      </tr>`;
    }).join("");

    const grandTotal = subTotal;
    html = html.replace("{{items}}", itemsHtml)
               .replace("{{subTotal}}", subTotal.toFixed(2))
               .replace("{{discount}}", "0.00")
               .replace("{{grandTotal}}", grandTotal.toFixed(2));

    // Puppeteer launch
    browser = await puppeteer.launch({
      args: [
        ...chromium.args,
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--single-process",
        "--no-zygote"
      ],
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: true,
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "domcontentloaded", timeout: 60000 });
    const pdfBuffer = await page.pdf({
      format: "A4",
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
    console.error("🔥 Error downloading PDF:", err);
    if (browser) await browser.close();
    res.status(500).json({ success: false, message: err.message });
  }
};
