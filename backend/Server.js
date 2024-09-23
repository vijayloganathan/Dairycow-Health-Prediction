const express = require("express");
const cors = require("cors");
const XLSX = require("xlsx");
const { spawn } = require("child_process");
const PDFDocument = require("pdfkit");
const moment = require("moment");
const { exit } = require("process");
const bodyParser = require("body-parser");
const fs = require("fs");
const dotenv = require("dotenv");



dotenv.config();
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);

const app = express();
app.use(cors());
app.use(express.json());

let RateWorkbook, rateWorksheet;
let collectiondateis, collectionshiftis;
function getPrediction(
  today_fat,
  today_snf,
  member_code,
  specific_date,
  today_shift
) {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn("python", ["MLalgorithm.py"]);

    // Send input data to Python script
    pythonProcess.stdin.write(
      `${today_fat},${today_snf},${member_code},${specific_date},${today_shift}\n`
    );
    pythonProcess.stdin.end();

    // Receive prediction result from Python script
    pythonProcess.stdout.on("data", (data) => {
      resolve(data.toString().trim());
    });

    // Handle any errors
    pythonProcess.stderr.on("data", (data) => {
      reject(data.toString().trim());
    });
  });
}

try {
  // Load Excel files

  RateWorkbook = XLSX.readFile("rate.xlsx");

  // Load rate worksheet once during server startup
  rateWorksheet = RateWorkbook.Sheets[RateWorkbook.SheetNames[0]];
} catch (error) {
  console.error("Error loading Excel files:", error);
}

function getCellValue(worksheet, cellAddress) {
  return worksheet[cellAddress] ? worksheet[cellAddress].v : null;
}

function getRate(fat, snf) {
  const fatCol = Math.round((fat - 3) * 10) + 2;
  const snfRow = Math.round((snf - 7) * 10) + 2;
  const fatColLetter = String.fromCharCode(65 + snfRow); // Adjusted to start from A (65 in ASCII)
  const cellAddress = fatColLetter + fatCol;
  return getCellValue(rateWorksheet, cellAddress);
}

