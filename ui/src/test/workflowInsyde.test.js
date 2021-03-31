const timeout = 1000000;
const archiver = require('archiver');
var fs = require("fs");


beforeAll(async () => {
    await page.goto(URL, { waitUntil: "domcontentloaded" });
    await page.setDefaultTimeout(0)
    await page.setViewport({
        width: 1920,
        height: 1080
    })

    const output = fs.createWriteStream(__dirname + '/insyde_workspace.zip');
    const archive = archiver('zip');

    output.on('close', function () {
        console.log(archive.pointer() + ' total bytes');
        console.log('archiver has been finalized and the output file descriptor has closed.');
    });

    archive.pipe(output);

    archive.directory(__dirname +'/insyde_workspace', false);

    archive.finalize();
});

describe("Test upload", () => {


    test("Login", async () => {

        let handle = await page.$("#login");
        let html = await page.evaluate(handle => handle.innerText, handle);

        if (html !== "LOGOUT") {
            await page.click('#login')
            await page.waitForTimeout(3000)
            await page.screenshot({ path: 'screenshots/insydelogin.jpg', type: 'jpeg' });
            await page.click('#regular');
            await page.waitForNavigation();
        }

        handle = await page.$("#login");
        html = await page.evaluate(handle => handle.innerText, handle);

        expect(html).toBe("LOGOUT");

    }, timeout);

    test("Try upload with login", async () => {


        const inputUploadHandle = await page.$('input[type=file]');

        await page.screenshot({ path: 'screenshots/insydeUploadERC.jpg', type: 'jpeg' });
        let fileToUpload = './src/test/insyde_workspace.zip';
        inputUploadHandle.uploadFile(fileToUpload);
        await page.waitForTimeout(2000)
        await page.click('#upload')
        await page.waitForNavigation({ waitUntil: 'networkidle2' });
        await page.waitForTimeout(2000)


        const handle = await page.$("h3");
        const html = await page.evaluate(handle => handle.innerText, handle);
        await page.screenshot({ path: 'screenshots/insydeCreateERC.jpg', type: 'jpeg' });

        expect(html).toBe("This is the metadata we extracted out of your workspace. Is it correct? Fine, click the save button on the right. No? Make some changes and click on save.");
    }, timeout);

    test("Only Preview is possible", async () => {


        const handle = await page.$("#goTo");
        const html = await page.evaluate(handle => handle.innerText, handle);
        expect(html).toBe("PREVIEW");


    }, timeout);

    test("Go to Bindings", async () => {

        await page.click('#bindings')
        await page.waitForTimeout(2000)
        const handle = await page.$("#label0");
        const html = await page.evaluate(handle => handle.innerText, handle);
        await page.screenshot({ path: 'screenshots/insydeBindings.jpg', type: 'jpeg' });

        expect(html).toBe("Which figure should be made interactive?");

    }, timeout);


    test("Select plotFigure1", async () => {

        await page.select('#selectFigure', "plotFigure1()");
        await page.waitForTimeout(4000)

        const handle = await page.$("#preview");
        const html = await page.evaluate(handle => handle.innerText, handle);

        expect(html).toBe("Preview of the interactive figure");


    }, timeout);

    test("Go to next step", async () => {

        await page.click('#next')
        const handle = await page.$("#label1");
        const html = await page.evaluate(handle => handle.innerText, handle);

        expect(html).toBe("Select the parameter which should be made possible to change");

    }, timeout);



    test("Select parameter and go to next step", async () => {

        await page.waitForTimeout(2000)

        // https://stackoverflow.com/questions/60949856/e2e-testing-material-ui-select-with-puppeteer


        const MaterialSelect = async (page, newSelectedValue, cssSelector) => {
            await page.evaluate((newSelectedValue, cssSelector) => {
                var clickEvent = document.createEvent('MouseEvents');
                clickEvent.initEvent("mousedown", true, true);
                var selectNode = document.querySelector(cssSelector);
                selectNode.dispatchEvent(clickEvent);
                [...document.querySelectorAll('li')].filter(el => el.innerText == newSelectedValue)[0].click();
            }, newSelectedValue, cssSelector);
        }

        await MaterialSelect(page, "duration", '#selectP')



        await page.waitForTimeout(1000)
        await page.click('#next')
        await page.waitForTimeout(1000)


        const handle = await page.$(".MuiFormControlLabel-label");
        const html = await page.evaluate(handle => handle.innerText, handle);
        await page.screenshot({ path: 'screenshots/insydeBindings2.jpg', type: 'jpeg' });

        expect(html).toBe("Slider");


    }, timeout);

    test("fill widget Information and save", async () => {

        await page.waitForTimeout(2000)

        await page.click('#min')
        await page.$eval('#min', el => el.value = 0);
        await page.$eval('#min', e => e.blur());

        await page.click('#max')
        await page.$eval('#max', el => el.value = 24);
        await page.$eval('#max', e => e.blur());

        await page.click('#step')
        await page.$eval('#step', el => el.value = 1);
        await page.$eval('#step', e => e.blur());

        await page.click('#captionSlider')
        await page.$eval('#captionSlider', el => el.value = 'Duration of flooding event');
        await page.$eval('#captionSlider', e => e.blur());
        await page.click('#min')

        await page.waitForTimeout(1000)



        await page.click('#save')
        await page.waitForTimeout(1000)

        await page.click('#next')
        await page.waitForTimeout(1000)


        const handle = await page.$("#text");
        const html = await page.evaluate(handle => handle.innerText, handle);
        await page.screenshot({ path: 'screenshots/insydeBindings3.jpg', type: 'jpeg' });

        expect(html).toBe("All steps completed - Feel free to create another binding");

    }, timeout);

    test("Test publish", async () => {

        await page.click('#required')
        await page.waitForTimeout(1000)

        await page.click('#publish')
        await page.waitForTimeout(5000)
        await page.screenshot({ path: 'screenshots/insydeCreateERCSavedMetadata.jpg', type: 'jpeg' });
        const handle = await page.$("#goTo");
        const html = await page.evaluate(handle => handle.innerText, handle);
        expect(html).toBe("GO TO ERC");

    }, timeout);

    test("Test goToERC", async () => {

        await page.click('#goTo')
        await page.waitForTimeout(3000)
        await page.screenshot({ path: 'screenshots/insydeERCView.jpg', type: 'jpeg' });


        const elementHandle = await page.$(
            'iframe',
        );
        const frame = await elementHandle.contentFrame();
        const html = await frame.$eval('h1', (html) => { return html.innerText; });

        expect(html).toBe("INSYDE: a synthetic, probabilistic flood damage model based on explicit cost analysis");


    }, timeout);



});

