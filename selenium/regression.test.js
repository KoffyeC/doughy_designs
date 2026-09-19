import test from "node:test";
import assert from "node:assert/strict";
import { Builder, By, until, Key } from "selenium-webdriver";
import path from "node:path";

const BASE_URL = "http://localhost:8000";
const IMAGE_PATH = path.resolve("assets/logo.png");
const REPLACEMENT_IMAGE_PATH = path.resolve("assets/logo-source.png");

async function createDriver() {
    return await new Builder()
        .forBrowser("firefox")
        .build();
}

async function selectPremadeDesign(driver) {
    await driver.get(`${BASE_URL}/designs.html`);

    await driver.wait(
        until.elementLocated(By.css("#design-grid .design-card")),
        5000
    );

    await driver.findElement(
        By.css("#design-grid [data-select]")
    ).click();
}

async function chooseCustomType(driver, type) {
    await driver.get(`${BASE_URL}/customize.html`);

    await driver.findElement(
        By.css(`[data-custom-type="${type}"]`)
    ).click();
}

async function setQuantity(driver, quantity) {
    const quantityInput = await driver.findElement(
        By.id("quantity")
    );

    await quantityInput.clear();
    await quantityInput.sendKeys(String(quantity));
    await quantityInput.sendKeys(Key.TAB);
}

async function completeCustomerForm(driver) {
    await driver.findElement(By.id("full-name"))
        .sendKeys("Test Customer");

    await driver.findElement(By.id("phone"))
        .sendKeys("555-0100");

    await driver.findElement(By.id("email"))
        .sendKeys("test@example.com");

    await driver.findElement(By.id("address"))
        .sendKeys("123 Test Street");

    await driver.findElement(By.id("city"))
        .sendKeys("Milwaukee");

    await driver.findElement(By.id("state"))
        .sendKeys("WI");

    await driver.findElement(By.id("zip"))
        .sendKeys("53202");
}

// ============================================================
// DESIGN CATALOG
// ============================================================

test("Regression test - Design category filter works", async () => {
    const driver = await createDriver();

    try {
        await driver.get(`${BASE_URL}/designs.html`);

        await driver.wait(
            until.elementLocated(By.css("#design-grid .design-card")),
            5000
        );

        const birthdayFilter = await driver.findElement(
            By.css('[data-category="birthday"]')
        );

        await birthdayFilter.click();

        const cards = await driver.findElements(
            By.css("#design-grid .design-card")
        );

        assert.ok(
            cards.length > 0,
            "Birthday filter should display designs"
        );

        for (const card of cards) {
            const category = await card.findElement(
                By.css(".category")
            );

            assert.equal(
                await category.getText(),
                "BIRTHDAY",
                "Filtered cards should belong to the Birthday category"
            );
        }
    } finally {
        await driver.quit();
    }
});

test("Regression test - Selecting a pre-made design works", async () => {
    const driver = await createDriver();

    try {
        await selectPremadeDesign(driver);

        const selectedCard = await driver.findElement(
            By.css("#design-grid .design-card.is-selected")
        );

        assert.ok(
            await selectedCard.isDisplayed(),
            "Selected design should be marked as selected"
        );

        const selectionBar = await driver.findElement(
            By.id("selection-bar")
        );

        assert.ok(
            await selectionBar.isDisplayed(),
            "Selection bar should be displayed"
        );
    } finally {
        await driver.quit();
    }
});

test("Regression test - Custom writing option navigates to customize", async () => {
    const driver = await createDriver();

    try {
        await driver.get(`${BASE_URL}/designs.html`);

        await driver.findElement(
            By.css('[data-design-type="writing"]')
        ).click();

        await driver.wait(
            until.urlContains("customize.html"),
            5000
        );

        assert.ok(
            (await driver.getCurrentUrl()).includes("customize.html"),
            "Custom writing should navigate to customize page"
        );
    } finally {
        await driver.quit();
    }
});

// ============================================================
// CUSTOMIZATION
// ============================================================

test("Regression test - Customize requires a selection", async () => {
    const driver = await createDriver();

    try {
        await driver.get(`${BASE_URL}/customize.html`);

        // Clear any automatically selected state.
        await driver.executeScript(
            "sessionStorage.clear(); location.reload();"
        );

        await driver.wait(
            until.elementLocated(By.id("continue-customize")),
            5000
        );

        await driver.findElement(
            By.id("continue-customize")
        ).click();

        const error = await driver.findElement(
            By.id("customize-error")
        );

        assert.ok(
            await error.isDisplayed(),
            "Customize page should display an error"
        );

        assert.ok(
            (await error.getText()).includes("Choose"),
            "Customize error should explain that a design type is required"
        );
    } finally {
        await driver.quit();
    }
});