function store_milk_data(Member_code, Data) {
  try {
    const Database = XLSX.readFile("Database.xlsx");
    let membersheet = Database.Sheets[Member_code];

    const parts = Data.Date.split("-");
    const formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`; // Convert to yyyy/mm/dd format

    const range = XLSX.utils.decode_range(membersheet["!ref"]);
    let check = 0;
    for (let i = 0; i < range.e.r; i++) {
      const dateCellValue =
        membersheet[XLSX.utils.encode_cell({ r: i, c: 0 })]?.v;
      const shiftCellValue =
        membersheet[XLSX.utils.encode_cell({ r: i, c: 6 })]?.v;

      if (dateCellValue == formattedDate && shiftCellValue == Data.shift) {
        check = 1;
        try {
          membersheet[XLSX.utils.encode_cell({ r: i, c: 1 })] = { v: Data.fat };
          membersheet[XLSX.utils.encode_cell({ r: i, c: 2 })] = { v: Data.snf };
          membersheet[XLSX.utils.encode_cell({ r: i, c: 3 })] = {
            v: Data.weight,
          };
          membersheet[XLSX.utils.encode_cell({ r: i, c: 4 })] = {
            v: Data.rate,
          };
          membersheet[XLSX.utils.encode_cell({ r: i, c: 5 })] = {
            v: Data.total_amount,
          };

          // Save the changes back to the Excel file
          XLSX.writeFile(Database, "Database.xlsx");
        } catch (error) {
          console.error("Error updating cell values:", error);
        }
      }
    }
    if (check == 0) {
      try {
        const fat = Data.fat;
        const snf = Data.snf;
        const weight = Data.weight;
        const rate = Data.rate;
        const total_amount = Data.total_amount;
        const shift = Data.shift;

        const MilkData = [
          {
            formattedDate,
            fat,
            snf,
            weight,
            rate,
            total_amount,
            shift,
          },
        ];

        XLSX.utils.sheet_add_json(membersheet, MilkData, {
          skipHeader: true,
          origin: -1, // Append data to the end of the sheet
        });
        XLSX.writeFile(Database, "Database.xlsx");
      } catch (error) {
        console.error("Error reading Excel file:", error);
      }

      // Write changes back to the Excel file

      check = 0;
    }
  } catch (error) {
    console.error("Error reading Excel file:", error);
  }
}

app.post("/shiftdetail", (req, res) => {
  const { collectiondate, collectionshift } = req.body;
  (collectiondateis = collectiondate), (collectionshiftis = collectionshift);
  res.sendStatus(200);
});

app.post("/Society_Details_Update", (req, res) => {
  const {
    Center_Number,
    Owner_Name,
    Center_Name,
    Center_Address,
    Mobile_Number,
    Pincode,
  } = req.body;

  try {
    const Database = XLSX.readFile("Database.xlsx");
    let membersheet = Database.Sheets["S_D"];

    const range = XLSX.utils.decode_range(membersheet["!ref"]);

    try {
      membersheet[XLSX.utils.encode_cell({ r: range.e.r, c: 0 })] = {
        v: Center_Number,
      };
      membersheet[XLSX.utils.encode_cell({ r: range.e.r, c: 1 })] = {
        v: Owner_Name,
      };
      membersheet[XLSX.utils.encode_cell({ r: range.e.r, c: 2 })] = {
        v: Center_Name,
      };
      membersheet[XLSX.utils.encode_cell({ r: range.e.r, c: 3 })] = {
        v: Center_Address,
      };
      membersheet[XLSX.utils.encode_cell({ r: range.e.r, c: 4 })] = {
        v: Mobile_Number,
      };
      membersheet[XLSX.utils.encode_cell({ r: range.e.r, c: 5 })] = {
        v: Pincode,
      };

      XLSX.writeFile(Database, "Database.xlsx");
    } catch (error) {
      console.error("Error updating cell values:", error);
    }
  } catch (error) {
    console.error("Error reading Excel file:", error);
  }
  res.sendStatus(200);
});

app.get("/getdateandshift", (req, res) => {
  const { collectiondate, collectionshift } = req.body;
  dateandshift = {
    Date: collectiondateis,
    shift: collectionshiftis,
  };
  res.json({ dateandshift });
});

app.get("/get_society_details", (req, res) => {
  let data = {
    Center_Number: "",
    Owner_Name: "",
    Center_Name: "",
    Center_Address: "",
    Mobile_Number: "",
    Pincode: "",
  };
  try {
    const Database = XLSX.readFile("Database.xlsx");
    let membersheet = Database.Sheets["S_D"];

    const range = XLSX.utils.decode_range(membersheet["!ref"]);

    try {
      data.Center_Number =
        membersheet[XLSX.utils.encode_cell({ r: range.e.r, c: 0 })]?.v;
      data.Owner_Name =
        membersheet[XLSX.utils.encode_cell({ r: range.e.r, c: 1 })]?.v;
      data.Center_Name =
        membersheet[XLSX.utils.encode_cell({ r: range.e.r, c: 2 })]?.v;
      data.Center_Address =
        membersheet[XLSX.utils.encode_cell({ r: range.e.r, c: 3 })]?.v;
      data.Mobile_Number =
        membersheet[XLSX.utils.encode_cell({ r: range.e.r, c: 4 })]?.v;
      data.Pincode =
        membersheet[XLSX.utils.encode_cell({ r: range.e.r, c: 5 })]?.v;
    } catch (error) {
      console.error("Error updating cell values:", error);
    }
  } catch (error) {
    console.error("Error reading Excel file:", error);
  }

  res.json({ data });
});

app.get("/get_members_data", (req, res) => {
  let member_data = []; // Define member_data outside the try block

  try {
    const Database = XLSX.readFile("Database.xlsx");
    let membersheet = Database.Sheets["Member_List"];

    const range = XLSX.utils.decode_range(membersheet["!ref"]);

    for (let i = 1; i <= range.e.r; i++) {
      // Change the loop condition to <=
      let data = {
        Member_Id: membersheet[XLSX.utils.encode_cell({ r: i, c: 0 })]?.v,
        Member_Name: membersheet[XLSX.utils.encode_cell({ r: i, c: 1 })]?.v,
        Member_Mobile: membersheet[XLSX.utils.encode_cell({ r: i, c: 2 })]?.v,
      };
      member_data.push(data);
    }
  } catch (error) {
    console.error("Error reading Excel file:", error);
    res.status(500).json({ error: "Failed to read member data from Excel" });
    return;
  }

  res.json({ member_data });
});

app.post("/Add_Member_Details", (req, res) => {
  const { Member_Id, Member_Name, Member_Mobile } = req.body;

  try {
    // Read the Excel file
    const Database = XLSX.readFile("Database.xlsx");
    let membersheet = Database.Sheets["Member_List"];

    // Find the index of the last filled row
    let lastRow = 1; // Start from row 1
    while (membersheet[XLSX.utils.encode_cell({ r: lastRow, c: 0 })]) {
      lastRow++;
    }

    // Check if Member_Id already exists
    let memberIdFound = false;
    for (let i = 1; i < lastRow; i++) {
      if (membersheet[XLSX.utils.encode_cell({ r: i, c: 0 })].v === Member_Id) {
        // Member_Id found, update row data
        membersheet[XLSX.utils.encode_cell({ r: i, c: 1 })] = {
          v: Member_Name,
        };
        membersheet[XLSX.utils.encode_cell({ r: i, c: 2 })] = {
          v: Member_Mobile,
        };
        memberIdFound = true;
        break;
      }
    }

    if (!memberIdFound) {
      // Add data to the next row after the last filled row
      const newMemberData = [
        {
          Member_Id,
          Member_Name,
          Member_Mobile,
        },
      ];

      XLSX.utils.sheet_add_json(membersheet, newMemberData, {
        skipHeader: true,
        origin: -1, // Append data to the end of the sheet
      });
    }

    // Write changes back to the Excel file
    XLSX.writeFile(Database, "Database.xlsx");

    res.sendStatus(200);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to add member details" });
  }
});

app.post("/rateandtotamt", (req, res) => {
  const { Fat, Snf } = req.body;

  let rate = getRate(Fat, Snf);
  if (rate != null) {
    rate = rate.toFixed(2);
  }

  res.json({ rate });
});

app.post("/milkcoolection", (req, res) => {
  let { Member_code, Fat, Snf, total_litter, rate, totamt, Date, Shift } =
    req.body;
  const today_fat = Fat;
  const today_snf = Snf;
  const member_code = Member_code;
  const specific_date = Date;
  let today_shift;
  if (Shift == "Morning") {
    Shift = "M";
  } else {
    Shift = "E";
  }
  today_shift = Shift;

  // rate = rate.toFixed(2);
  let Data = {
    Date: specific_date,
    fat: today_fat,
    snf: today_snf,
    weight: total_litter,
    rate: rate,
    total_amount: totamt,
    shift: today_shift,
  };

  store_milk_data(Member_code, Data);

  getPrediction(today_fat, today_snf, member_code, specific_date, today_shift)
    .then((result) => {
      console.log(result);
      res.json({ result });

      const lent = result.length;

      let msg =
        "\n\nDear Customer Your milk data on \n" +
        specific_date +
        " " +
        today_shift +
        ",\nYour Milk FAT : " +
        today_fat +
        ",\nSNF : " +
        today_snf +
        ",\nRate : " +
        Data.rate +
        ",\nWeight : " +
        Data.weight +
        ",\nTotal Amount : Rs" +
        Data.total_amount;
      if (lent == 37) {
        msg =
          msg +
          "\n\nYour cow may have been affected by a health issue. Monitor closely." +
          "\n\n" +
          "உங்கள் மாடு உடல்நலப் பிரச்சினையால் பாதிக்கப்பட்டிருக்கலாம். கூர்ந்து கண்காணிக்கவும்.";
      }

      const Database = XLSX.readFile("Database.xlsx");
      let membersheet = Database.Sheets["Member_List"];
      const range = XLSX.utils.decode_range(membersheet["!ref"]);
      let Mobile_number;
      for (let i = 1; i <= range.e.r; i++) {
        const Member_ID =
          membersheet[XLSX.utils.encode_cell({ r: i, c: 0 })]?.v;
        const Mobile = membersheet[XLSX.utils.encode_cell({ r: i, c: 2 })]?.v;
        if (Member_ID == member_code) {
          Mobile_number = Mobile;
        }
      }

      // sending sms
      const messageParams = {
        body: msg,
        from: "+12564140040",
        to: "+91" + Mobile_number,
      };
      client.messages
        .create(messageParams)
        .then((message) => {
          msg = "";
          console.log("Message sent. SID:", message.sid);
        })
        .catch((error) => console.error("Error sending message:", error));
      // $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
    })
    .catch((error) => {
      console.error("Error:", error);
    });
});

app.post("/downloadtodayreport", (req, res) => {
  let { collectiondate, collectionshift } = req.body;
  const parts = collectiondate.split("-");
  collectiondate = `${parts[2]}/${parts[1]}/${parts[0]}`;
  let Shiftp = collectionshift;

  if (collectionshift == "Morning") {
    collectionshift = "M";
  } else {
    collectionshift = "E";
  }

  try {
    // Read the Excel file
    const Database = XLSX.readFile("Database.xlsx");
    let memberlist = Database.Sheets["Member_List"];
    const range = XLSX.utils.decode_range(memberlist["!ref"]);
    let Member_ID = [];
    let totalamt = 0;
    let totallette = 0;
    let head = {
      Member_Id: "ID",
      Fat: "Fat",
      Snf: "Snf",
      Weight: "Weight",
      Rate: "Rate",
      Total_Amount: "Total_Amount",
    };
    Member_ID.push(head);
    let count = 0;

    for (let i = 1; i <= range.e.r; i++) {
      let MemberID = memberlist[XLSX.utils.encode_cell({ r: i, c: 0 })]?.v;

      let membersheet = Database.Sheets[MemberID];
      const countrange = XLSX.utils.decode_range(membersheet["!ref"]);
      for (let j = 1; j < countrange.e.r; j++) {
        let Date = membersheet[XLSX.utils.encode_cell({ r: j, c: 0 })]?.v;
        let Fat = membersheet[XLSX.utils.encode_cell({ r: j, c: 1 })]?.v;
        let Snf = membersheet[XLSX.utils.encode_cell({ r: j, c: 2 })]?.v;
        let Weight = membersheet[XLSX.utils.encode_cell({ r: j, c: 3 })]?.v;
        let Rate = membersheet[XLSX.utils.encode_cell({ r: j, c: 4 })]?.v;
        let Total_Amount =
          membersheet[XLSX.utils.encode_cell({ r: j, c: 5 })]?.v;
        let Shift = membersheet[XLSX.utils.encode_cell({ r: j, c: 6 })]?.v;

        if (Date == collectiondate && collectionshift == Shift) {
          let milkdata = {
            Member_Id: MemberID,
            Fat: Fat,
            Snf: Snf,
            Weight: Weight,
            Rate: Rate,
            Total_Amount: Total_Amount,
          };

          Member_ID.push(milkdata);
          totalamt += parseFloat(Total_Amount);
          totallette += parseFloat(Weight);
          count += 1;
        }
      }
    }
    let roundedNum = parseFloat(totalamt.toFixed(2));
    totallette = parseFloat(totallette.toFixed(2));
    const Center_Name = Database.Sheets["S_D"];
    const Centerno = Center_Name[XLSX.utils.encode_cell({ r: 1, c: 0 })]?.v;
    const CenterName = Center_Name[XLSX.utils.encode_cell({ r: 1, c: 2 })]?.v;
    const Mobile_Number =
      Center_Name[XLSX.utils.encode_cell({ r: 1, c: 4 })]?.v;

    const doc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="today_collection_report.pdf"'
    );
    doc.pipe(res);
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("Center Number:  " + Centerno, { align: "center" });
    doc.moveDown();
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text(CenterName, { align: "center" });
    doc.moveDown();
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("Mobile Number : " + Mobile_Number, { align: "center" });
    doc.moveDown();
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("Today Collection Report", { align: "center" });
    doc.moveDown();
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("Date : " + collectiondate + "       Shift : " + Shiftp, {
        align: "center",
      });
    doc.moveDown();
    // Draw horizontal line
    const lineY = doc.y + 1;
    doc
      .moveTo(50, lineY)
      .lineTo(doc.page.width - 50, lineY)
      .stroke();
    doc.moveDown();
    // Draw table header
    const startX = 30;
    const startY = doc.y;
    const cellWidth = 70;
    const cellPadding = 1;

    // Draw table rows
    Member_ID.forEach((data, index) => {
      const y = doc.y;
      const totalWidth =
        Object.keys(data).length * cellWidth +
        cellPadding * (Object.keys(data).length - 1);
      const startXForRow = (doc.page.width - totalWidth) / 2;

      Object.keys(data).forEach((key, index) => {
        doc.text(data[key], startXForRow + index * cellWidth + cellPadding, y);
      });
      doc.moveDown();
    });

    // Calculate total members, total collection amount, and total litre
    const totalMembersText = "Total Members:  " + count;
    const totalAmountText = "Total Collection Amount:  " + roundedNum;
    const totalLitreText = "Total Amount of Litre:  " + totallette;

    doc.text(totalMembersText, 30, doc.y);
    doc.moveDown();
    doc.text(totalAmountText, 30, doc.y);
    doc.moveDown();
    doc.text(totalLitreText, 30, doc.y);

    doc.end();
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ error: "Failed to Download Today Collection Report" });
  }
});

app.post("/payment_Report_Download", (req, res) => {
  let { fromdate, todate } = req.body;
  let parts = fromdate.split("-");
  let fromDateObj = new Date(parts[0], parts[1] - 1, parts[2]);

  parts = todate.split("-");
  let toDateObj = new Date(parts[0], parts[1] - 1, parts[2]);

  try {
    const Database = XLSX.readFile("Database.xlsx");
    const memberList = Database.Sheets["Member_List"];
    const range = XLSX.utils.decode_range(memberList["!ref"]);

    const memberData = [];
    let alltotamt = 0;
    let alltotlit = 0;
    for (let i = 1; i <= range.e.r; i++) {
      let memberID = memberList[XLSX.utils.encode_cell({ r: i, c: 0 })]?.v;
      let memberSheet = Database.Sheets[memberID];
      const countRange = XLSX.utils.decode_range(memberSheet["!ref"]);
      const memberInfo = {
        Member_Id: memberID,
        Fat: 0,
        Snf: 0,
        Weight: 0,
        Rate: 0,
        Total_Amount: 0,
        Count: 0,
      };

      for (let j = 1; j <= countRange.e.r; j++) {
        let date = moment(
          memberSheet[XLSX.utils.encode_cell({ r: j, c: 0 })]?.v,
          "DD-MM-YYYY"
        );
        if (date >= fromDateObj && date <= toDateObj) {
          let Fat = parseFloat(
            memberSheet[XLSX.utils.encode_cell({ r: j, c: 1 })]?.v
          );
          let Snf = parseFloat(
            memberSheet[XLSX.utils.encode_cell({ r: j, c: 2 })]?.v
          );
          let Weight = parseFloat(
            memberSheet[XLSX.utils.encode_cell({ r: j, c: 3 })]?.v
          );
          let Rate = parseFloat(
            memberSheet[XLSX.utils.encode_cell({ r: j, c: 4 })]?.v
          );
          let Total_Amount = parseFloat(
            memberSheet[XLSX.utils.encode_cell({ r: j, c: 5 })]?.v
          );

          memberInfo.Fat += Fat;
          memberInfo.Snf += Snf;
          memberInfo.Weight += Weight;
          memberInfo.Rate += Rate;
          memberInfo.Total_Amount += Total_Amount;
          memberInfo.Count++;
        }
      }
      alltotamt += memberInfo.Total_Amount;
      alltotlit += memberInfo.Weight;

      if (memberInfo.Count > 0) {
        memberInfo.Fat /= memberInfo.Count;
        memberInfo.Snf /= memberInfo.Count;
        memberInfo.Rate /= memberInfo.Count;
        memberData.push(memberInfo);
      }
    }

    alltotamt = parseFloat(alltotamt.toFixed(2));
    alltotlit = parseFloat(alltotlit.toFixed(2));
    // Generating PDF
    const Center_Name = Database.Sheets["S_D"];
    const Centerno = Center_Name[XLSX.utils.encode_cell({ r: 1, c: 0 })]?.v;
    const CenterName = Center_Name[XLSX.utils.encode_cell({ r: 1, c: 2 })]?.v;
    const Mobile_Number =
      Center_Name[XLSX.utils.encode_cell({ r: 1, c: 4 })]?.v;

    const doc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="today_collection_report.pdf"'
    );
    doc.pipe(res);
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("Center Number:  " + Centerno, { align: "center" });
    doc.moveDown();
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text(CenterName, { align: "center" });
    doc.moveDown();
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("Mobile Number : " + Mobile_Number, { align: "center" });
    doc.moveDown();
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("Payment Report", { align: "center" });
    doc.moveDown();
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("Date : " + fromdate + "       Shift : " + todate, {
        align: "center",
      });
    doc.moveDown();
    // Draw horizontal line
    const lineY = doc.y + 1;
    doc
      .moveTo(50, lineY)
      .lineTo(doc.page.width - 50, lineY)
      .stroke();
    doc.moveDown();

    // Draw table header
    const tableHeader = [
      "Member ID",
      "Avg Fat",
      "Avg Snf",
      "T Weight",
      "Avg Rate",
      "T Amount",
    ];
    const startX =
      (doc.page.width -
        (tableHeader.length * 70 + (tableHeader.length - 1) * 1)) /
      2;
    const startY = doc.y;
    const cellWidth = 70;
    const cellPadding = 1;
    // Draw horizontal line

    doc.font("Helvetica-Bold");
    tableHeader.forEach((header, index) => {
      doc.text(
        header,
        startX + index * cellWidth + index * cellPadding,
        startY
      );
    });
    const lineYe = doc.y + 1;
    doc
      .moveTo(50, lineYe)
      .lineTo(doc.page.width - 50, lineYe)
      .stroke();
    doc.moveDown();

    // Draw table rows
    memberData.forEach((member, index) => {
      const y = doc.y;
      const rowData = [
        member.Member_Id,
        member.Fat.toFixed(2),
        member.Snf.toFixed(2),
        member.Weight.toFixed(2),
        member.Rate.toFixed(2),
        member.Total_Amount.toFixed(2),
      ];

      doc.font("Helvetica");
      rowData.forEach((data, index) => {
        doc.text(data, startX + index * cellWidth + index * cellPadding, y);
      });

      doc.moveDown();
    });

    const totalAmountText = "Total Collection Amount:  " + alltotamt;
    const totalLitreText = "Total Amount of Litre:  " + alltotlit;

    doc.font("Helvetica-Bold").text(totalAmountText, 30, doc.y);
    doc.moveDown();
    doc.font("Helvetica-Bold").text(totalLitreText, 30, doc.y);

    doc.end();
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ error: "Failed to Download Today Collection Report" });
  }
});

const PORT = process.env.PORT || 8081; // Use the provided port or default to 8081
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}...`);
});

