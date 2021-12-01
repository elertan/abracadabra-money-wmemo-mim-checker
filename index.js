const puppeteer = require('puppeteer');
const dappeteer = require('@chainsafe/dappeteer');
const notifier = require('node-notifier');

const main = async () => {
    const browser = await dappeteer.launch(puppeteer, { metamaskVersion: 'v10.1.1', headless: false });
    const metamask = await dappeteer.setupMetamask(browser);
    await metamask.addNetwork({
        networkName: 'Avalanche Network',
        rpc: 'https://api.avax.network/ext/bc/C/rpc',
        chainId: 43114,
        symbol: 'AVAX',
    });


    let checkLoopPage = null;
    const startCheckLoop = async () => {
        if (checkLoopPage === null) {
            checkLoopPage = await browser.newPage();
        }
        await checkLoopPage.goto("https://abracadabra.money/stand");

        let lastMimAmount = "0";
        for (;;) {
            const element = await checkLoopPage.waitForSelector('div.stand-table-item:nth-of-type(5)');
            const content = await element.evaluate(el => el.children[2].children[0].children[0].innerText);
            // const x = await element.$('p:nth-of-type(2)');
            // const content = await x.evaluate(el => el.textContent);
            console.log(content);
            if (lastMimAmount !== content) {
                lastMimAmount = content;
                if (lastMimAmount === "0") {
                    notifier.notify({
                        title: 'Abracadabra Checker',
                        message: `wMEMO - MIM is now gone`,
                    });
                } else {
                    notifier.notify({
                        title: 'Abracadabra Checker',
                        message: `wMEMO - MIM updated! New amount (${content})`,
                    });
                } 
            } else {
                console.log("Abracadabra reported same amount of mims left");
            }

            await new Promise((r) => setTimeout(r, 5000));
            await checkLoopPage.reload();
        }
    };

    // const browser = await puppeteer.launch({executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: false});
    const page = await browser.newPage();
    page.once('load', async () => {
        console.log('Page loaded!');
        // Login script here
        // await page.$eval('h2.user-card-name', el => el.text());

        // await metamask.approve();
        // await new Promise((r) => setTimeout(r, 1000));
        //
        // const connectButton = await page.$('.connect-btn');
        // console.log(connectButton);
        // await connectButton.click();

        console.log("Requesting accounts");
        page.evaluate('ethereum.request({ method: \'eth_requestAccounts\' })');
        await new Promise((r) => setTimeout(r, 1000));
        console.log("Approving with metamask");
        await metamask.approve();
        console.log("Approved!");
        // await new Promise((r) => setTimeout(r, 1000));
        // const x = await page.evaluate('ethereum.enable()');
        // console.log(await x);

        // await new Promise((r) => setTimeout(r, 1000));
        // await metamask.approve();

        await startCheckLoop();
    });
    await page.goto("https://abracadabra.money/stand");
};

main();