test("Regression test - Empty custom writing is rejected", async () => {
    const driver = await createDriver();

    try {
        await chooseCustomType(driver, "writing");

        await driver.findElement(
            By.id("continue-customize")
        ).click();

        const error = await driver.findElement(
            By.id("customize-error")
        );

        assert.ok(
            await error.isDisplayed(),
            "Empty writing should display an error"
        );

        assert.ok(
            (await error.getText()).includes("Enter the message"),
            "Writing error should explain that a message is required"
        );
    } finally {
        await driver.quit();
    }
});

test("Regression test - Custom writing continues to order details", async () => {
    const driver = await createDriver();

    try {
        await chooseCustomType(driver, "writing");

        await driver.findElement(
            By.id("custom-message")
        ).sendKeys("Congratulations!");

        await driver.findElement(
            By.id("continue-customize")
        ).click();

        await driver.wait(
            until.urlContains("order-details.html"),
            5000
        );

        const summary = await driver.findElement(
            By.id("summary-design")
        );

        assert.ok(
            (await summary.getText()).includes("Congratulations!"),
            "Order details should preserve the custom message"
        );
    } finally {
        await driver.quit();
    }
});

// ============================================================
// CUSTOM IMAGE
// ============================================================

test("Regression test - Custom image upload works", async () => {
    const driver = await createDriver();

    try {
        await chooseCustomType(driver, "image");

        const fileInput = await driver.findElement(
            By.id("image-file")
        );

        await fileInput.sendKeys(IMAGE_PATH);

        const imagePreview = await driver.findElement(
            By.id("image-preview")
        );

        await driver.wait(
            until.elementIsVisible(imagePreview),
            5000
        );

        assert.ok(
            await imagePreview.isDisplayed(),
            "Uploaded image should appear in the cookie preview"
        );

        assert.equal(
            await imagePreview.getAttribute("alt"),
            "Uploaded design: logo.png",
            "Uploaded image should have the correct name"
        );

        const imageActions = await driver.findElement(
            By.id("image-actions")
        );

        assert.ok(
            await imageActions.isDisplayed(),
            "Image replace/remove controls should appear"
        );
    } finally {
        await driver.quit();
    }
});

test("Regression test - Custom image can be resized", async () => {
    const driver = await createDriver();

    try {
        await chooseCustomType(driver, "image");

        await driver.findElement(
            By.id("image-file")
        ).sendKeys(IMAGE_PATH);

        const imagePreview = await driver.findElement(
            By.id("image-preview")
        );

        await driver.wait(
            until.elementIsVisible(imagePreview),
            5000
        );

        const initialWidth = await imagePreview.getCssValue("width");

        const sizeInput = await driver.findElement(
            By.id("image-size")
        );

        await driver.executeScript(
            `
            arguments[0].value = "120";
            arguments[0].dispatchEvent(
                new Event("input", { bubbles: true })
            );
            `,
            sizeInput
        );

        const resizedWidth = await imagePreview.getCssValue("width");

        assert.notEqual(
            resizedWidth,
            initialWidth,
            "Changing image size should change the preview size"
        );
    } finally {
        await driver.quit();
    }
});

test("Regression test - Custom image can be moved", async () => {
    const driver = await createDriver();

    try {
        await chooseCustomType(driver, "image");

        await driver.findElement(
            By.id("image-file")
        ).sendKeys(IMAGE_PATH);

        const imagePreview = await driver.findElement(
            By.id("image-preview")
        );

        await driver.wait(
            until.elementIsVisible(imagePreview),
            5000
        );

        const initialLeft = await imagePreview.getCssValue("left");
        const initialTop = await imagePreview.getCssValue("top");

        const actions = driver.actions({ async: true });

        await actions
            .move({
                origin: imagePreview,
                x: 1,
                y: 1
            })
            .press()
            .move({
                origin: imagePreview,
                x: 40,
                y: 30
            })
            .release()
            .perform();

        const finalLeft = await imagePreview.getCssValue("left");
        const finalTop = await imagePreview.getCssValue("top");

        assert.ok(
            finalLeft !== initialLeft || finalTop !== initialTop,
            "Dragging the image should change its position"
        );
    } finally {
        await driver.quit();
    }
});

