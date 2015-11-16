Tracking wallet
========================

Installation
--------------

Download the repository and execute the installation script:

````bash

cd Workspace
git clone https://github.com/coverwallet/tracking-wallet
cd tracking-wallet
npm install
grunt serve

//compile lib
grunt dist



````
Usage
--------------

````javascript
//depends of mixpanel and jquery
<script type="text/javascript" src="<path>/build/tracking-wallet.min.js"></script>
<script type="text/javascript">
    /**
        Init library. Get level log of data-event attribute in body tag. If data-env is different of production, log is debug
    */
    trackingWallet.init();
</script>


    <!--
        You can put attributes 'data-tw-...' that you want, but always it starts with data-tw- and always you must put 'data-tw-event=<click or submit>]' in the element that you want track.
        - submit: To forms tag
        - click: Other tags that you want track click event

        The body case is special because when the library init, always send a 'page view' event with the data put in the body tag. In this case is not necessary the data 'data-tw-event'
    -->

<html>
    <body data-tw-app='test-dev' data-tw-page="testPage" data-tw-section="Home section" data-env="development">
        <a href="./index.html" data-tw-event="click" data-tw-target="Test page" data-tw-section="header">Test</a>
        <form action="./index.html" method="GET" data-tw-event="submit" data-tw-name="pedirNombre">
            <label for="name">Nombre</label>
            <!-- For send input, is necesary data-tw-event in field -->
            <input type="text" name="name" id="name" data-tw-event="click" data-tw-name="name">
            <input type="submit" data-tw-event="click"/>
        </form>
        <script type="text/javascript" src="tracking-wallet.js"></script>
        <script type="text/javascript">
            window.trackingWallet.init();

        </script>
    </body>
</html>
````
