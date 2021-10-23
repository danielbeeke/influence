import { html, render } from 'https://cdn.skypack.dev/uhtml/async';
import { searchForm } from './templates/searchForm'
import { throttle } from './helpers/throttle';
import { getIds } from './helpers/getIds';
import { columnsRender } from './templates/columnsRender';
import './misc/bodyClick'
import { continueColumnsRender } from './misc/bodyClick';

import * as Sentry from "@sentry/browser";
import { Integrations } from "@sentry/tracing";
import { debounce } from './helpers/debounce';

Sentry.init({
  dsn: "https://cd8164655d204832bba96a931a6a018e@o483393.ingest.sentry.io/6010247",
  integrations: [new Integrations.BrowserTracing()],
  tracesSampleRate: 1.0,
});

const debouncedContinueColumnsRender = debounce(continueColumnsRender, 700)

export const drawApp = throttle(async () => {
    const ids = getIds()

    try {
        await render(document.body, ids.length ? columnsRender(ids) : searchForm())
    }
    catch (exception) {
        if (exception.message === 'NetworkError when attempting to fetch resource.') {
            render(document.body, html`<h1 class="dbpedia-offline">Unfortunatly DBpedia is down.<br>Please come back later.</h1>`)
        }
        else {
            console.info(exception.message)
        }
    }

}, 300)

drawApp().then(debouncedContinueColumnsRender)
window.addEventListener('popstate', drawApp)