test("Regression test - Custom image can be replaced", async () => {
    const driver = await createDriver();

    try {
        await chooseCustomType(driver, "image");

        const fileInput = await driver.findElement(
            By.id("image-file")
        );

        await fileInput.sendKeys(IMAGE_PATH);

        const imagePreview = await driver.findElement(
            By.id("image-preview")
        );

        await driver.wait(
            until.elementIsVisible(imagePreview),
            5000
        );

        assert.equal(
            await imagePreview.getAttribute("alt"),
            "Uploaded design: logo.png",
            "First image should be uploaded"
        );

        await driver.findElement(
            By.id("replace-image")
        ).click();

        await fileInput.sendKeys(REPLACEMENT_IMAGE_PATH);

        await driver.wait(
            async () => {
                return (
                    await imagePreview.getAttribute("alt")
                ) === "Uploaded design: logo-source.png";
            },
            5000
        );

        assert.equal(
            await imagePreview.getAttribute("alt"),
            "Uploaded design: logo-source.png",
            "Replacement image should be displayed"
        );
    } finally {
        await driver.quit();
    }
});

test("Regression test - Custom image can be removed", async () => {
    const driver = await createDriver();

    try {
        await chooseCustomType(driver, "image");

        await driver.findElement(
            By.id("image-file")
        ).sendKeys(IMAGE_PATH);

        const imagePreview = await driver.findElement(
            By.id("image-preview")
        );

        await driver.wait(
            until.elementIsVisible(imagePreview),
            5000
        );

        await driver.findElement(
            By.id("remove-image")
        ).click();

        assert.equal(
            await imagePreview.isDisplayed(),
            false,
            "Removed image should no longer be displayed"
        );

        const chooseImage = await driver.findElement(
            By.id("choose-image")
        );

        assert.ok(
            await chooseImage.isDisplayed(),
            "Choose image button should return after removing the image"
        );
    } finally {
        await driver.quit();
    }
});

// ============================================================
// PRICING
// ============================================================

test("Regression test - Pre-made pricing and bulk discounts work", async () => {
    const driver = await createDriver();

    try {
        await selectPremadeDesign(driver);

        await driver.get(`${BASE_URL}/customize.html`);

        await driver.findElement(
            By.css('[data-custom-type="premade"]')
        ).click();

        await driver.findElement(
            By.id("continue-customize")
        ).click();

        await driver.wait(
            until.urlContains("order-details.html"),
            5000
        );

        await setQuantity(driver, 1);

        assert.equal(
            await driver.findElement(By.id("summary-total")).getText(),
            "$2.00",
            "Pre-made price for 1 cookie should be $2.00"
        );

        await setQuantity(driver, 12);

        assert.equal(
            await driver.findElement(By.id("summary-total")).getText(),
            "$21.00",
            "Pre-made price for 12 cookies should be $21.00"
        );

        await setQuantity(driver, 24);

        assert.equal(
            await driver.findElement(By.id("summary-total")).getText(),
            "$36.00",
            "Pre-made price for 24 cookies should be $36.00"
        );
    } finally {
        await driver.quit();
    }
});

test("Regression test - Custom writing pricing and bulk discounts work", async () => {
    const driver = await createDriver();

    try {
        await chooseCustomType(driver, "writing");

        await driver.findElement(
            By.id("custom-message")
        ).sendKeys("Happy Birthday!");

        await driver.findElement(
            By.id("continue-customize")
        ).click();

        await driver.wait(
            until.urlContains("order-details.html"),
            5000
        );

        await setQuantity(driver, 1);

        assert.equal(
            await driver.findElement(By.id("summary-total")).getText(),
            "$2.50",
            "Custom writing price for 1 cookie should be $2.50"
        );

        await setQuantity(driver, 12);

        assert.equal(
            await driver.findElement(By.id("summary-total")).getText(),
            "$27.00",
            "Custom writing price for 12 cookies should be $27.00"
        );

        await setQuantity(driver, 24);

        assert.equal(
            await driver.findElement(By.id("summary-total")).getText(),
            "$48.00",
            "Custom writing price for 24 cookies should be $48.00"
        );
    } finally {
        await driver.quit();
    }
});

