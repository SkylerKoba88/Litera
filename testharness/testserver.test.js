// THIS IS WHERE WE WILL GENERATE TEST CODE FOR SERVER.ts
const request = require("supertest");
const app = require("../server");

// test server.ts methods
// test GET imagekit
describe("GET /api/imagekit/auth", () => {
    // test success response
    test("should return status code 200, expected body, & expected info", async () => {
        const response = await request(app).get('/api/imagekit/auth');

        expect(response.statusCode).toBe(200); // check for status code
        expect(response.body).toEqual({message: "Success"});
        expect(response.body).toHaveProperty("message") // checks for specific property
    });
    // test error response
    test("should return 404", async () => {
        const response = await request(app).get("/invalidroute");

        expect(response.statusCode).toBe(404);
    });
});

// test POST imagekit
describe("POST /api/imagekit/upload-base64", () => {
    // tesst success response
    test("should return status code 201, expected body, & expected info", async () => {
        const response = await request(app).post('/api/imagekit/upload-base64');
        // might need to declare basic file test case variables to test this accurately

        expect(response.statusCode).toBe(201);
        expect(response.body).toEqual({message: "Success"});
        expect(response.body).toHaveProperty("message");
    });
    
    // test error response: Base64 required
    test("should return 400", async () => {
        const response = await request(app).post("/api/imagekit/upload-base64");
        // declare test values that cause this to fail

        expect(response.statusCode).toBe(400);
    })

    // test error response: Upload Failed
    test("should return 500", async () => {
        const response = await request(app).post("/invalidroute");

        expect(response.statusCode).toBe(500);
    })
});

// test Render.com connection
describe("GET /^\/(?!api).*/", () => {
    // tesst success response
    test("should return status code 200, expected body, & expected info", async () => {
        const response = await request(app).get(/^\/(?!api).*/);

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({message: "Success"});
        expect(response.body).toHaveProperty("message");
    });

    // test error response
    test("should return 404", async () => {
        const response = await request(app).get("/invalidroute");

        expect(response.statusCode).toBe(404);
    });
});

// test port connection
describe("GET process.env.PORT", () => {
    test("should return status code 200 & expected body", async () => {
        const response = await request(app).get(process.env.PORT);

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({message: "Success"});
    });

    // test error response
    test("should return status code 404", async () => {
        const response = await request(app).get("invalidroute");

        expect(response.statusCode).toBe(404);
    })
});

