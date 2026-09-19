import test from "node:test";
import assert from "node:assert/strict";
import { Builder, By, until } from "selenium-webdriver";

const BASE_URL = "http://localhost:8000";

async function createDriver() {
    return await new Builder()
        .forBrowser("firefox")
        .build();
}

// HOME
test("Smoke test - Home page loads", async () => {
    const driver = await createDriver();

    try {
        await driver.get(`${BASE_URL}/index.html`);

        assert.equal(
            await driver.getTitle(),
            "Doughy Designs — Custom Cookies, Your Way",
            "Home page should load with the correct title"
        );

        const heading = await driver.findElement(By.css("h1"));

        assert.ok(
            (await heading.getText()).includes("CUSTOM COOKIES"),
            "Home page heading should be present"
        );
    } finally {
        await driver.quit();
    }
});

// DESIGNS
test("Smoke test - Designs page loads", async () => {
    const driver = await createDriver();

    try {
        await driver.get(`${BASE_URL}/designs.html`);

        assert.equal(
            await driver.getTitle(),
            "Choose a Design — Doughy Designs",
            "Designs page should load with the correct title"
        );

        const heading = await driver.findElement(By.css("h1"));

        assert.equal(
            await heading.getText(),
            "Choose a design",
            "Designs page heading should be present"
        );

        const designGrid = await driver.findElement(By.id("design-grid"));

        await driver.wait(
            until.elementLocated(By.css("#design-grid .design-card")),
            5000
        );

        assert.ok(
            await designGrid.isDisplayed(),
            "Design grid should be displayed"
        );
    } finally {
        await driver.quit();
    }
});

// CUSTOMIZE
test("Smoke test - Customize page loads", async () => {
    const driver = await createDriver();

    try {
        await driver.get(`${BASE_URL}/customize.html`);

        assert.equal(
            await driver.getTitle(),
            "Customize — Doughy Designs",
            "Customize page should load with the correct title"
        );

        const heading = await driver.findElement(By.css("h1"));

        assert.equal(
            await heading.getText(),
            "Customize your cookie",
            "Customize page heading should be present"
        );

        const options = await driver.findElements(
            By.css("[data-custom-type]")
        );

        assert.equal(
            options.length,
            3,
            "Customize page should have three design type options"
        );
    } finally {
        await driver.quit();
    }
});

// CUSTOMIZE - WRITING OPTION
test("Smoke test - Custom writing option works", async () => {
    const driver = await createDriver();

    try {
        await driver.get(`${BASE_URL}/customize.html`);

        const writingOption = await driver.findElement(
            By.css('[data-custom-type="writing"]')
        );

        await writingOption.click();

        const messageInput = await driver.findElement(
            By.id("custom-message")
        );

        assert.ok(
            await messageInput.isDisplayed(),
            "Custom writing input should be displayed"
        );

        await messageInput.sendKeys("Happy Birthday!");

        const preview = await driver.findElement(
            By.id("writing-preview")
        );

        assert.equal(
            await preview.getText(),
            "HAPPY BIRTHDAY!",
            "Writing preview should display the entered message"
        );
    } finally {
        await driver.quit();
    }
});

// ABOUT
test("Smoke test - About page loads", async () => {
    const driver = await createDriver();

    try {
        await driver.get(`${BASE_URL}/about.html`);

        assert.equal(
            await driver.getTitle(),
            "About — Doughy Designs",
            "About page should load with the correct title"
        );

        const heading = await driver.findElement(By.css("h1"));

        assert.equal(
            await heading.getText(),
            "About Doughy Designs",
            "About page heading should be present"
        );
    } finally {
        await driver.quit();
    }
});

// CONTACT
test("Smoke test - Contact page loads", async () => {
    const driver = await createDriver();

    try {
        await driver.get(`${BASE_URL}/contact.html`);

        assert.equal(
            await driver.getTitle(),
            "Contact — Doughy Designs",
            "Contact page should load with the correct title"
        );

        const heading = await driver.findElement(By.css("h1"));

        assert.equal(
            await heading.getText(),
            "Contact us",
            "Contact page heading should be present"
        );

        const form = await driver.findElement(By.id("contact-form"));

        assert.ok(
            await form.isDisplayed(),
            "Contact form should be displayed"
        );
    } finally {
        await driver.quit();
    }
});

// CONTACT - VALIDATION
test("Smoke test - Contact form validation works", async () => {
    const driver = await createDriver();

    try {
        await driver.get(`${BASE_URL}/contact.html`);

        const form = await driver.findElement(By.id("contact-form"));

        await form.submit();

        const alert = await driver.findElement(
            By.id("contact-alert")
        );

        await driver.wait(
            until.elementIsVisible(alert),
            2000
        );

        assert.ok(
            (await alert.getText()).includes("Please fix the following"),
            "Contact form should display validation errors"
        );
    } finally {
        await driver.quit();
    }
});