test("Regression test - Custom image pricing and bulk discounts work", async () => {
    const driver = await createDriver();

    try {
        await chooseCustomType(driver, "image");

        await driver.findElement(
            By.id("image-file")
        ).sendKeys(IMAGE_PATH);

        await driver.wait(
            until.elementIsVisible(
                await driver.findElement(By.id("image-preview"))
            ),
            5000
        );

        await driver.findElement(
            By.id("continue-customize")
        ).click();

        await driver.wait(
            until.urlContains("order-details.html"),
            5000
        );

        await setQuantity(driver, 1);

        assert.equal(
            await driver.findElement(By.id("summary-total")).getText(),
            "$3.00",
            "Custom image price for 1 cookie should be $3.00"
        );

        await setQuantity(driver, 12);

        assert.equal(
            await driver.findElement(By.id("summary-total")).getText(),
            "$33.00",
            "Custom image price for 12 cookies should be $33.00"
        );

        await setQuantity(driver, 24);

        assert.equal(
            await driver.findElement(By.id("summary-total")).getText(),
            "$60.00",
            "Custom image price for 24 cookies should be $60.00"
        );
    } finally {
        await driver.quit();
    }
});

test("Regression test - Shipping is FREE on order details", async () => {
    const driver = await createDriver();

    try {
        await selectPremadeDesign(driver);

        await driver.get(`${BASE_URL}/customize.html`);

        await driver.findElement(
            By.css('[data-custom-type="premade"]')
        ).click();

        await driver.findElement(
            By.id("continue-customize")
        ).click();

        await driver.wait(
            until.urlContains("order-details.html"),
            5000
        );

        const freeShipping = await driver.findElement(
            By.css(".summary__row .free")
        );

        assert.equal(
            await freeShipping.getText(),
            "FREE",
            "Order details should display FREE shipping"
        );
    } finally {
        await driver.quit();
    }
});

// ============================================================
// ORDER VALIDATION
// ============================================================

test("Regression test - Order details validation works", async () => {
    const driver = await createDriver();

    try {
        await driver.get(`${BASE_URL}/order-details.html`);

        await driver.findElement(
            By.id("order-form")
        ).submit();

        const alert = await driver.findElement(
            By.id("order-alert")
        );

        await driver.wait(
            until.elementIsVisible(alert),
            2000
        );

        assert.ok(
            (await alert.getText()).includes(
                "Please fix the following"
            ),
            "Order form should display validation errors"
        );
    } finally {
        await driver.quit();
    }
});

test("Regression test - Quantity controls work", async () => {
    const driver = await createDriver();

    try {
        await driver.get(`${BASE_URL}/order-details.html`);

        const quantity = await driver.findElement(
            By.id("quantity")
        );

        assert.equal(
            await quantity.getAttribute("value"),
            "1",
            "Default quantity should be 1"
        );

        await driver.findElement(
            By.css('[data-qty-step="1"]')
        ).click();

        assert.equal(
            await quantity.getAttribute("value"),
            "2",
            "Increasing quantity should change quantity to 2"
        );

        await driver.findElement(
            By.css('[data-qty-step="-1"]')
        ).click();

        assert.equal(
            await quantity.getAttribute("value"),
            "1",
            "Decreasing quantity should change quantity back to 1"
        );
    } finally {
        await driver.quit();
    }
});

// ============================================================
// CONTACT
// ============================================================

test("Regression test - Contact form successful submission works", async () => {
    const driver = await createDriver();

    try {
        await driver.get(`${BASE_URL}/contact.html`);

        await driver.findElement(
            By.id("contact-name")
        ).sendKeys("Test Customer");

        await driver.findElement(
            By.id("contact-email")
        ).sendKeys("test@example.com");

        await driver.findElement(
            By.id("contact-message")
        ).sendKeys("This is a test contact message.");

        await driver.findElement(
            By.id("contact-form")
        ).submit();

        const success = await driver.findElement(
            By.id("contact-success")
        );

        await driver.wait(
            until.elementIsVisible(success),
            2000
        );

        assert.ok(
            (await success.getText()).includes("Thanks, Test Customer!"),
            "Contact form should display a successful submission message"
        );
    } finally {
        await driver.quit();
    }
});

// ============================================================
// COMPLETE PRE-MADE ORDER
// ============================================================

