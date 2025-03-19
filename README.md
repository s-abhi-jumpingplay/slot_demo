# slot-machine-test

Its a demo for H5 slot game development using PIXI.JS,
A wheel bonus has been introduced to complete the demo

# Developer

**S.Abhi@jumpingplay.com**

# Installation

- run command : npm install or npm i
- run command : npm run serve
- browser game : open "localhost:8080" on your preferred browser

In case you see below error ( on serve command )
opensslErrorStack: [ 'error:03000086:digital envelope routines::initialization error' ],

Use any of the below options :

**for macOS, Linux or Windows Git Bash**

export NODE_OPTIONS=--openssl-legacy-provider

**for Windows CMD (Command Prompt)**

set NODE_OPTIONS=--openssl-legacy-provider

**for Windows PowerShell**

$env:NODE_OPTIONS="--openssl-legacy-provider"

**for Docker (in your Dockerfile)**

ENV NODE_OPTIONS="--openssl-legacy-provider"

# Tech and Tools

- PIXI v6
- GSAP 3
- Webpack

# Game Behavior

- Click spin button to see next result.

  - Clicking on the spin button will deduct a random bet from [10,20,30.......,100], player balance will reduce accordingly. ( can be seen under the logs )
  - As the spin result the new reel stop positions will be displayed on the bottom left of the screen, symbols on the reel will change accordingly.

  - In case of user win, winning details will display below the reel area ( replacing good luck msg ).
  - A quick rollup will play to the total win amount and will be placed right below the balance meter.
  - On roll up complete, balnce meter will update.
  - All the winning symbols start playing fade-in animation in a cyclic manner.

  - Player will not be able to bet in case of insufficient balance and will be notified by "Insufficent balance" message in place of Good Luck! message
  - Once the bet is reduced below the balance, player can place a bet again.


- Play it here
    3x3-slot-demo.netlify.app
