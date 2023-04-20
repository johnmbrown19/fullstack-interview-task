// Import required modules
const express = require("express");
const bodyParser = require("body-parser");
const config = require("config");
const axios = require("axios");
const fs = require("fs");
const R = require("ramda");

// Instantiate the Express app
const app = express();

// Add the JSON body-parser middleware with a 10mb limit
app.use(bodyParser.json({ limit: "10mb" }));

// Route to fetch investment details by ID
app.get("/investments/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { data } = await axios.get(`${config.investmentsServiceUrl}/investments/${id}`);
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

const buildCsvData = (investments, companies) =>
  investments.map((investment) => {
    const company = companies.find((c) => c.id === investment.financialCompanyId);

    return {
      User: investment.userId.replace(/"/g, '""'),
      FirstName: investment.firstName.replace(/"/g, '""'),
      LastName: investment.lastName.replace(/"/g, '""'),
      Date: investment.date.replace(/"/g, '""'),
      Holding: company ? company.name.replace(/"/g, '""') : "",
      Value: (investment.investmentTotal * investment.investmentPercentage).toFixed(2),
    };
  });


app.get("/generate-report", async (req, res) => {
  try {
    const [investmentsResponse, companiesResponse] = await Promise.all([
      axios.get(`${config.investmentsServiceUrl}/investments`),
      axios.get(`${config.financialCompaniesServiceUrl}/companies`),
    ]);

    const csvData = buildCsvData(investmentsResponse.data, companiesResponse.data);

    const csvContent = R.join(
      "\n",
      R.concat(
        ['"User","First Name","Last Name","Date","Holding","Value"'],
        R.map(R.pipe(R.values, R.map(R.concat('"', R.__, '"')), R.join(",")), csvData)
      )
    );

    const csvFilePath = `${__dirname}/report.csv`;

    try {
      await fs.promises.writeFile(csvFilePath, csvContent);
    } catch (error) {
      console.error(error);
      return res.status(500).send({ message: "An error occurred while saving the report.", error });
    }

    const csvContentEncoded = encodeURIComponent(csvContent);

    await axios.post(`${config.investmentsServiceUrl}/investments/export`, { csvContentEncoded });

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

