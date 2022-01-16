# Order Book

Responsive Real Time Order Book UI for XBT/USD and ETH/USD.

https://johannes-2022-01-16.vercel.app/

## Technology

- React
- TypeScript
- Redux & Redux Toolkit
- WebSocket
- ResizeObserver
- Jest & Cypress

Consistent Code Styling is enforced by prettier, eslint & husky.

## Test Coverage

- The reducers are unit tested with a code coverage of 100% (`npm test`).
- The React components are tested with Jest in a JSDOM environment (`npm test`).
- Critical flows are E2E tested with cypress (`npm run e2e`).

## Optimisations

The application is optimised to avoid unnecessary rerenders and therefore is able to render all real-time updates with steady 120 FPS. That is, with CPU throttled to 6x slowdown.

However, `delta` update messages are throttled to batch update every 100ms to make the UI appear less bustling. Batching is implemented with a custom redux middleware [throttleOrderBook](src/app/store.ts).

The bid and asks tables are built with actual HTML `table` elements in order to keep the semantics. However, their display is set to `flex`, though. This is mainly because of two reasons:

- This weird [Safari Table Row Gradient Background Repeat Bug](https://bugs.webkit.org/show_bug.cgi?id=34392), which would make the implementation of the depth graphs imperformant.
- Being able to use `flex-direction` to build the mobile layout with just some CSS media queries.

## CSS Setup

The Styling lives in plain old CSS files (one per component) and is preprocessed by PostCSS. The rules are scoped to the component by using a component class. If needed, migration to CSS Modules or SCSS would be seamless (as it's already setup).

## Responsiveness

We have one breakpoint at 768px, which discriminates between the mobile (bids and asks below each other) and desktop (bids and asks next to each other) layout.

The number of levels of the order book is dynamically adjusted to meet the height of the window using ResizeOberver. This is necessary, as we have to recalculate the depth graphs when the number of levels updates.
