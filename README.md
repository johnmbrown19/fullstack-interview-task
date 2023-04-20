# Moneyhub Tech Test - Investments and Holdings

At Moneyhub we use microservices to partition and separate the concerns of the codebase. In this exercise we have given you an example `admin` service and some accompanying services to work with. In this case the admin service backs a front end admin tool allowing non-technical staff to interact with data.

A request for a new admin feature has been received

## Requirements

- An admin is able to generate a csv formatted report showing the values of all user holdings
    - The report should be sent to the `/export` route of the investments service
    - The investments service expects the csv report to be sent as json
    - The csv should contain a row for each holding matching the following headers
    |User|First Name|Last Name|Date|Holding|Value|
    - The holding should be the name of the holding account given by the financial-companies service
    - The holding value can be calculated by `investmentTotal * investmentPercentage`
- Ensure use of up to date packages and libraries (the service is known to use deprecated packages)
- Make effective use of git

We prefer:
- Functional code 
- Ramda.js (this is not a requirement but feel free to investigate)
- Unit testing

### Notes
All of you work should take place inside the `admin` microservice

For the purposes of this task we would assume there are sufficient security middleware, permissions access and PII safe protocols, you do not need to add additional security measures as part of this exercise.

You are free to use any packages that would help with this task

We're interested in how you break down the work and build your solution in a clean, reusable and testable manner rather than seeing a perfect example, try to only spend around *1-2 hours* working on it

## Deliverables
**Please make sure to update the readme with**:

- Your new routes
- How to run any additional scripts or tests you may have added
- Relating to the task please add answers to the following questions;
    1. How might you make this service more secure?
    2. How would you make this solution scale to millions of records?
    3. What else would you have liked to improve given more time?
  

On completion email a link to your repository to your contact at Moneyhub and ensure it is publicly accessible.

## Getting Started

Please clone this service and push it to your own github (or other) public repository

To develop against all the services each one will need to be started in each service run

```bash
npm start
or
npm run develop
```

The develop command will run nodemon allowing you to make changes without restarting

The services will try to use ports 8081, 8082 and 8083

Use Postman or any API tool of you choice to trigger your endpoints (this is how we will test your new route).

### Existing routes
We have provided a series of routes 

Investments - localhost:8081
- `/investments` get all investments
- `/investments/:id` get an investment record by id
- `/investments/export` expects a csv formatted text input as the body

Financial Companies - localhost:8082
- `/companies` get all companies details
- `/companies/:id` get company by id

Admin - localhost:8083
- `/investments/:id` get an investment record by id

## Deliverable Update

### New Routes
Admin - localhost:8083
- `/generate-report` generate CSV report and send to `/investments/export` as JSON

### New Routes
To run Jest test suite use the following command from within '/admin' directory:
- npm test

### Process
- Added inline comments throughout
- Replaced request module with axios
- Added fs, CsvWriter, and CsvStringify as imports
- '/investments/:id' route handler updated to now use async/await w/ axios module; improved error handling
- New route '/generate-report' created - generates a CSV report with investment data
- Modified server startup code
- Test file created that contains test for two API endpoints - '/investments/:id' and '/generate-report'

### Q+A
1. To make this service more secure, some of the following measures can be taken:
- Implement HTTPS for secure communication between the client and the server.
- Implement proper authentication and authorisation to ensure only authorised users have access.
- Implement input validation and sanitization to prevent injection attacks and ensure data integrity.
- Implement rate limiting to prevent brute force attacks.
- Implement logging and monitoring to detect and respond to any security incidents or anomalies.


2. To make this solution scale to millions of records, some of the following measures can be taken:
- Use a distributed DB (e.g. MongoDB) to handle the large volume of data.
- Use caching to reduce load on the DB/improve response times.
- Use load balancing to distribute requests across multiple servers to handle increased load.
- Use horizontal scaling by adding more servers to the system to handle the increased load.


3. Given more time, I would have liked to improve the following aspects of the solution:
- Write more unit and integration tests to improve  overall test coverage.
- Implement better error handling and error messages/make more meaningful.
- Implement better validation and sanitisation of user input to improve data integrity and prevent injection attacks.
- Improve error reporting mechanism to notify admins of any errors/anomalies.
- Implement filtering and aggregation of data to provide more insights.