describe("Inspect ERC", () => {


    test("Go To startpage", async () => {
        await page.goto(URL, { waitUntil: "domcontentloaded" });
        await page.waitForTimeout(4000)

        const title = await page.title();


        expect(title).toBe("Home | o2r Demoserver");

    })

    test("Checout ERC 0", async () => {
        await page.click('#button0')
        await page.waitForTimeout(2000)
        await page.screenshot({ path: 'screenshots/insydeERCView2.jpg', type: 'jpeg' });


        const elementHandle = await page.$(
            'iframe',
        );
        const frame = await elementHandle.contentFrame();
        const html = await frame.$eval('h1', (html) => { return html.innerText; });

        expect(html).toBe("INSYDE: a synthetic, probabilistic flood damage model based on explicit cost analysis");

    })

    test("Go To check", async () => {
        await page.click('#check')
        await page.waitForTimeout(2000)
        await page.screenshot({ path: 'screenshots/insydecheckView.jpg', type: 'jpeg' });

        const handle = await page.$("#runAnalysis");
        const html = await page.evaluate(handle => handle.innerText, handle);

        expect(html).toBe("RUN ANALYSIS");
    })

    test("Start Analysis", async () => {

        await page.click('#runAnalysis')
        await page.waitForTimeout(2000)
        await page.screenshot({ path: 'screenshots/insydeanalysisStarted.jpg', type: 'jpeg' });

        const handle = await page.$("#stepOne");
        const html = await page.evaluate(handle => handle.innerText, handle);

        expect(html).toBe("1) Create configuration file: ");
    })

    test("Go to Manipulate", async () => {

        await page.click('#manipulate')
        await page.waitForTimeout(2000)

        await page.screenshot({ path: 'screenshots/insydeERCViewManipulate.jpg', type: 'jpeg' });

        const handle = await page.$("#desc");
        const html = await page.evaluate(handle => handle.innerText, handle);

        expect(html).toBe("Duration of flooding event");
    })

    test("Slider Change", async () => {

        // adapted from https://stackoverflow.com/questions/49772472/how-to-simulate-a-drag-and-drop-action-in-puppeteer
        const dragAndDrop = async (page, originSelector) => {
            await page.waitForSelector(originSelector)
            const origin = await page.$(originSelector)
            const ob = await origin.boundingBox()

            console.log(`Dragging from ${ob.x + ob.width / 2}, ${ob.y + ob.height / 2}`)
            await page.mouse.move(ob.x + ob.width / 2, ob.y + ob.height / 2)
            await page.mouse.down()
            console.log(`Dropping at   ${ob.x + ob.width / 2}, ${ob.y + ob.height / 2}`)
            await page.mouse.move(ob.x + ob.width / 2 - 300, ob.y + ob.height / 2)
            await page.mouse.up()
        }


        await page.click('#saveComparison')
        await dragAndDrop(page, ".MuiSlider-thumb")
        await page.click('#saveComparison')

        await page.click('#showComparison')

        const handle = await page.$("#caption0");
        const html = await page.evaluate(handle => handle.innerText, handle);

        expect(html).toBe("Parameter 1: duration = 24;");
    })

    test("Go To Metadata", async () => {
        await page.waitForTimeout(1000)
        await page.click('#close')
        await page.waitForTimeout(1000)
        await page.click('#metadata')
        await page.waitForTimeout(2000)
        await page.screenshot({ path: 'screenshots/insydeMetadata.jpg', type: 'jpeg' });

        const handle = await page.$("#title");
        const html = await page.evaluate(handle => handle.innerText, handle);

        expect(html).toBe("Title: INSYDE: a synthetic, probabilistic flood damage model based on explicit cost analysis");
    })

    test("Go To Shipment", async () => {
        await page.click('.MuiTabScrollButton-root')
        await page.click('#shipment')
        await page.waitForTimeout(2000)
        await page.screenshot({ path: 'screenshots/insydeShipment.jpg', type: 'jpeg' });

        const handle = await page.$("#description");
        const html = await page.evaluate(handle => handle.innerText, handle);

        expect(html).toBe("Create new Shipment:");
    })

});