// /////////////////////////////////////////////////////////

app.post("/api/download-pdf", async (req, res) => {
  console.log("hello");
  const data = req.body.data;

  // Create a new PDF document
  const doc = new PDFDocument();

  // Pipe the PDF document to a file
  const writeStream = fs.createWriteStream("./chart.pdf");
  doc.pipe(writeStream);

  // Add content to the PDF document
  doc.fontSize(20).text("Chart Data", { align: "center" });
  data.forEach((item) => {
    doc.fontSize(14).text(`${item.name}: ${item.uv}`);
  });

  // Finalize the PDF document
  doc.end();

  // Once the PDF is written, send it as a download
  writeStream.on("finish", () => {
    res.download("./chart.pdf", "chart.pdf", (err) => {
      if (err) {
        res.status(500).send("Error downloading PDF");
      } else {
        // Delete the generated PDF file after download
        fs.unlinkSync("./chart.pdf");
      }
    });
  });
});

function healthreportpass(membercode, fromdate, todate) {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn("python", ["Healthreport.py"]);

    // Send input data to Python script
    pythonProcess.stdin.write(`${membercode},${fromdate},${todate}`);
    pythonProcess.stdin.end();

    // Receive prediction result from Python script
    pythonProcess.stdout.on("data", (data) => {
      resolve(data.toString().trim());
    });

    // Handle any errors
    pythonProcess.stderr.on("data", (data) => {
      reject(data.toString().trim());
    });

    // Handle process exit
    pythonProcess.on("exit", (code) => {
      if (code !== 0) {
        reject(`Python script exited with code ${code}`);
      }
    });
  });
}

app.post("/healthreportdata", async (req, res) => {
  let { membercode, fromdate, todate } = req.body;
  try {
    const result = await healthreportpass(membercode, fromdate, todate);
    const graphdata = JSON.parse(result);
    res.json({ graphdata });
//     const result = await healthreportpass(membercode, fromdate, todate);
// console.log("Result from Python script:", result);
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while processing the request.");
  }
});
