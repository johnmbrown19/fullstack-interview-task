const request = require("supertest");
const app = require("../index");
const config = require("config");
const nock = require("nock");
const axios = require("axios");
const { parse } = require("csv-parse");

// Start the app with a random port for testing
let server;
beforeAll((done) => {
  server = app.listen(0, () => {
    config.port = server.address().port;
    done();
  });
});

// Close the server after tests
afterAll((done) => {
  server.close(done);
});

// Test the /investments/:id endpoint
describe("GET /investments/:id", () => {
    // Mock a successful request to the investments service
    const validId = "valid-id";
    const investmentsMock = nock(config.investmentsServiceUrl)
      .get(`/investments/${validId}`)
      .reply(200, { id: validId });
  
    // Mock a 404 request to the investments service
    const invalidId = "invalid-id";
    const investmentsNotFoundMock = nock(config.investmentsServiceUrl)
      .get(`/investments/${invalidId}`)
      .reply(404);
  
    // Test for successful response
    it("should return investment data for a valid ID", async () => {
      const response = await request(app).get(`/investments/${validId}`);
  
      expect(response.status).toEqual(200);
      expect(response.body).toHaveProperty("id", validId);
  
      // Assert that the investments service was called
      expect(investmentsMock.isDone()).toBe(true);
    });
  
    // Test for 404 error when ID is not found
    it("should return a 404 error for an invalid ID", async () => {
      const response = await request(app).get(`/investments/${invalidId}`);
  
      expect(response.status).toEqual(404);
      expect(response.body).toEqual({ message: "Investment not found" });
  
      // Assert that the investments service was called
      expect(investmentsNotFoundMock.isDone()).toBe(true);
    });
  });
  
  
// Test the /generate-report endpoint
describe("GET /generate-report", () => {
    
  
  it("should return a 500 error when the financial companies service is down", async () => {
    // Mock a successful request to the investments service
    nock(config.investmentsServiceUrl)
      .get("/investments")
      .reply(200, [
        { 
          id: "1",
          userId: "123",
          financialCompanyId: "1",
          date: "2022-01-01",
          investmentTotal: 1000,
          investmentPercentage: 0.5
        },
        { 
          id: "2",
          userId: "456",
          financialCompanyId: "2",
          date: "2022-02-01",
          investmentTotal: 2000,
          investmentPercentage: 0.3
        },
        { 
          id: "3",
          userId: "789",
          financialCompanyId: "3",
          date: "2022-03-01",
          investmentTotal: 3000,
          investmentPercentage: 0.2
        }
      ]);
    
    // Mock a failed request to the financial companies service
    nock(config.financialCompaniesServiceUrl)
      .get("/companies")
      .replyWithError("Financial companies service down");
    
    const response = await request(app).get("/generate-report");
    
    expect(response.status).toEqual(500);
    expect(response.body).toEqual({
      message: "An error occurred while generating the report.",
      error: {
        message: "Financial companies service down",
        name: "Error",
        stack: expect.any(String),
        config: expect.any(Object),
        status: null
      }
    });
  });
  
// Test when the financial companies service returns an error
it("should return a 500 error when the financial companies service returns an error", async () => {
    // Mock a successful request to the investments service
    nock(config.investmentsServiceUrl)
      .get("/investments")
      .reply(200, [
        { 
          id: "1",
          userId: "123",
          financialCompanyId: "1",
          date: "2022-01-01",
          investmentTotal: 1000,
          investmentPercentage: 0.5
        },
        { 
          id: "2",
          userId: "456",
          financialCompanyId: "2",
          date: "2022-02-01",
          investmentTotal: 2000,
          investmentPercentage: 0.3
        },
        { 
          id: "3",
          userId: "789",
          financialCompanyId: "3",
          date: "2022-03-01",
          investmentTotal: 3000,
          investmentPercentage: 0.2
        }
      ]);
  
    // Mock a failed request to the financial companies service
    nock(config.financialCompaniesServiceUrl)
      .get("/companies")
      .replyWithError(new Error("Error"));
  
    const response = await request(app).get("/generate-report");
  
    expect(response.status).toEqual(500);
    expect(response.body).toEqual({ 
      message: "An error occurred while generating the report.",
      error: {
        message: "Error",
        name: "Error",
        stack: expect.any(String),
        config: expect.any(Object),
        status: null
      }
    });
  });  
})