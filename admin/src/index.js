// Import required modules
const express = require("express");
const bodyParser = require("body-parser");
const config = require("config");
const axios = require("axios"); // Replaced 'request' with 'axios'
const fs = require("fs");
const CsvWriter = require("csv-writer").createObjectCsvWriter;
const { stringify } = require('csv-stringify');

// Instantiate the Express app
const app = express();

// Add the JSON body-parser middleware with a 10mb limit
app.use(bodyParser.json({ limit: "10mb" }));

// Route to fetch investment details by ID
app.get("/investments/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { data } = await axios.get(`${config.investmentsServiceUrl}/investments/${id}`); // Use 'axios' instead of 'request'
    res.send(data);
  } catch (error) {
    console.error(error);
    if (error.response && error.response.status === 404) {
      res.status(404).send({ message: "Investment not found" });
    } else {
      res.sendStatus(500);
    }
  }
});

app.get("/generate-report", async (req, res) => {
  try {
    const [investmentsResponse, companiesResponse] = await Promise.all([
      axios.get(`${config.investmentsServiceUrl}/investments`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }),
      axios.get(`${config.financialCompaniesServiceUrl}/companies`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })
    ]);

    const investments = investmentsResponse.data;
    const companies = companiesResponse.data;

    const csvData = investments.map((investment) => {
      const company = companies.find((c) => c.id === investment.financialCompanyId);

      return {
        User: investment.userId.replace(/"/g, '""'), // manually escape quote characters
        FirstName: investment.firstName.replace(/"/g, '""'),
        LastName: investment.lastName.replace(/"/g, '""'),
        Date: investment.date.replace(/"/g, '""'),
        Holding: company ? company.name.replace(/"/g, '""') : "",
        Value: investment.investmentTotal * investment.investmentPercentage,
      };
    });


    //  escape any quote characters in the CSV data (w/ CSV-Stringify)
    const csvContent = stringify(csvData, {
      header: true,
      quote: '"',
      escape: '"',
      doubleQuote: true,
      empty: "",
      columns: [
        { key: "User", header: "User" },
        { key: "FirstName", header: "First Name" },
        { key: "LastName", header: "Last Name" },
        { key: "Date", header: "Date" },
        { key: "Holding", header: "Holding" },
        { key: "Value", header: "Value" },
      ],
    });

    const csvFilePath = `${__dirname}/report.csv`;

    try {
      await fs.promises.writeFile(csvFilePath, csvContent);
    } catch (error) {
      console.error(error); // Add this line to log the error
      return res.status(500).send({ message: "An error occurred while saving the report.", error });
    }


    const csvContentEncoded = encodeURIComponent(csvContent);

    await axios.post(`${config.investmentsServiceUrl}/investments/export`, { csvContentEncoded }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    res.status(200).send({ message: "CSV report generated and sent." });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "An error occurred while generating the report.", error });
  }
});

// Start the server
const server = app.listen(process.env.NODE_ENV === 'test' ? 0 : config.port, (err) => {
  if (err) {
    console.error("Error occurred starting the server", err);
    process.exit(1);
  }
  console.log(`Server running on port ${config.port}`);
});

module.exports = app;
