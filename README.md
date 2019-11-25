# linkedin-email-extractor

### A node web scraper to extract your linkedin connection emails

**Note**: Works with redesigned LinkedIn only.

Thanks to [FutoRicky](https://github.com/FutoRicky/linkedin-email-extractor), [anhuin69](https://github.com/anhuin69/linkedin-email-extractor) and [reard96](https://github.com/reard96/linkedin-email-extractor
) for the initial code. I have completely rewrote it thought.

**Note**: _After cycling through ~150-200 contacts, it appears that the email addresses begin to populate with your most recent contact's email...I believe that this is LinkedIn trying to prevent bots. Re-starting the script when this happens takes care of the problem. Of course, this is for eductational use only!_

## Important Note
Scraping data off of LinkedIn is against their [User Agreement](https://www.linkedin.com/legal/user-agreement). This is purely intended for educational purposes.

If you would like to know the process on making this script, you can read about it [here](https://dev.to/futoricky/how-i-made-a-web-scraper-script-because-linkedin-27fc)

## Why?
LinkedIn allows you to export all of your connections' info into a csv, except for their emails.
Additionally their API stopped allowing the extraction of emails around 2013-2014. Why don't we have access to our connections emails through their data export if we both agreed to share that info/data?

## Installation
- Clone this repo `git clone https://github.com/priezz/linkedin-email-extractor.git` or download
- Move into the repo directory `cd linkedin-email-extractor`
- Install dependencies `yarn`

## How to Use
- You will need the `Connections.csv` file that LinkedIn provides with the data export.
  - [Instructions on how to export connections from LinkedIn](https://www.linkedin.com/help/linkedin/answer/66844/exporting-connections-from-linkedin?lang=en)
- Add the `Connections.csv` file into the `linkedin-email-extractor` directory
- Run `yarn start`
- Enter LinkedIn Credentials when prompted
- Wait for email extraction process to finish
- `Connections.csv` file would be updated on every successful fetch

## LinkedIn UI Versions
LinkedIn recently updated their UI and it affected the scraper logic. Some people already have the updated UI but some don't, so when you start the script you will be prompted to choose what version do you have. To know what version you have, go into the `network` section and look at the left side panel.

If your panel looks like this, then you are still on the `old` version:

[![Screen-Shot-2019-01-30-at-4-12-12-PM.png](https://i.postimg.cc/L8N31bfb/Screen-Shot-2019-01-30-at-4-12-12-PM.png)](https://postimg.cc/3k0GM9tX)

If your panel looks like this, then you are one the `new` version:

[![Screen-Shot-2019-01-30-at-4-14-34-PM.png](https://i.postimg.cc/rpsCCNNF/Screen-Shot-2019-01-30-at-4-14-34-PM.png)](https://postimg.cc/XZMCnFPT)

## Issues extracting? Read This

If linkedin updates their page and changes the class of an element used in the script it will stop working. You can check out the source code and verify if any class has changed on linkedin and update the script to make it work again. I can't be constantly checking linkedin to see if they have changed something that breaks the script.
