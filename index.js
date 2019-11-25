const csv = require('fast-csv');
const prompts = require('prompts');
const Nightmare = require('nightmare');


const CSV_FILE = 'Connections.csv';
const MAX_RETRIES = 3;
/// Setup prompt attributes
const OPTIONS = {
    userId: {
        message: 'LinkedIn login',
        type: 'text',
    },
    password: {
        message: 'LinkedIn password',
        type: 'password',
    },
    delayBetweenFetchesMs: {
        initial: 3000,
        message: 'Wait interval between each connection search (in ms)',
        type: 'number',
    },
    maxCountToProcess: {
        initial: 100,
        message: 'Maximum number of connections to fetch',
        type: 'number',
    },
};
const PERSON_FIELDS_MAP = {
    firstName: 'First Name',
    lastName: 'Last Name',
    email: 'Email Address',
    company: 'Company',
    position: 'Position',
    connectedOn: 'Connected On',
    retries: 'Fetch Retries',
}


async function main() {
    const people = [];
    csv.parseFile(CSV_FILE, {headers: true})
        .on('error', (e) => console.error(e.message))
        .on('data', (personRecord) => {
            const person = {}
            Object.keys(PERSON_FIELDS_MAP).forEach(
                (key) => person[key] = personRecord[PERSON_FIELDS_MAP[key]],
            )
            if(person.firstName && person.lastName) people.push(person)
        })
        .on('end', async () => {
            await startProcessing(people);
            process.exit(0);
        });
}

async function startProcessing(people) {
    if(!people.length) {
        console.log('No connections to fetch.');
        return;
    }

    const options = await promptOptions();

    const scrapper = new Nightmare({
        show: false,
        waitTimeout: 20000,
    });
    if(!(await login(scrapper, options.userId, options.password))) return;

    console.log('Logged in, fetching emails...');
    await fetchEmails(
        scrapper,
        people,
        {
            connectionsToProcess: Math.min(options.maxCountToProcess, people.length),
            delayBetweenFetchesMs: options.delayBetweenFetchesMs,
        },
    );
    await scrapper.end();
    console.log('Fetching finished.');
    process.exit(0);
}


/// This function starts the process by asking user for LinkedIn credentials, as well config options
/// - email & password are used to log in to linkedin
async function promptOptions() {
    const promptArgs = Object.keys(OPTIONS).map((key) => ({name: key, ...OPTIONS[key]}));
    return await prompts(promptArgs);
}


/// Log in to LinkedIn
async function login(scrapper, userId, password) {
    try {
        await scrapper
            .goto('https://www.linkedin.com/uas/login?trk=guest_homepage-basic_nav-header-signin')
            .insert('#username', userId)
            .insert('#password', password)
            .click('.login__form button')
            .wait('#mynetwork-tab-icon.nav-item__icon');
        return true;
    } catch (e) {
        console.error('An error occured while attempting to login to LinkedIn.');
        return false;
    }
}


async function fetchEmails(scrapper, people, {connectionsToProcess, delayBetweenFetchesMs,}) {
    console.log(`${connectionsToProcess}/${people.length} connections to extract...`);
    const knownEmails = [];
    let processedCount = 0;
    let retriesAllowed = 0;
    let breaked = false;
    while(!breaked && retriesAllowed < MAX_RETRIES) {
        for(const person of people) {
            if(processedCount >= connectionsToProcess) {
                breaked = true;
                break;
            }
            if(person.email) {
                knownEmails.push(person.email);
                continue;
            }
            if(person.retries > retriesAllowed) continue;

            person.retries = +(person.retries || 0) + 1;
            processedCount++;

            const email = await fetchEmail(
                scrapper,
                `${person.firstName} ${person.lastName}`,
                delayBetweenFetchesMs,
            );
            if(email) {
                person.email = email;
                if(knownEmails.includes(email)) {
                    console.error(`Stopped due to bot prevention mechanism (returned ${email}). Please restart the script.`);
                    break;
                }
                knownEmails.push(email);
            }
            writePeopleToFile(people);
        }
        retriesAllowed++;
    }
}


/// Actual email extraction procedure
/// Crawler looks for search input box, writes connection name, clicks on first result, copies connection's email
async function fetchEmail(scrapper, name, delayBetweenFetchesMs) {
    try {
        await scrapper
            .wait('.nav-item--mynetwork')
            .click('.nav-item--mynetwork a')
            .wait('.mn-community-summary__link')
            .click('.mn-community-summary__link')
            .wait('.mn-connections__search-input')
            .wait(delayBetweenFetchesMs)
            .insert('.mn-connections__search-input', name)
            .wait(2000)
            .click('.mn-connection-card__link')
            .wait('[data-control-name=contact_see_more]')
            .click('[data-control-name=contact_see_more]')
            .wait('.pv-contact-info');

        /// Here we get the email from the connections linkedin page.
        const email = await scrapper.evaluate(() => document
            .querySelector('.pv-contact-info__contact-type.ci-email a.pv-contact-info__contact-link')
            .getAttribute('href')
            .replace('mailto:', ''));
        console.log(`✅  ${name}: ${email}`);

        return email;
    } catch (e) {
        console.error(`❌  ${name} unable to extract email`);
    }
}


function writePeopleToFile(people) {
    const data = people.map((person) => {
        const personCsv = {};
        Object.keys(person).forEach(
            (key) => personCsv[PERSON_FIELDS_MAP[key]] = person[key],
        );
        return personCsv;
    })
    csv.writeToPath(CSV_FILE, data, {headers: true}).on('finish', () => {});
}


///* MAIN *///
main()
