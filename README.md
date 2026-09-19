# Doughy Designs — Custom Cookie Website

Plain HTML, CSS and JavaScript — no application build step or runtime dependencies, ready for GitHub Pages.

## Team split

| Step in the customer journey | Page | Owner |
| --- | --- | --- |
| Home | `index.html` | Developer 1 |
| Design catalog | `designs.html` | Developer 1 |
| About | `about.html` | Developer 1 |
| Contact | `contact.html` | Developer 1 |
| Customize (upload / move / resize image, custom writing) | `customize.html` | Complete |
| Order details (customer info + quantity) | `order-details.html` | Developer 1 |
| Review & mock checkout | `review.html` | Complete |
| Order confirmation | `confirmation.html` | Complete |

The complete ordering flow runs entirely in the browser. Uploaded images and
customer details use session storage and disappear when the browser session
ends. The checkout is clearly marked as a class demo and does not store or
process payment information.

## Files

```
index.html            Home page
designs.html          Pre-made design catalog + design-type choices
about.html            Business story, options, occasions, pricing table
contact.html          Fictional contact details + contact form
order-details.html    Quantity, customer/shipping details, order summary
customize.html        Design-type selection, writing, and image customization
review.html           Full order review and demo-only payment form
confirmation.html     Fictional order confirmation and private demo record

css/styles.css        Shared design system (colors, type, cards, forms, responsive)

js/order-state.js     Shared order object, pricing/bulk discounts, sessionStorage
js/cookie-art.js      Business-created cookie artwork, drawn as inline SVG
js/designs-data.js    The pre-made catalog (12 designs, 4 categories)
js/designs.js         Catalog filters, selection, design-type choices
js/form-utils.js      Shared field validation helpers
js/contact.js         Contact form validation + confirmation
js/order-details.js   Order details validation, live pricing, hand-off
js/customize.js       Writing/image preview, upload, movement, and resizing
js/review.js          Review summary and non-persistent demo checkout
js/confirmation.js    Submitted demo order display
js/home.js            "Popular right now" examples on the home page
js/main.js            Mobile nav, header cookie count, footer year

assets/logo.png       Business logo used in the header and footer
assets/logo-source.png  Original supplied logo file
pictures/             Supplied UI/UX reference screenshots
```

## Hand-off between developers

Everything Developer 1 collects is written to `sessionStorage` under the key
`doughyDesigns.order`, and is read/written through `js/order-state.js`:

```js
{
  designType: "premade" | "writing" | "image",
  design: { id, name, category, art, price } | null,   // pre-made only
  quantity: 12,
  customer: { fullName, phone, email, address, city, state, zip },
  pricing: { designType, quantity, unitPrice, subtotal, shipping: 0, total }
}
```

`pricing` is written when the order details form passes validation. Shipping is
always `0`. `OrderState.priceOrder(type, qty)` applies the bulk discount tiers
(1–11, 12–23, 24+) from the project brief.

Developer 2 adds the fields their steps own — custom writing text, the uploaded
image, image placement, and the order number — to the same object via
`OrderState.save({ ... })`. `OrderState.load()` preserves any extra keys it does
not recognise, so the two halves will not overwrite each other.

## Testing

The project includes automated Selenium tests using Firefox and Node.js.

* Smoke tests: Verify core pages and basic functionality.
* Regression tests: Verify design selection, customization, pricing, validation, image controls, ordering, checkout, and confirmation.
* Run all tests: `npm.cmd test`
* Run smoke tests: `npm.cmd run test:smoke`
* Run regression tests: `npm.cmd run test:regression`

The test suite contains 28 automated tests.

## Running it

Open `index.html` in a browser, or serve the folder:

```
python3 -m http.server 8000
```

Then visit <http://localhost:8000>.

## Notes

This is a fictional business. All contact details are made up, no payments are
processed, and no customer data leaves the browser. Customer-uploaded images are
used only for the customer's own order and are never added to the public design
catalog.