test("Regression test - Complete pre-made order flow works", async () => {
    const driver = await createDriver();

    try {
        await selectPremadeDesign(driver);

        await driver.get(`${BASE_URL}/customize.html`);

        await driver.findElement(
            By.css('[data-custom-type="premade"]')
        ).click();

        await driver.findElement(
            By.id("continue-customize")
        ).click();

        await driver.wait(
            until.urlContains("order-details.html"),
            5000
        );

        await completeCustomerForm(driver);

        await setQuantity(driver, 2);

        await driver.findElement(
            By.id("order-form")
        ).submit();

        await driver.wait(
            until.urlContains("review.html"),
            5000
        );

        const reviewHeading = await driver.findElement(
            By.css("h1")
        );

        assert.equal(
            await reviewHeading.getText(),
            "Review & checkout",
            "Order should reach review page"
        );

        assert.ok(
            (await driver.findElement(
                By.id("review-price-line")
            ).getText()).includes("2 cookies"),
            "Review should show the correct quantity"
        );

        assert.equal(
            await driver.findElement(
                By.id("review-total")
            ).getText(),
            "$4.00",
            "Review should show the correct total"
        );

        assert.equal(
            await driver.findElement(
                By.css(".summary__row .free")
            ).getText(),
            "FREE",
            "Review should show FREE shipping"
        );
    } finally {
        await driver.quit();
    }
});

// ============================================================
// PAYMENT
// ============================================================

test("Regression test - Demo payment validation works", async () => {
    const driver = await createDriver();

    try {
        await selectPremadeDesign(driver);

        await driver.get(`${BASE_URL}/customize.html`);

        await driver.findElement(
            By.css('[data-custom-type="premade"]')
        ).click();

        await driver.findElement(
            By.id("continue-customize")
        ).click();

        await driver.wait(
            until.urlContains("order-details.html"),
            5000
        );

        await completeCustomerForm(driver);

        await driver.findElement(
            By.id("order-form")
        ).submit();

        await driver.wait(
            until.urlContains("review.html"),
            5000
        );

        await driver.findElement(
            By.id("payment-form")
        ).submit();

        const paymentAlert = await driver.findElement(
            By.id("payment-alert")
        );

        await driver.wait(
            until.elementIsVisible(paymentAlert),
            2000
        );

        assert.ok(
            (await paymentAlert.getText()).includes(
                "Check the demo payment fields"
            ),
            "Invalid payment should display an error"
        );
    } finally {
        await driver.quit();
    }
});

// ============================================================
// COMPLETE CHECKOUT + CONFIRMATION
// ============================================================

test("Regression test - Complete checkout reaches confirmation", async () => {
    const driver = await createDriver();

    try {
        await selectPremadeDesign(driver);

        await driver.get(`${BASE_URL}/customize.html`);

        await driver.findElement(
            By.css('[data-custom-type="premade"]')
        ).click();

        await driver.findElement(
            By.id("continue-customize")
        ).click();

        await driver.wait(
            until.urlContains("order-details.html"),
            5000
        );

        await completeCustomerForm(driver);

        await driver.findElement(
            By.id("order-form")
        ).submit();

        await driver.wait(
            until.urlContains("review.html"),
            5000
        );

        await driver.findElement(
            By.id("demo-card-name")
        ).sendKeys("Test Customer");

        await driver.findElement(
            By.id("demo-card-number")
        ).sendKeys("4111111111111111");

        await driver.findElement(
            By.id("demo-expiry")
        ).sendKeys("1228");

        await driver.findElement(
            By.id("demo-cvv")
        ).sendKeys("123");

        await driver.findElement(
            By.id("payment-form")
        ).submit();

        await driver.wait(
            until.urlContains("confirmation.html"),
            5000
        );

        const confirmationHeading = await driver.findElement(
            By.css("h1")
        );

        assert.equal(
            await confirmationHeading.getText(),
            "Demo order confirmed!",
            "Successful checkout should reach confirmation"
        );

        const confirmationNumber = await driver.findElement(
            By.id("confirmation-number")
        );

        assert.ok(
            (await confirmationNumber.getText()).includes(
                "Order DD-DEMO-"
            ),
            "Confirmation page should display a demo order number"
        );

        const details = await driver.findElement(
            By.id("confirmation-details")
        );

        assert.ok(
            (await details.getText()).includes("FREE"),
            "Confirmation should display FREE shipping"
        );

        assert.ok(
            (await details.getText()).includes("Pre-made design"),
            "Confirmation should display the selected design type"
        );

        assert.ok(
            (await details.getText()).includes("$2.00"),
            "Confirmation should display the correct unit price"
        );
    } finally {
        await driver.quit();
    }
});